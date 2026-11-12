import { Link, useLocation } from "react-router";
import { fr } from "@/i18n/fr";
import { Button, ButtonLink } from "@/components/ui/UsButton";
import { Dialog } from "@/components/ui/UsDialog";
import { Icon } from "@/components/icons/Icon";

/**
 * Feuille affichée quand une personne en visite tente une action qui
 * demande un compte. On explique, on ne bloque pas : la visite continue.
 */
export function GuestGate({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const location = useLocation();
  const returnTo = encodeURIComponent(
    `${location.pathname}${location.search}`,
  );
  const { gate } = fr.journey;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={gate.title}
      variant="sheet"
    >
      <p className="us-muted">{gate.text}</p>
      <ul className="gate__perks">
        {gate.perks.map((perk) => (
          <li key={perk}>
            <Icon name="check" size={18} />
            {perk}
          </li>
        ))}
      </ul>
      <div className="us-dialog__actions">
        <Button variant="ghost" onClick={onClose}>
          {gate.keepVisiting}
        </Button>
        <ButtonLink to={`/inscription?returnTo=${returnTo}`}>
          {gate.signup}
        </ButtonLink>
      </div>
      <p className="us-caption" style={{ marginTop: 12 }}>
        <Link className="us-link" to={`/connexion?returnTo=${returnTo}`}>
          {gate.login}
        </Link>
      </p>
    </Dialog>
  );
}
