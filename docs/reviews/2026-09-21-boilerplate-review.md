# Core Code boilerplate review

Date: 21 September 2026
Branch: `review/boilerplate-improvements` (cut from `review/full-code-review` at `d87c5e1`)
Scope: every non-vendor file in the theme (about 4,400 lines), checked against the rules estate and against current HubSpot developer and knowledge-base documentation. The CoreCode sandbox (portal 141885928, CLI alias `CoreCodeSandbox`) holds an older thirty-module build of the theme at `CoreCode/` and no published page uses it, so no page rendered from this repo was available. Anything that needs a rendered page to prove is marked "verify in render". Section 5 records what the sandbox's default 404 page did confirm.

Precedence note: where this document and the developer guide or project `CLAUDE.md` disagree, this document is the newer evidence and wins until the older docs are corrected.

## 1. Headline findings

Ranked by impact. Section numbers point to the detail.

| # | Finding | Type | Ref |
|---|---------|------|-----|
| 1 | Layout tokens used by the inline critical CSS live in `theme_overrides.css`, which is deferred. Module padding and container width arrive late and shift the page. | Performance (CLS) | 3.1 |
| 2 | Sticky header plus a script that also adds `padding-top` to `body` equal to the header height. Likely an 80px blank strip above the header. | Defect | 2.1 |
| 3 | Google Fonts are requested on every page but no `font-family` is ever applied, and the Open Sans token name does not match the family Google serves. | Performance and defect | 2.2 |
| 4 | Sub-menu flyouts show on `:hover` only. Keyboard users cannot reach child links. Between 768px and 1199px touch users cannot either. | Accessibility (WCAG 2.1.1) | 2.3 |
| 5 | The header module uses `.e-button--primary`, which the boilerplate never defines. | Defect | 2.4 |
| 6 | `meta.json` uses the legacy `host_template_types` key. HubSpot documents `content_types` as the current name. | HubSpot alignment | 6.1 |
| 7 | Theme settings expose only spacing. No brand colour or font fields, so Brand Kit inheritance and the `brand-direction` skill have nothing to target. | UX and operations | 4.1 |
| 8 | Templates ship with empty drag-and-drop areas and no section templates. Every new page starts blank. | Editor UX | 4.2 |
| 9 | Root font size is pinned to 16px, overriding the visitor's browser font-size preference. | Accessibility | 2.5 |
| 10 | Roughly 1.9KB of inline JavaScript in `base.html` does nothing: the loadCSS polyfill, the scrollbar-width probe, and a prefetch keyed on an undocumented variable. | Performance | 3.2 |
| 11 | Orphaned files: lightbox CSS and PNGs, popup CSS, pagination CSS, `tabs_accordion.js`, `tools/macros.css`, two Node scripts written for modules that no longer exist. | Code health | 6.3 |
| 12 | Project `CLAUDE.md` and the developer guide describe a codebase that no longer exists and repeat a macro claim the estate has since disproved. | Documentation | 6.5 |
| 13 | The theme could not be uploaded at all: `end_editor_placeholder` is not a HubL tag and both module templates were rejected. Fixed on this branch. | Defect (confirmed on sandbox) | 2.6 |

## 2. Defects and accessibility

### 2.1 Sticky header and body padding double up (confirmed in render)

`css/critical/header.critical.css:4-9` makes the global-partial wrapper `position: sticky`. A sticky element stays in normal flow and occupies its own height. `templates/partials/header.html:23-26` then measures the header and sets `body.style.paddingTop` to the same value. Both mechanisms reserve space, so the page renders with an empty strip above the header equal to `--siteHeaderHeight`.

Measured with Playwright on the sandbox page `/playground` (portal 141885928, older build of the same header code) at 1280x800 on 21 Sep 2026:

| Measurement | Value |
|-------------|-------|
| Global-partial wrapper `position` | `sticky` |
| `body` inline `padding-top` | `80px` |
| Header top edge | 80px from the viewport top |
| `<main>` top edge | 160px |
| Layout shift attributed to `.body-wrapper` when the script ran | 0.0633 |

So the padding script also accounts for most of the page's measured CLS of 0.068 (section 3.1). The original `header.css` (visible at `f3b2d05`) already had `position: sticky` alongside the same script, so this predates the current branch.

Screenshots at both widths (`.playwright-mcp/playground-1280.png`, `playground-390.png`, not committed) show the logo row beginning about 90px down with an empty band above it, so the geometry matches what is painted.

