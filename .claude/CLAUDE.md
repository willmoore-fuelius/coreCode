# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Agent Mode Selection

**Claude Code supports two operational modes for this repository:**

### Planning Mode (Default for Architecture/Design)
Use when the task involves:
- Breaking down feature requirements into implementation steps
- Designing new module structures or refactoring existing ones
- Evaluating architectural decisions or trade-offs
- Identifying dependencies and affected files across the codebase
- Proposing approaches for complex integrations

**In planning mode:**
- Provide a structured plan with numbered steps
- List all files that will be created, modified, or deleted
- Flag potential issues or edge cases
- Do not implement code unless explicitly requested
- Output can be reviewed before proceeding to execution

### Execution Mode (Default for Implementation)
Use when the task involves:
- Implementing a pre-approved plan or specification
- Making routine code changes, bug fixes, or updates
- Following established patterns from existing modules
- Writing CSS, JavaScript, or HubL based on clear requirements

**In execution mode:**
- Follow the specified approach without redesigning
- Prioritise working code over clever alternatives
- Maintain consistency with existing conventions
- Implement changes efficiently

**To switch modes:** Start your prompt with `[PLANNING MODE]` or `[EXECUTION MODE]` explicitly, or Claude will infer from context.

---

## Front-End Coding Standards

When writing or modifying module HTML, CSS, or JavaScript, follow the standards in `.claude/skills/frontend-standards/references/`. This covers BEM naming (camelCase within segments), ITCSS prefixes, WCAG 2.2 AA accessibility, vanilla CSS (no nesting), vanilla JS (no jQuery), design tokens, and performance best practices.

When spawning agents for front-end coding tasks, instruct them to read the reference files in `.claude/skills/frontend-standards/references/`.

For HubL templating standards, see `.claude/skills/hubspot-module-dev/references/hubl-standards.md`.

## Project Overview

This is **Core Code**, a HubSpot CMS theme by Fuelius. It provides modular, responsive website components for HubSpot's CMS platform using Jinja2-based templating (HubL).

## Development Workflow

There are **no build commands** - this is a HubSpot CMS theme deployed directly via Git integration:
1. Commit changes to the repository
2. Upload with `hs cms upload --account=<account> . "<destination>"` (or `hs cms watch` while developing)
3. Test in the HubSpot editor and on a rendered page

Repo tooling does have a dev dependency: `npm install` once, then `npm run check` runs the CSS comment parser and stylelint. Neither is required to deploy the theme.

There is no build or compilation step: the CSS and JS in the repo are the CSS and JS HubSpot serves.

## Architecture

### CSS Architecture (ITCSS)

Styles follow the Inverted Triangle CSS pattern in `css/`:
- **Generic** (`global/generic/`) - Reset, normalise
- **Objects** (`global/objects/`) - Layout patterns, containers (`.o-*`)
- **Components** (`global/components/`) - Header, footer (`.c-*`)
- **Elements** (`global/elements/`) - Base HTML styling (`.e-*`)
- **Modules** (`modules/`) - Module-specific styles (`.m-*`)

Entry point: `css/main.css` uses `{% include %}` to compose styles.

### Module Structure

The boilerplate ships two modules:
```
modules/
├── site_navigation.module/   # Header logo, menu, optional CTA
└── footer_content.module/    # Footer text, menu, copyright

Those two are the only modules the boilerplate ships. Content modules are
generated per project (see the stitch-to-hubspot skill), not kept here.
```

Each module is self-contained:
```
module_name.module/
├── module.html      # HubL/Jinja2 template
├── module.css       # Module-specific styles (auto-loaded by HubSpot)
├── module.js        # Optional JavaScript (auto-loaded by HubSpot)
├── fields.json      # CMS field definitions
└── meta.json        # Module metadata
```

### Macros

Reusable template functions in `macros/`. These are imported globally in `templates/layouts/base.html`:

