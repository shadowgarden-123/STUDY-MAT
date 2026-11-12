import { useNavigate } from "react-router";
import { fr } from "@/i18n/fr";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { useAnalytics } from "@/lib/analytics";
import { startVisit } from "@/lib/visit";
import { Icon } from "@/components/icons/Icon";
import { Logo } from "@/components/icons/Logo";
import { ButtonLink } from "@/components/ui/UsButton";

const PROOF_ICONS = ["search", "hand", "message"] as const;

export default function Welcome() {
  const navigate = useNavigate();
  const track = useAnalytics();

  useDocumentMeta({
    title: "Univ-Share — donner, échanger, partager le matériel du campus",
    description:
      "Livres, cours, composants électroniques et matériel de labo entre étudiants. Trouve ou donne un objet utile en moins d'une minute.",
    path: "/",
  });

  const visit = () => {
    track("visit_home", { source: "visite-sans-compte" });
    startVisit();
    navigate("/annonces");
  };

  const { welcome } = fr.journey;

  return (
    <div className="us-container us-page welcome">
      <div className="welcome__head">
        <Logo />
        <p className="us-eyebrow">{welcome.eyebrow}</p>
        <h1 className="welcome__title">{welcome.title}</h1>
        <p className="welcome__lead">{welcome.lead}</p>

        <div className="welcome__actions">
          <ButtonLink to="/inscription" icon="plus">
            {welcome.signup}
          </ButtonLink>
          <ButtonLink to="/connexion" variant="secondary">
            {welcome.login}
          </ButtonLink>
          <button type="button" className="us-btn us-btn--ghost" onClick={visit}>
            {welcome.visit}
          </button>
        </div>
        <p className="us-caption welcome__note">{welcome.note}</p>
      </div>

      <ul className="welcome__proofs">
        {welcome.proofs.map((proof, index) => (
          <li className="welcome__proof" key={proof.title}>
            <span className="welcome__proof-icon">
              <Icon name={PROOF_ICONS[index] ?? "info"} size={22} />
            </span>
            <div>
              <p className="welcome__proof-title">{proof.title}</p>
              <p className="welcome__proof-text">{proof.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
