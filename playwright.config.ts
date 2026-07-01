import { defineConfig, devices } from "@playwright/test";

// The connection target comes from environment variables so no host or account
// is committed. Defaults use the documentation placeholder domain.
//   KINTONE_BASE_URL   e.g. https://example.cybozu.com
//   KINTONE_USERNAME   login name
//   KINTONE_PASSWORD   password
//   KINTONE_APP_ID     app id with this plugin installed
export default defineConfig({
  testDir: "./test/e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  use: {
    baseURL: process.env.KINTONE_BASE_URL ?? "https://example.cybozu.com",
    viewport: { width: 1280, height: 900 },
    locale: "ja-JP",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
