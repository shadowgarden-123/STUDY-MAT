import { normalizeText } from "@/convex/lib/normalize";
import type { Category } from "@/convex/config/campus";

const HINTS: Array<{ category: Category; words: string[] }> = [
  {
    category: "electronique",
    words: [
      "arduino",
      "resistance",
      "capteur",
      "plaque d essai",
      "calculatrice",
      "carte",
      "cable",
      "multiprise",
      "rallonge",
      "composant",
      "breadboard",
      "raspberry",
      "microcontroleur",
      "casio",
    ],
  },
  {
    category: "livres",
    words: [
      "livre",
      "manuel",
      "edition",
      "dictionnaire",
      "roman",
      "robert",
      "atlas",
      "ouvrage",
    ],
  },
  {
    category: "cours",
    words: [
      "polycopie",
      "cours",
      "td",
      "tp",
      "annales",
      "fiche",
      "resume",
      "support",
      "note",
      "partiel",
      "examen",
    ],
  },
  {
    category: "labo",
    words: [
      "blouse",
      "eprouvette",
      "becher",
      "gants",
      "lunettes",
      "verrerie",
      "pipette",
      "labo",
      "laboratoire",
    ],
  },
];

/**
 * Suggestion jamais imposée : un indice simple sur le titre.
 * Renvoie null dès qu'aucun mot connu n'apparaît.
 */
export function suggestCategory(title: string): Category | null {
  const normalized = ` ${normalizeText(title)} `;
  if (normalized.trim().length < 3) return null;
  for (const hint of HINTS) {
    for (const word of hint.words) {
      if (normalized.includes(` ${word} `)) return hint.category;
    }
  }
  return null;
}