| File (local) | Import alias | Key macros |
|---|---|---|
| `link_helpers.html` | `link_helper` | `render_link()`, `render_cta()`, `render_button()`, `render_module_footer_cta()` |
| `image_helpers.html` | `image_helper` | `render_image(image, class, sizes, priority)` — one `<img>` with a width-descriptor `srcset` |
| `text_helpers.html` | `text_helpers` | `render_heading(model, enabled, name)` |
| `video_helpers.html` | `video_helper` | Video embed helpers |

**Superseded 21 Sep 2026:** this note previously said HubSpot maps local filenames to Title Case on deployment, and that `base.html` must import the Title Cased paths. The Design Manager stores the literal lowercase filenames (confirmed by listing `CoreCode-review/macros` on portal 141885928). HubSpot's resolver also matches a Title Cased path, which is why the old imports worked and the claim went unchallenged. `base.html` now imports the literal names. Mind singular vs plural in the aliases: `link_helper` (singular), `text_helpers` (plural).

**Superseded 21 Sep 2026 — `render_button()` and `render_module_footer_cta()` are supported.** They were deprecated here on the grounds that un-prefixed cross-macro calls produce silent empty output. That was the wrong diagnosis: an un-prefixed sibling call works, and it is the `self.` prefix that renders nothing, because `self` addresses the block namespace rather than the macro namespace (verified on a rendered page, portal 149133071, 20 Aug 2026). Use the macros; do not duplicate their markup per module.

**Removed macros:**
- `style_helpers.render_module_padding()` — removed. Spacing uses inline custom properties on `.o-wrapper--module`.
- `style_helpers.html` and `accessibility_helpers.html` — deleted 21 Sep 2026, no consumers.

### CSS Variables & Design System

The theme uses a comprehensive design system with CSS custom properties following **camelCase naming convention**.

#### Variable Architecture
- **Base tokens** (spacing, radius, z-index, type scale, neutral greys) defined in `templates/layouts/base.html` (inline `<style>`)
- **Brand colours and fonts** are theme settings in `fields.json`, written to `:root` by `css/theme_overrides.css`. The colour fields inherit from the portal's brand kit. Their values are content, not code: a colour changed in the editor is not in git, and `fields.json` holds the code-side default
- **Extension tokens** with no theme field of their own go in `css/global/tokens/palette.css`, inlined by `base.html`
- **CMS fields** in `fields.json` for end-user customization

#### Design System Tokens

**Layout & Grid** (theme_overrides.css - CMS configurable):
```css
--containerWidth          /* 1440px default, configurable 1200-2000px */
--moduleTopSpacing        /* Responsive: mobile 30px, desktop 80px */
--moduleBottomSpacing     /* Responsive: mobile 30px, desktop 80px */
--moduleLeftSpacing       /* Responsive: mobile 24px, desktop 40px */
--moduleRightSpacing      /* Responsive: mobile 24px, desktop 40px */
--gridGutters            /* 20px - column gaps */
--gridColumns            /* 12 - grid system columns */
```

**Z-index Scale** (base.html):
```css
--zBelow: -1
--zBase: 0
--zDropdown: 100
--zSticky: 200
--zFixed: 300
--zModalBackdrop: 400
--zModal: 500
--zPopover: 600
--zTooltip: 700
```

**Spacing Scale** (base.html - 4px to 128px):
```css
--space4, --space8, --space12, --space16, --space20, --space24
--space32, --space40, --space48, --space64, --space80, --space96, --space128
```

**Typography** (base.html - fluid with clamp()):
```css
--h1: clamp(2.1875rem, 4vw + 1rem, 3.875rem)  /* 35px → 62px responsive */
--h2: clamp(2rem, 3vw + 0.5rem, 2.875rem)     /* 32px → 46px responsive */
--h3, --h4, --h5, --h6                         /* Fluid scaling */
--pXs, --pSm, --pBase, --pLg, --pXl           /* Paragraph sizes */
--fontPrimary, --fontSecondary                 /* Font families */
--fontLight, --fontRegular, --fontSemibold, --fontBold, --fontXbold
```

