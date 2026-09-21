# Attack Plan: Core Code boilerplate improvements

## Source

Verbal brief, no ticket. The brief is `docs/reviews/2026-09-21-boilerplate-review.md` (the review), whose section numbers this plan cites as "review 2.1" and so on. Decisions taken in the planning interview on 21 September 2026:

| Decision | Choice |
|----------|--------|
| Token location | Theme fields with Brand Kit inheritance; `theme_overrides.css` writes the tokens |
| Navigation | Rebuild from the `menu()` function with disclosure buttons |
| CSS loading | Blocking `main.css`; inline only tokens and header critical CSS |
| Backporting | Boilerplate only; a backport note lists the portable fixes |
| Scope | Whole review, sections 2 to 6 |
| Re-measurement page | Created by hand by the user from `CoreCode-review/templates/home.html` |
| Skill references | Updated in the same tasks as the code they describe |

## Current state

Branch `review/boilerplate-improvements` at `9e73c25`, clean tree. That commit fixed the one upload-blocking defect (review 2.6, `end_editor_placeholder`) and added the review. The theme is uploaded to sandbox portal 141885928 (alias `CoreCodeSandbox`) at `CoreCode-review/`, with no page yet using it. An older thirty-module build sits at `CoreCode/` on the same portal and is not touched by this plan.

## Objective

Make the boilerplate render correctly on first drop, load without layout shift, meet WCAG 2.2 AA on its own header and forms, expose brand colours and fonts as theme settings, and carry documentation that describes the code as it is. Success is a page created from `home.html` on the sandbox that measures: header top edge at 0px, no layout-shift source on `.body-wrapper`, computed `font-family` matching the theme font fields, a styled primary button, and every sub-menu link reachable by keyboard.

## Intent

For the Fuelius developer who clones this to start a client theme, and for the client editor who inherits the result. It lets the developer start from a theme that uploads, renders and passes the estate's baselines without a patch round, and lets the editor set brand colours and fonts without a developer. It belongs to the two theme-generation routes the estate runs: the stitch pipeline (`stitch-to-hubspot`) and the brand-first route (`brand-direction` then `theme-clone`), both of which need the same clean base.

## Out of scope

- Backporting fixes to client themes. Task 13 writes a backport note; each theme is assessed separately.
- Section templates (`templateType: section`). The boilerplate ships no content modules, so a section made only of HubSpot default modules has little value. The stitch pipeline generates content modules and is the right place to generate sections from them; recorded as a follow-up for that skill.
- Reformatting every file to one indentation style. Task 13 adds `.editorconfig`; the sweep is a separate mechanical commit so it does not obscure real diffs.
- The old `CoreCode/` theme on the sandbox and the 22 pages using it.
- Deleting `CoreCode-review/` from the sandbox after verification. Left in place as the reference render.

## Constraints

- HubSpot CMS, HubL. Every `.css` file is HubL-processed, so no HubL delimiters inside CSS comments (rules estate).
- Module CSS is emitted by `standard_header_includes` as blocking `<link>` tags in an order HubSpot decides. Anything that must precede module CSS in the cascade is placed as an explicit `<link>` before `{{ standard_header_includes }}`, not via `require_css`.
- HubSpot auto-loads a theme font field's web font only when the field is "referenced by HubL in a stylesheet or in a module". The reference therefore stays in `theme_overrides.css`, served as a stylesheet, not inlined into the template.
- WCAG 2.2 AA is a tier-1 surface: 24px target floor, 44px working default, visible `:focus-visible`, no hover-only reveal.
- Frontend standards: BEM with camelCase segments, flat selectors, range media queries, no `!important` outside third-party overrides, tokens not magic numbers.
- Deletions are routinely refused by the permission classifier. Each `git rm` in Task 12 is listed as a command for the user to run and tracked to closure.
- `hs cms upload` writes files before validating later ones. Every upload in this plan targets `CoreCode-review/` on the sandbox, never `CoreCode/` and never a live portal.

## Assets referenced

- `docs/reviews/2026-09-21-boilerplate-review.md`, including its section 8 source list (HubSpot docs fetched 21 Sep 2026).
- HubSpot HubL functions reference: `menu(menu_id, root_type, root_key)` with `root_type` in `site_root`, `top_parent`, `parent`, `breadcrumb`.
- HubSpot HubL variables reference, menu node variables: `label`, `url`, `pageId`, `contentGroupId`, `parentNode`, `children`, `activeBranch`, `activeNode`, `level`, `pageTitle`, `slug`, `linkTarget`. Also `year`, `site_settings.logo_src`, `logo_alt`, `logo_link`, `company_name`, `content.publish_date`, `content.blog_post_author`, `content.featured_image`, `content.featured_image_alt_text`, `content.topic_list`.
- HubSpot module and theme fields reference: font field JSON with `load_external_fonts`, `default.font`, `default.font_set`, `visibility.hidden_subfields`; colour field JSON; `inherited_value.property_value_paths` with `brand_settings.primaryColor`.
- HubSpot module configuration reference: `content_types` values (`SITE_PAGE`, `LANDING_PAGE`, `BLOG_POST`, `BLOG_LISTING`), `placeholder`, `js_render_options`.
- HubSpot theme docs: `hidden_modules`, `hide_all_default_modules`, `documentation_url`, `license`.
- Sandbox measurements from the review (page `/playground`, 1280x800 and 390x844): header top 80px, CLS 0.068 and 0.102, body font Times New Roman, `.e-button--primary` unstyled, flyout rules `:hover` only.
- HubSpot's own `cms-theme-boilerplate` `base.html` for the `<title>` pattern, and its menu module for the `menu(module.menu, root_type)` pattern.

## Affected files and systems

