/** Normalise une chaîne pour la recherche : minuscules, sans accents, espaces simples. */
export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

/** Tous les mots de la requête doivent être présents dans le texte normalisé. */
export function matchesAllWords(searchText: string, query: string): boolean {
  const words = normalizeText(query).split(" ").filter(Boolean);
  if (words.length === 0) return true;
  return words.every((word) => searchText.includes(word));
}
