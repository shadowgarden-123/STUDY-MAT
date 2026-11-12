import { useMutation } from "convex/react";
import { useCallback } from "react";
import { api } from "@/convex/_generated/api";

export type TrackedEvent =
  | "visit_home"
  | "search"
  | "filter_used"
  | "view_listing"
  | "share_click"
  | "click_contact"
  | "first_message_sent"
  | "publish_started"
  | "publish_succeeded"
  | "mark_given"
  | "signup_started"
  | "signup_completed"
  | "referral_signup";

export type TrackedProps = {
  source?: string;
  campaign?: string;
  ref?: string;
  value?: string;
};

const ANON_KEY = "univ-share:anon";

function getAnonId(): string {
  try {
    const existing = window.sessionStorage.getItem(ANON_KEY);
    if (existing) return existing;
    const generated =
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `anon-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    window.sessionStorage.setItem(ANON_KEY, generated);
    return generated;
  } catch {
    return "anon-session-fallback";
  }
}

/** Événements anonymes, sans traceur tiers. Les échecs restent silencieux. */
export function useAnalytics() {
  const track = useMutation(api.events.track);

  return useCallback(
    (name: TrackedEvent, props?: TrackedProps) => {
      track({ anonId: getAnonId(), name, props }).catch(() => undefined);
    },
    [track],
  );
}
