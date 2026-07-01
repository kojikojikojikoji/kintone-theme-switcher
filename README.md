# kintone-theme-switcher

Documentation in Japanese: [README.ja.md](./README.ja.md)

A kintone plugin that applies a dark, dim, light, or OS-following theme to the
record screens of the app it is installed on. It injects a CSS theme and stores
the user's choice in the browser. It sends no network requests and calls no REST
API.

The theme applies only to the record list, record detail, record create, and
record edit screens of the app where the plugin is installed. The portal, spaces,
other apps, and the pages behind the kintone common header stay in their normal
colors. This is a limit of where a kintone plugin runs; there is no way around it.

## Screenshots

TODO: add four screenshots taken on the demo app (list dark before/after,
detail dim, settings screen, toggle button close-up). See `docs/release-checklist.md`
and the requirement doc section 12 for capture instructions.

## Themes

- light: kintone's standard colors. Nothing is applied.
- dark: a dark palette.
- dim: the same structure as dark, lighter, gray-based.
- auto: follows the OS setting (`prefers-color-scheme`). It resolves to dark when
  the OS is set to dark, otherwise to light. auto never resolves to dim.

## Install

1. Build the plugin zip:
   ```
   npm install
   npm run build
   npm run pack
   ```
   `npm run pack` writes `dist/plugin.zip`. If `private.ppk` does not exist yet,
   the packer creates a new private key next to the output. Keep that `.ppk`
   file to publish later updates under the same plugin id. It is gitignored and
   must not be committed.
2. In kintone, open the system settings, go to Plugins, and upload `dist/plugin.zip`.
3. Open the target app's settings, add the plugin to the app, then run Update App.

## Settings

Open the plugin settings from the app's plugin list.

- Default theme (light / auto / dark / dim): the theme applied to a user who has
  not switched. Default is auto.
- Allow user switching (checkbox, on by default): when on, each user can cycle
  the theme with a header button and the choice is saved per browser. When off,
  every user gets the default theme and no button is shown. Existing saved values
  are kept, so turning it back on restores each user's choice.
- Rich text field display (keep white / try dark): default keeps rich text on a
  white card so inline colors stay readable. "Try dark" darkens the field but
  leaves any run that sets its own text color or background unchanged.

After saving, run Update App on the app settings screen for the change to take
effect.

## How it works

The theme is two CSS layers:

- `styles/tokens.css` defines the colors as `--kt-*` custom properties per theme.
- `styles/selectors.css` maps those tokens onto kintone's DOM and holds no color
  literals.

When kintone changes its DOM, only `styles/selectors.css` and
`src/kintone/dom-map.ts` need editing. `npm run lint` checks that selectors.css
carries no color literals and tokens.css carries no kintone selectors.

On the list screen the plugin checks that kintone's list table is present. If a
kintone update removed the expected structure, the plugin turns the theme off for
that page load, logs a warning to the console, and leaves the screen in light.

The user's raw choice (including auto) is stored in `localStorage` under the key
`kp-kts-<hostname>-<appId>-<userCode>`, as `{"version":1,"theme":"dark"}`. The
resolved theme is not stored. The value holds only a display preference. To clear
it, delete the site data for the kintone domain in the browser settings, or
switch back to the default theme. If localStorage is blocked (private browsing,
quota, or policy), switching still works for the current tab and resets to the
default theme on reload.

The theme is disabled while printing and under the OS high contrast / forced
colors mode, so records print on white and the system colors are respected.

## Limitations

- The theme covers only the installed app's four record screens. The portal,
  spaces, and other apps stay light.
- On first paint, kintone draws its white screen before the theme applies, so a
  white-to-dark flash of up to a few hundred milliseconds can appear. The plugin
  injects the CSS as early as it can and does not block rendering to hide this.
- No per-screen scope setting (for example, list only) in v1.
- No mobile support. The plugin ships no mobile script.
- Content inside iframes, DOM drawn by other plugins, and areas colored by
  high-specificity custom CSS are not darkened.
- The plugin runs independently of kintone's own header color setting. Every
  combination is not guaranteed.
- The choice is saved per browser and per device. There is no cross-device sync.

## Development

```
npm install
npm run typecheck   # tsc --noEmit
npm test            # vitest (core logic)
npm run build       # vite, emits dist/desktop.js and dist/config.js
npm run lint        # eslint + CSS layer check
npm run pack        # build then @kintone/plugin-packer -> dist/plugin.zip
```

The Playwright specs in `test/e2e` need a development kintone environment. Set
`KINTONE_BASE_URL`, `KINTONE_USERNAME`, `KINTONE_PASSWORD`, and `KINTONE_APP_ID`,
then run `npx playwright test`. Without those variables the E2E suite skips.

## TODO

- Verify the kintone class names in `styles/selectors.css` and
  `src/kintone/dom-map.ts` against the target kintone version. They track the
  current DOM and are not a stable contract (spec FR-7).
- Add the four screenshots described above.
- Wire the monthly screenshot-comparison E2E job (TC-19..TC-24) once a
  development environment and baseline images exist.

## License

MIT. See `LICENSE`.
