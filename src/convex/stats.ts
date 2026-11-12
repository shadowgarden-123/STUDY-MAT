import { v } from "convex/values";
import { query } from "./_generated/server";
import { fail } from "./lib/validation";
import type { Doc } from "./_generated/dataModel";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[middle - 1] + sorted[middle]) / 2)
    : sorted[middle];
}

function countBy<T extends string>(
  items: Doc<"listings">[],
  key: (item: Doc<"listings">) => T,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const value = key(item);
    counts[value] = (counts[value] ?? 0) + 1;
  }
  return counts;
}

export const publicStats = query({
  args: {},
  handler: async (ctx) => {
    const available = await ctx.db
      .query("listings")
      .withIndex("by_status_created", (q) => q.eq("status", "disponible"))
      .collect();
    const given = await ctx.db
      .query("listings")
      .withIndex("by_status_created", (q) => q.eq("status", "donne"))
      .collect();
    const users = await ctx.db.query("users").collect();
    const weekAgo = Date.now() - WEEK_MS;

    return {
      availableCount: available.length,
      givenCount: given.length,
      givenThisWeek: given.filter(
        (listing) => (listing.givenAt ?? 0) > weekAgo,
      ).length,
      studentsCount: users.filter((user) => user.displayName).length,
    };
  },
});

export const adminStats = query({
  args: { token: v.string() },
  handler: async (ctx, { token }) => {
    const expected = process.env.ADMIN_TOKEN;
    if (!expected || token !== expected) {
      fail("FORBIDDEN", "Jeton administrateur invalide.");
    }

    const listings = await ctx.db.query("listings").collect();
    const given = listings.filter((listing) => listing.status === "donne");
    const users = await ctx.db.query("users").collect();
    const reports = await ctx.db.query("reports").collect();
    const events = await ctx.db.query("events").collect();
    const studentsCount = Number(process.env.CAMPUS_STUDENTS_COUNT ?? 0);
    const weekAgo = Date.now() - WEEK_MS;

    const eventsByWeek: Record<string, number> = {};
    for (const event of events) {
      const week = new Date(event.createdAt).toISOString().slice(0, 10);
      eventsByWeek[week] = (eventsByWeek[week] ?? 0) + 1;
    }

    const uniqueAnon = new Set(events.map((event) => event.anonId));
    const referralSignups = users.filter((user) => user.referredBy).length;
    const publishers = new Set(listings.map((listing) => listing.userId));

    return {
      students: {
        registered: users.filter((user) => user.displayName).length,
        campus: studentsCount || null,
        adoptionRate:
          studentsCount > 0
            ? Math.round(
                (users.filter((user) => user.displayName).length /
                  studentsCount) *
                  100,
              )
            : null,
      },
      listings: {
        published: listings.length,
        given: given.length,
        available: listings.length - given.length,
        successRate:
          listings.length > 0
            ? Math.round((given.length / listings.length) * 100)
            : 0,
        medianPublishDurationMs: median(
          listings
            .map((listing) => listing.publishDurationMs)
            .filter((value): value is number => typeof value === "number"),
        ),
        byCategory: countBy(listings, (listing) => listing.category),
        byMode: countBy(listings, (listing) => listing.mode),
      },
      giving: {
        givenThisWeek: given.filter(
          (listing) => (listing.givenAt ?? 0) > weekAgo,
        ).length,
        givenPerWeek: eventsByWeek,
      },
      trust: { reports: reports.length },
      funnel: {
        visits: uniqueAnon.size,
        signups: users.filter((user) => user.displayName).length,
        publishers: publishers.size,
        recommended: referralSignups,
        eventsByName: events.reduce<Record<string, number>>((acc, event) => {
          acc[event.name] = (acc[event.name] ?? 0) + 1;
          return acc;
        }, {}),
      },
    };
  },
});