**Colors** (base.html):
```css
--grey10, --grey20, --grey30, --grey40, --grey50, --grey60, --grey90
--primary10, --primary20, --primary30
--primaryColour, --secondaryColour, --tertiaryColour, --highlightColour
--colorSuccess, --colorWarning, --colorError, --colorInfo  /* Semantic states */
```

**Border, Radius & Animation** (base.html):
```css
--border1, --border2, --border3
--radiusNone, --radiusXxs, --radiusXs, --radiusSm, --radiusMd, --radiusLg, --radiusXl
--transitionSpeed, --easeIn, --easeOut, --easeInOut
```

#### Usage
Modules override spacing via an **inline `style` attribute** on the `.o-wrapper--module` element, injecting four CSS custom properties: `--moduleTopSpacingMobile`, `--moduleBottomSpacingMobile`, `--moduleTopSpacingDesktop`, `--moduleBottomSpacingDesktop`. The global CSS in `containers_dnd.css` switches between mobile and desktop variables at 992px, with fallback to the theme defaults (`--moduleTopSpacing` / `--moduleBottomSpacing`).
All variables use **camelCase** naming (e.g., `--primaryColour`, not `--primary-colour`).

### Theme Fields (CMS Configurable)

End users can customize these settings in HubSpot theme settings via `fields.json`:

**Spacing Group**:
- Mobile vertical/horizontal spacing (0-500px sliders)
- Desktop vertical/horizontal spacing (0-500px sliders)
- Container max width (1200-2000px slider, default 1440px)

These fields populate the CSS variables in `theme_overrides.css`, allowing per-site customization without code changes.

## Key Conventions

### Naming Conventions
- **CSS classes**: BEM with prefixes - `.o-wrapper`, `.e-button`, `.m-accordion__item`
- **CSS variables**: camelCase - `--primaryColour`, `--gridGutters`, `--space20`
- **Files**: lowercase with underscores - `link_helpers.html`, `accordion.module`
- **JavaScript**: camelCase variables/functions

### Breakpoints (Range Syntax)
- **Mobile**: `width < 768px`
- **Desktop**: `width >= 992px`
- Primary breakpoint variable: `{% set breakpointLarge = '992px' %}`
- Use range syntax in all media queries: `@media (width >= 992px)` not `@media (min-width: 992px)`

### Module Template Pattern
```html
{%- if module.scrollid -%}
<div id="{{ module.scrollid }}" class="js-module">
{%- endif -%}

<section id="{{ name }}" class="m-moduleName">
  <div class="o-wrapper o-wrapper--module" style="--moduleTopSpacingMobile: {{ module.style.spacing_alignment.spacing.mobile.padding_top }}px; --moduleBottomSpacingMobile: {{ module.style.spacing_alignment.spacing.mobile.padding_bottom }}px; --moduleTopSpacingDesktop: {{ module.style.spacing_alignment.spacing.desktop.padding_top }}px; --moduleBottomSpacingDesktop: {{ module.style.spacing_alignment.spacing.desktop.padding_bottom }}px;">
    <div class="o-container">

      {{ text_helpers.render_heading(module.module_heading, module.enable_module_heading, name) }}

      {%- if module.items -%}
      <!-- Content -->
      {%- else -%}
      {%- if is_in_editor -%}
      {% editor_placeholder %}
      {%- endif -%}
      {%- endif -%}

      {# Footer CTA. link_helper.render_module_footer_cta(module.module_footer_cta, name) does the same job. #}
      {%- set footer = module.module_footer_cta -%}
      {%- if footer.button_type == 'link' and footer.link_settings.link_field.url.href and footer.link_settings.link_text -%}
      <div class="m-moduleFooter">
        <a id="{{ name }}__footer_cta"
           class="e-button e-button--{{ footer.button_style|default('primary') }}"
           href="{{ footer.link_settings.link_field.url.href }}"
           {% if footer.link_settings.link_field.open_in_new_tab %}target="_blank" rel="noopener" aria-label="{{ footer.link_settings.link_text }} (opens in new window)"{% else %}aria-label="{{ footer.link_settings.link_text }}"{% endif %}>
          {{ footer.link_settings.link_text }}
        </a>
      </div>
      {%- elif footer.button_type == 'cta' and footer.cta_settings.cta_field -%}
      <div class="m-moduleFooter">
        {% cta guid="{{ footer.cta_settings.cta_field }}" %}
      </div>
      {%- endif -%}

    </div>
  </div>
</section>

{%- if module.scrollid -%}
</div>
{%- endif -%}

{# Module spacing is handled via inline style attribute on .o-wrapper--module above #}
{# The CSS in containers_dnd.css switches between mobile/desktop variables at 992px #}
```

