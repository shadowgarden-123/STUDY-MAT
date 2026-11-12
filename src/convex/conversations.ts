import { getAuthUserId } from "@convex-dev/auth/server";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { fail, messageSchema, parseOrFail } from "./lib/validation";

const MESSAGE_LIMIT = 200;
const UNDO_WINDOW_MS = 10 * 60 * 1000;

async function userIdOrFail(ctx: QueryCtx): Promise<Id<"users">> {
  const userId = await getAuthUserId(ctx);
  if (!userId) fail("UNAUTHENTICATED", "Connecte-toi pour continuer.");
  return userId;
}

function isParticipant(conversation: Doc<"conversations">, userId: Id<"users">) {
  return (
    conversation.requesterId === userId || conversation.ownerId === userId
  );
}

async function requireConversation(
  ctx: QueryCtx,
  conversationId: Id<"conversations">,
  userId: Id<"users">,
): Promise<Doc<"conversations">> {
  const conversation = await ctx.db.get(conversationId);
  if (!conversation) fail("NOT_FOUND", "Cette conversation n'existe plus.");
  if (!isParticipant(conversation, userId)) {
    fail("FORBIDDEN", "Cette conversation ne t'appartient pas.");
  }
  return conversation;
}

async function listingSummary(
  ctx: QueryCtx,
  listing: Doc<"listings">,
) {
  return {
    _id: listing._id,
    title: listing.title,
    category: listing.category,
    mode: listing.mode,
    priceFcfa: listing.priceFcfa ?? null,
    status: listing.status,
    photoUrl: listing.photoStorageId
      ? await ctx.storage.getUrl(listing.photoStorageId)
      : null,
  };
}

async function participantSummary(ctx: QueryCtx, userId: Id<"users">) {
  const user = await ctx.db.get(userId);
  return {
    _id: userId,
    displayName: user?.displayName ?? user?.name ?? "Étudiant du campus",
    level: user?.level ?? "Campus",
    isVerifiedStudent: user?.isVerifiedStudent ?? false,
  };
}

export const start = mutation({
  args: {
    listingId: v.id("listings"),
    body: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await userIdOrFail(ctx);
    const listing = await ctx.db.get(args.listingId);
    if (!listing) fail("NOT_FOUND", "Cette annonce n'existe plus.");
    if (listing.userId === userId) {
      fail("FORBIDDEN", "C'est ton annonce : tu ne peux pas te contacter.");
    }
    if (listing.status !== "disponible") {
      fail("CONFLICT", "Cet objet a déjà été donné.");
    }
    const input = parseOrFail(messageSchema, { body: args.body });
    const now = Date.now();

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_listing", (q) => q.eq("listingId", args.listingId))
      .collect();
    let conversation: Doc<"conversations"> | null =
      conversations.find((item) => item.requesterId === userId) ?? null;

    if (!conversation) {
      const conversationId = await ctx.db.insert("conversations", {
        listingId: args.listingId,
        requesterId: userId,
        ownerId: listing.userId,
        createdAt: now,
        updatedAt: now,
      });
      conversation = await ctx.db.get(conversationId);
    }

    if (!conversation) fail("CONFLICT", "La conversation n'a pas pu être créée.");
    const existingId = conversation._id;

    await ctx.db.insert("messages", {
      conversationId: existingId,
      senderId: userId,
      body: input.body,
      kind: "text",
      createdAt: now,
    });
    await ctx.db.patch(existingId, { updatedAt: now });

    return existingId;
  },
});

