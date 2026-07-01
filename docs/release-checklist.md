# Release checklist

Manual verification matrix before publishing a release. Automated unit tests
cover the core logic; this list covers what only a real kintone environment and
real browsers show.

## Browser x screen matrix

Run each cell in dark and dim. Confirm no broken layout and no unreadable text.

| Screen | Chrome | Edge | Firefox | Safari |
| --- | --- | --- | --- | --- |
| Record list | | | | |
| Record detail | | | | |
| Record create | | | | |
| Record edit | | | | |

## Behavior checks

| Case | Expected | Pass |
| --- | --- | --- |
| No config saved, open all four screens fast | No console errors, no duplicated style tags or buttons | |
| Toggle cycles light -> dark -> dim -> auto | Tooltip text and data-kt-theme follow section 6.3 | |
| Reload after choosing dark | Stays dark (localStorage restore) | |
| Switching disabled, default dim | No toggle button, dim applied | |
| macOS auto, change system appearance | Open screen follows the OS change | |
| Two tabs of the same app, switch in one | The other tab follows | |
| Private browsing, switch then reload | Switch works in-tab, reload returns to default, no error | |
| Attachment image in a dark record | Thumbnail keeps original colors (no invert filter) | |
| Rich text with a yellow highlight, keepLight | Field stays on a white island, highlight stays yellow | |
| Rich text with a yellow highlight, tryDark | Field darkens, highlighted run keeps its colors | |
| Print (or print to PDF) a dark record | Prints on white | |
| Open the print preview screen | Standard appearance, no console error | |
| Windows high contrast theme on | System colors kept, plugin styles do not fight them | |
| Guest space app | Same behavior as a normal space | |
| Excel-like list-edit plugin on the same app | Either fallback with a warning, or coexists with that area left light; no exception | |

## kintone update watch

- The screenshot-comparison E2E (TC-19..TC-24) runs on the first of each month
  via GitHub Actions to catch selector drift after kintone updates.
- On a diff, the job fails and opens an issue. Suspect `styles/selectors.css`
  and `src/kintone/dom-map.ts` first. If any other file needs changing, revisit
  the two-layer split.
- Update baseline images only for intended changes, and state the reason in the
  commit.