At 390x844 the same page measured: header top 80px, `<main>` top 160px, body padding 80px, CLS 0.102 of which 0.0948 is the `.body-wrapper` shift from this script. That is over the 0.1 threshold Core Web Vitals treats as "needs improvement", on a page with no images above the fold. Opening the mobile menu compounds it: the drawer is sized `calc(100vh - 80px)` (764px) but starts at 160px, so it ends at 924px in an 844px viewport and its last 80px is unreachable without the drawer's own scroll. The toggle measured 40x40px, and `aria-expanded` and the body scroll lock behaved correctly. Fix: delete the script. If a measured height is genuinely needed (variable-height headers), write it into `--siteHeaderHeight` with `setProperty` rather than into `body` padding, so `scroll-padding` in `page.css` and the mobile drawer height read the real value. The rules estate calls this the custom-property bridge.

### 2.2 Fonts loaded and never used

- `base.html:190` requests Montserrat 400/600/700 and Open Sans 400/600 from Google Fonts on every page.
- No theme CSS sets `font-family` (grep across `css/`, `templates/`, `macros/`, `modules/`: the only hit is the editor placeholder in `default_modules.css`). Confirmed in render: on the sandbox `/playground` page the computed `font-family` of `body`, `h1` and `p` is `"Times New Roman"`, the Google Fonts stylesheet is present, and the only face that loaded was Montserrat 600, pulled in by a module rather than the theme.
- `--fontSecondary: 'open-sans'` (`base.html:127`) does not match the family Google registers, which is `'Open Sans'` (confirmed by fetching the CSS2 endpoint today). Even once a `font-family` is added, the secondary font would fall through to `sans-serif`.
- Tokens `--fontLight: 300` and `--fontXbold: 900` are declared but neither weight is requested, so they would render as synthesised weights.

The `stitch-to-hubspot` skill knows about the missing `font-family` and patches it per project (`SKILL.md:168-180`). That is a workaround for a boilerplate gap, not a reason to keep the gap. Recommendation: either apply `body { font-family: var(--fontSecondary) }` and heading families in `typography.critical.css`, or drop the hardcoded Google Fonts link entirely and move to theme font fields (section 4.1), which HubSpot loads automatically.

### 2.3 Menu flyouts are hover-only

`css/global/components/default_modules.css:102-127` positions `.hs-menu-children-wrapper` at `left: -9999px` and reveals it on `.hs-item-has-children:hover`. There is no `:focus-within` rule and no JavaScript, so a keyboard user tabs through invisible off-screen links and never sees the sub-menu. Confirmed in the rendered CSSOM of the sandbox `/playground` page: the only rules matching `.hs-menu-children-wrapper` with a state selector are the two `:hover` reveals, and none uses `:focus` or `:focus-within`. The header module uses `flyouts=True, max_levels=2` (`site_navigation.module/module.html:18`), so this is live in the boilerplate's own navigation.

A second gap: the mobile drawer applies below 1200px (`header.critical.css:85`) but the inline "show children" override only applies below 768px (`default_modules.css:129`). Between 768px and 1199px the drawer is open but children are still absolute hover flyouts, so touch users tapping a parent link navigate away and never see the children.

HubSpot's guidance is explicit that once you build custom navigation "you are fully responsible for the accessibility of your menu" (menus and navigation guide). Two routes:

1. Minimal: add `:focus-within` next to every `:hover` reveal, and align the inline-children breakpoint with the drawer breakpoint.
2. Proper: render the menu from the `menu()` HubL function into your own markup, with a `<button aria-expanded>` disclosure per parent that has children, and drop the `flyouts` CSS. This is the route the estate's a11y patterns already describe.

Related: the toggle button is 40x40px (`header.critical.css:59-60`), below the 44px working default though above the 24px AA floor. It also declares `align-items` and `justify-content` with no `display: flex`, so those two lines do nothing.

### 2.4 Undefined button variant

`.e-button--primary` is referenced by the header CTA, the heading macro, the link macro and the developer guide, but no stylesheet defines it (`grep -rn "e-button--" css modules` returns nothing). Confirmed in render: on the sandbox `/playground` page an `.e-button--primary` element computes to `background-color: rgba(0, 0, 0, 0)`, `color: rgb(0, 0, 238)` and `padding: 0`, which is an unstyled default link. `buttons.css` styles `.e-button` as a bare `inline-flex` anchor with no padding, background or colour. The stitch skill generates the variants per project (`SKILL.md:135, 292`), so on a clean clone the header button is an unstyled link. A neutral default for `--primary` and `--secondary` in `buttons.css` would make the boilerplate render sensibly on first drop and gives the skill a rule to override rather than create.

### 2.5 Root font size pinned

