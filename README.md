# Core Code — HubSpot CMS Theme Boilerplate

A convention framework for building HubSpot CMS themes. Provides layout infrastructure, design tokens, macros, global styles, and vendor libraries. **No content modules are included** — they are generated per-project using Claude Code skills.

## Quick Start

### 1. Prepare design files

Place the design export in the `design/` directory:

```
design/
├── DESIGN.md          # Design system document (colours, typography, spacing, component rules)
├── code.html          # Stitch HTML + Tailwind CSS export (or stitch-export.html)
└── screen.png         # Visual reference screenshot (optional but recommended)
```

### 2. Generate the theme

Run the `/new-theme` slash command in Claude Code:

```
/new-theme
```

This triggers the stitch-to-hubspot pipeline which runs in 4 phases:

| Phase | What happens | Output |
|---|---|---|
| **1. Token Extraction** | Parses DESIGN.md and Tailwind config, maps to Core Code custom properties | Token mapping table for review |
| **2. Module Specification** | Identifies sections, specifies fields, layouts, interactions | Module spec table for review |
| **3. Theme Generation** | Generates all module files, updates base.html tokens, creates page template | Files written to repo |
| **3.5. CSS Review** | Batch review of all module CSS for consistency | Fixes applied automatically |
| **4. QA Checklist** | Validates fields.json, meta.json, tokens, accessibility, performance | Pass/fail report |

Each phase pauses for your review before proceeding.

### 3. Upload to HubSpot

```bash
# Upload the full theme
hs cms upload --account=<account-name> . "<destination-path>"

# Watch for live changes during development
hs cms watch --account=<account-name> . "<destination-path>"
```

### 4. Preview

Create a new page in HubSpot using the generated template. All modules render with default content pre-populated from the design export.

## Available Skills

Skills are invoked as slash commands in Claude Code. They provide specialised workflows for common tasks.

### Theme Generation

| Command | Purpose |
|---|---|
| `/new-theme` | Full pipeline: Stitch design export to HubSpot theme |
| `/scaffold-module` | Create a single new module from a specification |
| `/add-module-feature` | Add fields or features to an existing module |

### Quality & Debugging

| Command | Purpose |
|---|---|
| `/qa-review` | 15-section quality audit against a module |
| `/fix-module` | Diagnose and fix HubSpot upload errors |
| `/css-debugging` | Structured audit-before-fix for CSS bugs |
| `/js-debugging` | Structured audit-before-fix for JS bugs |

### Standards & Optimisation

| Command | Purpose |
|---|---|
| `/frontend-standards` | Enforce CSS, JS, accessibility, performance standards |
| `/hubspot-module-dev` | HubL templating and module pattern standards |
| `/accessibility-checker` | WCAG 2.2 AA audit (with axe-core for live URLs) |
| `/frontend-performance` | Core Web Vitals audit (with Lighthouse for live URLs) |
| `/optimise-codebase` | Combined performance, WCAG, and SEO pass |

### Documentation & Communication

| Command | Purpose |
|---|---|
| `/write-module-docs` | Generate Client Guide + Technical Spec for a module |
| `/client-handover-guide` | Usage guide for non-technical content editors |
| `/client-response-translator` | Translate technical findings into client-ready language |

### Planning

| Command | Purpose |
|---|---|
| `/grill-me` | Stress-test a plan or design through relentless questioning |

## Project Structure

```
coreCode/
├── .claude/
│   ├── CLAUDE.md              # Agent instructions and conventions
│   └── skills/                # All slash command definitions
├── css/
│   ├── critical/              # Inlined in <head> (layout, header, typography)
│   ├── global/
│   │   ├── generic/           # Reset, normalise
│   │   ├── objects/           # Containers, DnD wrappers, utilities
│   │   ├── components/        # Header, footer global styles
│   │   └── elements/          # Buttons, forms, tables, typography, images
│   ├── vendor/                # Splide, Plyr, Odometer
│   ├── Modules/               # Shared module CSS (headings, footer CTA)
│   └── main.css               # Entry point ({% include %} composition)
├── js/
│   ├── modules/               # utilities.js (global), rotators, statistics
│   └── vendor/                # Third-party libraries
├── macros/                    # HubL macros (links, images, headings, video, style, accessibility)
├── modules/                   # Generated content modules (flat directory)
├── templates/
│   ├── layouts/base.html      # Base template — :root tokens, critical CSS, macro imports
│   ├── partials/              # header.html, footer.html (structural shells)
│   ├── system/                # 404, 500, email preferences, password prompt
│   ├── home.html              # Default homepage template
│   └── *.html                 # Additional page templates
├── design/                    # Design export files (input for /new-theme)
├── fields.json                # Theme-level CMS settings (spacing sliders, container width)
└── theme.json                 # Theme metadata
```

