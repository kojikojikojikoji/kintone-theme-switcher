import { describe, expect, it } from "vitest";
import {
  buildStorageKey,
  cycle,
  decideTheme,
  DEFAULT_SETTINGS,
  handleStorageEvent,
  parseConfig,
  parseStored,
  resolve,
  serializeConfig,
  serializeStored,
  type Settings,
} from "../../src/core/theme";

describe("cycle (TC-1)", () => {
  it("cycles light -> dark -> dim -> auto -> light", () => {
    let t = cycle("light");
    expect(t).toBe("dark");
    t = cycle(t);
    expect(t).toBe("dim");
    t = cycle(t);
    expect(t).toBe("auto");
    t = cycle(t);
    expect(t).toBe("light");
  });
});

describe("resolve (TC-2/3/4)", () => {
  // matchMedia is mocked upstream; resolve takes the resulting boolean.
  it("auto -> dark when OS prefers dark", () => {
    expect(resolve("auto", true)).toBe("dark");
  });
  it("auto -> light when OS does not prefer dark", () => {
    expect(resolve("auto", false)).toBe("light");
  });
  it("non-auto passes through unchanged", () => {
    expect(resolve("dim", true)).toBe("dim");
    expect(resolve("dark", false)).toBe("dark");
    expect(resolve("light", true)).toBe("light");
  });
});

describe("parseConfig (TC-5/6)", () => {
  it("reads a valid config", () => {
    const raw = serializeConfig({
      defaultTheme: "dark",
      allowUserSwitch: false,
      richTextPolicy: "tryDark",
    });
    expect(parseConfig(raw)).toEqual({
      defaultTheme: "dark",
      allowUserSwitch: false,
      richTextPolicy: "tryDark",
    });
  });

  it("falls back to defaults on broken JSON, out-of-range, or wrong version", () => {
    expect(parseConfig("{not json")).toEqual(DEFAULT_SETTINGS);
    expect(parseConfig(JSON.stringify({ version: 1, settings: { defaultTheme: "blue" } }))).toEqual(
      DEFAULT_SETTINGS,
    );
    expect(
      parseConfig(
        JSON.stringify({
          version: 2,
          settings: { defaultTheme: "dark", allowUserSwitch: true, richTextPolicy: "keepLight" },
        }),
      ),
    ).toEqual(DEFAULT_SETTINGS);
    expect(parseConfig(undefined)).toEqual(DEFAULT_SETTINGS);
  });
});

describe("parseStored (TC-7/8)", () => {
  it("reads a valid stored selection", () => {
    expect(parseStored(serializeStored("dark"))).toBe("dark");
  });
  it("returns null on corrupt or wrong-version values", () => {
    expect(parseStored("garbage")).toBeNull();
    expect(parseStored(JSON.stringify({ version: 2, theme: "dark" }))).toBeNull();
    expect(parseStored(JSON.stringify({ version: 1, theme: "purple" }))).toBeNull();
    expect(parseStored(null)).toBeNull();
  });
});

describe("decideTheme (TC-9)", () => {
  it("ignores the stored value when switching is disallowed", () => {
    const settings: Settings = {
      defaultTheme: "dim",
      allowUserSwitch: false,
      richTextPolicy: "keepLight",
    };
    expect(decideTheme(settings, "dark")).toBe("dim");
  });
  it("uses the stored value when switching is allowed", () => {
    const settings: Settings = {
      defaultTheme: "auto",
      allowUserSwitch: true,
      richTextPolicy: "keepLight",
    };
    expect(decideTheme(settings, "dark")).toBe("dark");
    expect(decideTheme(settings, null)).toBe("auto");
  });
});

describe("handleStorageEvent (TC-18)", () => {
  const key = buildStorageKey("example.cybozu.com", 12, "user1");

  it("reflects only the own key with a valid value", () => {
    expect(handleStorageEvent({ key, newValue: serializeStored("dim") }, key)).toBe("dim");
  });
  it("ignores other keys", () => {
    expect(handleStorageEvent({ key: "other", newValue: serializeStored("dim") }, key)).toBeNull();
  });
  it("ignores corrupt values on the own key", () => {
    expect(handleStorageEvent({ key, newValue: "broken" }, key)).toBeNull();
  });
});
