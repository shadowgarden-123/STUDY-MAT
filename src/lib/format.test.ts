import { describe, expect, it } from "vitest";
import {
  formatPrice,
  formatRelativeDate,
  parsePriceInput,
} from "./format";

const NBSP = "\u00a0";
const NOW = new Date("2026-11-11T12:00:00Z").getTime();
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatPrice", () => {
  it("sépare le nombre et l'unité par une espace insécable", () => {
    expect(formatPrice(500)).toBe(`500${NBSP}FCFA`);
    expect(formatPrice(2000)).toBe(`2${NBSP}000${NBSP}FCFA`);
    expect(formatPrice(50000)).toBe(`50${NBSP}000${NBSP}FCFA`);
  });
});

describe("formatRelativeDate", () => {
  it("couvre chaque palier demandé", () => {
    expect(formatRelativeDate(NOW - 30_000, NOW)).toBe("à l'instant");
    expect(formatRelativeDate(NOW - 2 * HOUR, NOW)).toBe("il y a 2 h");
    expect(formatRelativeDate(NOW - 30 * HOUR, NOW)).toBe("hier");
    expect(formatRelativeDate(NOW - 3 * DAY, NOW)).toBe("il y a 3 j");
    expect(formatRelativeDate(NOW - 8 * DAY, NOW)).toBe("il y a 1 sem.");
  });

  it("bascule sur une date courte au-delà de 4 semaines", () => {
    expect(formatRelativeDate(NOW - 40 * DAY, NOW)).toMatch(
      /^\d{2}\/\d{2}\/\d{4}$/,
    );
  });

  it("ne produit jamais de temps négatif", () => {
    expect(formatRelativeDate(NOW + 5_000, NOW)).toBe("à l'instant");
  });
});

describe("parsePriceInput", () => {
  it("accepte les espaces et les séparateurs de milliers", () => {
    expect(parsePriceInput("2 000")).toBe(2000);
    expect(parsePriceInput("2\u202f000")).toBe(2000);
    expect(parsePriceInput("500 FCFA")).toBe(500);
  });

  it("refuse une saisie sans chiffre", () => {
    expect(parsePriceInput("")).toBeNull();
    expect(parsePriceInput("FCFA")).toBeNull();
  });
});
