// Regenerates plugin/icon.png from plugin/icon.svg at 56x56. Tries rsvg-convert,
// then macOS sips. If neither is available it prints guidance and exits 1.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const svg = resolve(root, "plugin/icon.svg");
const png = resolve(root, "plugin/icon.png");

function has(cmd) {
  return spawnSync("which", [cmd], { stdio: "ignore" }).status === 0;
}

if (!existsSync(svg)) {
  console.error("plugin/icon.svg not found");
  process.exit(1);
}

let ok = false;
if (has("rsvg-convert")) {
  ok =
    spawnSync("rsvg-convert", ["-w", "56", "-h", "56", svg, "-o", png], { stdio: "inherit" })
      .status === 0;
} else if (has("sips")) {
  ok =
    spawnSync("sips", ["-s", "format", "png", "-z", "56", "56", svg, "--out", png], {
      stdio: "inherit",
    }).status === 0;
}

if (!ok) {
  console.error("No SVG rasterizer found. Install librsvg (rsvg-convert) or use sips on macOS.");
  process.exit(1);
}

console.log("Wrote plugin/icon.png (56x56).");
