// Config screen logic. Loads the saved settings, populates the form, validates,
// and saves under the single `config` key as a versioned JSON envelope. No REST
// call is needed because this plugin stores no field references (7.1).

import { CONFIG_KEY, type Settings, parseConfig, serializeConfig } from "../core/theme";

function radioValue(name: string): string | null {
  const checked = document.querySelector<HTMLInputElement>(`input[name="${name}"]:checked`);
  return checked ? checked.value : null;
}

function setRadio(name: string, value: string): void {
  const input = document.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`);
  if (input) {
    input.checked = true;
  }
}

function showError(id: string, message: string | null): void {
  const el = document.getElementById(id);
  if (!el) {
    return;
  }
  if (message) {
    el.textContent = message;
    el.hidden = false;
  } else {
    el.textContent = "";
    el.hidden = true;
  }
}

function load(settings: Settings): void {
  setRadio("defaultTheme", settings.defaultTheme);
  setRadio("richTextPolicy", settings.richTextPolicy);
  const allow = document.getElementById("kp-kts-allow-switch") as HTMLInputElement | null;
  if (allow) {
    allow.checked = settings.allowUserSwitch;
  }
}

function collect(): Settings | null {
  showError("kp-kts-default-theme-error", null);
  showError("kp-kts-richtext-error", null);

  const defaultTheme = radioValue("defaultTheme");
  const richTextPolicy = radioValue("richTextPolicy");
  const allow = document.getElementById("kp-kts-allow-switch") as HTMLInputElement | null;

  let ok = true;
  if (!defaultTheme) {
    showError("kp-kts-default-theme-error", "既定テーマを選択してください。");
    ok = false;
  }
  if (!richTextPolicy) {
    showError("kp-kts-richtext-error", "リッチテキストの表示方法を選択してください。");
    ok = false;
  }
  if (!ok) {
    return null;
  }

  return {
    defaultTheme: defaultTheme as Settings["defaultTheme"],
    allowUserSwitch: allow ? allow.checked : true,
    richTextPolicy: richTextPolicy as Settings["richTextPolicy"],
  };
}

function save(): void {
  const settings = collect();
  if (!settings) {
    return;
  }
  const config: Record<string, string> = { [CONFIG_KEY]: serializeConfig(settings) };
  const status = document.getElementById("kp-kts-status");
  kintone.plugin.app.setConfig(config, () => {
    if (status) {
      status.textContent =
        "設定を保存しました。アプリの設定画面で [アプリを更新] を実行すると反映されます。";
    }
    window.location.href = "../../" + "flow?app=" + kintone.app.getId() + "&mode=settings";
  });
}

function init(): void {
  const rawConfig = kintone.plugin.app.getConfig(kintone.$PLUGIN_ID);
  load(parseConfig(rawConfig ? rawConfig[CONFIG_KEY] : undefined));

  document.getElementById("kp-kts-save")?.addEventListener("click", save);
  document.getElementById("kp-kts-cancel")?.addEventListener("click", () => {
    window.history.back();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
