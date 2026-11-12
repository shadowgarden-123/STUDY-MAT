/** Lieux de remise partagés entre la validation serveur et l'interface. */
export const CAMPUS_LOCATIONS = [
  "Bâtiment A",
  "Bâtiment B",
  "Bâtiment C",
  "Résidence",
  "Amphi",
  "Bibliothèque",
  "Autre",
] as const;

export type CampusLocation = (typeof CAMPUS_LOCATIONS)[number];

export const CATEGORIES = ["livres", "cours", "electronique", "labo"] as const;
export type Category = (typeof CATEGORIES)[number];

export const MODES = ["don", "echange", "prix"] as const;
export type Mode = (typeof MODES)[number];

/** Domaine académique reconnu quand ALLOWED_EMAIL_DOMAINS n'est pas configuré. */
export function isAcademicEmail(email: string): boolean {
  const configured = process.env.ALLOWED_EMAIL_DOMAINS;
  const domain = email.split("@")[1]?.toLowerCase() ?? "";
  if (!domain) return false;
  if (configured && configured.trim().length > 0) {
    return configured
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter(Boolean)
      .includes(domain);
  }
  return (
    domain.includes("univ") ||
    domain.endsWith(".edu") ||
    domain.endsWith(".edu.ci") ||
    domain.endsWith(".ac.ci")
  );
}
