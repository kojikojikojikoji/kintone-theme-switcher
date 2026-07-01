// Rich-text inline-style exclusion (FR-10). Pure functions that take DOM nodes
// as arguments; they read the DOM but do not touch kintone globals, so they are
// unit-testable with jsdom (TC-12..TC-15).
//
// Reading el.style rather than matching the style attribute string avoids the
// trap that a substring test for "color" also matches "background-color"
// (FR-10 calls this out explicitly).

/**
 * True when the element carries an inline text color or an inline background,
 * meaning the user picked those colors and the theme must leave them alone.
 */
export function shouldKeep(el: HTMLElement): boolean {
  const style = el.style;
  const hasColor = style.color.trim() !== "";
  const hasBackground = style.backgroundColor.trim() !== "" || style.background.trim() !== "";
  return hasColor || hasBackground;
}

/**
 * Within a rich-text container, mark every element that carries an inline
 * color/background (and its whole subtree) with data-kt-keep so selectors.css
 * reverts theme colors there. Elements without inline colors are left for the
 * theme to darken. Returns the count of directly matched elements.
 */
export function markKeep(container: Element): number {
  let matched = 0;
  const all = container.querySelectorAll<HTMLElement>("*");
  all.forEach((el) => {
    if (el.hasAttribute("data-kt-keep")) {
      return;
    }
    if (shouldKeep(el)) {
      matched += 1;
      el.setAttribute("data-kt-keep", "");
      el.querySelectorAll("*").forEach((child) => child.setAttribute("data-kt-keep", ""));
    }
  });
  return matched;
}