## Conventions

### CSS

- **Vanilla CSS** with flat selectors (no SCSS, no CSS nesting, no Tailwind in output)
- **BEM + ITCSS prefixes:** `.o-` objects, `.c-` components, `.e-` elements, `.m-` modules
- **camelCase** custom properties: `--primaryColour`, `--space20`, `--fontPrimary`
- **Mobile-first** with range syntax breakpoints: `@media (width >= 992px)`
- **Opt-in animation:** transitions declared inside `@media (prefers-reduced-motion: no-preference)`

### JavaScript

- **Vanilla JS only** — no jQuery, no frameworks
- **IIFE** with `'use strict'`, `const`/`let` only
- **`.js-*` classes** for DOM targeting, `data-*` for configuration
- **Event delegation** on module container
- **Shared utilities:** `CoreCode.trapFocus()`, `CoreCode.debounce()`

### HubSpot / HubL

- **Macros** for links (`render_link`), images (`render_responsive_images`), headings (`render_heading`)
- **Module spacing** via inline `style` on `.o-wrapper--module` (4 custom properties for mobile/desktop top/bottom)
- **No deprecated macros:** `render_button()`, `render_module_footer_cta()`, `render_module_padding()`

### Accessibility

- **WCAG 2.1 AA** minimum
- `:focus-visible` on all interactive elements
- Semantic HTML (`<nav>`, `<section>`, `<article>`, `<dialog>`)
- `aria-expanded`, `aria-controls`, `aria-live` on interactive patterns
- 44px minimum touch targets

### Performance

- `content-visibility: auto` on below-fold modules
- `loading="lazy"` + `decoding="async"` on below-fold images
- `fetchpriority="high"` on hero/LCP images
- Critical CSS inlined in `<head>`, non-critical loaded async
- `IntersectionObserver`-based lazy module initialisation

## Design Token System

Tokens are defined in `templates/layouts/base.html` inline `<style>` at `:root`. The `/new-theme` pipeline overwrites values per project while preserving the token structure.

| Category | Examples |
|---|---|
| **Spacing** (13 steps) | `--space0` through `--space128` |
| **Colours** | `--primaryColour`, `--secondaryColour`, `--grey10`–`--grey90`, state colours |
| **Typography** | `--h1`–`--h6` (fluid clamp), `--pXs`–`--pXl`, `--fontPrimary`/`--fontSecondary` |
| **Weights** | `--fontLight` (300) through `--fontXbold` (900) |
| **Radius** | `--radiusNone` through `--radiusXl`, `--radiusAvatar` |
| **Z-index** | `--zBelow` (-1) through `--zTooltip` (700) |
| **Animation** | `--transitionSpeed`, `--easeIn`, `--easeOut`, `--easeInOut` |
| **Layout** | `--containerWidth`, `--siteHeaderHeight`, `--gridGutters`, `--gridColumns` |

## Deployment

No build step. HubSpot CMS themes deploy directly:

1. **Local development:** `hs cms watch` for live sync
2. **CI/CD:** Push to Bitbucket, HubSpot Git integration auto-deploys
3. **Manual:** `hs cms upload` for one-time pushes

## Common Upload Errors

| Error | Fix |
|---|---|
| `internal error` | Add missing `description` to `meta.json` |
| `CSS or Javascript is not allowed on modules with ANY content type` | Add `"host_template_types": ["PAGE"]` to `meta.json` |
| `'X' is not a valid category` | Use UPPERCASE in `meta.json` categories |
| `Cannot deserialize value of type java.util.ArrayList` | Remove `content_tags` from `meta.json` |
| `Value for field with an occurrence must be an array` | Use `"default": []` not `"default": {}` for repeaters |

Run `/fix-module` for automated diagnosis and fixes.
