import { describe, expect, it } from "vitest";
import { markKeep, shouldKeep } from "../../src/core/richtext";

function el(html: string): HTMLElement {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.firstElementChild as HTMLElement;
}

describe("shouldKeep (TC-12/13/14)", () => {
  it("keeps an element with an inline background color", () => {
    expect(shouldKeep(el('<span style="background-color: yellow">x</span>'))).toBe(true);
  });
  it("keeps an element with an inline text color", () => {
    expect(shouldKeep(el('<span style="color: red">x</span>'))).toBe(true);
  });
  it("does not keep an element without inline color/background", () => {
    expect(shouldKeep(el("<span>x</span>"))).toBe(false);
    // An inline style unrelated to color must not trigger keep.
    expect(shouldKeep(el('<span style="font-weight: bold">x</span>'))).toBe(false);
  });
});

describe("markKeep (TC-15)", () => {
  it("marks only the inline-colored child and its descendants", () => {
    const container = document.createElement("div");
    container.innerHTML =
      '<p id="plain">a<span id="colored" style="color: red">b<b id="grand">c</b></span></p>';

    markKeep(container);

    expect(container.querySelector("#plain")!.hasAttribute("data-kt-keep")).toBe(false);
    expect(container.querySelector("#colored")!.hasAttribute("data-kt-keep")).toBe(true);
    expect(container.querySelector("#grand")!.hasAttribute("data-kt-keep")).toBe(true);
  });

  it("is idempotent across repeated calls", () => {
    const container = document.createElement("div");
    container.innerHTML = '<span style="color: red">x</span>';
    expect(markKeep(container)).toBe(1);
    // Already marked elements are skipped on a second pass.
    expect(markKeep(container)).toBe(0);
  });
});
