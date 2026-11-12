import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { categoryValidator, modeValidator } from "./schema";
import { matchesAllWords, normalizeText } from "./lib/normalize";
import {
  fail,
  listingInputSchema,
  parseOrFail,
  reportSchema,
} from "./lib/validation";

const MAX_SCANNED_LISTINGS = 400;

async function photoUrl(
  ctx: QueryCtx,
  listing: Doc<"listings">,
): Promise<string | null> {
  if (!listing.photoStorageId) return null;
  return await ctx.storage.getUrl(listing.photoStorageId);
}

async function toSummary(ctx: QueryCtx, listing: Doc<"listings">) {
  return {
    _id: listing._id,
    title: listing.title,
    category: listing.category,
    mode: listing.mode,
    priceFcfa: listing.priceFcfa ?? null,
    location: listing.location,
    status: listing.status,
    createdAt: listing.createdAt,
    photoUrl: await photoUrl(ctx, listing),
  };
}

function buildSearchText(listing: {
  title: string;
  description: string;
  category: string;
  location: string;
}): string {
  return normalizeText(
    [
      listing.title,
      listing.description,
      listing.category,
      listing.location,
    ].join(" "),
  );
}

export const list = query({
  args: {
    q: v.optional(v.string()),
    category: v.optional(categoryValidator),
    mode: v.optional(modeValidator),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const scanned = await ctx.db
      .query("listings")
      .withIndex("by_status_created", (q) => q.eq("status", "disponible"))
      .order("desc")
      .take(MAX_SCANNED_LISTINGS);

    const queryText = (args.q ?? "").slice(0, 80);
    const filtered = scanned.filter((listing) => {
      if (args.category && listing.category !== args.category) return false;
      if (args.mode && listing.mode !== args.mode) return false;
      if (queryText && !matchesAllWords(listing.searchText, queryText)) {
        return false;
      }
      return true;
    });

    const limit = Math.min(Math.max(args.limit ?? 12, 1), 96);
    const offset = Math.max(args.offset ?? 0, 0);
    const page = filtered.slice(offset, offset + limit);
    const items = await Promise.all(page.map((listing) => toSummary(ctx, listing)));

    return {
      items,
      total: filtered.length,
      nextOffset:
        offset + limit < filtered.length ? offset + limit : null,
    };
  },
});

export const get = query({
  args: { id: v.id("listings") },
  handler: async (ctx, { id }) => {
    const listing = await ctx.db.get(id);
    if (!listing) return null;

    const owner = await ctx.db.get(listing.userId);
    const viewerId = await getAuthUserId(ctx);
    let isFavorite = false;
    if (viewerId) {
      const favorite = await ctx.db
        .query("favorites")
        .withIndex("by_user_listing", (q) =>
          q.eq("userId", viewerId).eq("listingId", id),
        )
        .unique();
      isFavorite = favorite !== null;
    }

    let givenToName: string | null = null;
    if (listing.givenToUserId) {
      const givenTo = await ctx.db.get(listing.givenToUserId);
      givenToName = givenTo?.displayName ?? givenTo?.name ?? null;
    }

    return {
      ...(await toSummary(ctx, listing)),
      description: listing.description,
      exchangeWanted: listing.exchangeWanted ?? null,
      givenAt: listing.givenAt ?? null,
      givenToName,
      isFavorite,
      isOwner: viewerId !== null && viewerId === listing.userId,
      owner: owner
        ? {
            _id: owner._id,
            displayName: owner.displayName ?? owner.name ?? "Étudiant du campus",
            level: owner.level ?? "Campus",
            isVerifiedStudent: owner.isVerifiedStudent ?? false,
          }
        : null,
    };
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    mode: modeValidator,
    priceFcfa: v.optional(v.number()),
    exchangeWanted: v.optional(v.string()),
    location: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
    publishDurationMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) fail("UNAUTHENTICATED", "Connecte-toi pour publier une annonce.");
    const user = await ctx.db.get(userId);
    if (!user?.displayName) {
      fail("CONFLICT", "Termine ton profil avant de publier.");
    }

    const input = parseOrFail(listingInputSchema, {
      ...args,
      priceFcfa: args.priceFcfa,
    });

    const now = Date.now();
    const id = await ctx.db.insert("listings", {
      userId,
      title: input.title,
      description: input.description,
      category: input.category,
      mode: input.mode,
      priceFcfa: input.mode === "prix" ? input.priceFcfa : undefined,
      exchangeWanted:
        input.mode === "echange" && input.exchangeWanted
          ? input.exchangeWanted
          : undefined,
      location: input.location,
      photoStorageId: args.photoStorageId,
      status: "disponible",
      searchText: buildSearchText(input),
      publishDurationMs: input.publishDurationMs,
      createdAt: now,
    });

    return id;
  },
});

