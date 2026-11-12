import { describe, expect, it } from "vitest";
import { listingInputSchema, messageSchema, profileSchema } from "./validation";

const baseListing = {
  title: "Carte Arduino Uno",
  description: "Servie deux TP, encore parfaite.",
  category: "electronique" as const,
  mode: "don" as const,
  location: "Bâtiment B" as const,
};

describe("listingInputSchema", () => {
  it("accepte une annonce en don, sans prix", () => {
    expect(listingInputSchema.safeParse(baseListing).success).toBe(true);
  });

  it("nettoie les espaces autour du titre et de la description", () => {
    const result = listingInputSchema.safeParse({
      ...baseListing,
      title: "   Polycopié L2   ",
      description: "  Cours complet.  ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe("Polycopié L2");
      expect(result.data.description).toBe("Cours complet.");
    }
  });

  it("exige un prix quand le mode est « prix »", () => {
    const result = listingInputSchema.safeParse({ ...baseListing, mode: "prix" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["priceFcfa"]);
    }
  });

  it("accepte un prix raisonnable, refuse les extrêmes et les décimales", () => {
    const withPrice = (priceFcfa: number) =>
      listingInputSchema.safeParse({ ...baseListing, mode: "prix", priceFcfa });
    expect(withPrice(2_000).success).toBe(true);
    expect(withPrice(50).success).toBe(false);
    expect(withPrice(60_000).success).toBe(false);
    expect(withPrice(1_500.5).success).toBe(false);
  });

  it("refuse un titre trop court et une catégorie inconnue", () => {
    expect(
      listingInputSchema.safeParse({ ...baseListing, title: "ab" }).success,
    ).toBe(false);
    expect(
      listingInputSchema.safeParse({ ...baseListing, category: "divers" })
        .success,
    ).toBe(false);
  });
});

describe("messageSchema", () => {
  it("refuse un message vide, accepte 1000 caractères et pas 1001", () => {
    expect(messageSchema.safeParse({ body: "   " }).success).toBe(false);
    expect(messageSchema.safeParse({ body: "a".repeat(1000) }).success).toBe(
      true,
    );
    expect(messageSchema.safeParse({ body: "a".repeat(1001) }).success).toBe(
      false,
    );
  });
});

describe("profileSchema", () => {
  it("accepte un nom et un niveau lisibles, refuse un nom d'un caractère", () => {
    expect(
      profileSchema.safeParse({ displayName: "Awa K.", level: "L2 MIAGE" })
        .success,
    ).toBe(true);
    expect(
      profileSchema.safeParse({ displayName: "A", level: "L2 MIAGE" }).success,
    ).toBe(false);
  });
});
