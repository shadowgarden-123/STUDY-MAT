import { useEffect } from "react";
import { Outlet, useLocation } from "react-router";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { AppShell } from "./AppShell";

/** Mémorise le parrainage présent dans l'URL, sans le conserver au-delà de la session. */
function ReferralCapture() {
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get("ref");
    if (ref && /^[a-zA-Z0-9_-]{6,64}$/.test(ref)) {
      try {
        window.sessionStorage.setItem("univ-share:referral", ref);
      } catch {
        /* stockage indisponible : le parrainage sera simplement ignoré */
      }
    }
  }, [location.search]);

  return null;
}

const SEED_SESSION_KEY = "univ-share:graines";

export function Layout() {
  const ensureSeed = useMutation(api.seed.ensure);

  // Le jeu de démonstration est déjà idempotent côté serveur. On évite en plus
  // d'appeler une mutation d'écriture à chaque changement de page : une fois
  // par session suffit, et on ne marque la session qu'en cas de succès.
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(SEED_SESSION_KEY) === "1") return;
    } catch {
      /* stockage indisponible : le serveur reste seul juge */
    }

    ensureSeed({})
      .then(() => {
        try {
          window.sessionStorage.setItem(SEED_SESSION_KEY, "1");
        } catch {
          /* sans stockage, on retentera au prochain écran */
        }
      })
      .catch(() => undefined);
  }, [ensureSeed]);

  return (
    <AppShell>
      <ReferralCapture />
      <Outlet />
    </AppShell>
  );
}
