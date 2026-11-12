import { fr } from "@/i18n/fr";
import { ButtonLink } from "@/components/ui/UsButton";
import { OpenBagArt } from "@/components/icons/Illustrations";
import { useDocumentMeta } from "@/lib/useDocumentMeta";

export default function NotFound() {
  useDocumentMeta({
    title: "Page introuvable · Univ-Share",
    path: "/404",
  });

  return (
    <div className="us-container us-page">
      <div className="center-page">
        <OpenBagArt className="center-page__art" />
        <p className="us-eyebrow">Erreur 404</p>
        <h1>Cette page n'est plus dans le sac.</h1>
        <p className="us-muted" style={{ maxWidth: "38ch" }}>
          Le lien a peut-être changé, ou l'annonce a été retirée. Le fil du
          campus, lui, est toujours là.
        </p>
        <ButtonLink to="/">{fr.nav.home}</ButtonLink>
      </div>
    </div>
  );
}