export const list = query({
  args: {
    scope: v.optional(
      v.union(v.literal("tout"), v.literal("je-donne"), v.literal("je-cherche")),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const asRequester = await ctx.db
      .query("conversations")
      .withIndex("by_requester", (q) => q.eq("requesterId", userId))
      .collect();
    const asOwner = await ctx.db
      .query("conversations")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const merged = [...asRequester, ...asOwner].sort(
      (a, b) => b.updatedAt - a.updatedAt,
    );

    const scope = args.scope ?? "tout";
    const filtered = merged.filter((conversation) => {
      if (scope === "je-donne") return conversation.ownerId === userId;
      if (scope === "je-cherche") return conversation.requesterId === userId;
      return true;
    });

    const items = [];
    for (const conversation of filtered) {
      const listing = await ctx.db.get(conversation.listingId);
      if (!listing) continue;
      const otherId =
        conversation.requesterId === userId
          ? conversation.ownerId
          : conversation.requesterId;
      const other = await participantSummary(ctx, otherId);
      const lastMessages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", conversation._id),
        )
        .order("desc")
        .take(1);
      const unreadMessages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", conversation._id),
        )
        .collect();
      const unreadCount = unreadMessages.filter(
        (message) =>
          message.kind === "text" &&
          message.senderId !== userId &&
          !message.readAt,
      ).length;
      const last = lastMessages[0];

      items.push({
        _id: conversation._id,
        listing: await listingSummary(ctx, listing),
        other,
        role: conversation.requesterId === userId ? "demandeur" : "proprietaire",
        lastMessage: last
          ? { body: last.body, kind: last.kind, createdAt: last.createdAt }
          : null,
        unreadCount,
        updatedAt: conversation.updatedAt,
      });
    }

    return items;
  },
});

export const thread = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const conversation = await ctx.db.get(conversationId);
    if (!conversation || !isParticipant(conversation, userId)) return null;

    const listing = await ctx.db.get(conversation.listingId);
    if (!listing) return null;
    const otherId =
      conversation.requesterId === userId
        ? conversation.ownerId
        : conversation.requesterId;
    const other = await participantSummary(ctx, otherId);

    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", conversationId),
      )
      .order("asc")
      .take(MESSAGE_LIMIT);

    return {
      _id: conversation._id,
      isOwner: conversation.ownerId === userId,
      other,
      listing: await listingSummary(ctx, listing),
      messages: messages.map((message) => ({
        _id: message._id,
        body: message.body,
        kind: message.kind,
        createdAt: message.createdAt,
        isMine: message.senderId === userId,
      })),
      canUndoGiven:
        listing.status === "donne" &&
        listing.givenAt !== undefined &&
        Date.now() - listing.givenAt < UNDO_WINDOW_MS,
    };
  },
});

export const send = mutation({
  args: { conversationId: v.id("conversations"), body: v.string() },
  handler: async (ctx, args) => {
    const userId = await userIdOrFail(ctx);
    const conversation = await requireConversation(
      ctx,
      args.conversationId,
      userId,
    );
    const input = parseOrFail(messageSchema, { body: args.body });
    const now = Date.now();

    const recent = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", conversation._id),
      )
      .order("desc")
      .take(20);
    const lastTenSeconds = recent.filter(
      (message) =>
        message.senderId === userId && now - message.createdAt < 10_000,
    );
    if (lastTenSeconds.length >= 12) {
      fail(
        "RATE_LIMITED",
        "Tu envoies trop de messages d'un coup. Attends quelques secondes.",
      );
    }

    await ctx.db.insert("messages", {
      conversationId: conversation._id,
      senderId: userId,
      body: input.body,
      kind: "text",
      createdAt: now,
    });
    await ctx.db.patch(conversation._id, { updatedAt: now });
    return null;
  },
});

export const markRead = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const userId = await userIdOrFail(ctx);
    await requireConversation(ctx, conversationId, userId);
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", conversationId),
      )
      .collect();
    const now = Date.now();
    for (const message of messages) {
      if (
        message.kind === "text" &&
        message.senderId !== userId &&
        !message.readAt
      ) {
        await ctx.db.patch(message._id, { readAt: now });
      }
    }
    return null;
  },
});

export const unreadCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    const asRequester = await ctx.db
      .query("conversations")
      .withIndex("by_requester", (q) => q.eq("requesterId", userId))
      .collect();
    const asOwner = await ctx.db
      .query("conversations")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();
    let count = 0;
    for (const conversation of [...asRequester, ...asOwner]) {
      const messages = await ctx.db
        .query("messages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", conversation._id),
        )
        .collect();
      count += messages.filter(
        (message) =>
          message.kind === "text" &&
          message.senderId !== userId &&
          !message.readAt,
      ).length;
    }
    return count;
  },
});

