const NBSP = "\u00a0";
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** 500 FCFA, 2 000 FCFA — espace insécable entre le nombre et l'unité. */
export function formatPrice(value: number): string {
  const formatted = new Intl.NumberFormat("fr-FR")
    .format(value)
    .replace(/[\u202f\u00a0]/g, NBSP);
  return `${formatted}${NBSP}FCFA`;
}

export function formatRelativeDate(
  timestamp: number,
  now: number = Date.now(),
): string {
  const diff = Math.max(0, now - timestamp);
  if (diff < MINUTE) return "à l'instant";
  if (diff < HOUR) return `il y a ${Math.floor(diff / MINUTE)} min`;
  if (diff < DAY) return `il y a ${Math.floor(diff / HOUR)} h`;
  if (diff < 2 * DAY) return "hier";
  if (diff < 7 * DAY) return `il y a ${Math.floor(diff / DAY)} j`;
  if (diff < 28 * DAY) {
    const weeks = Math.floor(diff / (7 * DAY));
    return `il y a ${weeks} sem.`;
  }
  return formatShortDate(timestamp);
}

export function formatShortDate(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(timestamp);
}

export function formatLongDate(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(timestamp);
}

export function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(timestamp);
}

/** Saisie libre « 2 000 » → 2000 ; null si aucun chiffre. */
export function parsePriceInput(value: string): number | null {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return null;
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatPriceInput(value: number | undefined | null): string {
  if (value === undefined || value === null) return "";
  return new Intl.NumberFormat("fr-FR").format(value);
}

export function firstName(displayName: string): string {
  return displayName.trim().split(/\s+/)[0] ?? displayName;
}

export function initials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "US";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
