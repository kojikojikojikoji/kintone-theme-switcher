// Assembles the plugin contents (built JS + manifest + icon + config files) and
// packs them into a .zip with @kintone/plugin-packer. Run `npm run build` first.
//
// A private key signs the plugin id. If private.ppk is absent, plugin-packer
// generates one and writes it next to the output; keep that file to publish
// updates under the same plugin id. private.ppk is gitignored.
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const contents = resolve(root, "build/plugin-contents");

for (const f of ["dist/desktop.js", "dist/config.js"]) {
  if (!existsSync(resolve(root, f))) {
    console.error(`Missing ${f}. Run "npm run build" first.`);
    process.exit(1);
  }
}

rmSync(contents, { recursive: true, force: true });
mkdirSync(contents, { recursive: true });

const copy = [
  ["plugin/manifest.json", "manifest.json"],
  ["plugin/icon.png", "icon.png"],
  ["dist/desktop.js", "desktop.js"],
  ["dist/config.js", "config.js"],
  ["src/config/config.html", "config.html"],
  ["src/config/theme.css", "config.css"],
];
for (const [from, to] of copy) {
  cpSync(resolve(root, from), resolve(contents, to));
}

const args = [contents, "--out", resolve(root, "dist/plugin.zip")];
if (existsSync(resolve(root, "private.ppk"))) {
  args.push("--ppk", resolve(root, "private.ppk"));
}

const result = spawnSync("kintone-plugin-packer", args, { stdio: "inherit", shell: true });
process.exit(result.status ?? 1);
