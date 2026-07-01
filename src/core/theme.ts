// Theme resolution logic: cycling, auto resolution, config/localStorage schema
// validation, and the decide/persist helpers. Pure and kintone-independent so
// every branch is unit-testable (TC-1..TC-9, TC-18). No DOM or kintone globals.

import { z } from "zod";

export type Theme = "light" | "dark" | "dim" | "auto";
export type ResolvedTheme = "light" | "dark" | "dim";

export const THEMES: readonly Theme[] = ["light", "dark", "dim", "auto"] as const;

// Button cycle order (FR-4): light -> dark -> dim -> auto -> light.
const CYCLE_ORDER: readonly Theme[] = ["light", "dark", "dim", "auto"] as const;

/** Next theme in the cycle. Unknown input restarts at light. */
export function cycle(current: Theme): Theme {
  const i = CYCLE_ORDER.indexOf(current);
  if (i === -1) {
    return CYCLE_ORDER[0];
  }
  return CYCLE_ORDER[(i + 1) % CYCLE_ORDER.length];
}

/**
 * Resolve a raw theme to what is actually applied. Only auto depends on the OS
 * setting; auto never resolves to dim (FR-2). `prefersDark` is the result of
 * matchMedia('(prefers-color-scheme: dark)').matches, passed in so this stays
 * pure.
 */
export function resolve(theme: Theme, prefersDark: boolean): ResolvedTheme {
  if (theme === "auto") {
    return prefersDark ? "dark" : "light";
  }
  return theme;
}

// ---- plugin config (setConfig/getConfig) ----

export const RichTextPolicy = z.enum(["keepLight", "tryDark"]);
export type RichTextPolicy = z.infer<typeof RichTextPolicy>;

export const SettingsSchema = z.object({
  defaultTheme: z.enum(["light", "dark", "dim", "auto"]),
  allowUserSwitch: z.boolean(),
  richTextPolicy: RichTextPolicy,
});
export type Settings = z.infer<typeof SettingsSchema>;

export const DEFAULT_SETTINGS: Settings = {
  defaultTheme: "auto",
  allowUserSwitch: true,
  richTextPolicy: "keepLight",
};

const ConfigEnvelope = z.object({
  version: z.literal(1),
  settings: SettingsSchema,
});

export const CONFIG_KEY = "config";
export const CONFIG_VERSION = 1;

/**
 * Validate the stored config JSON string. Any parse error, out-of-range value,
 * or version mismatch falls back to DEFAULT_SETTINGS without throwing (FR / TC-6).
 */
export function parseConfig(raw: string | null | undefined): Settings {
  if (!raw) {
    return { ...DEFAULT_SETTINGS };
  }
  try {
    const parsed = ConfigEnvelope.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.settings : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

/** Serialize settings into the envelope stored under the single `config` key. */
export function serializeConfig(settings: Settings): string {
  return JSON.stringify({ version: CONFIG_VERSION, settings });
}

// ---- per-user localStorage selection ----

const StoredSchema = z.object({
  version: z.literal(1),
  theme: z.enum(["light", "dark", "dim", "auto"]),
});
export type StoredSelection = z.infer<typeof StoredSchema>;

/**
 * Parse a localStorage value into a Theme, or null when absent/corrupt/wrong
 * version (TC-7/TC-8). The caller falls back to the default theme on null.
 */
export function parseStored(raw: string | null | undefined): Theme | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = StoredSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data.theme : null;
  } catch {
    return null;
  }
}

/** Serialize a user selection for localStorage. */
export function serializeStored(theme: Theme): string {
  return JSON.stringify({ version: 1, theme } satisfies StoredSelection);
}

/**
 * localStorage key, namespaced by domain + app + user so it never collides with
 * other apps, users, or plugins (common spec section 6).
 */
export function buildStorageKey(domain: string, appId: string | number, userCode: string): string {
  return `kp-kts-${domain}-${appId}-${userCode}`;
}

/**
 * Decide the raw theme to apply (auto still unresolved). When the admin has
 * turned off user switching the default theme is forced and any stored value is
 * ignored (FR-2 / TC-9).
 */
export function decideTheme(settings: Settings, stored: Theme | null): Theme {
  if (!settings.allowUserSwitch) {
    return settings.defaultTheme;
  }
  return stored ?? settings.defaultTheme;
}

/**
 * Given a storage event and this tab's expected key, return the new theme to
 * apply, or null to ignore. Only the own key with a valid value is honored;
 * other keys and corrupt values are ignored (TC-18 / EC-14).
 */
export function handleStorageEvent(
  event: { key: string | null; newValue: string | null },
  expectedKey: string,
): Theme | null {
  if (event.key !== expectedKey) {
    return null;
  }
  return parseStored(event.newValue);
}