**Key details:**
- `render_heading(model, enabled, name)` — 3rd `name` param is optional but recommended to avoid ID collisions
- **Footer CTA** uses `{{ link_helper.render_module_footer_cta(module.module_footer_cta, name) }}`. The inline copy shown above is still valid, but the macro is not broken and is the DRY option.
- **Module spacing** uses inline `style` attribute on `.o-wrapper--module` to inject `--moduleTopSpacingMobile`, `--moduleBottomSpacingMobile`, `--moduleTopSpacingDesktop`, `--moduleBottomSpacingDesktop`. The CSS in `containers_dnd.css` switches between mobile/desktop at 992px. Do not use inline `<style>` blocks.
- Spacing field names must be `padding_top` and `padding_bottom` (NOT `top`/`bottom`)
- Scrollid wrapper is optional — provides anchor link targets
- Use `{%- -%}` whitespace-trimming tags for clean HTML output

## Vendor Libraries

Located in `css/vendor/` and `js/vendor/`:
- **Splide** - Carousels (jQuery-free)
- **Plyr** - Video player (CSS variable theming)
- **lite-youtube** - Lightweight YouTube embeds
- **Tabs Accordion** - Responsive tabs/accordion
- **Odometer.js** - Animated counters

**No jQuery** — all JavaScript is vanilla. Use native `<dialog>` for modals, Intersection Observer for scroll detection.

### Shared JS Utilities

`js/modules/utilities.js` is loaded globally via `base.html` and exposes:
- `window.CoreCode.trapFocus(container)` — Traps Tab focus within a container. Returns a cleanup function.
- `window.CoreCode.debounce(func, wait, immediate)` — Debounce utility (default 200ms delay).
- `window.CoreCode.lazyModuleInit(moduleId, initFn)` — runs `initFn` when the module is needed. A wrapper carrying `data-lazy-init` waits until it nears the viewport (IntersectionObserver, 200px margin); anything else runs on DOMContentLoaded. Also exposed as the bare `window.lazyModuleInit`.

Use these instead of inlining duplicate implementations in module JS files.

### Lazy Initialization

Carousels (`js/modules/rotators.js`) and statistics counters (`js/modules/statistics.js`) use `IntersectionObserver` to defer initialization until the module is near the viewport. This reduces main thread work on pages with multiple heavy modules.

## Coding Principles

- **WCAG 2.2 AA** — Keyboard navigation with `:focus-visible`, ARIA attributes, 4.5:1 contrast, 48px touch targets, semantic HTML
- **Performance** — Lazy load images, async/defer JS, `font-display: swap`, responsive images
- **Vanilla JS only** — No jQuery, no frameworks. IIFE pattern, event delegation, `const`/`let`
- **Modern CSS** — Media query range syntax (`width >= 992px`), `:is()`/`:where()` selectors, logical properties (`margin-inline`), individual transform properties (`translate`, `rotate`, `scale`)

## Skills (Slash Commands)

This project has skills in `.claude/skills/` for common workflows:

### Coding Standards & Development

| Skill | Trigger | What it does |
|---|---|---|
| `/frontend-standards` | Write or review front-end code | Enforces HTML, CSS, JS, accessibility, performance, and design token standards |
| `/hubspot-module-dev` | Write or review HubL code | HubL templating, data handling, variable scoping, and module patterns |
| `/css-debugging` | CSS/styling bug report | Structured audit-before-fix workflow for visual bugs, layout issues, responsive breakage |
| `/js-debugging` | JS bug report | Structured audit-before-fix workflow for broken interactivity, event handlers, vendor libraries |
| `/email-module-dev` | Build email module | Email-safe HTML with table layouts, VML fallbacks, MSO conditionals for Outlook |

