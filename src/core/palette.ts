// Color palette constants and WCAG contrast math. Pure and kintone-independent
// so the contrast requirement (6.1) can be verified in unit tests (TC-10/TC-11).
//
// These values mirror styles/tokens.css. tokens.css is the runtime source of
// truth for the browser; this object exists so the same numbers can be checked
// programmatically. Keep the two in sync.

export interface Palette {
  bg: string;
  bgElevated: string;
  text: string;
  textSub: string;
  border: string;
  link: string;
  rowHover: string;
  rowSelected: string;
  inputBg: string;
  inputBorder: string;
  headerBg: string;
  focus: string;
}

export const DARK: Palette = {
  bg: "#1b1e23",
  bgElevated: "#23272e",
  text: "#d6dde4",
  textSub: "#9aa4af",
  border: "#3a4048",
  link: "#6cb2e8",
  rowHover: "#2a2f37",
  rowSelected: "#1f3a52",
  inputBg: "#15181c",
  inputBorder: "#3a4048",
  headerBg: "#23272e",
  focus: "#6cb2e8",
};

export const DIM: Palette = {
  bg: "#2e343c",
  bgElevated: "#383f49",
  text: "#e3e8ed",
  textSub: "#a8b2bc",
  border: "#4d555f",
  link: "#8fc3ee",
  rowHover: "#414956",
  rowSelected: "#35516c",
  inputBg: "#272c33",
  inputBorder: "#4d555f",
  headerBg: "#383f49",
  focus: "#8fc3ee",
};

function channelToLinear(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

/** Relative luminance of a #rrggbb color per WCAG 2.1. */
export function relativeLuminance(hex: string): number {
  const match = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!match) {
    throw new Error(`relativeLuminance: expected a #rrggbb color, got "${hex}"`);
  }
  const int = parseInt(match[1], 16);
  const r = (int >> 16) & 0xff;
  const g = (int >> 8) & 0xff;
  const b = int & 0xff;
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

/** WCAG contrast ratio between two #rrggbb colors (1..21). */
export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * The foreground/background pairs from requirement 6.1 that must clear WCAG AA
 * body text (4.5:1). Returned as [label, fg, bg] tuples for a palette.
 */
export function contrastPairs(p: Palette): Array<[string, string, string]> {
  return [
    ["text/bg", p.text, p.bg],
    ["text/bgElevated", p.text, p.bgElevated],
    ["text/inputBg", p.text, p.inputBg],
    ["textSub/bg", p.textSub, p.bg],
    ["link/bg", p.link, p.bg],
    ["text/rowHover", p.text, p.rowHover],
    ["text/rowSelected", p.text, p.rowSelected],
  ];
}
