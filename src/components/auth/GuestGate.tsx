import { useLocation } from "react-router";
import { fr } from "@/i18n/fr";
import { Button, ButtonLink } from "@/components/ui/UsButton";
import { Dialog } from "@/components/ui/UsDialog";
import { Icon } from "@/components/icons/Icon";
import { GoogleDemoButton } from "./GoogleDemoButton";

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
  const returnToPath = `${location.pathname}${location.search}`;
  const returnTo = encodeURIComponent(returnToPath);
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
      <div className="gate__actions">
        <ButtonLink to={`/inscription?returnTo=${returnTo}`} block>
          {gate.signup}
        </ButtonLink>
        <ButtonLink
          to={`/connexion?returnTo=${returnTo}`}
          variant="secondary"
          block
        >
          {gate.login}
        </ButtonLink>
      </div>
      <GoogleDemoButton returnTo={returnToPath} onSignedIn={onClose} />
      <Button variant="ghost" block onClick={onClose} className="gate__later">
        {gate.keepVisiting}
      </Button>
    </Dialog>
  );
}