export const update = mutation({
  args: {
    id: v.id("listings"),
    title: v.string(),
    description: v.string(),
    category: categoryValidator,
    mode: modeValidator,
    priceFcfa: v.optional(v.number()),
    exchangeWanted: v.optional(v.string()),
    location: v.string(),
    photoStorageId: v.optional(v.id("_storage")),
    removePhoto: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) fail("UNAUTHENTICATED", "Connecte-toi pour modifier une annonce.");
    const listing = await ctx.db.get(args.id);
    if (!listing) fail("NOT_FOUND", "Cette annonce n'existe plus.");
    if (listing.userId !== userId) {
      fail("FORBIDDEN", "Seul le propriétaire peut modifier cette annonce.");
    }

    const input = parseOrFail(listingInputSchema, args);

    if (listing.photoStorageId && (args.removePhoto || args.photoStorageId)) {
      await ctx.storage.delete(listing.photoStorageId);
    }

    await ctx.db.patch(args.id, {
      title: input.title,
      description: input.description,
      category: input.category,
      mode: input.mode,
      priceFcfa: input.mode === "prix" ? input.priceFcfa : undefined,
      exchangeWanted:
        input.mode === "echange" && input.exchangeWanted
          ? input.exchangeWanted
          : undefined,
      location: input.location,
      photoStorageId: args.removePhoto
        ? undefined
        : (args.photoStorageId ?? listing.photoStorageId),
      searchText: buildSearchText(input),
    });

    return null;
  },
});

export const remove = mutation({
  args: { id: v.id("listings") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) fail("UNAUTHENTICATED", "Connecte-toi pour supprimer une annonce.");
    const listing = await ctx.db.get(id);
    if (!listing) fail("NOT_FOUND", "Cette annonce n'existe plus.");
    if (listing.userId !== userId) {
      fail("FORBIDDEN", "Seul le propriétaire peut supprimer cette annonce.");
    }

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_listing", (q) => q.eq("listingId", id))
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

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_listing", (q) => q.eq("listingId", id))
      .collect();
    for (const favorite of favorites) await ctx.db.delete(favorite._id);

    if (listing.photoStorageId) await ctx.storage.delete(listing.photoStorageId);
    await ctx.db.delete(id);
    return null;
  },
});

export const toggleFavorite = mutation({
  args: { listingId: v.id("listings") },
  handler: async (ctx, { listingId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) fail("UNAUTHENTICATED", "Connecte-toi pour garder une annonce.");
    const listing = await ctx.db.get(listingId);
    if (!listing) fail("NOT_FOUND", "Cette annonce n'existe plus.");

    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_listing", (q) =>
        q.eq("userId", userId).eq("listingId", listingId),
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      return { saved: false };
    }
    await ctx.db.insert("favorites", {
      userId,
      listingId,
      createdAt: Date.now(),
    });
    return { saved: true };
  },
});

export const favorites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const saved = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
    const items = [];
    for (const favorite of saved) {
      const listing = await ctx.db.get(favorite.listingId);
      if (listing) items.push(await toSummary(ctx, listing));
    }
    return items;
  },
});

export const mine = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const rows = await ctx.db
      .query("listings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(100);
    return await Promise.all(rows.map((listing) => toSummary(ctx, listing)));
  },
});

export const report = mutation({
  args: {
    listingId: v.id("listings"),
    reason: v.union(
      v.literal("inapproprie"),
      v.literal("arnaque"),
      v.literal("doublon"),
      v.literal("autre"),
    ),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) fail("UNAUTHENTICATED", "Connecte-toi pour signaler une annonce.");
    const listing = await ctx.db.get(args.listingId);
    if (!listing) fail("NOT_FOUND", "Cette annonce n'existe plus.");
    if (listing.userId === userId) {
      fail("FORBIDDEN", "Tu ne peux pas signaler ta propre annonce.");
    }
    const input = parseOrFail(reportSchema, {
      reason: args.reason,
      note: args.note,
    });
    await ctx.db.insert("reports", {
      listingId: args.listingId,
      reporterId: userId,
      reason: input.reason,
      note: input.note,
      createdAt: Date.now(),
    });
    return null;
  },
});

/** Nombre d'annonces disponibles par mode, pour les onglets du fil. */
export const modeCounts = query({
  args: {},
  handler: async (ctx) => {
    const available = await ctx.db
      .query("listings")
      .withIndex("by_status_created", (q) => q.eq("status", "disponible"))
      .take(MAX_SCANNED_LISTINGS);

    const counts: Record<"don" | "echange" | "prix", number> = {
      don: 0,
      echange: 0,
      prix: 0,
    };
    for (const listing of available) counts[listing.mode] += 1;

    return { ...counts, total: available.length };
  },
});

