import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@/hooks/use-auth";
import type { Profile } from "@/types/listing";

type SessionValue = {
  isLoading: boolean;
  isAuthenticated: boolean;
  profile: Profile | null;
  signOut: () => Promise<void>;
};

const SessionContext = createContext<SessionValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { isLoading: authLoading, isAuthenticated, signOut: convexSignOut } =
    useAuth();
  const profile = useQuery(api.profile.me);
  const navigate = useNavigate();

  const signOut = useCallback(async () => {
    await convexSignOut();
    navigate("/", { replace: true });
  }, [convexSignOut, navigate]);

  const value = useMemo<SessionValue>(
    () => ({
      isLoading: authLoading || (isAuthenticated && profile === undefined),
      isAuthenticated,
      profile: (profile as Profile | null | undefined) ?? null,
      signOut,
    }),
    [authLoading, isAuthenticated, profile, signOut],
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession doit être utilisé dans AuthProvider.");
  }
  return context;
}