`typography.critical.css:4-6` sets `html { font-size: calc(var(--rootFontSize) * 1px) }` with `--rootFontSize: 16`. A visitor who has set their browser default to 20px gets 16px. Browser zoom still works, so it is not a hard AA failure, but it defeats the user preference the `rem` scale exists to honour. Remove the declaration and let `rem` resolve against the browser default. `--rootFontSize` is only otherwise used in comments.

### 2.6 Smaller defects

- `forms.css:186-199` gives the date picker header and hovered day `color: var(--white)` with no background. White text on the picker's default white surface is invisible. These look like remnants of a themed version whose backgrounds were stripped.
- `forms.css:11-14` sets `fieldset.form-columns-2 { display: flex }` with no wrap. HubSpot's own stacking of two-column fields on narrow screens relies on its float and width rules, so this may hold two fields side by side at 375px. Verify in render.
- `forms.css:229-235` leaves `.hs-form-required` and `.hs-input.invalid.error` empty, so there is no visible error state beyond HubSpot's default red message text. The UX baseline wants error states distinct and not colour-only.
- `templates/system/404.html:16` and `500.html:22` use `<h1 class="h6">`. No `.h6` utility class exists anywhere, so the h1 renders at full size. Both templates also ship Lorem ipsum in the default rich text, and the 500 page carries the `error-page--404` modifier.
- `templates/system/search_results.html` places its two modules directly in `<main>` with no `.o-wrapper` or `.o-container`, so results run edge to edge. Every other system template wraps its content.
- `macros/accessibility_helpers.html:6-12` `sanitize_rich_text` falls back to `<p>Content coming soon</p>`, which would leak placeholder text to a live page if a field is empty. Not imported anywhere at present.
- `macros/image_helpers.html:42, 47` default `alt` to "Image related to content". A generic alt is worse than `alt=""` for a decorative image and never fires anyway, because HubSpot pre-populates `.alt` with the filename (rules estate, `hubspot-module-conventions.md`).
- The header logo uses `module.logo.alt | default('', true)`. For the same reason the filename ships as the accessible name. Use `site_settings.logo_alt` or a dedicated text field.
- `header.critical.css:104` sizes the mobile drawer with `100vh`. On mobile browsers with a collapsing URL bar that overshoots the visible area and hides the last links. Use `100dvh` with a `100vh` fallback.
- `main.css:7-16` applies the blanket reduced-motion reset to every element. The a11y baseline notes this also stops spinners and progress indicators. Acceptable for a boilerplate, but worth narrowing once real components exist.
- **Confirmed and fixed on this branch.** Both custom modules used `{% editor_placeholder %} ... {% end_editor_placeholder %}`. A whole-theme `hs cms upload` to the sandbox on 21 Sep 2026 rejected both `module.html` files with `Syntax error in '{% end_editor_placeholder %}': Unknown tag: end_editor_placeholder`, after every other file had already been written. That is the write-before-validate trap the rules estate describes: the portal held two modules with no template. So the boilerplate as committed at `d87c5e1` could not be uploaded. HubSpot documents `editor_placeholder` as a single tag (standard tags reference) and the `placeholder` object in `meta.json` (`show_module_icon`, `title`, `description`) as the mechanism for empty-state guidance (module configuration reference). Both modules now use the single tag and carry their guidance text in `meta.json`; the re-upload of the two module folders succeeded and `hs cms list` shows `module.html` present in both.
- `base.html:207` guards `template_css` with `is iterable`. In Jinja2 a string is iterable, and `blog_post.html` sets `template_css` to a string. It evidently works under HubL, but `is string` would make the intent explicit and remove the dependence on Jinjava's behaviour.

## 3. Performance

### 3.1 Critical CSS depends on deferred tokens

The inline `<style>` in `base.html` includes `layout.critical.css`, whose `.o-wrapper--module` padding and `.o-container` max-width resolve `--moduleTopSpacing`, `--moduleRightSpacing` and `--containerWidth`. Those tokens are only defined in `css/theme_overrides.css`, which `base.html:225` loads with the `preload` then `rel=stylesheet` swap. Until that file lands, every `var()` fails at computed-value time: the padding collapses to zero and the container has no maximum width. When the file arrives, modules gain 30px or 80px of vertical padding and the layout narrows to 1440px. That is layout shift on first load of every page, and it is caused by the very file meant to prevent it.

Measured on the sandbox `/playground` page at 1280x800 with a buffered `layout-shift` observer: three shifts totalling 0.068. The largest, 0.0633 at about 1.5s, is attributed to `.body-wrapper` and is the header padding script from 2.1. The third, 0.0048 at about 1.7s, is attributed to `.o-wrapper.o-wrapper--module` and lands when the deferred `theme_overrides.css` arrives. The page has 35 module wrappers, so a page with more above-the-fold content shifts more. Both stylesheets were confirmed to use the `preload` then `rel=stylesheet` swap.

