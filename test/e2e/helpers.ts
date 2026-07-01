import type { Page } from "@playwright/test";

export interface KintoneEnv {
  baseUrl: string;
  username: string;
  password: string;
  appId: string;
}

/** Reads the kintone connection from environment variables, or null if unset. */
export function readEnv(): KintoneEnv | null {
  const baseUrl = process.env.KINTONE_BASE_URL;
  const username = process.env.KINTONE_USERNAME;
  const password = process.env.KINTONE_PASSWORD;
  const appId = process.env.KINTONE_APP_ID;
  if (!baseUrl || !username || !password || !appId) {
    return null;
  }
  return { baseUrl, username, password, appId };
}

/** Logs into kintone using the form login page. */
export async function login(page: Page, env: KintoneEnv): Promise<void> {
  await page.goto(`${env.baseUrl}/login`);
  await page.fill('input[name="username"]', env.username);
  await page.fill('input[name="password"]', env.password);
  await page.click('button[type="submit"], .login-button-gaia');
  await page.waitForLoadState("networkidle");
}

export function listUrl(env: KintoneEnv): string {
  return `${env.baseUrl}/k/${env.appId}/`;
}
