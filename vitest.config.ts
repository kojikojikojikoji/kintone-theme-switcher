import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    include: ["test/**/*.test.ts"],
    coverage: {
      include: ["src/core/**", "src/kintone/dom-map.ts"],
    },
  },
});
