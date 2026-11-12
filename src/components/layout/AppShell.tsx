import type { ReactNode } from "react";
import { TopNav } from "./TopNav";
import { TabBar } from "./TabBar";
import { SiteFooter } from "./SiteFooter";
import { useOnline } from "@/lib/useOnline";
import { fr } from "@/i18n/fr";

export function AppShell({ children }: { children: ReactNode }) {
  const online = useOnline();

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
      <main id="contenu" className="us-main">
        {children}
      </main>
      <SiteFooter />
      <TabBar />
    </div>
  );
}
