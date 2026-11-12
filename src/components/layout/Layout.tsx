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

export function Layout() {
  const ensureSeed = useMutation(api.seed.ensure);

  useEffect(() => {
    ensureSeed({}).catch(() => undefined);
  }, [ensureSeed]);

  return (
    <AppShell>
      <ReferralCapture />
      <Outlet />
    </AppShell>
  );
}
