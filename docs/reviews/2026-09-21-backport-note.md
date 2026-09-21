# Backport note: fixes portable to client themes

Date: 21 September 2026
Source: `2026-09-21-boilerplate-review.md` and the work on `review/boilerplate-improvements`.

Every theme cloned from Core Code before this date carries some of the defects below. They are listed here so each client theme can be assessed on its own terms. **This is not a batch job.** Each theme is a separate release: check whether the defect is actually present, then take it through `hs-deploy` with a backup of live and a drift check, on its own ticket.

Ordered by how much a visitor notices.

| # | Defect | Where it lives | Review |
|---|--------|----------------|--------|
| 1 | A script sets `body` padding-top equal to the header height, while the global-partial wrapper is already `position: sticky`. Both reserve the space, so the page renders with an empty strip above the header and takes a layout shift when the script runs. | `templates/partials/header.html`, the `require_js` block | 2.1 |
| 2 | Inline critical CSS reads `--moduleTopSpacing`, `--moduleRightSpacing` and `--containerWidth` from `theme_overrides.css`, which is loaded with a `preload` then `rel=stylesheet` swap. Until it lands, module padding is zero and the container has no maximum width. | `templates/layouts/base.html` | 3.1 |
| 3 | No `font-family` is applied anywhere, so the page renders in the browser default serif while a Google Fonts stylesheet loads unused. Check the `--fontSecondary` token too: `'open-sans'` does not match the family Google serves, which is `'Open Sans'`. | `css/global/elements/typography.css`, `base.html` `:root` | 2.2 |
| 4 | Sub-menu flyouts reveal on `:hover` only, with no `:focus-within` and no JavaScript, so keyboard users tab through off-screen links. The inline-children breakpoint (768px) is also below the drawer breakpoint (1200px), leaving touch users stranded in between. | `css/global/components/default_modules.css` | 2.3 |
| 5 | `{% editor_placeholder %} ... {% end_editor_placeholder %}`. The block form is not HubL and fails the whole upload with `Unknown tag: end_editor_placeholder`, after earlier files have already been written. | any `module.html` | 2.6 |
| 6 | The date picker sets `color: var(--white)` on the header row and hovered day with no background, so the text is invisible on the picker's white surface. | `css/global/elements/forms.css` | 2.6 |
| 7 | `.e-button--primary` and `--secondary` referenced but never defined, so buttons render as unstyled links. Only applies to a theme whose project CSS never added them. | `css/global/elements/buttons.css` | 2.4 |
| 8 | `html { font-size: calc(var(--rootFontSize) * 1px) }` pins the root to 16px and overrides the visitor's browser font-size preference. | `css/global/elements/typography.css` | 2.5 |
| 9 | Mobile drawer sized `calc(100vh - var(--siteHeaderHeight))` but offset below the header, so its last rows sit under the fold on a browser with a collapsing URL bar. `100dvh` with a `100vh` fallback. | `css/critical/header.critical.css` | 2.6 |

## Not portable

These were changes of direction rather than fixes, and a client theme should only take them deliberately:

- Brand colours and fonts moved to theme fields with brand-kit inheritance. On a live client site this changes where the palette lives and makes it editable, which is a conversation with the client, not a patch.
- `main.css` switched from async to blocking, and the duplicated critical stylesheets deleted.
- The header navigation rebuilt from the `menu()` function. Fix 4 above is the minimal accessible patch for a theme that is not being rebuilt.
- `host_template_types` renamed to `content_types`. The old key still functions, so this is housekeeping.

## Checking a theme

From the theme's repo root:

```bash
grep -rn "paddingTop" templates/                       # 1
grep -n "theme_overrides" templates/layouts/base.html  # 2, look for rel=preload
grep -rn "font-family" css/ | grep -v vendor           # 3, expect a hit on body
grep -n "focus-within" css/global/components/default_modules.css  # 4, expect a hit
grep -rn "end_editor_placeholder" modules/             # 5, expect nothing
grep -rn "e-button--primary" css/                      # 7, expect a definition
grep -n "rootFontSize" css/global/elements/typography.css  # 8, expect nothing
```

Defects 1, 2, 3 and 9 are only confirmed on a rendered page. Measure the header's top edge, the first-paint padding on `.o-wrapper--module`, and the computed `font-family` on `body`, rather than reading the source.
