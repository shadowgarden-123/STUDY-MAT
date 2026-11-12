import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useSession } from "./AuthContext";
import { EmptyState } from "@/components/ui/EmptyState";
import { ListingGridSkeleton } from "@/components/listings/ListingCard";

/** Protège une route et conserve le chemin voulu pour le retour après connexion. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, profile } = useSession();
  const location = useLocation();
  const returnTo = `${location.pathname}${location.search}`;

  if (isLoading) {
    return (
      <div className="us-container us-page" aria-busy="true">
        <p className="us-sr-only">Vérification de ta session…</p>
        <ListingGridSkeleton count={3} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`/connexion?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  if (profile?.needsOnboarding && location.pathname !== "/bienvenue") {
    return (
      <Navigate
        to={`/bienvenue?returnTo=${encodeURIComponent(returnTo)}`}
        replace
      />
    );
  }

  if (!profile) {
    return (
      <div className="us-container us-page">
        <EmptyState
          title="Ton profil n'a pas pu se charger."
          text="Reconnecte-toi pour retrouver tes annonces et tes échanges."
          action={
            <a className="us-btn" href="/connexion">
              Se reconnecter
            </a>
          }
        />
      </div>
    );
  }

  return children;
}