Fix: `theme_overrides.css` is 718 bytes and is already HubL-processed, so include it inside the inline critical `<style>` with `{% include %}` exactly as the other critical files are, and remove the deferred link. Same treatment for `palette.css` once it holds values.

### 3.2 Loading strategy

Measured today:

| Asset | Raw | Gzip |
|-------|-----|------|
| `main.css` composed from its includes | 20,135 B | 5,380 B |
| Inline critical CSS | 5,092 B | 1,677 B |
| loadCSS polyfill (inline JS) | 942 B | |
| `theme_overrides.css` | 718 B | |
| `palette.css` (empty) | 359 B | |

At 5KB compressed, `main.css` is small enough to load as a normal blocking stylesheet. Loading it asynchronously buys almost nothing here because HubSpot already emits every module's CSS as blocking `<link>` tags inside `standard_header_includes`, and the cost is a flash of unstyled content plus the duplicated critical CSS that has to be kept in sync by hand. Recommendation: load `main.css` with `require_css` (blocking), keep the inline block for tokens plus the header only, and delete the duplicated `layout.critical.css` and `typography.critical.css` copies (their content already exists in `containers_dnd.css` and `typography.css`). `main.css` already documents this approach for the header.

Other removals in `base.html`:

- The loadCSS polyfill (`base.html:229-232`) targets browsers without `rel=preload` support. Every browser in the support matrix has it. Dead weight executed on every page.
- The scrollbar-width probe (`base.html:250-253`) reads `document.body.offsetWidth` during parse, forcing layout, and writes `--scrollbarWidth`, which nothing consumes (grep confirms). Remove. Move `scrollbar-gutter: stable` from `body` to `html` while there, since the property only affects the viewport when set on the root.
- `{% if content.next_page_url %}` (`base.html:202`) keys a prefetch on a variable that does not appear in the HubL variables reference. `next_page_num` exists; `next_page_url` does not. Unverified - not found in current HubSpot docs. The branch is almost certainly never true.
- The lazy-init observer (`base.html:255-306`) is fine to keep, but the skill documentation says it lives in `js/modules/utilities.js` and it does not. Move it there so the documentation is true, and let `rotators.js` and `statistics.js` use it instead of each creating their own `IntersectionObserver`.
- `palette.css` is empty and loaded as a blocking request via `require_css`. Either populate it or do not load it until the stitch pipeline writes it. The comment "must load before all other stylesheets" is also inaccurate: `require_css` renders inside `standard_header_includes`, which sits after the `main.css` link in the document.

### 3.3 Images

`macros/image_helpers.html` needs a rewrite rather than patching:

- Each breakpoint emits a `type="image/webp"` source whose URL is the same as the fallback. HubSpot's CDN already serves WebP by content negotiation when it is smaller, so the extra `<source>` doubles the markup for no gain (rules estate, verified against the knowledge base 20 Aug 2026).
- `srcset` has a single candidate and no `sizes`, so the browser cannot choose by layout width and there is no 2x candidate for high-density screens.
- No way to pass `fetchpriority="high"` or `loading="eager"` for the LCP image, so hero modules cannot mark their image as the priority resource.
- `sizeAttrs` and `loadingAttr` are set and never used. `class` is applied to `<source>` elements, where it has no effect. `-wrapper` suffix naming is not BEM.

Replace with one `<img>` carrying a multi-width `srcset` built from `resize_image_url` at, say, 480/768/1200/1600, a `sizes` parameter supplied by the caller, `width`/`height` from the field, and optional `priority` flag that switches `loading`/`fetchpriority`/`decoding`. HubSpot's automatic resizing only applies to images with `width` and `height` attributes and skips anything over 4096px, so the attributes stay mandatory.

### 3.4 Video

`macros/video_helpers.html` loads Plyr `async` then polls every 100ms for up to five seconds until the global appears, and emits one polling script per video instance. Replace with a shared `js/modules/video.js` that initialises every `.js-videoPlayer` on `DOMContentLoaded`, loaded via `require_js` in the footer (scripts there execute in order after the vendor file). Also consider `js_render_options` on any module that ships JS: HubSpot documents `position`, `async`, `defer` and `type`, with footer as the default position.

### 3.5 Legacy CTA path

`link_helpers.html:65-86` still renders the pre-2023 CTA embed for GUIDs containing a dash: a synchronous `<script src="https://js.hscta.net/cta/current.js">` in the body per CTA, a `role="button"` on a span wrapping an anchor, and `target="_blank"` forced on. New CTAs use the `{% cta %}` tag, which the macro already handles. Unless a client portal still carries legacy CTAs, drop the branch.

