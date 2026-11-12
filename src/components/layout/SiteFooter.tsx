import { Link } from "react-router";
import { Logo } from "@/components/icons/Logo";
import { fr } from "@/i18n/fr";

export function SiteFooter() {
  return (
    <footer className="us-site-footer">
      <div className="us-container us-site-footer__inner">
        <div className="us-site-footer__brand">
          <Logo href="/" />
          <p className="us-site-footer__tagline">{fr.footer.tagline}</p>
        </div>
        <nav className="us-site-footer__links" aria-label="Liens de pied de page">
          <Link to="/comment-ca-marche">{fr.nav.howItWorks}</Link>
          <Link to="/confidentialite">{fr.nav.privacy}</Link>
          <Link to="/publier">{fr.actions.publish}</Link>
        </nav>
        <p className="us-site-footer__legal">
          {fr.footer.legal} · {fr.footer.noTrackers}
        </p>
      </div>
    </footer>
  );
}
