import { resolve } from "node:path";
import { defineConfig } from "vite";

// kintone loads plugin JS as classic scripts, so every entry is emitted as a
// self-contained IIFE with all dependencies bundled in (no CDN at runtime).
// IIFE output does not support multiple entry points in one build, so scripts/
// build.mjs runs this config once per entry via the KTS_ENTRY env var.
type EntryName = "desktop" | "config";
const entry: EntryName = process.env.KTS_ENTRY === "config" ? "config" : "desktop";

export default defineConfig({
  build: {
    outDir: "dist",
    // Keep both entries; only the first pass in build.mjs (KTS_EMPTY=1) clears dist.
    emptyOutDir: process.env.KTS_EMPTY === "1",
    lib: {
      entry: resolve(__dirname, `src/${entry}/index.ts`),
      formats: ["iife"],
      name: entry === "desktop" ? "KintoneThemeSwitcherDesktop" : "KintoneThemeSwitcherConfig",
      fileName: () => `${entry}.js`,
    },
    minify: true,
    target: "es2019",
  },
});
