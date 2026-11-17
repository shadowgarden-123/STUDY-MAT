import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/hooks/use-auth";
import { fr } from "@/i18n/fr";
import { Button } from "@/components/ui/UsButton";
import { Icon } from "@/components/icons/Icon";

/**
 * Connexion Google simulée : le prototype ouvre une session de démonstration
 * avec le fournisseur anonyme de Convex Auth. Aucun compte Google n'est
 * contacté, aucune donnée Google n'est lue.
 */
export function GoogleDemoButton({
  returnTo,
  onSignedIn,
}: {
  returnTo: string;
  onSignedIn?: () => void;
}) {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    setFailed(false);
    try {
      await signIn("anonymous");
      onSignedIn?.();
      navigate(`/bienvenue?returnTo=${encodeURIComponent(returnTo)}`, {
        replace: true,
      });
    } catch {
      setFailed(true);
      setLoading(false);
    }
  };

  return (
    <div className="auth__google">
      <p className="auth__divider" role="separator">
        <span>{fr.auth.or}</span>
      </p>
      <Button variant="secondary" block loading={loading} onClick={handleClick}>
        <span className="google-mark" aria-hidden="true">
          G
        </span>
        {fr.auth.google}
      </Button>
      <p className="us-caption auth__google-note">{fr.auth.googleNote}</p>
      {failed ? (
        <p className="us-field__error" role="alert">
          <Icon name="alert" size={16} />
          {fr.auth.googleError}
        </p>
      ) : null}
    </div>
  );
}