| File | Status | Responsibility |
|------|--------|----------------|
| `templates/layouts/base.html` | Modify | Head order: inline tokens and header critical CSS, blocking `theme_overrides.css` and `main.css` links, `{% block head %}`, guarded meta, tidy title, JSON-LD partial; footer scripts reduced to `utilities.js` |
| `templates/partials/header.html` | Modify | Skip link and header wrapper only; padding script removed |
| `templates/partials/footer.html` | Read-only | Unchanged |
| `templates/partials/seo_schema.html` | Create | Organisation and WebSite JSON-LD from `site_settings` |
| `templates/home.html`, `standard_internal.html`, `Playground.html` | Modify | Default `dnd_section` content |
| `templates/blog_listing.html` | Modify | Default `dnd_module` for the post listing |
| `templates/blog_post.html` | Modify | Date, author, featured image, tags, Article JSON-LD in `{% block head %}` |
| `templates/system/404.html`, `500.html` | Modify | Real copy, correct heading, own modifier |
| `templates/system/search_results.html` | Modify | Wrapper and container |
| `templates/system/email_*.html` (3) | Modify | Shared include replaces the triplicated asset block |
| `templates/partials/subscription_assets.html` | Create | The shared `require_css` and `require_js` block for the three subscription templates |
| `css/critical/header.critical.css` | Modify | Header layout without `!important`, drawer `100dvh`, 44px toggle |
| `css/critical/layout.critical.css`, `typography.critical.css` | Delete | Duplicates of `containers_dnd.css` and `typography.css` |
| `css/theme_overrides.css` | Modify | Writes every brand colour and font token from theme fields, plus spacing |
| `css/global/tokens/palette.css` | Modify | Header comment states its role (stitch extension tokens, inlined) |
| `css/main.css` | Modify | Include list after deletions and renames; narrower reduced-motion rule |
| `css/global/elements/typography.css` | Modify | Root font-size pin removed, `font-family` applied, single fluid scale |
| `css/global/elements/buttons.css` | Modify | Default `--primary` and `--secondary` variants |
| `css/global/elements/forms.css` | Modify | Date picker colours, error state, input types, empty rules removed |
| `css/global/generic/reset.css` | Modify | React mount-point rule removed |
| `css/global/elements/page.css` | Modify | `scrollbar-gutter` moved to `html` |
| `css/global/elements/skip-link.css` | Modify | `z-index` token |
| `css/global/components/default_modules.css` | Modify | `:focus-within` beside `:hover`, breakpoint alignment, empty rule removed |
| `css/global/components/footer.css`, `elements/arrows.css`, `objects/rte.css` | Modify | Empty rules removed |
| `css/global/objects/utilities.css` | Modify | `.show-for-sr` sizing without the border token |
| `css/Modules/` | Rename | Becomes `css/modules/`; `modules.lightbox.css`, `modules.toggle-button.css`, `pagination.css`, `popup.css` deleted |
| `css/modules/video.css` | Modify | Loaded only by the video macro, removed from `main.css` |
| `css/tools/macros.css` | Delete | Unreferenced HubL macros |
| `fields.json` | Modify | Colour and typography groups with Brand Kit inheritance |
| `theme.json` | Modify | `documentation_url`, `license`, `hidden_modules` |
| `modules/site_navigation.module/*` | Modify | Nav from `menu()`, disclosure buttons, logo defaults, `content_types`, `logo_alt_text` field |
| `modules/footer_content.module/*` | Modify | `{{ year }}` copyright, `content_types` |
| `macros/image_helpers.html` | Modify | Rewritten `render_image` macro |
| `macros/video_helpers.html` | Modify | Markup only; initialisation moved to `js/modules/video.js` |
| `macros/link_helpers.html` | Modify | Legacy CTA branch removed, redundant `aria-label` and `title` removed, deprecation comments corrected |
| `macros/text_helpers.html` | Modify | Calls `link_helper.render_link` instead of duplicating it |
| `macros/style_helpers.html`, `accessibility_helpers.html` | Delete | No consumers |
| `js/modules/utilities.js` | Modify | Gains `lazyModuleInit` |
| `js/modules/video.js` | Create | Plyr initialisation for `.js-videoPlayer` |
| `js/modules/rotators.js`, `statistics.js` | Modify | Use `lazyModuleInit`; reduced-motion guard on counters |
| `js/vendor/tabs_accordion.js` | Delete | Unreferenced |
| `images/lightbox/*` | Delete | Orphaned |
| `scripts/apply-ux-improvements.js`, `remove-debug-fields.js` | Delete | Tooling for removed modules |
| `.gitignore`, `.editorconfig`, `package.json`, `.stylelintrc.json`, `scripts/check_css_comments.py` | Create or modify | Lint instruments |
| `.claude/CLAUDE.md`, `README.md`, `docs/core-code-developer-guide.md` | Modify | Corrected to match the code |
| `.claude/skills/scaffold-module/{SKILL.md,meta-reference.md}`, `fix-module/SKILL.md`, `stitch-to-hubspot/{SKILL.md,references/core-code-conventions.md}` | Modify | `content_types`, `lazyModuleInit` location, theme-field tokens, font step |
| `docs/reviews/2026-09-21-backport-note.md` | Create | Portable fixes for client themes |

## Approach

Tasks are ordered by dependency. Each task is one commit unless stated. Every upload targets `CoreCode-review/` on `CoreCodeSandbox` only.

### Task 1: Header geometry and drawer

**Files:**
- Modify: `templates/partials/header.html` (lines 14-43)
- Modify: `css/critical/header.critical.css`

**Steps:**
1. Delete lines 14-43 of `header.html` (the `require_js` block that sets `body.style.paddingTop`). The header height is `--siteHeaderHeight` and the wrapper is sticky, so the flow already reserves the space.
2. In `header.critical.css`, replace the hardcoded z-indexes: line 8 `z-index: 90` becomes `z-index: var(--zSticky)`, line 14 `z-index: 10` becomes `z-index: var(--zBase)`, line 100 `z-index: 99` becomes `z-index: var(--zDropdown)`.
3. Delete the empty-effect rules `.m-siteHeader__row--upper` (lines 86-88) and `.m-siteHeader__cta--navigationmenu` (lines 81-83), the duplicate `background-color: var(--white)` on `.m-siteHeader__inner` (line 30), and the three `::-webkit-scrollbar` rules (lines 46-56).
4. Toggle: change `height: 40px; width: 40px` to `height: var(--space48); width: var(--space48)` and add `display: flex` so the existing `align-items`/`justify-content` apply. Add `--touchArea` is 3rem already; use `var(--touchArea)` for both dimensions instead of `--space48` so the token earns its keep.
5. Remove both `!important` declarations by restructuring the hidden state. Replace the unconditional `.m-siteHeader__navigation { display: none; align-self: stretch; }` with:
   ```css
   .m-siteHeader__navigation {
   	align-self: stretch;
   }

   @media (width < 1200px) {
   	.m-siteHeader__navigation {
   		display: none;
   		position: absolute;
   		z-index: var(--zDropdown);
   		top: 100%;
   		left: 0;
   		right: 0;
   		height: calc(100vh - var(--siteHeaderHeight));
   		height: calc(100dvh - var(--siteHeaderHeight));
   		overflow-y: auto;
   		background-color: var(--white);
   	}

   	.m-siteHeader__navigation.is-active {
   		display: flex;
   		flex-direction: column;
   	}
   }

   @media (width >= 1200px) {
   	.m-siteHeader__navigation {
   		display: flex;
   	}

   	.m-siteHeader__toggle {
   		display: none;
   	}
   }
   ```
   Delete the old `.m-siteHeader__navigation .hs_cos_wrapper { display: flex!important }` rule; Task 7 replaces the `{% menu %}` wrapper markup so it is no longer needed.
6. Keep `.m-siteHeader__logo { max-width: 125px }` inside the `< 1200px` block.

**Verification:**
- Before: on the sandbox `/playground` page, `document.body.style.paddingTop` is `80px` and `.m-siteHeader` top edge is 80px.
- After (Task 14 page): `document.body.style.paddingTop` is empty, `.m-siteHeader.getBoundingClientRect().top` is 0 at 1280px and 390px, and no `layout-shift` entry names `.body-wrapper`.
- `grep -c '!important' css/critical/header.critical.css` returns 0. The toggle measures 48x48.
- Open the drawer at 390x844: `.m-siteHeader__navigation.getBoundingClientRect().bottom` is 844 or less.

### Task 2: Head order, critical CSS and dead scripts

**Files:**
- Modify: `templates/layouts/base.html`
- Delete: `css/critical/layout.critical.css`, `css/critical/typography.critical.css`
- Modify: `css/main.css`
- Modify: `css/global/tokens/palette.css`
- Modify: `js/modules/utilities.js`, `js/modules/rotators.js`, `js/modules/statistics.js`
- Modify: `css/global/elements/page.css`

**Steps:**
1. In `base.html` lines 170-173, keep only `{% include '../../css/critical/header.critical.css' %}` and add `{% include '../../css/global/tokens/palette.css' %}` after the `:root` block. Remove the layout and typography includes; `containers_dnd.css` and `typography.css` already hold those rules and are in `main.css`.
2. Replace lines 176-179 with the boilerplate form: `{% if page_meta.html_title or pageTitle %}<title>{{ page_meta.html_title or pageTitle }}</title>{% endif %}`.
3. Line 181: `rel="shortcut icon"` becomes `rel="icon"`. Line 183 becomes `{% if page_meta.meta_description %}<meta name="description" content="{{ page_meta.meta_description }}">{% endif %}`.
4. Leave lines 185-193 (Google Fonts preconnects and link) in place for now. Task 6 removes them in the same commit that adds the theme font fields, so no interim commit renders without web fonts.
5. Delete lines 201-204 (`content.next_page_url` prefetch; the variable is not documented).
6. Replace lines 206-232 with, in this order:
   ```html
   {# Theme-field tokens and spacing. A real stylesheet so HubSpot loads theme fonts; blocking so tokens exist at first paint. #}
   <link rel="stylesheet" href="{{ get_asset_url('../../css/theme_overrides.css') }}">
   {# Global styles, blocking. 5KB gzipped; loading it async caused a flash of unstyled content and a second copy of the critical rules. #}
   <link rel="stylesheet" href="{{ get_asset_url('../../css/main.css') }}">
   {% if template_css is string %}
   {{ require_css(get_asset_url(template_css)) }}
   {% elif template_css %}
   {% for stylesheet in template_css %}{{ require_css(get_asset_url(stylesheet)) }}{% endfor %}
   {% endif %}
   {% block head %}{% endblock head %}
   {{ standard_header_includes }}
   ```
   The two explicit links sit before `standard_header_includes` so global rules precede module CSS in the cascade regardless of how HubSpot orders its own block. The loadCSS polyfill goes with the preload swaps.
