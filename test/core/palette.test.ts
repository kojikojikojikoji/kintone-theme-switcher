import { describe, expect, it } from "vitest";
import { contrastPairs, contrastRatio, DARK, DIM } from "../../src/core/palette";

describe("contrastRatio", () => {
  it("computes the known black/white ratio (21:1)", () => {
    expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 0);
  });
  it("is 1 for identical colors", () => {
    expect(contrastRatio("#123456", "#123456")).toBeCloseTo(1, 5);
  });
});

describe("dark palette contrast (TC-10)", () => {
  for (const [label, fg, bg] of contrastPairs(DARK)) {
    it(`${label} meets WCAG AA 4.5:1`, () => {
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
    });
  }
});

describe("dim palette contrast (TC-11)", () => {
  for (const [label, fg, bg] of contrastPairs(DIM)) {
    it(`${label} meets WCAG AA 4.5:1`, () => {
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
    });
  }
});