export const markGiven = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const userId = await userIdOrFail(ctx);
    const conversation = await requireConversation(ctx, conversationId, userId);
    const listing = await ctx.db.get(conversation.listingId);
    if (!listing) fail("NOT_FOUND", "Cette annonce n'existe plus.");
    if (listing.userId !== userId) {
      fail("FORBIDDEN", "Seul le propriétaire peut marquer l'objet comme donné.");
    }
    if (listing.status === "donne") return null;

    const recipientId =
      conversation.requesterId === userId
        ? conversation.ownerId
        : conversation.requesterId;
    const recipient = await ctx.db.get(recipientId);
    const firstName = (
      recipient?.displayName ??
      recipient?.name ??
      "cette personne"
    ).split(" ")[0];
    const now = Date.now();

    await ctx.db.patch(listing._id, {
      status: "donne",
      givenToUserId: recipientId,
      givenAt: now,
    });
    await ctx.db.insert("messages", {
      conversationId,
      body: `Annonce marquée comme donnée à ${firstName}.`,
      kind: "system",
      createdAt: now,
    });
    await ctx.db.patch(conversationId, { updatedAt: now });

    const otherConversations = await ctx.db
      .query("conversations")
      .withIndex("by_listing", (q) => q.eq("listingId", listing._id))
      .collect();
    for (const other of otherConversations) {
      if (other._id === conversationId) continue;
      await ctx.db.insert("messages", {
        conversationId: other._id,
        body: "Cet objet a été donné à quelqu'un d'autre.",
        kind: "system",
        createdAt: now,
      });
      await ctx.db.patch(other._id, { updatedAt: now });
    }

    return null;
  },
});

export const unmarkGiven = mutation({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, { conversationId }) => {
    const userId = await userIdOrFail(ctx);
    const conversation = await requireConversation(ctx, conversationId, userId);
    const listing = await ctx.db.get(conversation.listingId);
    if (!listing) fail("NOT_FOUND", "Cette annonce n'existe plus.");
    if (listing.userId !== userId) {
      fail("FORBIDDEN", "Seul le propriétaire peut annuler ce don.");
    }
    if (listing.status !== "donne" || !listing.givenAt) {
      fail("CONFLICT", "Cette annonce n'est pas marquée comme donnée.");
    }
    if (Date.now() - listing.givenAt > UNDO_WINDOW_MS) {
      fail("CONFLICT", "Le délai d'annulation de 10 minutes est passé.");
    }

    await ctx.db.patch(listing._id, {
      status: "disponible",
      givenToUserId: undefined,
      givenAt: undefined,
    });

    const conversations = await ctx.db
      .query("conversations")
      .withIndex("by_listing", (q) => q.eq("listingId", listing._id))
      .collect();
    for (const item of conversations) {
      await ctx.db.insert("messages", {
        conversationId: item._id,
        body: "Le don a été annulé : l'objet est de nouveau disponible.",
        kind: "system",
        createdAt: Date.now(),
      });
      await ctx.db.patch(item._id, { updatedAt: Date.now() });
    }
    return null;
  },
});

/**
 * Objets en cours d'échange, vus de l'utilisateur connecté : ce qu'il donne
 * et ce qu'il cherche. L'état se déduit du statut de l'annonce.
 */
export const exchanges = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const asRequester = await ctx.db
      .query("conversations")
      .withIndex("by_requester", (q) => q.eq("requesterId", userId))
      .collect();
    const asOwner = await ctx.db
      .query("conversations")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .collect();

    const merged = [...asRequester, ...asOwner].sort(
      (a, b) => b.updatedAt - a.updatedAt,
    );

    const items = [];
    const seen = new Set<string>();
    for (const conversation of merged) {
      if (seen.has(conversation._id)) continue;
      seen.add(conversation._id);

      const listing = await ctx.db.get(conversation.listingId);
      if (!listing) continue;

      const otherId =
        conversation.requesterId === userId
          ? conversation.ownerId
          : conversation.requesterId;
      const other = await participantSummary(ctx, otherId);
      const isOwner = conversation.ownerId === userId;

      items.push({
        conversationId: conversation._id,
        listing: await listingSummary(ctx, listing),
        other,
        role: isOwner ? ("proprietaire" as const) : ("demandeur" as const),
        state: listing.status === "donne" ? ("termine" as const) : ("a-convenir" as const),
        updatedAt: conversation.updatedAt,
      });
    }

    return items;
  },
});
