import { fr } from "@/i18n/fr";

export type FieldErrors = Record<string, string>;

export type AppError = {
  code: string;
  message: string;
  fields?: FieldErrors;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Extrait le format d'erreur Convex `{ code, message, fields }`. */
export function toAppError(error: unknown): AppError {
  if (isRecord(error) && isRecord(error.data)) {
    const data = error.data;
    const message =
      typeof data.message === "string" && data.message.length > 0
        ? data.message
        : fr.errors.generic;
    const fields =
      isRecord(data.fields) &&
      Object.values(data.fields).every((value) => typeof value === "string")
        ? (data.fields as FieldErrors)
        : undefined;
    return {
      code: typeof data.code === "string" ? data.code : "SERVER",
      message,
      fields,
    };
  }
  if (error instanceof Error && error.message) {
    return { code: "SERVER", message: fr.errors.generic };
  }
  return { code: "SERVER", message: fr.errors.generic };
}
