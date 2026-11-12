import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSession } from "@/auth/AuthContext";
import { useAnalytics } from "@/lib/analytics";
import { toAppError } from "@/lib/errors";
import { fr } from "@/i18n/fr";
import { LogoLockup } from "@/components/icons/Logo";
import { OpenBagArt } from "@/components/icons/Illustrations";
import { Button } from "@/components/ui/UsButton";
import { TextField } from "@/components/ui/Fields";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "@/components/icons/Icon";

function readPendingProfile(): { displayName: string; level: string } | null {
  try {
    const raw = window.sessionStorage.getItem("univ-share:pending-profile");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      displayName?: string;
      level?: string;
    };
    return {
      displayName: parsed.displayName ?? "",
      level: parsed.level ?? "",
    };
  } catch {
    return null;
  }
}

function readReferral(): string | null {
  try {
    return window.sessionStorage.getItem("univ-share:referral");
  } catch {
    return null;
  }
}

export default function Onboarding() {
  const { profile } = useSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const returnToParam = params.get("returnTo");
  const returnTo =
    returnToParam?.startsWith("/") && !returnToParam.startsWith("//")
      ? returnToParam
      : "/";
  const { showToast } = useToast();
  const track = useAnalytics();
  const completeProfile = useMutation(api.profile.completeProfile);
  const bootstrap = useMutation(api.seed.bootstrapForCurrentUser);

  const pending = readPendingProfile();
  const [displayName, setDisplayName] = useState(
    pending?.displayName ?? profile?.displayName ?? "",
  );
  const [level, setLevel] = useState(pending?.level ?? profile?.level ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile && !profile.needsOnboarding) {
      navigate(returnTo, { replace: true });
    }
  }, [profile, navigate, returnTo]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (displayName.trim().length < 2 || displayName.trim().length > 40) {
      nextErrors.displayName = "Ton nom doit faire entre 2 et 40 caractères.";
    }
    if (level.trim().length < 2 || level.trim().length > 60) {
      nextErrors.level = "Indique ton niveau et ta filière.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      document
        .getElementById(`onboarding-${Object.keys(nextErrors)[0]}`)
        ?.focus();
      return;
    }

    setSaving(true);
    try {
      const referral = readReferral();
      await completeProfile({
        displayName: displayName.trim(),
        level: level.trim(),
        referredBy: referral ?? undefined,
      });
      try {
        await bootstrap({});
      } catch {
        /* les fils de démonstration ne doivent jamais bloquer l'inscription */
      }
      try {
        window.sessionStorage.removeItem("univ-share:pending-profile");
      } catch {
        /* rien à nettoyer */
      }
      track("signup_completed", { source: referral ? "ref" : "direct" });
      if (referral) track("referral_signup", { ref: referral });
      showToast(fr.auth.welcome);
      navigate(returnTo, { replace: true });
    } catch (error) {
      setSaving(false);
      showToast(toAppError(error).message || fr.auth.finishError);
    }
  };

  return (
    <div className="us-container us-page">
      <div className="auth">
        <div className="auth__inner" style={{ gridTemplateColumns: "1fr" }}>
          <div className="auth__panel">
            <div className="auth__head">
              <LogoLockup />
              <h1 className="auth__title">{fr.auth.profileTitle}</h1>
              <p className="auth__lead">{fr.auth.profileLead}</p>
              {profile?.email ? (
                <p className="us-caption">
                  {profile.email}
                  {profile.isVerifiedStudent ? (
                    <span className="us-badge" style={{ marginLeft: 8 }}>
                      <Icon name="check" size={12} />
                      {fr.common.verified}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>

            <form className="auth__form" onSubmit={submit} noValidate>
              <TextField
                id="onboarding-displayName"
                label={fr.auth.displayName}
                placeholder={fr.auth.displayNamePlaceholder}
                value={displayName}
                error={errors.displayName}
                onChange={(event) => {
                  setDisplayName(event.target.value);
                  setErrors((current) => ({ ...current, displayName: "" }));
                }}
                autoComplete="name"
                maxLength={40}
                required
              />
              <TextField
                id="onboarding-level"
                label={fr.auth.level}
                placeholder={fr.auth.levelPlaceholder}
                value={level}
                error={errors.level}
                onChange={(event) => {
                  setLevel(event.target.value);
                  setErrors((current) => ({ ...current, level: "" }));
                }}
                autoComplete="organization-title"
                maxLength={60}
                required
              />
              <Button type="submit" block loading={saving}>
                {fr.auth.finish}
              </Button>
              <p className="us-caption">
                Ton nom et ton niveau apparaissent sur tes annonces et dans la
                messagerie. Rien d'autre.
              </p>
            </form>

            <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
              <OpenBagArt className="us-empty__art" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
