import { ConvexError } from "convex/values";
import { z } from "zod";
import { CATEGORIES, CAMPUS_LOCATIONS, MODES } from "../config/campus";

export type FieldErrors = Record<string, string>;

export type AppErrorCode =
  | "VALIDATION"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED";

export function fail(
  code: AppErrorCode,
  message: string,
  fields?: FieldErrors,
): never {
  throw new ConvexError({ code, message, fields });
}

export function parseOrFail<T extends z.ZodType>(
  schema: T,
  value: unknown,
): z.infer<T> {
  const result = schema.safeParse(value);
  if (result.success) return result.data;

  const fields: FieldErrors = {};
  for (const issue of result.error.issues) {
    const key =
      typeof issue.path[0] === "string" ? String(issue.path[0]) : "form";
    if (!fields[key]) fields[key] = issue.message;
  }
  fail(
    "VALIDATION",
    Object.values(fields)[0] ?? "Vérifie les champs indiqués.",
    fields,
  );
}

export const profileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(2, "Ton nom doit faire entre 2 et 40 caractères.")
    .max(40, "Ton nom doit faire entre 2 et 40 caractères."),
  level: z
    .string()
    .trim()
    .min(2, "Indique ton niveau et ta filière.")
    .max(60, "Ton niveau doit faire moins de 60 caractères."),
});

export const listingInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Le titre doit faire entre 3 et 80 caractères.")
      .max(80, "Le titre doit faire entre 3 et 80 caractères."),
    description: z
      .string()
      .trim()
      .max(1000, "La description ne peut pas dépasser 1000 caractères."),
    category: z.enum(CATEGORIES, { message: "Choisis une catégorie." }),
    mode: z.enum(MODES, { message: "Choisis un mode." }),
    priceFcfa: z.number().int().optional(),
    exchangeWanted: z
      .string()
      .trim()
      .max(120, "120 caractères maximum pour l'échange recherché.")
      .optional(),
    location: z.enum(CAMPUS_LOCATIONS, {
      message: "Choisis un lieu de remise.",
    }),
    photoStorageId: z.string().optional(),
    publishDurationMs: z.number().min(0).max(600_000).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.mode === "prix") {
      if (value.priceFcfa === undefined) {
        ctx.addIssue({
          code: "custom",
          path: ["priceFcfa"],
          message: "Indique un prix entre 100 et 50 000 FCFA.",
        });
      } else if (
        !Number.isInteger(value.priceFcfa) ||
        value.priceFcfa < 100 ||
        value.priceFcfa > 50_000
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["priceFcfa"],
          message: "Le prix doit être entre 100 et 50 000 FCFA.",
        });
      }
    }
  });

export const messageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Écris un message avant d'envoyer.")
    .max(1000, "Ton message est trop long (1000 caractères maximum)."),
});

export const reportSchema = z.object({
  reason: z.enum(["inapproprie", "arnaque", "doublon", "autre"]),
  note: z
    .string()
    .trim()
    .max(300, "300 caractères maximum pour le détail.")
    .optional(),
});
