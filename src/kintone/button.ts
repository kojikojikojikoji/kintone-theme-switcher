// Header toggle button (FR-4). Rendered idempotently into the header menu space
// provided by the caller. Icons are static SVG built without innerHTML string
// concatenation of any dynamic value (security section 6).

import type { ResolvedTheme, Theme } from "../core/theme";

export const BUTTON_ID = "kp-kts-toggle";

// 20px monoline icons keyed by the raw theme value (auto has its own half icon).
const ICONS: Record<Theme, string> = {
  light: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/></svg>`,
  dark: `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" stroke="none" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>`,
  dim: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>`,
  auto: `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 3v18" /><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" stroke="none"/></svg>`,
};

// Tooltip / aria-label strings (requirement 6.3, kept in Japanese as UI copy).
export function labelFor(theme: Theme, resolved: ResolvedTheme): string {
  switch (theme) {
    case "light":
      return "テーマ: ライト（クリックでダークに切替）";
    case "dark":
      return "テーマ: ダーク（クリックでディムに切替）";
    case "dim":
      return "テーマ: ディム（クリックで自動に切替）";
    case "auto":
      return resolved === "dark"
        ? "テーマ: 自動（現在はダーク。クリックでライトに切替）"
        : "テーマ: 自動（現在はライト。クリックでライトに切替）";
  }
}

function svgNode(markup: string): Node {
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml");
  return document.importNode(doc.documentElement, true);
}

/**
 * Create or update the toggle button inside `space`. Returns the button. Safe to
 * call on every show event: an existing button is reused, so listeners and DOM
 * do not multiply (common spec section 4).
 */
export function renderButton(
  space: HTMLElement,
  theme: Theme,
  resolved: ResolvedTheme,
  onClick: () => void,
): HTMLButtonElement {
  let button = space.querySelector<HTMLButtonElement>(`#${BUTTON_ID}`);
  if (!button) {
    button = document.createElement("button");
    button.id = BUTTON_ID;
    button.type = "button";
    button.className = "kp-kts-toggle";
    button.addEventListener("click", () => onClick());
    space.appendChild(button);
  }
  const label = labelFor(theme, resolved);
  button.title = label;
  button.setAttribute("aria-label", label);
  button.replaceChildren(svgNode(ICONS[theme]));
  return button;
}

/** Remove the button if present (used when switching is disallowed or on fallback). */
export function removeButton(space: HTMLElement | null): void {
  const button = space?.querySelector<HTMLButtonElement>(`#${BUTTON_ID}`);
  button?.remove();
}