### 3.6 Portal-level

- jQuery is included on HubSpot sites by default. The theme is vanilla JS, so document in the README that the portal setting to include jQuery should be switched off, and check `standard_footer_includes` on a rendered page for it.
- `images/template-previews/theme_preview.png` is 1.9MB. It only loads in the HubSpot UI, but a theme picker screenshot does not need to be that large.

## 4. Editor and end-user experience

### 4.1 Theme settings and brand inheritance

`fields.json` exposes spacing only. HubSpot theme fields support colour fields that inherit from the portal's Brand Kit through `inherited_value` with `property_value_paths` (for example `"color": "brand_settings.primaryColor"`), and font fields for which "HubSpot automatically loads the selected web font to the page if the font is selected and referenced by HubL in a stylesheet or in a module" (fields reference and brand-inheritance guide). Neither is used.

The current architecture puts tokens in code: hex values in `base.html` and a generated `palette.css`. That suits the stitch pipeline, where the design export is the source of truth. It does not suit the other route the estate has, `brand-direction` then `theme-clone`, which expects a theme with Brand settings to map onto. The two are not exclusive: `theme_overrides.css` is already HubL-processed and already writes `:root` tokens from `theme.*`. Adding colour and font groups to `fields.json` and writing `--primaryColour`, `--fontPrimary` and friends from them in that file gives editors a settings panel, gives Brand Kit a hook, and lets the stitch pipeline write the same fields' defaults instead of editing `base.html`. Trade-off: theme field values are content, so a change made in the editor is not in git. That is the standard HubSpot trade and the developer guide should state it.

### 4.2 Blank pages and no sections

`home.html`, `standard_internal.html`, `Playground.html` and `blog_listing.html` each contain an empty `dnd_area`. HubSpot documents that "the body of a `dnd_area` tag supplies the default content for the drag and drop area", and section templates (`templateType: section` with `label`, `description`, `screenshotPath`) appear in the editor's section picker. The blog listing in particular renders no posts until an editor finds and drops `@hubspot/blog_posts`. Recommendation: a `templates/sections/` folder with at least a hero and a rich-text section, default `dnd_section` content in each page template, and a default `dnd_module` for the blog listing. Note the documented limitation: default content only applies when a page is first created.

Pair this with `hidden_modules` or `hide_all_default_modules` in `theme.json` so the module picker shows the theme's modules rather than HubSpot's forty defaults alongside them. Both keys are documented.

### 4.3 Header and footer modules

- Footer copyright defaults to a static "© Your Company. All rights reserved." HubL exposes `{{ year }}` ("Prints the current year"), so the module can render the year itself and let the field hold only the company name.
- The header logo could default to `site_settings.logo_src`, `logo_alt` and `logo_link`, all documented, so a fresh portal shows the right logo before anyone opens the module. Keep the field as an override.
- Footer text comes from a rich text field named `footer_text`. Fine. The footer `nav` has an `aria-label`, good.
- The header toggle label "Toggle navigation menu" is acceptable, but the more robust pattern is a static label ("Menu") with `aria-expanded` doing the state work.

### 4.4 Blog templates

`blog_post.html` outputs the title, body and comments only. No publish date, author, featured image, tags or `<time>` element, and no next/previous. `content.publish_date`, `content.blog_post_author`, `content.featured_image` and `content.topic_list` are all documented. A boilerplate post template should at least render date and author in a `<header>` and the featured image with the responsive macro.

### 4.5 System pages

Replace the Lorem ipsum in the 404 and 500 rich text defaults with real copy, drop the `class="h6"`, and give the 500 template its own modifier. HubSpot's `error_page` documentation found today does not carry specific guidance about keeping the 500 page free of global partials, so the current structure is acceptable; keep an eye on it because a 500 page that depends on the header partial fails with it.

### 4.6 Forms

Add visible error styling (border plus message, not colour alone), a required-field marker on the label, and cover `input[type=url]`, `[type=search]` and `[type=date]` in the input selectors. Note in the developer guide that a form created via the Forms v3 API renders in an iframe unless `displayOptions.renderRawHtml` is set, which makes all of `forms.css` unreachable (rules estate, verified 2 Sep 2026).

## 5. SEO

What HubSpot does for you, so the template should not duplicate it:

