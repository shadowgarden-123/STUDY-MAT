import { Link } from "react-router";
import { fr } from "@/i18n/fr";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import { PageHeader } from "@/components/layout/PageHeader";

export default function Privacy() {
  useDocumentMeta({
    title: "Données et confidentialité · Univ-Share",
    description:
      "Ce que Univ-Share collecte, pourquoi, et comment supprimer ton compte.",
    path: "/confidentialite",
  });

  return (
    <div className="us-container us-page">
      <PageHeader title={fr.nav.privacy} />
      <div className="page-narrow">
        <div className="page-intro">
          <h1>{fr.privacy.title}</h1>
          <p className="page-intro__lead">{fr.privacy.lead}</p>
        </div>

        <div className="us-prose">
          {fr.privacy.sections.map((section) => (
            <section key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
            </section>
          ))}

          <section>
            <h2>{fr.privacy.contactTitle}</h2>
            <p>{fr.privacy.contactText}</p>
            <p>
              Pour supprimer ton compte, va dans{" "}
              <Link to="/profil">ton profil</Link> et utilise le bouton de
              suppression en bas de page.
            </p>
          </section>
        </div>

        <div className="us-tips">
          <p className="us-tips__head">En résumé</p>
          <ul>
            <li>Pas de traceur publicitaire, pas de revente de données.</li>
            <li>Aucun numéro de téléphone ni e-mail public.</li>
            <li>Ton compte et ton contenu sont supprimables à tout moment.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
