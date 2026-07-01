// Desktop entry. Injects the two-layer theme CSS as early as possible, decides
// and applies the theme, wires OS-follow and cross-tab sync, and (re)builds the
// header toggle idempotently on every screen. Processing bodies live in small
// functions; kintone.events.on registrations are listed at the bottom.

import tokensCss from "../../styles/tokens.css?raw";
import selectorsCss from "../../styles/selectors.css?raw";
import { detectListTable } from "../core/detect";
import { markKeep } from "../core/richtext";
import {
  CONFIG_KEY,
  DEFAULT_SETTINGS,
  type ResolvedTheme,
  type Settings,
  type Theme,
  buildStorageKey,
  cycle,
  decideTheme,
  handleStorageEvent,
  parseConfig,
  parseStored,
  resolve,
  serializeStored,
} from "../core/theme";
import { BUTTON_ID, removeButton, renderButton } from "../kintone/button";
import { LIST_TABLE_SELECTORS, RICHTEXT_CONTAINER_SELECTORS } from "../kintone/dom-map";

const PRINT_RE = /\/k\/(?:guest\/\d+\/)?\d+\/print/;
const TOKENS_STYLE_ID = "kp-kts-tokens";
const SELECTORS_STYLE_ID = "kp-kts-selectors";
const UI_STYLE_ID = "kp-kts-ui";
const TRANSITION_CLASS = "kp-kts-transition";
const THEME_ATTR = "data-kt-theme";
const TRANSITION_MS = 300;

const UI_CSS = [
  `.kp-kts-toggle{width:32px;height:32px;display:inline-flex;align-items:center;`,
  `justify-content:center;padding:0;margin:0 4px;border:none;background:transparent;`,
  `color:inherit;cursor:pointer;border-radius:6px;line-height:0;}`,
  `.kp-kts-toggle:hover{background:rgba(0,0,0,.06);}`,
  `html[data-kt-theme="dark"] .kp-kts-toggle:hover,`,
  `html[data-kt-theme="dim"] .kp-kts-toggle:hover{background:rgba(255,255,255,.08);}`,
  `.kp-kts-toggle:focus-visible{outline:2px solid var(--kt-focus,#0f6db3);outline-offset:2px;}`,
].join("");

// ---- module state (single tab) ----
let settings: Settings = { ...DEFAULT_SETTINGS };
let currentTheme: Theme = DEFAULT_SETTINGS.defaultTheme;
let fallbackActive = false;
let storageKey = "";
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

function injectStyle(id: string, css: string): void {
  if (document.getElementById(id)) {
    return; // idempotent: never inject twice across SPA navigations (FR-1)
  }
  const style = document.createElement("style");
  style.id = id;
  style.textContent = css;
  document.head.appendChild(style);
}

function resolveCurrent(): ResolvedTheme {
  if (fallbackActive) {
    return "light";
  }
  return resolve(currentTheme, prefersDark.matches);
}

function applyTheme(withTransition: boolean): void {
  const html = document.documentElement;
  if (withTransition) {
    html.classList.add(TRANSITION_CLASS);
    window.setTimeout(() => html.classList.remove(TRANSITION_CLASS), TRANSITION_MS);
  }
  html.setAttribute(THEME_ATTR, resolveCurrent());
}

function readStored(): Theme | null {
  if (!settings.allowUserSwitch) {
    return null; // forced default; ignore any saved value (EC-9)
  }
  try {
    return parseStored(localStorage.getItem(storageKey));
  } catch {
    return null; // localStorage blocked (EC-7)
  }
}

function persist(theme: Theme): void {
  if (!settings.allowUserSwitch) {
    return;
  }
  try {
    localStorage.setItem(storageKey, serializeStored(theme));
  } catch {
    // Private browsing / quota / policy: keep switching for this tab only (EC-7).
  }
}

function setTheme(theme: Theme, opts: { persist: boolean; transition: boolean }): void {
  currentTheme = theme;
  if (opts.persist) {
    persist(theme);
  }
  applyTheme(opts.transition);
  syncPrefersListener();
  updateButtonState();
}

