import { describe, expect, it } from "vitest";
import { matchesAllWords, normalizeText } from "@/convex/lib/normalize";

describe("normalizeText", () => {
  it("retire accents, majuscules et ponctuation", () => {
    expect(normalizeText("Électronique")).toBe("electronique");
    expect(normalizeText("  Cours de Réseaux, L2 !! ")).toBe(
      "cours de reseaux l2",
    );
  });

  it("permet de trouver « électro » dans « Électronique »", () => {
    expect(normalizeText("Électronique").includes("electro")).toBe(true);
  });
});

describe("matchesAllWords", () => {
  const text = normalizeText(
    "Kit Arduino Uno et câbles. Plaque d'essai et résistances.",
  );

  it("exige tous les mots de la requête", () => {
    expect(matchesAllWords(text, "arduino cables")).toBe(true);
    expect(matchesAllWords(text, "arduino blouse")).toBe(false);
  });

  it("accepte une requête vide", () => {
    expect(matchesAllWords(text, "")).toBe(true);
  });
});