### Module Lifecycle

| Skill | Trigger | What it does |
|---|---|---|
| `/scaffold-module` | Create a new module | Full scaffolding workflow: spec intake → field generation → template → CSS/JS |
| `/qa-review` | Audit a module | 15-section quality checklist with structured error/warning report |
| `/fix-module` | Fix upload errors | Diagnose HubSpot upload errors and apply targeted fixes |
| `/add-module-feature` | Add to existing module | Add fields, groups, or features without breaking live content |
| `/write-module-docs` | Generate documentation | Create Client Guide + Technical Spec from module code |

### Auditing & Optimisation

| Skill | Trigger | What it does |
|---|---|---|
| `/accessibility-checker` | WCAG audit | WCAG 2.2 AA audit with axe-core script for live URLs |
| `/frontend-performance` | Performance audit | Core Web Vitals audit with Lighthouse script for live URLs |
| `/optimise-codebase` | Combined optimisation | Performance, WCAG 2.2, and SEO optimisations across modules or full codebase |

### Client Communication & Handover

| Skill | Trigger | What it does |
|---|---|---|
| `/client-response-translator` | "Explain to client", "draft response for PM" | Translates technical findings into non-technical client-ready responses |
| `/client-handover-guide` | "Write guide for client", "training doc" | Generates usage guides for non-technical content editors in HubSpot |

### Planning & Review

| Skill | Trigger | What it does |
|---|---|---|
| `/grill-me` | "Grill me", "poke holes", "stress-test this" | Interviews you relentlessly about a plan or design, resolving each decision branch |

## HubSpot Upload Error Reference

Most common upload errors shown below. The complete error table (12+ patterns) is maintained in `.claude/skills/fix-module/SKILL.md` — use `/fix-module` for full diagnosis and automated fixes:

| Error message | Root cause | Fix |
|---|---|---|
| `internal error` | `meta.json` missing `description`, `icon`, or other required keys | Add all required meta.json fields — see `/fix-module` skill |
| `CSS or Javascript is not allowed on modules with ANY content type` | `meta.json` missing `content_types` | Add `"content_types": ["SITE_PAGE", "LANDING_PAGE", "BLOG_POST", "BLOG_LISTING"]` |
| `'link' is required but no default is set` | Link field missing complete default, or cascade from broken meta.json | Fix meta.json first; if persists, ensure all link fields have `default` with `url.type`, `url.href`, `open_in_new_tab`, `no_follow` |
| `'X' is not a valid category` | Category value in meta.json is lowercase | Use UPPERCASE: `"BODY_CONTENT"`, `"MEDIA"`, `"TEXT"`, etc. |
| `Cannot deserialize value of type java.util.ArrayList` | `content_tags` included in meta.json | Remove `content_tags` entirely — it's auto-generated |
| `Value for field with an occurrence must be an array` | Repeater default is `{}` instead of `[]` | Use `"default": []` or `"default": [{...}]` |

**Key rule:** When `css_assets` or `js_assets` are present in `meta.json`, `content_types` is **mandatory**. Without it, HubSpot treats the module as available on ALL content types and blocks CSS/JS.

`content_types` is the current key. `host_template_types` is its former name and still functions, but new modules use `content_types` with the documented values (`SITE_PAGE`, `LANDING_PAGE`, `BLOG_POST`, `BLOG_LISTING`, `EMAIL`, and the rest). Note `PAGE` is not one of them.

**`{% end_editor_placeholder %}` is not a HubL tag.** `editor_placeholder` is a single tag used inside an `if`; the block form fails the whole upload with `Unknown tag: end_editor_placeholder` after earlier files have already been written. Put empty-state guidance in the `placeholder` object in `meta.json` (`show_module_icon`, `title`, `description`).

## Git Workflow

- **Main branch**: `main`
- **Feature branches**: `feature/HCC-{number}`
- **Bugfix branches**: `bugfix/HCC-{number}`