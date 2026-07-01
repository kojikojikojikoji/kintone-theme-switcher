import { describe, expect, it } from "vitest";
import { detectListTable } from "../../src/core/detect";
import { LIST_TABLE_SELECTORS } from "../../src/kintone/dom-map";

describe("detectListTable (TC-16/17)", () => {
  it("returns true when a list-table element is present", () => {
    const root = document.createElement("div");
    const table = document.createElement("div");
    table.className = "recordlist-gaia";
    root.appendChild(table);
    expect(detectListTable(root, LIST_TABLE_SELECTORS)).toBe(true);
  });

  it("returns false for an empty DOM", () => {
    const root = document.createElement("div");
    expect(detectListTable(root, LIST_TABLE_SELECTORS)).toBe(false);
  });

  it("ignores a malformed selector without throwing", () => {
    const root = document.createElement("div");
    expect(detectListTable(root, ["::::bad"])).toBe(false);
  });
});