7. Delete the scrollbar-width script (lines 250-253). In `css/global/elements/page.css`, move `scrollbar-gutter: stable` from `body` to the `html` rule.
8. Move the lazy-init observer (lines 258-306) into `js/modules/utilities.js` as `window.CoreCode.lazyModuleInit` and keep `window.lazyModuleInit` as an alias so the skill examples still work. Convert `var` to `const`/`let`. Delete the inline block from `base.html`.
9. In `rotators.js`, replace the module-level `IntersectionObserver` (lines 111-129) with `rotators.forEach(el => window.CoreCode.lazyModuleInit(el.id, () => initRotator(el)))`, guarding `if (!el.id) initRotator(el)`. Same in `statistics.js` lines 51-69. Both files then need `data-lazy-init` on the module wrapper to defer; document that in Task 13.
10. In `statistics.js` `animateStatistics`, before creating Odometers: `if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { counters.forEach(el => { el.textContent = el.getAttribute('data-value'); }); return; }`.
11. `main.css`: remove the `video.css` include (Task 9 loads it from the macro), and narrow the reduced-motion block to the theme's own animated surfaces: `.e-button, .m-siteHeader__navigation, .m-playbutton, .plyr__control--overlaid, .m-heading, [class*="m-"]` with `transition-duration: 0.01ms; animation-duration: 0.01ms; animation-iteration-count: 1;` and no `!important`. Keep `scroll-behavior: auto` on `html` (already in `reset.css`).
12. `palette.css`: replace the header comment with three lines stating it holds stitch-generated extension tokens only, is inlined into `base.html`, and that brand colours and fonts live in `fields.json` and `theme_overrides.css`.

**Verification:**
- `curl -s <page> | grep -c 'rel="preload"'` returns 0 and `grep -c loadCSS` returns 0.
- In DevTools, `document.styleSheets` lists `theme_overrides` then `main` before any `module_` sheet.
- Layout-shift entries at 1280px and 390px total under 0.01 with the header fixed in Task 1.
- `typeof window.CoreCode.lazyModuleInit === 'function'` and `window.lazyModuleInit === window.CoreCode.lazyModuleInit`.
- With `prefers-reduced-motion: reduce` emulated, a `.js-count` element shows its final value with no Odometer markup.

### Task 3: Typography

**Files:**
- Modify: `css/global/elements/typography.css`
- Modify: `templates/layouts/base.html` (`:root` lines 125-157)

**Steps:**
1. Delete `html { font-size: calc(var(--rootFontSize) * 1px) }` (lines 1-3) and the `--rootFontSize` token. `rem` now follows the browser default.
2. Add after the `body` rule:
   ```css
   body {
   	font-family: var(--fontSecondary);
   	font-size: var(--pBase);
   	color: var(--grey90);
   	background-color: var(--contentBackgroundColour);
   }

   h1, h2, h3, h4, h5, h6 {
   	font-family: var(--fontPrimary);
   	font-weight: var(--fontBold);
   }
   ```
3. Collapse the double clamp. In `base.html`, set the heading tokens to single fluid values anchored in `rem`, using the existing minimums: `--h1: clamp(2rem, 1.25rem + 2.5vw, 3.875rem); --h2: clamp(1.75rem, 1.25rem + 1.5vw, 2.875rem); --h3: clamp(1.5rem, 1.25rem + 0.75vw, 2rem); --h4: clamp(1.125rem, 1rem + 0.4vw, 1.5rem); --h5: clamp(0.875rem, 0.8rem + 0.25vw, 1.0625rem); --h6: 0.8125rem;`. Delete the six `--h*Min` tokens. In `typography.css` each heading becomes `font-size: var(--hN)`.
4. Delete `--fontAwesome`, the five `--breakpoint*` tokens, `--dotDimension` and `--rootFontSize` from `:root`. Correct `--fontSecondary` to `"Open Sans", sans-serif` so the Google Fonts link already on the page applies. Both font tokens stay in `:root` until Task 6 moves them to `theme_overrides.css` and deletes them here in the same commit.
5. Delete the duplicated `p { margin: 0 }` (reset already zeroes margins) and the `body { line-height: 150% }` duplicate of the reset's `1.5`.

**Verification:**
- Computed `font-family` on `body` and `h1` equals the values written by `theme_overrides.css` (Task 6). Before Task 6 lands it is `sans-serif`, never Times New Roman.
- With the browser default font size set to 20px, `getComputedStyle(document.documentElement).fontSize` is `20px`.
- At 390px an `h4` computes to 18px; at 1280px to 24px.

### Task 4: Button defaults

**Files:**
- Modify: `css/global/elements/buttons.css`

**Steps:**
1. Add after the base `.e-button` rule:
   ```css
   .e-button {
   	align-items: center;
   	justify-content: center;
   	min-height: var(--touchArea);
   	padding: var(--space12) var(--space24);
   	border-radius: var(--radiusXs);
   	font-family: var(--fontPrimary);
   	font-weight: var(--fontSemibold);
   	text-decoration: none;
   	transition: background-color var(--transitionSpeed) var(--easeOut), color var(--transitionSpeed) var(--easeOut);
   }

   .e-button--primary {
   	background-color: var(--primaryColour);
   	color: var(--primaryTextColour);
   }

   .e-button--primary:hover,
   .e-button--primary:focus-visible {
   	background-color: color-mix(in oklch, var(--primaryColour), black 12%);
   	color: var(--primaryTextColour);
   	text-decoration: none;
   }

   .e-button--secondary {
   	background-color: transparent;
   	color: var(--primaryColour);
   	box-shadow: inset 0 0 0 var(--border2) var(--primaryColour);
   }

   .e-button--secondary:hover,
   .e-button--secondary:focus-visible {
   	background-color: var(--primaryColour);
   	color: var(--primaryTextColour);
   	text-decoration: none;
   }
   ```
2. Delete the `:focus:not(:active)` fallback block (lines 21-28); `:focus-visible` is Baseline in every supported browser.

