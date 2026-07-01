// The single place that holds kintone DOM selector strings (paired with
// styles/selectors.css). When a kintone update breaks the theme, edit this file
// and selectors.css and nothing else (FR-7).
//
// TODO(spec FR-7): these class names track kintone's current DOM and are not a
// stable contract. Verify them against the running kintone version before
// release; the list-table names below drive the breakage fallback (FR-9), so
// keep them in step with the .recordlist-* selectors in selectors.css.

/**
 * List-table selectors. FR-9 uses these for breakage detection: on the list
 * screen with viewType "list", if none of these match, the theme is switched
 * off for that page load and a warning is logged.
 */
export const LIST_TABLE_SELECTORS: readonly string[] = [
  ".recordlist-gaia",
  ".recordlist-header-gaia",
  ".recordlist-row-gaia",
  ".recordlist-cell-gaia",
];

/**
 * Detail-screen field label/value selectors. Listed for maintenance visibility
 * only. FR-9 does not use these for the fallback decision: a partial styling
 * miss here is tolerated (a missing label color is not a broken screen).
 */
export const DETAIL_FIELD_SELECTORS: readonly string[] = [
  ".control-label-gaia",
  ".control-value-gaia",
  ".layout-gaia",
];

/**
 * Header/toolbar selectors. Maintenance visibility only; not used for the
 * fallback decision.
 */
export const HEADER_SELECTORS: readonly string[] = [
  ".gaia-argoui-app-toolbar",
  ".gaia-argoui-app-index-toolbar",
  ".gaia-argoui-app-menu",
];

/**
 * Rich-text field container selectors. desktop.ts adds a policy class here and,
 * for tryDark, marks inline-colored descendants (FR-8/FR-10).
 */
export const RICHTEXT_CONTAINER_SELECTORS: readonly string[] = [
  ".ocean-ui-editor-field",
  ".control-rich_text-field-gaia .editor",
];
