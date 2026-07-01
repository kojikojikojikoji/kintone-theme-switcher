// Breakage detection (FR-9). Pure: given a root node and the list-table selector
// strings from dom-map, report whether kintone's list table is present. If none
// match after a kintone UI change, desktop.ts falls back to light. Unit-tested
// with jsdom (TC-16/TC-17).

/** True when at least one of the selectors matches an element under `root`. */
export function detectListTable(root: ParentNode, selectors: readonly string[]): boolean {
  return selectors.some((selector) => {
    try {
      return root.querySelector(selector) !== null;
    } catch {
      // A malformed selector should not throw the whole check; treat as no match.
      return false;
    }
  });
}
