// Builds each kintone entry as its own IIFE. Vite's IIFE format allows only one
// entry per build, so desktop and config are built in separate passes. The
// first pass clears dist; the second keeps it.
import { spawnSync } from "node:child_process";

const entries = ["desktop", "config"];
let first = true;

for (const entry of entries) {
  const result = spawnSync("vite", ["build"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, KTS_ENTRY: entry, KTS_EMPTY: first ? "1" : "0" },
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
  first = false;
}