- Canonical: "By default, when you create a new page or blog post, its URL is set as canonical for that content", with blog listing pages excluded so paginated pages are crawlable (knowledge base, set canonical URLs). Confirmed injected by `standard_header_includes` with no template code: the CoreCode sandbox (portal 141885928) default 404 page carries `<link rel="canonical">` plus `og:title`, `og:description`, `og:url`, `twitter:card`, `twitter:title` and `twitter:description`, measured with Playwright on 21 Sep 2026.
- Social cards: title, meta description and featured image are set automatically for blog posts. For website and landing pages the featured image must be set manually (knowledge base, featured images). Document this for editors rather than adding `og:` tags to the template.
- jQuery: `typeof window.jQuery` is `undefined` on the CoreCode sandbox, so the portal-level include is already off there. Still document the setting for new client portals.
- `standard_header_includes` adds "layout.css, any attached stylesheets, a meta viewport tag, Google Analytics tracking code, other page meta information" (variables reference). The template's own `<meta name="viewport">` is therefore duplicated; harmless, but one can go.

What the template should add:

- A head extension point. `base.html` has no `{% block head %}`, so a template cannot preload its hero image or add JSON-LD without editing the layout. Add an empty block after the critical CSS. HubSpot also documents `require_head` for the same purpose from inside modules.
- Guard the description: `<meta name="description" content="">` is emitted when the page has none. Wrap it in `{% if page_meta.meta_description %}`.
- Tidy the `<title>`: the current markup emits newlines and tabs inside the element. Follow the HubSpot boilerplate form, one line with `page_meta.html_title or pageTitle`.
- Organisation JSON-LD from `site_settings.company_name` and the logo, and Article JSON-LD on the blog post template (publish date, author, featured image, all documented variables). Both are boilerplate-safe because they read portal settings.
- `rel="shortcut icon"` is the legacy form; `rel="icon"` is the standard. Consider `apple-touch-icon` if the portal supplies one.
- `theme.json`: add `documentation_url` and `license: "MIT"` (both documented keys; the repo carries an MIT licence file).

## 6. Code health and how the boilerplate operates

### 6.1 HubSpot alignment

| Item | Current | HubSpot docs | Action |
|------|---------|--------------|--------|
| Module content types | `host_template_types` in both `meta.json` files | "this field was previously named `host_template_types`. Modules using the previous field name will continue to function, but it's recommended to use `content_types` moving forward." Values include `SITE_PAGE`, `LANDING_PAGE`, `BLOG_POST`, `BLOG_LISTING`. | Rename, and update the `fix-module` error table which still teaches the old key. Note `PAGE` is not in the documented value list; `SITE_PAGE` and `LANDING_PAGE` are. |
| Editor placeholder | Block form `{% editor_placeholder %}...{% end_editor_placeholder %}` | Single tag inside `if`; `placeholder` object in `meta.json` is the configured mechanism | Upload rejected the block form; fixed on this branch (2.6) |
| Module JS loading | Defaults | `js_render_options` supports `position`, `async`, `defer`, `type`; default position footer | Set `defer` on any module JS that is not needed before paint |
| Default modules in picker | All shown | `hidden_modules`, `hide_all_default_modules` | Curate (4.2) |
| Sections | None | `templateType: section`, `include_dnd_partial` | Add (4.2) |
| Brand Kit | Not wired | `inherited_value.property_value_paths` on colour fields; font fields auto-load | Add (4.1) |
| Theme metadata | `label`, `preview_path`, `screenshot_path`, `author`, `version`, one breakpoint | Also `documentation_url`, `example_url`, `license`, `is_available_for_new_content` | Add `documentation_url`, `license` |
| Request variables | Not used | "using certain request variables will disable page caching" | Keep it that way; the rules already say prefer `content.*` |

### 6.2 Dead and empty CSS

- 65 of the custom properties declared in `base.html` have no consumer anywhere in the theme. A token library is expected to run ahead of usage, but some are noise rather than library: the five `--breakpoint*` values (cannot be used in media queries, as the comment admits), `--fontAwesome` (Font Awesome is not loaded), `--dotDimension` and `--touchArea` (hardcoded 24px and 40px are used instead where they would apply).
- 24 empty rulesets across seven files, including twelve `h1 {}` to `h6 {}` shells in `rte.css` and the `.m-siteFooter {}` block. Empty rules are dead bytes and a reader has to check each one to learn it does nothing.
- 30 `!important` declarations outside vendor CSS. The two in `header.critical.css` (`display: flex!important`) override the theme's own `display: none` and go away if the hidden state is scoped to `@media (width < 1200px)` instead of being the unconditional default. The nine in `utilities.css` are the usual visibility-utility exception.
- Seven hardcoded `z-index` values (90, 10, 99, 99, 9999, 1, 2) sit alongside a nine-step `--z*` scale that nothing uses.
- `reset.css:55-57` keeps `#root, #__next { isolation: isolate }` from the source reset. Those are React and Next.js mount points and never exist in a HubSpot page.
- `.m-siteHeader__row--upper` and `.m-siteHeader__cta--navigationmenu` are styled but never rendered. `.default-module` is styled but never output. `.body-container` is set on every `dnd_area` and styled nowhere.

