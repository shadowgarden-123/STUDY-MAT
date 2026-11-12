import { useNavigate } from "react-router";
import { Icon } from "@/components/icons/Icon";
import { fr } from "@/i18n/fr";

/** Barre de retour + libellé de page. Le titre principal reste le h1 de la page. */
export function PageHeader({
  title,
  backTo = "/",
}: {
  title: string;
  backTo?: string;
}) {
  const navigate = useNavigate();

  return (
    <div className="us-page-head">
      <button
        type="button"
        className="us-page-head__back"
        aria-label={fr.actions.back}
        onClick={() => {
          if (window.history.length > 1) navigate(-1);
          else navigate(backTo);
        }}
      >
        <Icon name="arrow-left" size={24} />
      </button>
      <p className="us-page-head__title">{title}</p>
    </div>
  );
}
