import "@vly-ai/integrations";
import "@fontsource/bricolage-grotesque/latin-700.css";
import "@fontsource/nunito-sans/latin-400.css";
import "@fontsource/nunito-sans/latin-700.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/layout.css";
import "./styles/pages.css";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import React, { StrictMode, Suspense, lazy, useEffect } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigationType,
} from "react-router";

import { AuthProvider } from "@/auth/AuthContext";
import { RequireAuth } from "@/auth/RequireAuth";
import { Layout } from "@/components/layout/Layout";
import { Logo } from "@/components/icons/Logo";
import { ToastProvider } from "@/components/ui/Toast";

const Home = lazy(() => import("@/pages/Home"));
const ListingDetail = lazy(() => import("@/pages/ListingDetail"));
const Publish = lazy(() => import("@/pages/Publish"));
const Messages = lazy(() => import("@/pages/Messages"));
const Conversation = lazy(() => import("@/pages/Conversation"));
const Profile = lazy(() => import("@/pages/Profile"));
const AuthPage = lazy(() => import("@/pages/Auth"));
const Onboarding = lazy(() => import("@/pages/Onboarding"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Styleguide = lazy(() => import("@/pages/Styleguide"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

function RouteLoading() {
  return (
    <div className="us-container us-page center-page" aria-busy="true">
      <Logo href="/" />
      <p className="us-muted">On ouvre le campus…</p>
    </div>
  );
}

/** Envoie la position de la route au cadre de prévisualisation. */
function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}

/** Remonte en haut sur une navigation volontaire, pas sur un retour arrière. */
function ScrollToTop() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "PUSH") window.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname, navigationType]);

  return null;
}

class RootErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  state = { hasError: false, message: "" };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message || "Erreur inconnue" };
  }
  componentDidCatch(err: Error) {
    console.error("[Univ-Share] runtime error:", err);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="us-container us-page center-page">
          <Logo />
          <h1>Le campus a eu un hoquet.</h1>
          <p className="us-muted">
            Recharge la page dans un instant. Tes annonces et tes messages sont
            intacts.
          </p>
          <button
            type="button"
            className="us-btn"
            onClick={() => window.location.reload()}
          >
            Recharger la page
          </button>
          {import.meta.env.DEV ? (
            <p className="us-caption">{this.state.message}</p>
          ) : null}
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <AuthProvider>
            <ToastProvider>
              <RouteSyncer />
              <ScrollToTop />
              <Suspense fallback={<RouteLoading />}>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<Home />} />
                    <Route path="/annonces" element={<Home />} />
                    <Route path="/annonce/:id" element={<ListingDetail />} />
                    <Route
                      path="/publier"
                      element={
                        <RequireAuth>
                          <Publish />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/publier/:id"
                      element={
                        <RequireAuth>
                          <Publish />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/messages"
                      element={
                        <RequireAuth>
                          <Messages />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/messages/:id"
                      element={
                        <RequireAuth>
                          <Conversation />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="/profil"
                      element={
                        <RequireAuth>
                          <Profile />
                        </RequireAuth>
                      }
                    />
                    <Route path="/connexion" element={<AuthPage mode="login" />} />
                    <Route
                      path="/inscription"
                      element={<AuthPage mode="register" />}
                    />
                    <Route
                      path="/bienvenue"
                      element={
                        <RequireAuth>
                          <Onboarding />
                        </RequireAuth>
                      }
                    />
                    <Route path="/comment-ca-marche" element={<HowItWorks />} />
                    <Route path="/confidentialite" element={<Privacy />} />
                    {import.meta.env.DEV ? (
                      <Route path="/_styleguide" element={<Styleguide />} />
                    ) : null}
                    <Route path="/auth" element={<Navigate to="/connexion" replace />} />
                    <Route path="*" element={<NotFound />} />
                  </Route>
                </Routes>
              </Suspense>
            </ToastProvider>
          </AuthProvider>
        </BrowserRouter>
      </ConvexAuthProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
