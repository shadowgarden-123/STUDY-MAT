import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { useSession } from "@/auth/AuthContext";
import { useAnalytics } from "@/lib/analytics";
import { fr } from "@/i18n/fr";
import { LogoLockup } from "@/components/icons/Logo";
import { OpenBagArt } from "@/components/icons/Illustrations";
import { Button } from "@/components/ui/UsButton";
import { TextField } from "@/components/ui/Fields";
import { Icon } from "@/components/icons/Icon";
import { GoogleDemoButton } from "@/components/auth/GoogleDemoButton";

type Mode = "login" | "register";

function safeReturnTo(value: string | null): string {
  if (value?.startsWith("/") && !value.startsWith("//")) return value;
  return "/";
}

export default function AuthPage({ mode }: { mode: Mode }) {
  const { signIn } = useAuth();
  const { profile } = useSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnTo = safeReturnTo(params.get("returnTo"));
  const track = useAnalytics();

  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [level, setLevel] = useState("");
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const codeRef = useRef<HTMLInputElement>(null);
  const isRegister = mode === "register";

  useEffect(() => {
    if (isRegister) track("signup_started");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRegister]);

  useEffect(() => {
    if (step === "code") codeRef.current?.focus();
  }, [step]);

  useEffect(() => {
    if (profile && !profile.needsOnboarding) {
      navigate(returnTo, { replace: true });
    }
  }, [profile, navigate, returnTo]);

  const sendCode = async () => {
    const nextErrors: Record<string, string> = {};
    const trimmedEmail = email.trim();
    if (!trimmedEmail) nextErrors.email = fr.auth.requiredEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmedEmail)) {
      nextErrors.email = fr.auth.invalidEmail;
    }
    if (isRegister) {
      if (displayName.trim().length < 2 || displayName.trim().length > 40) {
        nextErrors.displayName = "Ton nom doit faire entre 2 et 40 caractères.";
      }
      if (level.trim().length < 2 || level.trim().length > 60) {
        nextErrors.level = "Indique ton niveau et ta filière.";
      }
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      document
        .getElementById(
          `auth-${Object.keys(nextErrors)[0]}`,
        )
        ?.focus();
      return;
    }

    setLoading(true);
    setErrors({});
    setFormError(null);
    try {
      const formData = new FormData();
      formData.set("email", trimmedEmail);
      await signIn("email-otp", formData);
      setEmail(trimmedEmail);
      setStep("code");
    } catch {
      setFormError(fr.auth.emailError);
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(code)) {
      setErrors({ code: fr.auth.codeRequired });
      codeRef.current?.focus();
      return;
    }
    setLoading(true);
    setErrors({});
    setFormError(null);
    try {
      const formData = new FormData();
      formData.set("email", email);
      formData.set("code", code);
      await signIn("email-otp", formData);
      try {
        if (isRegister) {
          window.sessionStorage.setItem(
            "univ-share:pending-profile",
            JSON.stringify({
              displayName: displayName.trim(),
              level: level.trim(),
            }),
          );
        }
      } catch {
        /* le profil pourra être complété sur l'écran suivant */
      }
      navigate(`/bienvenue?returnTo=${encodeURIComponent(returnTo)}`, {
        replace: true,
      });
    } catch {
      setFormError(fr.auth.codeError);
      setCode("");
      codeRef.current?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="us-container us-page">
      <div className="auth">
        <div className="auth__inner">
          <div className="auth__panel">
            <div className="auth__head">
              <LogoLockup />
              <h1 className="auth__title">
                {isRegister ? fr.auth.signupTitle : fr.auth.loginTitle}
              </h1>
              <p className="auth__lead">
                {isRegister ? fr.auth.signupLead : fr.auth.loginLead}
              </p>
            </div>

            {step === "email" ? (
              <form
                className="auth__form"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  sendCode();
                }}
              >
                {isRegister ? (
                  <>
                    <TextField
                      id="auth-displayName"
                      label={fr.auth.displayName}
                      placeholder={fr.auth.displayNamePlaceholder}
                      value={displayName}
                      error={errors.displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      autoComplete="name"
                      maxLength={40}
                      required
                    />
                    <TextField
                      id="auth-level"
                      label={fr.auth.level}
                      placeholder={fr.auth.levelPlaceholder}
                      value={level}
                      error={errors.level}
                      onChange={(event) => setLevel(event.target.value)}
                      autoComplete="organization-title"
                      maxLength={60}
                      required
                    />
                  </>
                ) : null}
                <TextField
                  id="auth-email"
                  label={fr.auth.email}
                  type="email"
                  placeholder={fr.auth.emailPlaceholder}
                  value={email}
                  error={errors.email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  inputMode="email"
                  required
                />
                {formError ? (
                  <p className="us-field__error" role="alert">
                    <Icon name="alert" size={16} />
                    {formError}
                  </p>
                ) : null}
                <Button type="submit" block loading={loading}>
                  {fr.auth.sendCode}
                </Button>
                <p className="us-field__hint">
                  On t'envoie un code à 6 chiffres. Pas de mot de passe à retenir.
                </p>
              </form>
            ) : (
              <form className="auth__form" onSubmit={verifyCode} noValidate>
                <p className="auth__lead">{fr.auth.codeLead(email)}</p>
                <div className="auth__code">
                  <label className="us-sr-only" htmlFor="auth-code">
                    {fr.auth.code}
                  </label>
                  <input
                    id="auth-code"
                    ref={codeRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    autoComplete="one-time-code"
                    placeholder={fr.auth.codePlaceholder}
                    value={code}
                    onChange={(event) =>
                      setCode(event.target.value.replace(/\D/g, ""))
                    }
                    aria-invalid={errors.code ? true : undefined}
                    aria-describedby={errors.code ? "auth-code-error" : undefined}
                  />
                </div>
                {errors.code ? (
                  <p className="us-field__error" id="auth-code-error" role="alert">
                    <Icon name="alert" size={16} />
                    {errors.code}
                  </p>
                ) : null}
                {formError ? (
                  <p className="us-field__error" role="alert">
                    <Icon name="alert" size={16} />
                    {formError}
                  </p>
                ) : null}
                <Button
                  type="submit"
                  block
                  loading={loading}
                  disabled={code.length !== 6}
                >
                  {fr.auth.verify}
                </Button>
                <Button
                  variant="ghost"
                  block
                  onClick={() => {
                    setStep("email");
                    setFormError(null);
                  }}
                >
                  {fr.auth.useOtherEmail}
                </Button>
                <Button
                  variant="ghost"
                  type="button"
                  onClick={sendCode}
                  disabled={loading}
                >
                  {fr.auth.resend}
                </Button>
              </form>
            )}

            <GoogleDemoButton returnTo={returnTo} />

            <p className="auth__switch">
              {isRegister ? fr.auth.switchToLogin : fr.auth.switchToSignup}{" "}
              <Link
                to={`${isRegister ? "/connexion" : "/inscription"}?returnTo=${encodeURIComponent(returnTo)}`}
              >
                {isRegister ? fr.auth.login : fr.auth.signup}
              </Link>
            </p>
          </div>

          <aside className="auth__aside">
            <div className="auth__quote">
              <p className="auth__quote-text">{fr.auth.asideQuote}</p>
              <p className="auth__quote-author">{fr.auth.asideText}</p>
            </div>
            <OpenBagArt className="auth__art" />
            <ul className="us-prose" style={{ marginTop: 24, gap: 8 }}>
              <li>{fr.auth.asideStep1}</li>
              <li>{fr.auth.asideStep2}</li>
              <li>{fr.auth.asideStep3}</li>
            </ul>
          </aside>
        </div>
      </div>
      <p
        className="us-caption auth__guest"
        style={{ textAlign: "center", marginTop: 16 }}
      >
        {fr.auth.guestNote}{" "}
        <Link to="/">{fr.nav.home}</Link>
      </p>
    </div>
  );
}