### 6.3 Orphaned files

No reference in the theme, the skills, or the docs unless stated:

- `css/Modules/modules.lightbox.css` and `images/lightbox/*.png` plus `loading.gif`: no lightbox JavaScript exists. The developer guide lists Lightbox and Magnific under "removed, do not re-introduce".
- `css/Modules/popup.css`: `video_popup.js` builds a `.m-popup` dialog but nothing loads this stylesheet, so the dialog is unstyled wherever the script is used.
- `css/Modules/pagination.css`: no consumer; three of its rules are empty.
- `js/vendor/tabs_accordion.js`: no reference anywhere, including the skills. Either the vendor table in the guide is wrong or the file is dead.
- `css/tools/macros.css`: referenced only by a comment in `main.css`. Its `fluidTypography` macro predates the `clamp()` scale.
- `scripts/apply-ux-improvements.js` and `scripts/remove-debug-fields.js` iterate `modules/` to patch fields that belonged to the thirty modules removed at `d59af37`. With two modules left and the stitch skill generating fields directly, these are legacy tooling.
- `macros/style_helpers.html` `render_toggle` and `macros/accessibility_helpers.html`: no consumers. The toggle also uses non-BEM classes (`e-toggle-light`, `e-toggle-btn`) and `{% set breakpointLarge %}` at the top of a macro file has no effect on importers.
- `js/modules/rotators.js`, `statistics.js`, `video_popup.js`, `lite_youtube.js`, Splide, Odometer, Plyr: not loaded by the layout, but referenced by the skills as libraries for generated modules. Keep, and say so in one line in the README so the next reviewer does not flag them.

### 6.4 Duplication and drift

- `layout.critical.css` and `typography.critical.css` are hand-maintained copies of parts of `containers_dnd.css` and `typography.css`, and both originals are still included in `main.css`. Two copies drift; section 3.2 removes the need for them.
- The heading CTA in `text_helpers.html:22-39` re-implements `link_helpers.render_link` line for line because the project docs say cross-macro calls fail. They do not: the estate verified on a rendered page (portal 149133071, 20 Aug 2026) that an un-prefixed sibling macro call works and only the `self.` form renders nothing. `render_button` and `render_module_footer_cta` can come off the deprecated list and the duplication can go.
- The three email subscription templates repeat the same `require_css` and `require_js` block. A tiny partial or a shared `{% block %}` in a `system_base` layout removes the triplication.
- `css/Modules/` is capitalised while every other path is lowercase snake_case, and its files mix `modules.lightbox.css` with `footer_cta.css`. Rename the directory and the dotted files.
- Indentation is split roughly half tabs, half spaces across the non-vendor files. There is no `.editorconfig`, no stylelint, no `package.json`. The rules estate expects an instrument to exist wherever one can; a `package.json` with stylelint and the CSS comment-balance scan the estate already prescribes would be the minimum.
- `.gitignore` is a generic template (Java classes, Maven, `.war`). Trim to what this repo produces and add `.claude/worktrees/` per the estate's worktree guidance.

### 6.5 Documentation drift

`.claude/CLAUDE.md`:

- Describes `modules/banners/`, `blog/`, `components/`, `elements/`, `menus/` and "~30+" page modules. Two modules exist.
- Says deployment is "Commit changes to Bitbucket, HubSpot CI/CD automatically pulls". The remote is GitHub and the README documents `hs cms upload`.
- Says the main branch is `development`. The repository's default branch is `main`.
- States WCAG 2.1 AA twice. The estate's baseline is 2.2 AA.
- Repeats the disproved claim that un-prefixed cross-macro calls fail silently, and deprecates two macros on that basis.

`docs/core-code-developer-guide.md` carries the same deprecations and the same branch names. `.claude/skills/stitch-to-hubspot/references/core-code-conventions.md:827` and `scaffold-module/SKILL.md:102` say `lazyModuleInit` is defined in `utilities.js`; it is inline in `base.html`. Where a claim is corrected, mark the old text superseded with the date and reason rather than deleting it, per the estate's documentation rule.

## 7. Suggested order

