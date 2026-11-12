import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation } from "./_generated/server";
import { fail } from "./lib/validation";

/** URL d'envoi direct vers le stockage Convex, réservée aux étudiants connectés. */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) fail("UNAUTHENTICATED", "Connecte-toi pour ajouter une photo.");
    return await ctx.storage.generateUploadUrl();
  },
});
