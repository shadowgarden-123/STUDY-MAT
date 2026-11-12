import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const EVENT_NAMES = [
  "visit_home",
  "search",
  "filter_used",
  "view_listing",
  "share_click",
  "click_contact",
  "first_message_sent",
  "publish_started",
  "publish_succeeded",
  "mark_given",
  "signup_started",
  "signup_completed",
  "referral_signup",
] as const;

/** Mesure maison, sans traceur tiers ni cookie publicitaire. */
export const track = mutation({
  args: {
    anonId: v.string(),
    name: v.string(),
    props: v.optional(
      v.object({
        source: v.optional(v.string()),
        campaign: v.optional(v.string()),
        ref: v.optional(v.string()),
        value: v.optional(v.string()),
      }),
    ),
  },
  handler: async (ctx, args) => {
    if (!(EVENT_NAMES as readonly string[]).includes(args.name)) return null;
    if (args.anonId.length < 6 || args.anonId.length > 64) return null;

    const recent = await ctx.db
      .query("events")
      .withIndex("by_name", (q) => q.eq("name", args.name))
      .order("desc")
      .take(80);
    const now = Date.now();
    const flood = recent.filter(
      (event) =>
        event.anonId === args.anonId && now - event.createdAt < 60_000,
    );
    if (flood.length > 40) return null;

    const userId = await getAuthUserId(ctx);
    await ctx.db.insert("events", {
      anonId: args.anonId,
      userId: userId ?? undefined,
      name: args.name,
      props: args.props,
      createdAt: now,
    });
    return null;
  },
});
