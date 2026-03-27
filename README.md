# Core Code

A HubSpot CMS convention framework by Fuelius. Provides layout infrastructure, design tokens, macros, and global styles. Content modules are generated per-project from design exports using the stitch-to-hubspot skill.

---

## Quick Start: Stitch Design to HubSpot Build

### Prerequisites

- [Claude Code](https://claude.ai/code) CLI installed
- [HubSpot CLI](https://developers.hubspot.com/docs/cms/developer-reference/local-development-cli) v8+ (`hs --version`)
- HubSpot CLI authenticated to the target portal (`hs init` or `hs auth personalaccesskey`)
- This repo cloned locally

### 1. Generate the design with Google Stitch

Use [Google Stitch](https://stitch.withgoogle.com/) (or any AI design tool) to generate a website design. Export three files:

| File | What it is | Required |
|---|---|---|
| `DESIGN.md` | Design system document (colours, typography, spacing, components) | Yes |
| `code.html` | Full HTML + Tailwind CSS export | Yes |
| `screen.png` | Visual screenshot of the design | Recommended |

Place all three files in the `design/` directory at the repo root:

```
design/
  DESIGN.md
  code.html
  screen.png
```

### 2. Run the pipeline

Open Claude Code in the repo root and run:

```
/new-theme
```

This triggers the stitch-to-hubspot skill, which runs a 4-phase pipeline:

| Phase | What happens | User action |
|---|---|---|
| **Phase 1: Token Extraction** | Parses colours, fonts, spacing, radii from DESIGN.md and the Tailwind config in code.html. Maps to Core Code CSS custom properties. | Review the token mapping table. Confirm font choices and container width. |
| **Phase 2: Module Specification** | Parses the HTML section by section. Generates a module spec for each (fields, layout, interactions). Identifies module reuse. | Review the spec table. Flag any missing sections or field changes. |
| **Phase 3: Theme Generation** | Updates base.html tokens, typography CSS, and Google Fonts. Generates all module files (meta.json, fields.json, module.html, module.css, module.js). Creates the page template. | Wait for generation to complete. |
| **Phase 3.5: CSS Review** | Audits all generated CSS for token compliance, responsive breakpoints, BEM consistency, and duplicate patterns. | Review any flagged issues. |
| **Phase 4: QA Checklist** | Validates fields.json structures, meta.json completeness, accessibility, performance, and macro usage. | Review the checklist. |

### 3. Upload to HubSpot

```bash
hs cms upload --account=<account-name> . "<theme-name>"
```

Replace `<account-name>` with your HubSpot CLI account name and `<theme-name>` with the Design Manager path (e.g. `client-name-hubspot-theme`).

### 4. Preview

1. Go to **Marketing > Website > Website Pages** in HubSpot
2. Create a new page using the generated template (e.g. "GrowthArchitect - Homepage")
3. The page loads with all modules pre-seeded and default content populated
4. Replace placeholder images with real assets, edit copy, and publish

---

## What the Pipeline Generates

```
modules/
  hero_banner.module/          # Per-project content modules
  service_deep_dive.module/    # Each with meta.json, fields.json,
  case_study_bento.module/     # module.html, module.css, module.js
  ...
templates/
  home.html                    # Page template with dnd_area pre-seeded
  layouts/base.html            # Updated :root tokens + Google Fonts
  partials/header.html         # Wired to generated nav module
  partials/footer.html         # Wired to generated footer module
css/
  critical/typography.critical.css  # font-family declarations
  global/elements/typography.css    # font-family declarations
```

### What the boilerplate provides (not generated)

- `templates/layouts/base.html` - Critical CSS, async loading, macro imports, JS utilities
- `macros/` - `render_heading()`, `render_link()`, `render_responsive_images()`, video/style helpers
- `css/critical/` - Layout, header, typography critical styles (inlined in `<head>`)
- `css/global/` - Reset, containers, buttons, forms, images, utilities
- `js/modules/utilities.js` - `CoreCode.trapFocus()`, `CoreCode.debounce()`
- `js/vendor/` - Splide, Plyr, lite-youtube, Odometer, Tabs Accordion
- `templates/system/` - 404, 500, password, email preferences

---

## Architecture

### CSS Architecture (ITCSS)

```
css/
  critical/          # Inlined in <head> for fastest FCP
  global/
    generic/         # Reset, normalise
    objects/         # Layout patterns (.o-*)
    components/      # Header, footer (.c-*)
    elements/        # Base HTML styling (.e-*)
    utilities/       # Utility classes
  vendor/            # Third-party CSS
  main.css           # HubL {% include %} composition
  theme_overrides.css # Theme field -> CSS variable bridge
```

### Design Token System

All tokens defined in `base.html` inline `<style>` at `:root`. Projects override values but preserve the structure.

| Category | Examples |
|---|---|
| Spacing | `--space4` through `--space128` (13 steps) |
| Typography | `--h1` through `--h6` (fluid clamp), `--pXs` through `--pXl` |
| Fonts | `--fontPrimary`, `--fontSecondary`, weights `--fontLight` through `--fontXbold` |
| Colours | `--primaryColour`, `--secondaryColour`, `--tertiaryColour`, `--highlightColour`, grey scale |
| Radius | `--radiusNone` through `--radiusXl`, `--radiusAvatar` |
| Z-index | `--zBelow` (-1) through `--zTooltip` (700) |
| Animation | `--transitionSpeed`, `--easeIn`, `--easeOut`, `--easeInOut` |

### Module Structure

Every module is self-contained in `modules/<name>.module/`:

```
module_name.module/
  meta.json       # Label, description, icon, categories, host_template_types
  fields.json     # CMS editor fields with help_text and defaults
  module.html     # HubL template using Core Code macros
  module.css      # Scoped vanilla CSS with BEM naming
  module.js       # Optional vanilla JS (IIFE, event delegation)
```

### Naming Conventions

| What | Convention | Example |
|---|---|---|
| CSS classes | BEM + ITCSS prefix, camelCase | `.m-heroBanner__statCard--active` |
| CSS variables | camelCase | `--primaryColour`, `--space20` |
| Module directories | lowercase_underscores | `hero_banner.module` |
| JS hook classes | `js-` prefix | `.js-siteNav-trigger` |
| State classes | `is-` / `has-` prefix | `.is-active`, `.has-error` |

### Breakpoints

Mobile-first with range syntax:

```css
/* Base styles apply at all sizes */
@media (width >= 768px) { /* Tablet */ }
@media (width >= 992px) { /* Desktop - primary breakpoint */ }
```

---

## Key Conventions

### Module HTML Pattern

```hubl
<div class="o-wrapper o-wrapper--module" style="
  --moduleTopSpacingMobile: {{ module.style.spacing_alignment.spacing.mobile.padding_top }}px;
  --moduleBottomSpacingMobile: {{ module.style.spacing_alignment.spacing.mobile.padding_bottom }}px;
  --moduleTopSpacingDesktop: {{ module.style.spacing_alignment.spacing.desktop.padding_top }}px;
  --moduleBottomSpacingDesktop: {{ module.style.spacing_alignment.spacing.desktop.padding_bottom }}px;"
  {% if module.scrollid %}id="{{ module.scrollid }}"{% endif %}>
  <div class="m-moduleName o-container">
    {# Content #}
  </div>
</div>
```

### Macro Usage

| Macro | Alias | Use for |
|---|---|---|
| `text_helpers.render_heading()` | `text_helpers` | All module headings |
| `link_helper.render_link()` | `link_helper` | All links and CTAs |
| `image_helper.render_responsive_images()` | `image_helper` | All content images |

**Deprecated (do not use):** `render_button()`, `render_module_footer_cta()`, `render_module_padding()`

### HubSpot Upload Rules

These cause upload failures if violated:

| Rule | Detail |
|---|---|
| No `textarea` field type | Use `"type": "text"` for all text fields |
| No `label` field name | Reserved by HubSpot. Use `section_label`, `stat_label`, etc. |
| `description` required in meta.json | Omitting causes generic "internal error" |
| `host_template_types` required | When `css_assets` or `js_assets` are present |
| Categories must be UPPERCASE | `"DESIGN"`, `"BODY_CONTENT"`, not lowercase |
| No `content_types` in meta.json | HubSpot infers from `host_template_types` |
| Icon must be valid | Default to `"module"` — many icon names are invalid |
| Spacing uses groups, not native type | `type: "spacing"` doesn't support mobile/desktop split |

---

## Skills (Slash Commands)

| Command | What it does |
|---|---|
| `/new-theme` | Full Stitch-to-HubSpot pipeline |
| `/scaffold-module` | Create a single new module |
| `/qa-review` | 15-section quality audit on a module |
| `/fix-module` | Diagnose and fix upload errors |
| `/add-module-feature` | Add fields/features to existing modules |
| `/frontend-standards` | Enforce CSS/JS/a11y coding standards |
| `/accessibility-checker` | WCAG 2.2 AA audit |
| `/frontend-performance` | Core Web Vitals audit |
| `/css-debugging` | Structured CSS bug investigation |
| `/js-debugging` | Structured JS bug investigation |
| `/client-handover-guide` | Generate editor usage guide |
| `/write-module-docs` | Generate Confluence documentation |

---

## Development Workflow

There are **no build commands**. CSS and JS are used as-is.

1. Make changes locally
2. Upload to HubSpot: `hs cms upload --account=<name> . "<theme-path>"`
3. Or use watch mode: `hs cms watch --account=<name> . "<theme-path>"`
4. Preview in HubSpot editor
5. Commit to Git when ready