1. Correctness first, one commit each so they can be reverted independently: header padding script (2.1), inline `theme_overrides.css` into the critical style (3.1), `font-family` and the Open Sans token (2.2), `:focus-within` on flyouts and the breakpoint alignment (2.3), default `.e-button--primary` and `--secondary` (2.4), root font size (2.5), date picker colours (2.6).
2. Strip `base.html`: polyfill, scrollbar probe, dead prefetch, duplicated critical files, `main.css` back to blocking; move the lazy-init helper into `utilities.js` (3.2).
3. Rename `host_template_types` to `content_types`, add `theme.json` metadata and `hidden_modules`, fix the `fix-module` table (6.1).
4. Delete the orphans in 6.3 and the empty rules in 6.2. Deletions are routinely refused by the permission classifier, so expect to run the `git rm` commands by hand; track them to closure.
5. Rewrite the image macro and consolidate the video initialisation (3.3, 3.4).
6. Theme fields for colour and font with Brand Kit inheritance, written into `theme_overrides.css` (4.1). Agree the trade-off with the stitch pipeline owner first, because it changes where the pipeline writes tokens.
7. Sections, default drag-and-drop content, blog post enrichment, system page copy, header logo defaults, footer year (4.2 to 4.5).
8. Head block, guarded description, tidy title, JSON-LD (5).
9. Documentation pass over `CLAUDE.md`, the developer guide and the two skill references (6.5), then `.editorconfig` and stylelint (6.4).

Items 1 and 2 were measured on the sandbox's older build of the same code (sections 2.1, 2.2, 2.4, 3.1). Re-measure after the fixes on a page created from `CoreCode-review/templates/home.html`: header top at 0px at both 390px and 1280px, `.body-wrapper` absent from the layout-shift sources, computed `font-family` on `body` matching the token, and a keyboard traversal of a two-level `{% menu %}` reaching every child link. Creating that page needs a CLI key carrying the granular `content` scope; the current `CoreCodeSandbox` key returned `MISSING_SCOPES` with `requiredGranularScopes: ["content"]` on `POST /cms/v3/pages/site-pages`.

## 8. Sources consulted

HubSpot developer documentation, fetched 21 September 2026:

- Module configuration (`content_types` legacy note, `css_render_options`, `js_render_options`, `placeholder`): developers.hubspot.com/docs/reference/cms/modules/configuration
- Module and theme fields (font field auto-loading, colour field): developers.hubspot.com/docs/reference/cms/fields/module-theme-fields
- Brand and settings inheritance (`inherited_value`, `brand_settings.primaryColor`): developers.hubspot.com/docs/guides/cms/content/fields/brand-and-settings-inheritance
- Themes overview (`theme.json` keys): developers.hubspot.com/docs/guides/cms/content/themes/overview
- Hide modules and sections (`hidden_modules`, `hide_all_default_modules`): developers.hubspot.com/docs/cms/building-blocks/themes/hide-modules-and-sections
- Sections (`templateType: section`, `include_dnd_partial`): developers.hubspot.com/docs/guides/cms/content/templates/drag-and-drop/sections
- Drag and drop area tags (default content, `dnd_section` parameters): developers.hubspot.com/docs/reference/cms/hubl/tags/dnd-areas
- Menus and navigation (`menu()` function, accessibility responsibility): developers.hubspot.com/docs/guides/cms/content/menus-and-navigation
- Standard tags (`editor_placeholder`, `menu`, `require_head`): developers.hubspot.com/docs/reference/cms/hubl/tags/standard-tags
- Functions (`require_css`, `require_js` options, `resize_image_url`): developers.hubspot.com/docs/reference/cms/hubl/functions
- Variables (`standard_header_includes`, `site_settings.*`, `year`, `content.*`, request caching caveat, absence of `next_page_url`): developers.hubspot.com/docs/reference/cms/hubl/variables
- HubSpot CMS theme boilerplate `base.html` (title and description patterns): github.com/HubSpot/cms-theme-boilerplate

HubSpot knowledge base:

- Set canonical URLs for duplicate content: knowledge.hubspot.com/seo/set-canonical-urls-for-duplicate-content
- Use a featured image on a page or blog post (automatic social metadata for posts): knowledge.hubspot.com/blog/use-a-featured-image-on-a-page-or-blog-post
- CDN, security and performance overview (minification, WebP, Brotli, jQuery default): developers.hubspot.com/docs/cms/developer-reference/cdn

Other:

- Google Fonts CSS2 endpoint for Open Sans, fetched today, registers `font-family: 'Open Sans'`.
- Estate rules: `~/.claude/rules/hubspot-module-conventions.md` (macro `self.` verification, alt pre-population, WebP CDN behaviour), `~/.claude/rules/frontend-standards.md` (custom-property bridge, `renderRawHtml`).