**Verification:**
- The header CTA on the Task 14 page computes to `background-color` equal to `--primaryColour` and `min-height` 48px; contrast between `--primaryColour` (#46107b default) and white is 10.9:1.
- Hover and focus-visible states measured with DevTools force-state show the darkened background, not the rest colour.

### Task 5: Forms

**Files:**
- Modify: `css/global/elements/forms.css`

**Steps:**
1. Extend the input selector lists (lines 36-43 and 49-56) with `form input[type=url]`, `form input[type=search]`, `form input[type=date]`.
2. Replace the date picker rules (lines 186-199) with `.fn-date-picker .pika-table thead th { color: var(--grey90); }` and `.fn-date-picker td .pika-button:hover, .fn-date-picker td .pika-button:focus { background-color: var(--primaryColour); color: var(--primaryTextColour); border-radius: 0; }`. Delete the empty `.hs-dateinput:before` icon rule unless an icon is added.
3. Replace the empty validation rules (lines 229-235) with:
   ```css
   .hs-form-required {
   	color: var(--colorError);
   	margin-left: var(--space4);
   }

   .hs-input.invalid.error {
   	border: var(--border2) solid var(--colorError);
   }

   .hs-error-msg {
   	display: block;
   	margin-top: var(--space8);
   	color: var(--colorError);
   	font-size: var(--pSm);
   }
   ```
   `--colorError` (#ef4444) on white is 3.76:1, below 4.5:1 for small text, so change the token in `base.html` to `#c81e1e` (5.9:1 on white) in the same commit.
4. Add `flex-wrap: wrap` to `fieldset.form-columns-2` and `form-columns-2 .hs-form-field { flex: 1 1 16rem; }` so two columns stack below about 512px.
5. Delete the empty `form input[type=radio] ~ span:before {}` rule. Replace `.hs-input:not(...)` scoping only if a width rule is added; the existing `fieldset.form-columns-1 .hs-input { width: 100% !important }` gets `:not([type=checkbox]):not([type=radio])` appended per the estate's `.hs-input` rule.

**Verification:**
- `grep -c '{[[:space:]]*}' css/global/elements/forms.css` returns 0.
- A HubSpot form with raw HTML rendering (`displayOptions.renderRawHtml: true`) on a test page shows a red 2px border and message on a required field after submit; the message text contrast is at least 4.5:1 (measure with DevTools).
- Two-column fieldset stacks at 390px.

### Task 6: Theme fields for brand colours and fonts

**Files:**
- Modify: `fields.json`
- Modify: `css/theme_overrides.css`
- Modify: `templates/layouts/base.html` (`:root` colour block lines 97-111)

**Steps:**
1. Add a `colours` group to `fields.json` before `spacing`:
   ```json
   {
     "label": "Colours",
     "name": "colours",
     "type": "group",
     "tab": "STYLE",
     "children": [
       { "name": "primary", "label": "Primary", "type": "color", "default": { "color": "#46107b", "opacity": 100 },
         "inherited_value": { "property_value_paths": { "color": "brand_settings.primaryColor" } },
         "inline_help_text": "Buttons, links and highlights. Inherits the Brand Kit primary colour until set." },
       { "name": "secondary", "label": "Secondary", "type": "color", "default": { "color": "#5E646A", "opacity": 100 },
         "inherited_value": { "property_value_paths": { "color": "brand_settings.secondaryColor" } } },
       { "name": "tertiary", "label": "Tertiary", "type": "color", "default": { "color": "#ee52ac", "opacity": 100 } },
       { "name": "highlight", "label": "Highlight", "type": "color", "default": { "color": "#e3f7e8", "opacity": 100 } },
       { "name": "text", "label": "Body text", "type": "color", "default": { "color": "#1D252D", "opacity": 100 } },
       { "name": "background", "label": "Page background", "type": "color", "default": { "color": "#ffffff", "opacity": 100 } }
     ]
   }
   ```
   Before committing, confirm the exact `brand_settings` key for the secondary colour on the brand-inheritance page (only `primaryColor` is quoted verbatim in the docs fetched). If it differs, use the documented key; if none exists, drop the `inherited_value` on `secondary`.
2. Add a `typography` group:
   ```json
   {
     "label": "Typography",
     "name": "typography",
     "type": "group",
     "tab": "STYLE",
     "children": [
       { "name": "heading_font", "label": "Heading font", "type": "font", "load_external_fonts": true,
         "default": { "font": "Montserrat", "font_set": "GOOGLE", "size": 16, "size_unit": "px", "color": "#1D252D", "styles": {} },
         "visibility": { "hidden_subfields": { "size": true, "color": true, "bold": true, "italic": true, "underline": true } } },
       { "name": "body_font", "label": "Body font", "type": "font", "load_external_fonts": true,
         "default": { "font": "Open Sans", "font_set": "GOOGLE", "size": 16, "size_unit": "px", "color": "#1D252D", "styles": {} },
         "visibility": { "hidden_subfields": { "size": true, "color": true, "bold": true, "italic": true, "underline": true } } }
     ]
   }
   ```
3. Rewrite `theme_overrides.css`:
   ```css
   :root {
   	--primaryColour: {{ theme.colours.primary.color }};
   	--secondaryColour: {{ theme.colours.secondary.color }};
   	--tertiaryColour: {{ theme.colours.tertiary.color }};
   	--highlightColour: {{ theme.colours.highlight.color }};
   	--grey90: {{ theme.colours.text.color }};
   	--contentBackgroundColour: {{ theme.colours.background.color }};
   	--fontPrimary: "{{ theme.typography.heading_font.font }}", sans-serif;
   	--fontSecondary: "{{ theme.typography.body_font.font }}", sans-serif;
   	--containerWidth: {{ theme.spacing.max_width ~ 'px' }};
   	--moduleTopSpacing: {{ theme.spacing.mobile.vertical_spacing ~ 'px' }};
   	--moduleRightSpacing: {{ theme.spacing.mobile.horizontal_spacing ~ 'px' }};
   	--moduleBottomSpacing: {{ theme.spacing.mobile.vertical_spacing ~ 'px' }};
   	--moduleLeftSpacing: {{ theme.spacing.mobile.horizontal_spacing ~ 'px' }};
   }
   ```
   plus the existing desktop media block. The `*TextColour` tokens stay in `base.html` as `var(--white)`/`var(--black)` for now; a contrast-aware derivation is a follow-up.
4. In `base.html` `:root`, delete `--primary10/20/30`, `--primaryColour`, `--secondaryColour`, `--tertiaryColour`, `--highlightColour`, `--contentBackgroundColour`, `--fontPrimary`, `--fontSecondary`, `--grey90`, since `theme_overrides.css` now owns them. Keep the greys 10 to 60, `--white`, `--black`, and the four `*TextColour` tokens. In the same commit delete the Google Fonts preconnects and `<link>` (lines 185-193 of `base.html`); HubSpot now loads the fonts because the font fields are referenced in `theme_overrides.css` with `load_external_fonts: true`.

**Verification:**
- Theme settings in the sandbox show Colours and Typography groups; changing Primary changes the header button after publish.
- Network panel on the Task 14 page shows a `fonts.googleapis.com` request for Montserrat and Open Sans originating from HubSpot's injected link, not from the template; `document.fonts` reports both families loaded.
- `getComputedStyle(document.documentElement).getPropertyValue('--fontSecondary')` is `"Open Sans", sans-serif`.

### Task 7: Navigation module rebuilt from `menu()`

**Files:**
- Modify: `modules/site_navigation.module/module.html`, `module.js`, `module.css`, `fields.json`, `meta.json`
- Modify: `modules/footer_content.module/module.html`, `meta.json`
- Modify: `css/global/components/default_modules.css`

**Steps:**
1. `fields.json`: add after `logo` a text field `{ "name": "logo_alt_text", "label": "Logo alt text", "type": "text", "default": "", "inline_help_text": "Describes the logo for screen readers, usually the company name. Falls back to the portal logo alt text." }`.
2. `module.html` logo block: `{%- set logo_src = module.logo.src or site_settings.logo_src -%}`, `{%- set logo_alt = module.logo_alt_text or site_settings.logo_alt or site_settings.company_name -%}`, render `<img src="{{ logo_src }}" alt="{{ logo_alt|escape_attr }}" ...>` when `logo_src` is truthy. Link `href` falls back to `site_settings.logo_link` before `/`.
3. Replace the `{% menu %}` block with:
   ```html
   {%- if module.menu -%}
   {%- set nav_root = menu(module.menu, "site_root") -%}
   {%- if nav_root.children -%}
   <ul class="m-siteHeader__menu">
     {%- for item in nav_root.children -%}
     <li class="m-siteHeader__menuItem{% if item.children %} has-children{% endif %}{% if item.activeBranch %} is-activeBranch{% endif %}">
       {%- if item.url -%}
       <a class="m-siteHeader__menuLink" href="{{ item.url }}"{% if item.activeNode %} aria-current="page"{% endif %}{% if item.linkTarget == '_blank' %} target="_blank" rel="noopener noreferrer"{% endif %}>{{ item.label }}</a>
       {%- else -%}
       <span class="m-siteHeader__menuLink">{{ item.label }}</span>
       {%- endif -%}
       {%- if item.children -%}
       <button type="button" class="m-siteHeader__submenuToggle js-submenuToggle" aria-expanded="false" aria-controls="{{ name }}__submenu_{{ loop.index }}">
         <span class="show-for-sr">Show {{ item.label }} submenu</span>
       </button>
       <ul id="{{ name }}__submenu_{{ loop.index }}" class="m-siteHeader__submenu">
         {%- for child in item.children -%}
         <li class="m-siteHeader__submenuItem">
           <a class="m-siteHeader__submenuLink" href="{{ child.url }}"{% if child.activeNode %} aria-current="page"{% endif %}>{{ child.label }}</a>
         </li>
         {%- endfor -%}
       </ul>
       {%- endif -%}
     </li>
     {%- endfor -%}
   </ul>
   {%- endif -%}
   {%- elif is_in_editor -%}
   {% editor_placeholder %}
   {%- endif -%}
   ```
   Two levels only, matching the previous `max_levels=2`.
4. `module.js`: keep the drawer toggle. Add, inside `init()`, one delegated listener per `.js-siteNav`:
   ```js
   nav.addEventListener('click', function(e) {
   	const toggle = e.target.closest('.js-submenuToggle');
   	if (!toggle) return;
   	const open = toggle.getAttribute('aria-expanded') === 'true';
   	closeAllSubmenus(nav);
   	toggle.setAttribute('aria-expanded', open ? 'false' : 'true');
   });
   document.addEventListener('click', function(e) { if (!nav.contains(e.target)) closeAllSubmenus(nav); });
   document.addEventListener('keydown', function(e) {
   	if (e.key !== 'Escape') return;
   	const openToggle = nav.querySelector('.js-submenuToggle[aria-expanded="true"]');
   	if (openToggle) { closeAllSubmenus(nav); openToggle.focus(); }
   });
   function closeAllSubmenus(scope) {
   	scope.querySelectorAll('.js-submenuToggle[aria-expanded="true"]').forEach(function(t) { t.setAttribute('aria-expanded', 'false'); });
   }
   ```
   The existing Escape handler for the drawer runs only when the drawer is open; order the submenu check first so Escape closes the innermost thing.
5. `module.css`: replace the `.hs-menu-wrapper` overrides with:
   ```css
   .m-siteHeader__menu { display: flex; flex-direction: column; gap: var(--space16); margin: 0; padding: var(--space20); list-style: none; }
   .m-siteHeader__menuItem { position: relative; display: flex; flex-wrap: wrap; align-items: center; gap: var(--space8); }
   .m-siteHeader__menuLink { display: inline-flex; align-items: center; min-height: var(--touchArea); padding: var(--space8) 0; color: var(--grey90); font-weight: var(--fontSemibold); }
   .m-siteHeader__menuLink[aria-current="page"] { text-decoration: underline; text-decoration-thickness: var(--border2); }
   .m-siteHeader__submenuToggle { width: var(--touchArea); height: var(--touchArea); border: 0; background: none; cursor: pointer; }
   .m-siteHeader__submenuToggle::before { content: ""; display: block; width: 0.5rem; height: 0.5rem; margin: auto; border: solid var(--grey90); border-width: 0 var(--border2) var(--border2) 0; rotate: 45deg; transition: rotate var(--transitionSpeed) var(--easeOut); }
   .m-siteHeader__submenuToggle[aria-expanded="true"]::before { rotate: -135deg; }
   .m-siteHeader__submenuToggle:focus-visible, .m-siteHeader__menuLink:focus-visible, .m-siteHeader__submenuLink:focus-visible { outline: var(--border2) solid var(--primaryColour); outline-offset: 2px; }
   .m-siteHeader__submenu { display: none; flex-basis: 100%; margin: 0; padding: 0 0 0 var(--space16); list-style: none; }
   .m-siteHeader__submenuToggle[aria-expanded="true"] + .m-siteHeader__submenu { display: block; }
   .m-siteHeader__submenuLink { display: block; padding: var(--space8) 0; min-height: var(--touchArea); }

   @media (width >= 1200px) {
   	.m-siteHeader__menu { flex-direction: row; align-items: center; gap: var(--gridGutters); padding: 0; }
   	.m-siteHeader__menuItem { flex-wrap: nowrap; }
   	.m-siteHeader__submenu { position: absolute; top: 100%; left: 0; z-index: var(--zDropdown); min-width: 14rem; padding: var(--space8) var(--space16); background: var(--white); box-shadow: 0 var(--space4) var(--space16) rgb(0 0 0 / 0.12); }
   }

   @media (prefers-reduced-motion: reduce) {
   	.m-siteHeader__submenuToggle::before { transition: none; }
   }
   ```
6. `meta.json` in both modules: rename `host_template_types` to `content_types` with value `["SITE_PAGE", "LANDING_PAGE", "BLOG_POST", "BLOG_LISTING"]`. Add `"js_render_options": { "position": "footer", "defer": true }` to the navigation module.
7. `footer_content.module/module.html`: change the copyright line to `<p class="m-siteFooter__copyright">&copy; {{ year }} {{ module.copyright }}</p>` and the field default to `Your Company. All rights reserved.` with help text "The year is added automatically."
8. `default_modules.css`: for the two `:hover` reveal selectors (lines 113-127) add a `:focus-within` twin, and change the `< 768px` inline-children block (line 129) to `< 1200px`. Delete the empty `.hs-menu-wrapper > ul > li.hs-menu-item a {}` rule. These rules now only govern HubSpot default menu modules placed in page content.

**Verification:**
- On the Task 14 page with a two-level menu: Tab reaches each top-level link, then its toggle; Enter or Space on the toggle sets `aria-expanded="true"` and the submenu links become tabbable; Escape closes it and returns focus to the toggle. Confirm with `document.activeElement` in DevTools after each key.
- At 390px every menu link and toggle measures at least 44px tall.
- `hs cms upload` of the module folder succeeds with `content_types` (any rejection of a value means fall back to the documented list, never to `PAGE`).
- The footer renders `© 2026 Your Company. All rights reserved.`

### Task 8: Theme metadata

**Files:**
- Modify: `theme.json`

**Steps:**
1. Add `"documentation_url": "https://github.com/willmoore-fuelius/coreCode#readme"`, `"license": "MIT"`, `"is_available_for_new_content": true`.
2. Add `"hidden_modules": ["@hubspot/menu", "@hubspot/simple_menu"]`, since the theme now owns navigation and these two default modules are the ones `default_modules.css` exists to patch. Leave every other default module visible; see Open questions.

**Verification:**
- Upload succeeds; the module picker on the sandbox no longer lists Menu or Simple menu.

### Task 9: Image and video macros, link helpers

**Files:**
- Modify: `macros/image_helpers.html`, `macros/video_helpers.html`, `macros/link_helpers.html`, `macros/text_helpers.html`
- Create: `js/modules/video.js`
- Modify: `css/modules/video.css` (path after Task 12 rename; do the rename first or reference `css/Modules/video.css` until then)

**Steps:**
1. Replace `render_responsive_images` with:
   ```html
   {#
     render_image(image, class, sizes, priority)
     image    - HubSpot image field value (needs .src; .width/.height/.alt used when present)
     class    - BEM class for the <img>
     sizes    - sizes attribute, e.g. "(width >= 992px) 50vw, 100vw"; defaults to 100vw
     priority - true for the LCP image: eager, fetchpriority high, sync decode
   #}
   {% macro render_image(image, class, sizes, priority) %}
   {%- if image.src -%}
   {%- set widths = [480, 768, 1200, 1600] -%}
   <img class="{{ class }}"
        src="{{ resize_image_url(image.src, 1200, 0, 0) }}"
        srcset="{% for w in widths %}{% if not image.width or w <= image.width %}{{ resize_image_url(image.src, w, 0, 0) }} {{ w }}w{% if not loop.last %}, {% endif %}{% endif %}{% endfor %}"
        sizes="{{ sizes|default('100vw', true) }}"
        alt="{{ image.alt|default('', true)|escape_attr }}"
        {% if image.width %}width="{{ image.width }}"{% endif %}
        {% if image.height %}height="{{ image.height }}"{% endif %}
        {% if priority %}loading="eager" fetchpriority="high" decoding="sync"{% else %}loading="lazy" decoding="async"{% endif %}>
   {%- endif -%}
   {% endmacro %}
   ```
   Keep `get_loading_type` for callers that still use it; delete `get_image_size` and `get_file_type`. A trailing comma can appear in `srcset` when the last width is skipped; fix by building the list with `{% set candidates = [] %}` and `{% do candidates.append(...) %}` then `{{ candidates|join(', ') }}`.
2. `video_helpers.html`: keep the `<video>` markup, add `class="m-videoPlayer__video js-videoPlayer"` and `data-video-ratio="16:9"`; rename `m-video-player` to `m-videoPlayer` and `m-video-player__video` to `m-videoPlayer__video`. Replace the inline polling script with `{{ require_js(get_asset_url('../js/vendor/vendor.plyr.js'), { position: "footer" }) }}` followed by `{{ require_js(get_asset_url('../js/modules/video.js'), { position: "footer" }) }}` and keep `require_css` for the Plyr CSS plus `{{ require_css(get_asset_url('../css/modules/video.css')) }}`. Footer scripts execute in order, so no polling is needed.
3. `js/modules/video.js`:
   ```js
   (function() {
   	'use strict';
   	function init() {
   		if (typeof Plyr === 'undefined') { console.warn('Plyr is not loaded; video players cannot initialise.'); return; }
   		document.querySelectorAll('.js-videoPlayer:not(.is-initialised)').forEach(function(el) {
   			el.classList.add('is-initialised');
   			new Plyr(el, { controls: ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'captions', 'fullscreen'], ratio: el.dataset.videoRatio || '16:9' });
   		});
   	}
   	if (document.readyState !== 'loading') { init(); } else { document.addEventListener('DOMContentLoaded', init); }
   })();
   ```
4. `video.css`: rename `.m-video-player` selectors to `.m-videoPlayer`, `.m-playbutton` to `.m-playButton`, `.m-playbutton__icon` to `.m-playButton__icon`. Replace `z-index: 2` with `var(--zBase)` and remove `body .lyt-activated` duplicates already covered by `lite-youtube.lyt-activated`.
5. `link_helpers.html`: delete `render_cta`'s legacy branch (lines 69-85) so it is `{% cta guid="{{ cta_settings.cta_field }}" %}` guarded on `cta_settings.cta_field`. In `render_link`, remove the `title` attribute and the `aria-label` on the non-new-tab branch; for the new-tab branch render `{{ link_settings.link_text }} <span class="show-for-sr">(opens in new window)</span>` inside the anchor instead of `aria-label`. Replace the header comment's deprecation note with: "Un-prefixed sibling macro calls work; `self.` does not (verified on a rendered page, portal 149133071, 20 Aug 2026)."
6. `text_helpers.html`: replace lines 24-34 with `{{ link_helper.render_link(model.button.link_settings, name ~ '__heading_cta', '', model.button.button_style) }}`. This requires `{% import './link_helpers.html' as link_helper %}` at the top of `text_helpers.html`, because macro files do not see the layout's imports. Use the literal lowercase filename: the portal listing of `CoreCode-review/macros` shows `link_helpers.html`, and the estate has recorded that HubSpot does not Title-Case files on deploy.
7. `base.html` lines 5-9: change the five imports from Title Case (`'../../macros/Link Helpers.html'`) to the literal filenames (`'../../macros/link_helpers.html'` and so on). The Title Case paths do resolve on the sandbox today (three `.m-heading` blocks render on `/playground` from `text_helpers.render_heading`), so this is a normalisation to the names that exist in the Design Manager, not a bug fix; it removes the dependence on whatever case-folding HubSpot applies. Remove the "HubSpot maps local filenames to Title Case" note from `.claude/CLAUDE.md` and the developer guide in Task 13.

**Verification:**
- A page with a hero calling `render_image(image, 'm-hero__image', '100vw', true)` shows one `<img>` with four `srcset` candidates for a 1600px source and two for a 900px source, and `fetchpriority="high"`; `curl` the page and grep.
- The heading CTA on a module renders identical markup to `render_link` (diff the two anchors' `outerHTML`), proving the cross-macro call works.
- After the import rename, `.m-heading` still renders on the Task 14 page (count greater than 0 where a module enables its heading); an empty render means the literal path did not resolve and the Title Case form must be restored while the cause is investigated.
- A video page loads `vendor.plyr.js` then `video.js` once each (Network panel), and Plyr controls render with no `setInterval` in the page source.

### Task 10: Templates and default content

**Files:**
- Modify: `templates/home.html`, `standard_internal.html`, `Playground.html`, `blog_listing.html`, `blog_post.html`, `system/404.html`, `system/500.html`, `system/search_results.html`, the three `system/email_*.html`
- Create: `templates/partials/subscription_assets.html`

**Steps:**
1. In `home.html`, `standard_internal.html` and `Playground.html`, give the `dnd_area` default content:
   ```html
   {% dnd_area 'main_content' class='body-container', label='Main section' %}
     {% dnd_section padding={ 'top': 80, 'bottom': 80 } %}
       {% dnd_module path='@hubspot/rich_text', offset=0, width=12 %}
         {% module_attribute 'html' %}<h1>Page heading</h1><p>Replace this text, or delete the section and add your own modules.</p>{% end_module_attribute %}
       {% end_dnd_module %}
     {% end_dnd_section %}
   {% end_dnd_area %}
   ```
2. `blog_listing.html`: same shape with `{% dnd_module path='@hubspot/blog_posts', offset=0, width=12 %}{% end_dnd_module %}`. Confirm the path in the sandbox's Design Manager default modules list before upload; if the listing module carries a different path there, use that one.
3. `blog_post.html`: replace the `<header>` with:
   ```html
   <header class="m-blogPost__header">
     <h1 class="m-blogPost__title">{{ content.name }}</h1>
     <p class="m-blogPost__meta">
       <time datetime="{{ content.publish_date|format_datetime('yyyy-MM-dd') }}">{{ content.publish_date|format_date('long') }}</time>
       {%- if content.blog_post_author.display_name %} <span class="m-blogPost__author">by {{ content.blog_post_author.display_name }}</span>{% endif %}
     </p>
     {%- if content.featured_image %}
     <img class="m-blogPost__image" src="{{ resize_image_url(content.featured_image, 1200, 0, 0) }}" alt="{{ content.featured_image_alt_text|escape_attr }}" loading="eager" fetchpriority="high" decoding="sync">
     {%- endif %}
   </header>
   ```
   After the body, when `content.topic_list` is non-empty, `<ul class="m-tags">{% for topic in content.topic_list %}<li class="m-tags__tag"><a href="{{ blog_tag_url(group.id, topic.slug) }}">{{ topic.name }}</a></li>{% endfor %}</ul>`. Add `{% block head %}` with Article JSON-LD: `@type Article`, `headline` from `content.name|tojson`, `datePublished` from the ISO date, `author` from `display_name`, `image` from `content.featured_image` when set. Add `.m-blogPost__meta { color: var(--grey50); font-size: var(--pSm); margin-bottom: var(--space16); }` to `css/templates/blog_post.css`.
4. `404.html` and `500.html`: heading becomes `<p class="m-errorPage__code">404 error</p><h1>Page not found</h1>` (500: `<h1>Something went wrong</h1>`), body copy "The page you are looking for has moved or no longer exists. Try the navigation above, or return to the homepage." (500: "We could not load this page. Please try again in a few minutes, or return to the homepage."). Rename `error-page` classes to `m-errorPage`, `m-errorPage--404` and `m-errorPage--500`, and update `css/templates/system.css` to match.
5. `search_results.html`: wrap both modules in `<section class="o-wrapper o-wrapper--module"><div class="o-container"> ... </div></section>`.
6. Create `templates/partials/subscription_assets.html` with `templateType: none` annotation holding the `require_css` and `require_js` block from the three email templates; each template replaces its copy with `{% include '../partials/subscription_assets.html' %}`.

**Verification:**
- A new page from Standard page opens in the editor with a rich text module already present.
- A new blog listing page shows posts without editor action.
- A blog post renders a `<time>` element whose `datetime` matches the publish date, and Google's Rich Results test on the sandbox URL parses one Article.
- `curl` the 404 page: one `<h1>`, no Lorem ipsum.

### Task 11: SEO hooks

**Files:**
- Create: `templates/partials/seo_schema.html`
- Modify: `templates/layouts/base.html`

**Steps:**
1. Create the partial (annotation `templateType: none`) containing, guarded by `{% if site_settings.company_name %}`, two `<script type="application/ld+json">` blocks: Organisation (`name` from `site_settings.company_name|tojson`, `url` as `https://{{ request.domain }}`, `logo` from `site_settings.logo_src|tojson` when set) and WebSite (`name`, `url`). This mirrors what the older portal build already shipped in `base.html`.
2. Include it in `base.html` immediately before `{{ standard_footer_includes }}`.
3. `request.domain` reads a request variable. Confirm on the Task 14 page that `X-HS-Cache-Config` or the response headers still indicate the page is cached; if caching is disabled by it, replace with `content.absolute_url|split('/')|slice(0,3)|join('/')` or omit `url`.

**Verification:**
- Rich Results test on the Task 14 page parses Organisation and WebSite with no errors.
- Response header check shows the page is still served from cache.

### Task 12: Dead code, renames and empty rules

**Files:**
- Rename: `css/Modules/` to `css/modules/`
- Delete: `css/modules/modules.lightbox.css`, `modules.toggle-button.css`, `pagination.css`, `popup.css`, `css/tools/macros.css`, `css/critical/layout.critical.css`, `css/critical/typography.critical.css`, `macros/style_helpers.html`, `macros/accessibility_helpers.html`, `js/vendor/tabs_accordion.js`, `images/lightbox/` (4 files), `scripts/apply-ux-improvements.js`, `scripts/remove-debug-fields.js`
- Modify: `css/main.css`, `templates/layouts/base.html` (remove the `style_helpers` import), `css/global/generic/reset.css`, `css/global/objects/rte.css`, `css/global/components/footer.css`, `css/global/elements/arrows.css`, `css/global/elements/skip-link.css`, `css/global/objects/utilities.css`, `css/templates/communication_preferences.css`, `css/modules/video.css`

**Steps:**
1. Case-only rename on Windows needs two moves: `git mv css/Modules css/modules_tmp && git mv css/modules_tmp css/modules`. Update the four includes in `main.css` to `./modules/...`.
2. Deletions, to be run by the user because the classifier refuses them, then tracked until they show in `git status`:
   ```
   git rm css/modules/modules.lightbox.css css/modules/modules.toggle-button.css css/modules/pagination.css css/modules/popup.css css/tools/macros.css css/critical/layout.critical.css css/critical/typography.critical.css macros/style_helpers.html macros/accessibility_helpers.html js/vendor/tabs_accordion.js scripts/apply-ux-improvements.js scripts/remove-debug-fields.js
   git rm -r images/lightbox
   ```
   `popup.css` is deleted only after its rules are moved into `video.css` under `.m-popup` (the dialog `video_popup.js` builds), so the popup keeps its styling and loads with the video macro.
3. Remove `{% import '../../macros/Style Helpers.html' as style_helpers %}` from `base.html`.
4. Empty rulesets: delete the twelve `hN {}` shells in `rte.css`, `.m-siteFooter {}`, `.m-arrows__button:hover {}`, `.m-arrows__buttonicon {}`, and the two empty rules in `communication_preferences.css`. Re-run the review's empty-ruleset scan; expected total 0.
5. `reset.css`: delete `#root, #__next { isolation: isolate; }`.
6. `skip-link.css`: `z-index: 9999` becomes `var(--zTooltip)`. `utilities.css` `.show-for-sr`: `width: 1px; height: 1px;` instead of the border token, and add `clip-path: inset(50%)` alongside `clip`.
7. `containers_dnd.css`: delete `.default-module` rules (no consumer) and the `.dnd-section.collapse` `!important` pair if no template emits `collapse` (grep confirms none).
8. On the sandbox, the old `CoreCode-review/css/Modules/` folder survives a normal upload because Design Manager paths are case-sensitive. Task 14 uses `--clean` for the review folder so both casings do not coexist.

**Verification:**
- `find css -name '*.css' -path '*Modules*'` returns nothing; `main.css` uploads without a missing-include error.
- The empty-ruleset scan from the review reports 0; `grep -rc '!important' css --include=*.css | grep -v vendor` totals no more than the nine in `utilities.css` plus the four HubSpot-widget overrides in `communication_preferences.css`.
- `git status` shows every file in step 2 as deleted before the commit.

### Task 13: Documentation, skills and lint instruments

**Files:**
- Modify: `.claude/CLAUDE.md`, `README.md`, `docs/core-code-developer-guide.md`
- Modify: `.claude/skills/scaffold-module/SKILL.md` (lines 93, 102, 104, 134), `.claude/skills/scaffold-module/meta-reference.md` (lines 11, 27, 52, 79), `.claude/skills/fix-module/SKILL.md` (lines 29, 79), `.claude/skills/stitch-to-hubspot/SKILL.md` (lines 59, 92, 156-180), `.claude/skills/stitch-to-hubspot/references/core-code-conventions.md` (lines 186-208, 346-360, 827)
- Create: `.editorconfig`, `package.json`, `.stylelintrc.json`, `scripts/check_css_comments.py`, `docs/reviews/2026-09-21-backport-note.md`
- Modify: `.gitignore`

**Steps:**
1. `.claude/CLAUDE.md`: replace the module directory tree (lines 78-86) with the two modules; change "Commit changes to Bitbucket / HubSpot CI/CD" to the `hs cms upload` flow from the README; "Main branch: `development`" becomes `main`; WCAG 2.1 becomes 2.2 (two places); replace the deprecated-macro notes (lines 113-116, 266) with a "Superseded 21 Sep 2026" line stating un-prefixed sibling calls work and `self.` does not, with the portal and date; update the module template pattern's footer CTA to `{{ link_helper.render_button(module.module_footer_cta, name ~ '__footer_cta') }}`; update the upload error table row to `content_types` and note `host_template_types` is the legacy name; document theme fields as the token source and `theme_overrides.css` as where they are written.
2. `docs/core-code-developer-guide.md`: same corrections at lines 314-330, 441, 452, 614, 623-645; add the `render_image` signature and the `data-lazy-init` contract; add the Design Manager case-sensitivity note.
3. `README.md`: add a "Vendor libraries are loaded on demand" line naming `rotators.js`, `statistics.js`, `video.js`, `video_popup.js`, Splide, Odometer, Plyr, lite-youtube as generated-module dependencies; add the portal jQuery setting; add the theme fields section.
4. Skills: `scaffold-module` and `fix-module` lines listed above switch to `content_types` with the documented values and mark `host_template_types` legacy. `scaffold-module/SKILL.md:102` and `core-code-conventions.md:827` say `lazyModuleInit` lives in `js/modules/utilities.js` (true after Task 2) and that the module wrapper needs `data-lazy-init`. `stitch-to-hubspot/SKILL.md:92` and `core-code-conventions.md:186-208`: Tier 1 brand colours and fonts are written as `fields.json` defaults (Task 6 groups); `palette.css` receives only tokens with no theme field. `SKILL.md:156-180`: the font-family step becomes "verify `typography.css` applies the tokens" rather than an edit, and the Google Fonts link step is removed.
5. `.editorconfig`: `root = true`, `[*] indent_style = tab, end_of_line = lf, charset = utf-8, trim_trailing_whitespace = true, insert_final_newline = true`, `[*.json] indent_style = space, indent_size = 2`, `[*.md] trim_trailing_whitespace = false`.
6. `package.json` with `"private": true`, devDependency `stylelint` and `stylelint-config-standard`, scripts `"lint:css": "stylelint \"css/**/*.css\" \"modules/**/*.css\" --ignore-path .gitignore"` and `"check:css-comments": "python scripts/check_css_comments.py css modules"`. `.stylelintrc.json` extends `stylelint-config-standard` with `"selector-class-pattern": null` (BEM camelCase), `"declaration-no-important": [true, { "severity": "warning" }]`, `"custom-property-pattern": null`, and `"ignoreFiles": ["css/vendor/**"]`. Add `node_modules/` is already ignored; add `css/vendor/` to `.stylelintignore`.
7. `scripts/check_css_comments.py`: a parser-based check (not a count) that walks each file character by character tracking comment state, reports a nested `/*` inside a comment and an unclosed comment at EOF, and exits 1 on any finding. Run it against a fixture containing a deliberate nested comment before trusting a clean result.
8. `docs/reviews/2026-09-21-backport-note.md`: one table, one row per portable fix (header padding script, `font-family` application and the Open Sans token, `end_editor_placeholder`, flyout `:focus-within`, `theme_overrides` loading, date picker colours), with the file each lives in and the review section, and the sentence that each client theme is assessed with `hs-deploy` separately.

**Verification:**
- `npm run lint:css` runs to completion; record the first-run finding count in `.stylelint-baseline.json` per the estate's baseline rule if it is non-zero.
- `npm run check:css-comments` exits 1 on the fixture and 0 on the tree.
- `grep -rn "host_template_types" .claude docs README.md` returns only lines that call it legacy.
- `grep -rn "Bitbucket\|WCAG 2.1\|silently fail" .claude/CLAUDE.md docs/core-code-developer-guide.md` returns nothing.

### Task 14: Upload and re-measure

**Files:**
- Read-only: everything above

**Steps:**
1. Preflight per `hs-cli`: portal `CoreCodeSandbox (141885928)`, branch `review/boilerplate-improvements`, pushing whole theme, command `hs cms upload --account=CoreCodeSandbox . "CoreCode-review" --clean`. `--clean` removes the stale `css/Modules/` casing; it also clears global content in the review folder, which holds none worth keeping. Confirm with the user before running.
2. User creates a page from "Core Code - Homepage" under `CoreCode-review`, selects a menu with at least one child item on the header module, publishes, and supplies the URL.
3. Playwright measurements at 1280x800 and 390x844, recorded into a new section 9 of the review:
   - `.m-siteHeader.getBoundingClientRect().top === 0`; `document.body.style.paddingTop === ''`.
   - Buffered `layout-shift` entries: none with a source on `.body-wrapper`; total under 0.01.
   - `getComputedStyle(document.body).fontFamily` starts with `"Open Sans"`; `h1` with `"Montserrat"`.
   - `.e-button--primary` background equals `--primaryColour`.
   - Keyboard: Tab to the first parent with children, Enter on its toggle, confirm `aria-expanded="true"` and that Tab lands on the first submenu link; Escape returns focus to the toggle.
   - Drawer at 390px ends at or above 844px.
   - `document.styleSheets` order: `theme_overrides`, `main`, then module sheets.
   - Rich Results test: Organisation, WebSite (and Article on a post) parse.
4. Fetch `fields.json` and both `meta.json` back with `hs cms fetch` to the scratchpad and diff against the repo.

**Verification:**
- Every measurement above meets its stated value; any that does not is a finding recorded in the review before the branch is offered for merge.

## Edge cases and error states

- Menu item with no URL (label-only header): rendered as `<span>` not `<a>`, still carries the toggle when it has children.
- Menu with no children anywhere: no toggles rendered; `has-children` absent; JS finds no `.js-submenuToggle` and does nothing.
- `module.menu` unset: editor shows the placeholder from `meta.json`; live page renders the logo and CTA only.
- Portal with no `site_settings.logo_src` and no module logo: no `<img>`; the header still lays out because `.m-siteHeader__navigationgroup` uses `margin-left: auto`.
- Image narrower than 480px: `srcset` is empty; the macro must then omit the attribute rather than emit `srcset=""`, so the candidates list is checked for length before output.
- Font field left at default in a portal whose Brand Kit has no fonts: `theme.typography.body_font.font` is `Open Sans` from the default, so `--fontSecondary` is never an empty string.
- Colour field with opacity below 100: `.color` outputs hex only, so opacity is ignored by design; the help text says so.
- Reduced motion: submenu chevron does not animate; counters render final values; Splide's built-in `reducedMotion` handles carousels.
- `request.domain` in JSON-LD disables caching on some request variables (HubSpot docs); Task 11 step 3 checks and falls back.
- Two sub-menus: opening one closes the other (`closeAllSubmenus` runs before toggling), so only one panel is open at desktop width.

## Risks and trade-offs

- Blocking `main.css` adds one render-blocking request of about 5KB compressed. Accepted in exchange for no FOUC and one copy of every rule. Mitigation: HubSpot serves it minified over HTTP/2 on the same origin as the page.
- Theme field values are content, not code. A colour changed in the editor is not in git. Documented in the developer guide (Task 13); `fields.json` defaults remain the code-side record.
- `inherited_value` key names beyond `primaryColor` are confirmed at implementation, not now. Worst case `secondary` loses inheritance and keeps its default.
- `content_types` accepted values: the docs list has no `PAGE`. If an upload rejects `SITE_PAGE` or `LANDING_PAGE` the fix is to the value, not a return to the legacy key.
- `--clean` on `CoreCode-review` deletes the folder first. Acceptable because it is a review copy; never use it on `CoreCode/` or a client portal.
- Renaming `css/Modules` changes every include path; a missed path fails the `main.css` upload loudly, which is the safe direction.
- Deleting `style_helpers.html` and `accessibility_helpers.html` breaks any generated module that imports them. No module or skill references them today (grep), and the stitch skill does not emit imports.
- The header nav rebuild removes `flyouts` behaviour that a client editor may have relied on visually. The disclosure pattern is the accessible replacement; a hover-open enhancement can be layered later with `:hover` opening in addition to click, without removing the button.

## Open questions

- Which default HubSpot modules to hide. Task 8 hides the two menu modules only; hiding more (Button, Form, Image) is an editor-experience choice for the user, owner: user, decision needed before Task 8 ships, otherwise the two-module list stands.
- Whether `request.domain` in the Organisation JSON-LD disables page caching. Owner: Task 11 step 3, answered on the Task 14 page; fallback stated.
- The exact `brand_settings` key for the secondary colour. Owner: Task 6 step 1, answered from the brand-inheritance docs page at implementation.
- Whether `@hubspot/blog_posts` is the listing module's path on this portal. Owner: Task 10 step 2, answered from the Design Manager before upload.

## Tracked action before merge

**Revert the theme label.** `theme.json` carries `"label": "Core Code (review branch)"` so the review copy is unmistakable in the sandbox theme picker alongside the original. HubSpot had otherwise renamed it to "Core Code - review" on upload to resolve the collision, which is what made it hard to find. Before this branch merges, set the label back to `"Core Code"`. A client theme cloned from a boilerplate labelled "review branch" is a visible defect, and `theme-clone` renames the label per client from this value.

## Definition of done

- All fourteen tasks committed on `review/boilerplate-improvements`, one commit per task (Task 12 may be two: rename, then deletions), subjects in conventional format under 72 characters.
- `hs cms upload --account=CoreCodeSandbox . "CoreCode-review" --clean` completes with zero `[ERROR]` lines.
- On the user-created page from `home.html`: header top edge 0px at 1280px and 390px; no layout-shift source on `.body-wrapper`; total CLS under 0.01; `body` font `"Open Sans"` and `h1` font `"Montserrat"`; `.e-button--primary` background equals `--primaryColour`; every second-level menu link reachable with Tab after activating its toggle; Escape returns focus to the toggle; drawer bottom at or above the viewport bottom at 390px.
- Theme settings show Colours and Typography groups; changing Primary in the editor changes the header button after republish.
- `npm run lint:css` and `npm run check:css-comments` both exit 0 (or lint exits 0 against a committed baseline).
- The review's scans report: 0 empty rulesets; `!important` only in `utilities.css` and the HubSpot-widget overrides; no hardcoded `z-index`; no `host_template_types` outside legacy notes; no `Bitbucket`, `WCAG 2.1` or "silently fail" in project docs.
- `docs/reviews/2026-09-21-boilerplate-review.md` gains a section 9 with the re-measurement table, and `docs/reviews/2026-09-21-backport-note.md` exists.
- Every `git rm` in Task 12 shows as deleted in `git status` before the deletion commit; none is left as a note.
- `theme.json` label is back to `"Core Code"` (see Tracked action before merge).
