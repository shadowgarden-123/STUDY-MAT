import { describe, expect, it } from "vitest";
import { suggestCategory } from "./categoryHints";

describe("suggestCategory", () => {
  it("reconnaît les objets des quatre familles", () => {
    expect(suggestCategory("Kit Arduino Uno")).toBe("electronique");
    expect(suggestCategory("Polycopié de Réseaux, L2")).toBe("cours");
    expect(suggestCategory("Blouse de labo, taille M")).toBe("labo");
    expect(suggestCategory("Manuel de biologie cellulaire")).toBe("livres");
  });

  it("reconnaît une plaque d'essai malgré l'apostrophe", () => {
    expect(suggestCategory("Plaque d'essai et résistances")).toBe(
      "electronique",
    );
  });

  it("ne suggère rien sans mot connu", () => {
    expect(suggestCategory("Chaise pliante")).toBeNull();
    expect(suggestCategory("ab")).toBeNull();
  });
});
