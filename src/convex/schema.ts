import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

export const categoryValidator = v.union(
  v.literal("livres"),
  v.literal("cours"),
  v.literal("electronique"),
  v.literal("labo"),
);

export const modeValidator = v.union(
  v.literal("don"),
  v.literal("echange"),
  v.literal("prix"),
);

export const statusValidator = v.union(
  v.literal("disponible"),
  v.literal("donne"),
);

export const reportReasonValidator = v.union(
  v.literal("inapproprie"),
  v.literal("arnaque"),
  v.literal("doublon"),
  v.literal("autre"),
);

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove

      displayName: v.optional(v.string()),
      level: v.optional(v.string()),
      isVerifiedStudent: v.optional(v.boolean()),
      referredBy: v.optional(v.id("users")),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    listings: defineTable({
      userId: v.id("users"),
      title: v.string(),
      description: v.string(),
      category: categoryValidator,
      mode: modeValidator,
      priceFcfa: v.optional(v.number()),
      exchangeWanted: v.optional(v.string()),
      location: v.string(),
      photoStorageId: v.optional(v.id("_storage")),
      status: statusValidator,
      givenToUserId: v.optional(v.id("users")),
      givenAt: v.optional(v.number()),
      searchText: v.string(),
      publishDurationMs: v.optional(v.number()),
      createdAt: v.number(),
    })
      .index("by_status_created", ["status", "createdAt"])
      .index("by_user", ["userId", "createdAt"])
      .index("by_category", ["category"]),

    favorites: defineTable({
      userId: v.id("users"),
      listingId: v.id("listings"),
      createdAt: v.number(),
    })
      .index("by_user", ["userId"])
      .index("by_listing", ["listingId"])
      .index("by_user_listing", ["userId", "listingId"]),

    conversations: defineTable({
      listingId: v.id("listings"),
      requesterId: v.id("users"),
      ownerId: v.id("users"),
      createdAt: v.number(),
      updatedAt: v.number(),
    })
      .index("by_listing", ["listingId"])
      .index("by_requester", ["requesterId", "updatedAt"])
      .index("by_owner", ["ownerId", "updatedAt"]),

    messages: defineTable({
      conversationId: v.id("conversations"),
      senderId: v.optional(v.id("users")),
      body: v.string(),
      kind: v.union(v.literal("text"), v.literal("system")),
      createdAt: v.number(),
      readAt: v.optional(v.number()),
    }).index("by_conversation", ["conversationId", "createdAt"]),

    reports: defineTable({
      listingId: v.id("listings"),
      reporterId: v.id("users"),
      reason: reportReasonValidator,
      note: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_listing", ["listingId"]),

    events: defineTable({
      anonId: v.string(),
      userId: v.optional(v.id("users")),
      name: v.string(),
      props: v.optional(
        v.object({
          source: v.optional(v.string()),
          campaign: v.optional(v.string()),
          ref: v.optional(v.string()),
          value: v.optional(v.string()),
        }),
      ),
      createdAt: v.number(),
    }).index("by_name", ["name", "createdAt"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
