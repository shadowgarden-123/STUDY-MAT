import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { TabBar } from "./TabBar";
import { SiteFooter } from "./SiteFooter";
import { useOnline } from "@/lib/useOnline";
import { useSession } from "@/auth/AuthContext";
import { fr } from "@/i18n/fr";

export function AppShell({ children }: { children: ReactNode }) {
  const online = useOnline();
  // La barre d'onglets est réservée aux membres connectés.
  const { isAuthenticated } = useSession();

  return (
    <div className="us-shell">
      <a className="us-skip-link" href="#contenu">
        Aller au contenu
      </a>
      {!online ? (
        <p className="us-banner us-banner--offline" role="status">
          {fr.offline.banner}
        </p>
      ) : null}
      <TopNav />
      <main
        id="contenu"
        className={isAuthenticated ? "us-main" : "us-main us-main--sans-onglets"}
      >
        {children}
      </main>
      <SiteFooter />
      {isAuthenticated ? <TabBar /> : null}
    </div>
  );
}
