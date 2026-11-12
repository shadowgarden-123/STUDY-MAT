import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { isAcademicEmail } from "./config/campus";
import { fail, parseOrFail, profileSchema } from "./lib/validation";

async function currentUserId(ctx: QueryCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) fail("UNAUTHENTICATED", "Connecte-toi pour continuer.");
  return userId;
}

export const me = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    if (!user) return null;

    const listings = await ctx.db
      .query("listings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    const allUsers = await ctx.db.query("users").collect();
    const referrals = allUsers.filter((item) => item.referredBy === userId);

    return {
      _id: user._id,
      email: user.email ?? null,
      displayName: user.displayName ?? user.name ?? null,
      level: user.level ?? null,
      isVerifiedStudent: user.isVerifiedStudent ?? false,
      needsOnboarding: !user.displayName || !user.level,
      listingsCount: listings.length,
      givenCount: listings.filter((listing) => listing.status === "donne").length,
      referralsCount: referrals.length,
    };
  },
});

export const completeProfile = mutation({
  args: {
    displayName: v.string(),
    level: v.string(),
    referredBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await currentUserId(ctx);
    const user = await ctx.db.get(userId);
    const input = parseOrFail(profileSchema, {
      displayName: args.displayName,
      level: args.level,
    });

    let referredBy: Id<"users"> | undefined;
    if (args.referredBy) {
      const normalized = await ctx.db.normalizeId("users", args.referredBy);
      if (normalized && normalized !== userId) referredBy = normalized;
    }

    const email = user?.email ?? "";
    await ctx.db.patch(userId, {
      displayName: input.displayName,
      level: input.level,
      name: user?.name ?? input.displayName,
      isVerifiedStudent: isAcademicEmail(email),
      referredBy: user?.referredBy ?? referredBy,
    });

    return null;
  },
});

export const deleteMe = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await currentUserId(ctx);

    const listings = await ctx.db
      .query("listings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const listing of listings) {
      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_listing", (q) => q.eq("listingId", listing._id))
        .collect();
      for (const favorite of favorites) await ctx.db.delete(favorite._id);

      const conversations = await ctx.db
        .query("conversations")
        .withIndex("by_listing", (q) => q.eq("listingId", listing._id))
        .collect();
      for (const conversation of conversations) {
        const messages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) =>
            q.eq("conversationId", conversation._id),
          )
          .collect();
        for (const message of messages) await ctx.db.delete(message._id);
        await ctx.db.delete(conversation._id);
      }
      if (listing.photoStorageId) {
        await ctx.storage.delete(listing.photoStorageId);
      }
      await ctx.db.delete(listing._id);
    }

    const myFavorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    for (const favorite of myFavorites) await ctx.db.delete(favorite._id);

    const asRequester = await ctx.db
      .query("conversations")
      .withIndex("by_requester", (q) => q.eq("requesterId", userId))
      .collect();
    const asOwner = await ctx.db
      .query("conversations")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();
    for (const conversation of [...asRequester, ...asOwner]) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", conversation._id),
        )
        .collect();
      for (const message of messages) await ctx.db.delete(message._id);
      await ctx.db.delete(conversation._id);
    }

    const reports = await ctx.db.query("reports").collect();
    for (const report of reports) {
      if (report.reporterId === userId) await ctx.db.delete(report._id);
    }

    await ctx.db.delete(userId);
    return null;
  },
});