function onToggle(): void {
  setTheme(cycle(currentTheme), { persist: true, transition: true });
}

function updateButtonState(): void {
  const button = document.getElementById(BUTTON_ID);
  const space = button?.parentElement;
  if (button && space) {
    renderButton(space, currentTheme, resolveCurrent(), onToggle);
  }
}

function onPrefersChange(): void {
  if (currentTheme === "auto") {
    applyTheme(true); // OS appearance changed (EC-13)
    updateButtonState();
  }
}

function syncPrefersListener(): void {
  prefersDark.removeEventListener("change", onPrefersChange);
  if (currentTheme === "auto") {
    prefersDark.addEventListener("change", onPrefersChange); // FR-3
  }
}

function onStorage(event: StorageEvent): void {
  const theme = handleStorageEvent(event, storageKey);
  if (theme !== null) {
    setTheme(theme, { persist: false, transition: true }); // cross-tab sync (EC-14)
  }
}

function activateFallback(): void {
  if (fallbackActive) {
    return;
  }
  fallbackActive = true;
  applyTheme(false);
  // eslint-disable-next-line no-console
  console.warn(
    "[kintone-theme-switcher] 一覧テーブルが検出できないため、テーマ適用を中止して" +
      "ライト表示に戻しました。kintone の UI 更新で selectors.css の対象セレクタが" +
      "変わった可能性があります。",
  );
}

function setupHeader(space: HTMLElement | null): void {
  if (!space) {
    return; // no header menu space on this screen (EC-15); theme still applied
  }
  if (!settings.allowUserSwitch || fallbackActive) {
    removeButton(space); // FR-4: no button when switching is off or on fallback
    return;
  }
  renderButton(space, currentTheme, resolveCurrent(), onToggle);
}

function applyRichText(): void {
  const dark = settings.richTextPolicy === "tryDark";
  for (const selector of RICHTEXT_CONTAINER_SELECTORS) {
    document.querySelectorAll<HTMLElement>(selector).forEach((container) => {
      if (dark) {
        container.classList.add("kp-kts-richtext-dark"); // FR-10
        markKeep(container);
      } else {
        container.classList.add("kp-kts-richtext-keep"); // FR-8 / 6.4 white island
      }
    });
  }
}

function onIndexShow(event: KintoneEvent): KintoneEvent {
  if (event.viewType === "list") {
    // Only the standard list has a table; calendar/custom views legitimately
    // have none, so they skip the check (FR-9 / EC-2).
    if (!detectListTable(document, LIST_TABLE_SELECTORS)) {
      activateFallback();
    }
  }
  setupHeader(kintone.app.getHeaderMenuSpaceElement());
  return event;
}

function onRecordShow(event: KintoneEvent): KintoneEvent {
  setupHeader(kintone.app.record.getHeaderMenuSpaceElement());
  applyRichText();
  return event;
}

function init(): void {
  if (PRINT_RE.test(location.pathname)) {
    return; // print preview: inject nothing, do nothing (FR-1 / EC-6)
  }
  injectStyle(TOKENS_STYLE_ID, tokensCss);
  injectStyle(SELECTORS_STYLE_ID, selectorsCss);
  injectStyle(UI_STYLE_ID, UI_CSS);

  const rawConfig = kintone.plugin.app.getConfig(kintone.$PLUGIN_ID);
  settings = parseConfig(rawConfig ? rawConfig[CONFIG_KEY] : undefined);

  const appId = kintone.app.getId() ?? 0;
  const userCode = kintone.getLoginUser().code;
  storageKey = buildStorageKey(location.hostname, appId, userCode);

  currentTheme = decideTheme(settings, readStored());
  applyTheme(false); // initial paint carries no transition (FR-6)
  syncPrefersListener();
  window.addEventListener("storage", onStorage);
}

init();

kintone.events.on("app.record.index.show", onIndexShow);
kintone.events.on(
  ["app.record.detail.show", "app.record.create.show", "app.record.edit.show"],
  onRecordShow,
);
