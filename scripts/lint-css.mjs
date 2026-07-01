// Enforces the two-layer CSS split (FR-7):
//   - selectors.css must contain no color literals (hex or rgb()/rgba()).
//   - tokens.css must contain no kintone DOM selectors.
// Exits non-zero on any violation so `npm run lint` catches drift.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(resolve(root, rel), "utf8");
}

// Strip /* ... */ block comments (including multi-line) while preserving line
// numbers, so the checks below never trip on prose inside comments.
function stripComments(src) {
  return src.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

const problems = [];

// selectors.css: no color literals.
const selectors = stripComments(read("styles/selectors.css"));
selectors.split("\n").forEach((code, i) => {
  if (/#[0-9a-fA-F]{3,8}\b/.test(code) || /\brgba?\(/.test(code)) {
    problems.push(`styles/selectors.css:${i + 1}: color literal not allowed here: ${code.trim()}`);
  }
});

// tokens.css: no kintone DOM selectors.
const tokens = stripComments(read("styles/tokens.css"));
tokens.split("\n").forEach((code, i) => {
  if (/\.(gaia|recordlist|control-|layout-|subtable|ocean-ui)/.test(code)) {
    problems.push(
      `styles/tokens.css:${i + 1}: kintone DOM selector not allowed here: ${code.trim()}`,
    );
  }
});

if (problems.length > 0) {
  console.error("CSS layer check failed:");
  for (const p of problems) {
    console.error("  " + p);
  }
  process.exit(1);
}

console.log("CSS layer check passed.");
