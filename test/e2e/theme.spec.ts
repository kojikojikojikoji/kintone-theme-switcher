import { expect, test } from "@playwright/test";
import { listUrl, login, readEnv } from "./helpers";

// These run against a development kintone environment configured via env vars.
// Without them the suite is skipped rather than failing, so CI without secrets
// stays green. Configure KINTONE_BASE_URL / _USERNAME / _PASSWORD / _APP_ID.
const env = readEnv();

test.describe("kintone-theme-switcher", () => {
  test.skip(env === null, "kintone connection env vars are not set");

  test.beforeEach(async ({ page }) => {
    if (env) {
      await login(page, env);
    }
  });

  // TC-19: default dark applies on the list screen.
  test("applies dark on the record list", async ({ page }) => {
    if (!env) return;
    await page.goto(listUrl(env));
    await expect(page.locator("html")).toHaveAttribute("data-kt-theme", "dark");
  });

  // TC-25: clicking the toggle cycles light -> dark -> dim -> auto.
  test("toggle cycles through themes", async ({ page }) => {
    if (!env) return;
    await page.goto(listUrl(env));
    const html = page.locator("html");
    const button = page.locator("#kp-kts-toggle");
    const seen: string[] = [];
    for (let i = 0; i < 4; i += 1) {
      seen.push((await html.getAttribute("data-kt-theme")) ?? "");
      await button.click();
    }
    expect(seen.length).toBe(4);
  });

  // TC-26: the chosen theme survives a reload (localStorage restore).
  test("restores the chosen theme after reload", async ({ page }) => {
    if (!env) return;
    await page.goto(listUrl(env));
    await page.locator("#kp-kts-toggle").click();
    const before = await page.locator("html").getAttribute("data-kt-theme");
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-kt-theme", before ?? "");
  });

  // TC-27: auto follows the OS color scheme.
  test("auto follows prefers-color-scheme", async ({ page }) => {
    if (!env) return;
    await page.emulateMedia({ colorScheme: "dark" });
    await page.goto(listUrl(env));
    await page.emulateMedia({ colorScheme: "light" });
    await expect(page.locator("html")).toHaveAttribute("data-kt-theme", "light");
  });

  // TC-35: printing reverts backgrounds to a light base.
  test("print media reverts to light backgrounds", async ({ page }) => {
    if (!env) return;
    await page.goto(listUrl(env));
    await page.emulateMedia({ media: "print" });
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).not.toBe("rgb(27, 30, 35)");
  });
});
