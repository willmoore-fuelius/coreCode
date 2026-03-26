# Core Code — Developer Guide

> **Audience:** HubSpot developers joining the Core Code theme.
> **Last updated:** February 2026

---

## Quick Start

### What is Core Code?

Core Code is a HubSpot CMS theme by Fuelius. It provides modular, responsive website components using HubL (HubSpot's Jinja2-based templating language), vanilla CSS, and vanilla JavaScript.

### Key Facts

| | |
|---|---|
| **Deployment** | Git → HubSpot CI/CD (no build step, no npm/webpack) |
| **CSS** | Vanilla CSS, ITCSS architecture, BEM naming |
| **JavaScript** | Vanilla JS (zero jQuery dependencies) |
| **Templating** | HubL/Jinja2 with reusable macros |
| **Accessibility** | WCAG 2.1 Level AA compliant |
| **Breakpoint** | Mobile-first, desktop at `992px` |
| **Main branch** | `development` |

### Naming Conventions at a Glance

| Artifact | Convention | Example |
|---|---|---|
| Module directory | `snake_case.module` | `feature_cards.module` |
| CSS class | `.m-camelCase` | `.m-featureCards` |
| CSS variable | `--camelCase` | `--primaryColour` |
| meta.json label | Title Case | `"Feature Cards"` |
| Field names | `snake_case` | `heading_text` |
| JS variables | `camelCase` | `accordionTrigger` |

### Module Template Pattern (Copy-Paste Starter)

Every module follows this wrapper structure:

```html
{%- if module.scrollid -%}
<div id="{{ module.scrollid }}" class="js-module">
{%- endif -%}

<section id="{{ name }}" class="m-moduleName">
  <div class="o-wrapper o-wrapper--module"
       style="--moduleTopSpacingMobile: {{ module.style.spacing_alignment.spacing.mobile.padding_top }}px;
              --moduleBottomSpacingMobile: {{ module.style.spacing_alignment.spacing.mobile.padding_bottom }}px;
              --moduleTopSpacingDesktop: {{ module.style.spacing_alignment.spacing.desktop.padding_top }}px;
              --moduleBottomSpacingDesktop: {{ module.style.spacing_alignment.spacing.desktop.padding_bottom }}px;">
    <div class="o-container">

      {{ text_helpers.render_heading(module.module_heading, module.enable_module_heading, name) }}

      <!-- Module content here -->

      {# Inline footer CTA — do NOT use link_helper.render_module_footer_cta() (silently fails) #}
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
```

**Important:** Do NOT use `{% from %}` or `{% import %}` for macros — call them directly (e.g. `text_helpers.render_heading()`). HubSpot makes macros globally available.

**Module spacing** is set via inline `style` attribute on `.o-wrapper--module` using four CSS custom properties. The global CSS in `containers_dnd.css` switches between mobile/desktop at 992px. Do NOT use `style_helpers.render_module_padding()` (removed) or inline `<style>` blocks.

---

## Project Structure

```
CoreCode/
├── css/
│   ├── main.css                    # ITCSS entry point
│   ├── critical/                   # Inlined above-the-fold styles
│   ├── global/
│   │   ├── generic/                # Reset, normalise
│   │   ├── objects/                # Layout patterns (.o-*)
│   │   ├── components/             # Header, footer (.c-*)
│   │   └── elements/               # Base HTML styling (.e-*)
│   ├── modules/                    # Shared module styles
│   └── vendor/                     # Third-party (Splide, Plyr, etc.)
├── js/
│   └── vendor/                     # Third-party JS
├── macros/                         # Reusable HubL template functions
│   ├── link_helpers.html
│   ├── image_helpers.html
│   ├── text_helpers.html
│   └── style_helpers.html
├── modules/
│   └── page/                       # Page modules
│       └── module_name.module/     # Self-contained module
│           ├── module.html
│           ├── module.css
│           ├── module.js           # Optional
│           ├── fields.json
│           └── meta.json
└── templates/
    └── layouts/
        └── base.html               # Design system tokens + critical CSS
```

### Module Anatomy

Each module lives in `modules/page/[name].module/` and is fully self-contained:

| File | Purpose |
|---|---|
| `module.html` | HubL/Jinja2 template |
| `module.css` | Module-specific styles (`.m-*` prefix) |
| `module.js` | Optional vanilla JavaScript |
| `fields.json` | CMS editor field definitions |
| `meta.json` | Module metadata, categories, assets |

---

## CSS Architecture (ITCSS)

Styles follow the Inverted Triangle CSS pattern — specificity increases as you move down:

```
Generic      →  Reset, normalise (lowest specificity)
Objects      →  Layout patterns: .o-wrapper, .o-container
Components   →  Global UI: .c-header, .c-footer
Elements     →  Base HTML: .e-button, .e-form
Modules      →  Module-specific: .m-accordion, .m-featureCards (highest specificity)
```

### CSS Rules

- **Vanilla CSS only** — no Sass, no nesting, no preprocessors
- **BEM with camelCase** — `.m-accordion__triggerText`, not `.m-accordion__trigger-text`
- **ITCSS prefixes** — `.o-` objects, `.c-` components, `.e-` elements, `.m-` modules
- **Design system tokens** — always use CSS variables, never magic numbers
- **Mobile-first** — base styles are mobile, use `@media (min-width: 992px)` for desktop
- **Flat selectors** — repeat the full selector at each breakpoint, don't nest

### CSS Class Pattern

```css
/* Base (mobile) styles */
.m-moduleName {
  padding: var(--space16);
}

.m-moduleName__title {
  font-size: var(--pLg);
  font-weight: var(--fontSemibold);
  color: var(--grey90);
}

.m-moduleName__title:hover {
  color: var(--primaryColour);
}

/* Desktop override */
@media (min-width: 992px) {
  .m-moduleName {
    padding: var(--space24);
  }

  .m-moduleName__title {
    font-size: var(--h4);
  }
}

/* Accessibility */
@media (prefers-reduced-motion: reduce) {
  .m-moduleName__panel {
    transition: none;
  }
}
```

### JS Hook Classes

Use `.js-*` classes for JavaScript targeting — never target BEM classes from JS:

```html
<div class="m-accordion js-accordion" data-allow-multiple="true">
  <button class="m-accordion__trigger js-accordionTrigger">
```

```javascript
// Correct — targets .js- class
document.querySelectorAll('.js-accordion');

// Wrong — never target BEM from JS
document.querySelectorAll('.m-accordion');
```

---

## Design System Tokens

All tokens are defined in `templates/layouts/base.html` and use **camelCase naming**.

### Spacing Scale

| Token | Value | Token | Value |
|---|---|---|---|
| `--space4` | 4px | `--space32` | 32px |
| `--space8` | 8px | `--space40` | 40px |
| `--space12` | 12px | `--space48` | 48px |
| `--space16` | 16px | `--space64` | 64px |
| `--space20` | 20px | `--space80` | 80px |
| `--space24` | 24px | `--space96` | 96px |

### Typography (Fluid)

| Token | Range | Usage |
|---|---|---|
| `--h1` | 35px → 62px | Page title |
| `--h2` | 32px → 46px | Section heading |
| `--h3` | 24px → 34px | Subsection |
| `--h4` | 20px → 24px | Card title |
| `--pXs` | 12px | Small print |
| `--pSm` | 14px | Captions |
| `--pBase` | 16px | Body text |
| `--pLg` | 18px | Lead text |

Font families: `--fontPrimary` (Montserrat), `--fontSecondary` (Open Sans)
Weights: `--fontLight` (300), `--fontRegular` (400), `--fontSemibold` (600), `--fontBold` (700), `--fontXbold` (900)

### Colours

| Token | Purpose |
|---|---|
| `--primaryColour` | Brand primary |
| `--secondaryColour` | Brand secondary |
| `--tertiaryColour` | Brand tertiary |
| `--highlightColour` | Accent/highlight |
| `--grey10` → `--grey90` | Greyscale (light → dark) |
| `--colorSuccess` | Green — success states |
| `--colorWarning` | Amber — warning states |
| `--colorError` | Red — error states |
| `--colorInfo` | Blue — informational |

### Z-Index Scale

```
--zBelow: -1          --zFixed: 300
--zBase: 0            --zModalBackdrop: 400
--zDropdown: 100      --zModal: 500
--zSticky: 200        --zPopover: 600
                      --zTooltip: 700
```

### Borders & Radius

Borders: `--border1` (1px), `--border2` (2px), `--border3` (3px)
Radius: `--radiusNone` → `--radiusXxs` (0.25rem) → `--radiusSm` (0.5rem) → `--radiusMd` (0.75rem) → `--radiusLg` (1rem) → `--radiusXl` (2rem)

### Animation

```css
transition: color var(--transitionSpeed) var(--easeOut);
/* --transitionSpeed: 0.3s */
/* --easeIn, --easeOut, --easeInOut available */
```

---

## Core Macros

These are globally available — call them directly without `{% import %}`.

### `text_helpers.render_heading(model, enabled, name)`

Renders a module heading block with optional summary text and CTA.

```html
{{ text_helpers.render_heading(module.module_heading, module.enable_module_heading, name) }}
```

**Field structure expected:**

```
module_heading: {
  heading: "Section Title",
  heading_type: "h2",         // h1–h6
  summary: "<p>Optional</p>",
  add_link_cta_: true/false,  // NOTE: trailing underscore in field name
  button: { ... },
  position: {
    margin: {
      mobile:  { margin_top: 0, margin_bottom: 16 },
      desktop: { margin_top: 0, margin_bottom: 24 }
    }
  }
}
```

### ~~`style_helpers.render_module_padding(name, spacing)`~~ — REMOVED

This macro has been removed. Use the **inline style attribute pattern** on `.o-wrapper--module` instead. See the Module Template Pattern above.

### `link_helper.render_button(button, scope, classes)`

Renders a button — routes to link or CTA based on `button_type`.

```html
{{ link_helper.render_button(item.button, name ~ '__button_' ~ loop.index) }}
```

### ~~`link_helper.render_module_footer_cta(button, name)`~~ — DEPRECATED

This macro silently produces empty output due to an internal cross-macro namespace issue. **Use the inline footer CTA pattern** from the Module Template Pattern instead.

### `image_helpers.render_responsive_images(item, class)`

Renders a `<picture>` element with device-specific sources (mobile/tablet/desktop) and WebP.

```html
{{ image_helpers.render_responsive_images(item.image, 'm-moduleName__image') }}
```

**Field structure expected:**

```
image: {
  mobile:   { mobile_image:  { src, alt, loading, width, height } },
  tablet:   { tablet_image:  { src, alt, loading, width, height } },
  desktop:  { desktop_image: { src, alt, loading, width, height } },
  fallback_image: { default_image: { src, alt, width, height } }
}
```

---

## JavaScript Patterns

### Module JS Template

```javascript
(function () {
  'use strict';

  function initModuleName(container) {
    var triggers = Array.from(container.querySelectorAll('.js-moduleTrigger'));

    // Event delegation on container
    container.addEventListener('click', function (e) {
      var trigger = e.target.closest('.js-moduleTrigger');
      if (!trigger) return;
      // Handle click
    });

    // Keyboard navigation
    container.addEventListener('keydown', function (e) {
      // Arrow key handling
    });
  }

  // Initialise all instances on the page
  function init() {
    var containers = document.querySelectorAll('.js-moduleName');
    containers.forEach(initModuleName);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

### Rules

- **IIFE wrapper** — all module JS wrapped in `(function () { ... })();`
- **`'use strict'`** — always at the top
- **`const`/`let`** — never `var` (exception: legacy modules)
- **`.js-*` classes** — for DOM targeting, never BEM classes
- **`data-*` attributes** — for configuration values
- **Event delegation** — attach to container, use `.closest()` to find targets
- **Multiple instances** — always use `querySelectorAll` + `forEach`, never assume single instance
- **Reduced motion** — check `window.matchMedia('(prefers-reduced-motion: reduce)').matches`

---

## Module Scaffolding Workflow

This is the step-by-step process for creating a new Core Code module.

### Step 1: Gather Requirements

Before writing any code, establish the spec:

1. **Check for existing documentation** — Is there a Jira ticket, design file, or specification document?
2. If no spec exists, answer these questions:
   - What is the module name? (snake_case, e.g. `feature_cards`)
   - What is its purpose?
   - What content fields does it need? (text, images, links, rich text, repeaters)
   - What behaviours does it need? (accordion, carousel, tabs, static)
   - What style options should editors have? (colour variants, alignment, column count)
   - Any responsive-specific requirements beyond the standard 992px breakpoint?

### Step 2: Create the Module Directory

```
modules/page/module_name.module/
├── module.html
├── module.css
├── module.js        # Only if interactive behaviour needed
├── fields.json
└── meta.json
```

### Step 3: Write `meta.json`

```json
{
  "label": "Module Name",
  "description": "Brief description of what this module does.",
  "icon": "fontawesome-5.14.0:icon-name:SOLID",
  "css_assets": [],
  "other_assets": [],
  "smart_type": "NOT_SMART",
  "tags": [],
  "host_template_types": ["PAGE", "BLOG_POST", "BLOG_LISTING"],
  "is_available_for_new_content": true,
  "categories": ["BODY_CONTENT"]
}
```

**Critical rules:**

| Rule | Detail |
|---|---|
| **Categories** | MUST be UPPERCASE: `TEXT`, `BODY_CONTENT`, `MEDIA`, `FORMS_AND_BUTTONS`, `DESIGN`, `FUNCTIONALITY`, `BLOG`, `SOCIAL`, `COMMERCE` |
| **host_template_types** | MUST be present when `css_assets` or `js_assets` exist — otherwise HubSpot blocks CSS/JS |
| **Never include** | `content_tags`, `module_id`, `global`, `css_assets` (auto), `js_assets` (auto) |
| **description + icon** | Always include both — missing description triggers "internal error" on upload |

### Step 4: Write `fields.json`

Structure your fields following these patterns:

#### Standard Field Groups

Every module should include:

1. **Style tab** — spacing fields with inherited theme values
2. **Module heading** — toggle + heading fields (uses `text_helpers.render_heading()`)
3. **Content fields** — module-specific content
4. **Footer CTA** — optional bottom CTA (uses `link_helper.render_module_footer_cta()`)
5. **Scroll ID** — optional anchor text field

#### Field Authoring Rules

| Rule | Correct | Wrong |
|---|---|---|
| Required fields | Always include `default` | Omit default |
| Image defaults | `{ "size_type": "auto", "src": "https://placehold.co/800x600", "alt": "Placeholder", "loading": "lazy", "width": 800, "height": 600 }` | Missing `size_type` or dimensions |
| Link defaults | Include `url.type`, `url.href`, `open_in_new_tab`, `no_follow` | Incomplete structure |
| Repeater defaults | Array: `"default": [{ ... }]` | Object: `"default": { ... }` |
| Repeater meta | `"group_occurrence_meta": { "min": 1, "max": null }` | Using `"occurrence"` |
| Rich text features | `"bulleted_list"`, `"numbered_list"`, `"link"`, `"anchor"` | `"ul"`, `"ol"`, `"personalization_token"` |
| Spacing fields | Number fields with `"inherited_value": { "default_value_path": "..." }` | Using spacing field type |
| Choice fields | `[["value", "Label"], ...]` | `[{"value": "", "label": ""}]` |

#### Spacing Field Pattern

```json
{
  "name": "padding_top",
  "type": "number",
  "display": "slider",
  "min": 0,
  "max": 500,
  "step": 1,
  "suffix": "px",
  "default": 80,
  "inherited_value": {
    "default_value_path": "theme.spacing.desktop_vertical_spacing"
  }
}
```

### Step 5: Write `module.html`

Follow the template pattern from the Quick Start section. Key rules:

- **No macro imports** — call macros directly (`text_helpers.render_heading()`, not `{% from 'macros/text_helpers.html' import render_heading %}`)
- **Defensive checks** — always check fields exist before rendering: `{% if module.field.src %}`
- **`|safe` filter** — use on rich text fields from the CMS editor (these are trusted)
- **Security** — never use `|safe` on user-supplied input; add `rel="noopener noreferrer"` on external links
- **Editor placeholders** — use `{% if is_in_editor %}{% editor_placeholder %}{% endif %}` for empty states
- **Loop scoping** — render content inside the loop; arrays built in loops don't persist outside in HubL
- **Unique IDs** — use `{{ name }}` (module instance ID) to scope IDs and prevent collisions

### Step 6: Write `module.css`

Follow the CSS patterns from the CSS Architecture section:
- `.m-camelCase` prefix matching the module name
- Mobile-first with `@media (min-width: 992px)` for desktop
- Design system tokens for all values
- `focus-visible` outlines for interactive elements
- `@media (prefers-reduced-motion: reduce)` for all transitions/animations

### Step 7: Write `module.js` (if needed)

Follow the JavaScript Patterns section:
- IIFE wrapper, strict mode
- Handle multiple instances via `querySelectorAll`
- `.js-*` classes for DOM targeting
- Keyboard navigation for interactive components
- Reduced motion support

---

## Accessibility Checklist

Every module must meet WCAG 2.1 Level AA:

- [ ] **Semantic HTML** — use `<button>`, `<nav>`, `<main>`, `<article>` over generic `<div>`
- [ ] **Keyboard navigation** — all interactive elements reachable and operable via keyboard
- [ ] **Focus indicators** — visible `focus-visible` outlines on interactive elements
- [ ] **ARIA attributes** — `aria-expanded`, `aria-controls`, `aria-hidden`, `aria-labelledby` where needed
- [ ] **Colour contrast** — 4.5:1 minimum for text, 3:1 for large text and UI components
- [ ] **Touch targets** — 48px minimum for touch devices
- [ ] **Alt text** — all images have meaningful `alt` attributes
- [ ] **Reduced motion** — `@media (prefers-reduced-motion: reduce)` disables animations
- [ ] **Skip links** — provided at page level (handled by base template)
- [ ] **No auto-play** — media must not auto-play with sound

---

## HubL Quick Reference

### Common Patterns

```html
{# Defensive field check #}
{% if module.image.src %}
  <img src="{{ module.image.src }}" alt="{{ module.image.alt }}">
{% endif %}

{# Loop with index-based IDs #}
{% for item in module.items %}
  {% set item_id = name ~ "-item-" ~ loop.index %}
  <div id="{{ item_id }}">{{ item.title }}</div>
{% endfor %}

{# Conditional rendering #}
{% if module.show_section %}
  {# Render section #}
{% endif %}

{# Default filter for optional values #}
{{ module.optional_text|default("Fallback text") }}

{# Rich text (trusted CMS content) #}
{{ module.content|safe }}

{# Build rel attribute for links #}
{% set rel = [] %}
{% if link.no_follow %}{% do rel.append("nofollow") %}{% endif %}
{% if link.open_in_new_tab %}{% do rel.append("noopener") %}{% do rel.append("noreferrer") %}{% endif %}
<a href="{{ link.url.href }}"
   {% if link.open_in_new_tab %}target="_blank"{% endif %}
   {% if rel %}rel="{{ rel|join(' ') }}"{% endif %}>
```

### Variable Naming

- `snake_case` for all HubL variables
- `is_`, `has_`, `show_` prefixes for booleans
- Cache queries outside loops: `{% set items = hubdb_table_rows(...) %}`

### Gotchas

| Issue | Detail |
|---|---|
| **Loop scoping** | Arrays/objects built inside `{% for %}` loops don't persist outside — render output inside the loop |
| **`content.absolute_url` vs `content.url`** | `absolute_url` includes domain, `url` is path-only — not interchangeable |
| **No macro imports** | Core Code macros are globally available; `{% from %}` will cause upload errors |
| **`|safe` on user input** | XSS risk — only use on CMS rich text fields, never on query params or form data |
| **`hidden` attribute on animated panels** | The HTML `[hidden]` attribute has `display: none !important` in the UA stylesheet. Use a CSS class (`.is-open`) with `grid-template-rows` animation and toggle `aria-hidden` for accessibility instead |
| **`--h*Min` tokens required** | `typography.css` uses `clamp()` with `--h1Min`–`--h6Min` variables. These are defined in `base.html`. Do not remove them — headings will render unsized without them |
| **`add_link_cta_` trailing underscore** | The heading CTA toggle field is named `add_link_cta_` (with trailing underscore) in `fields.json`. The macro checks this exact name. Renaming the field will break the CTA toggle |
| **Inline footer CTA, not macro** | `link_helper.render_module_footer_cta()` silently produces empty output. Always use the inline CTA pattern from the Module Template Pattern |
| **Module spacing via inline style** | `style_helpers.render_module_padding()` has been removed. Always set `--moduleTopSpacingMobile` etc. via inline `style` on `.o-wrapper--module` |
| **Debugging** | Append `?hsDebug=true` to preview URL for caching/rendering debug info |

---

## Common Upload Errors

| Error | Cause | Fix |
|---|---|---|
| `internal error` | `meta.json` missing `description`, `icon`, or required fields | Add all required meta.json fields |
| `CSS or Javascript is not allowed on modules with ANY content type` | `meta.json` missing `host_template_types` | Add `"host_template_types": ["PAGE", "BLOG_POST", "BLOG_LISTING"]` |
| `'link' is required but no default is set` | Link field missing complete default, or cascade from broken meta.json | Fix meta.json first; then check all link fields have full defaults |
| `'X' is not a valid category` | Category in meta.json is lowercase | Use UPPERCASE: `"BODY_CONTENT"`, `"MEDIA"`, etc. |
| `Cannot deserialize value` | `content_tags` present in meta.json | Remove the `content_tags` key |
| `Value for field with occurrence must be array` | Repeater default is an object | Change to array: `"default": [{ ... }]` |
| `Cannot find method render_module_padding` | Macro has been removed — still referenced in old templates | Replace with inline style attribute on `.o-wrapper--module`. See Module Template Pattern |

---

## Vendor Libraries

| Library | Purpose | Notes |
|---|---|---|
| **Splide** | Carousels/sliders | jQuery-free, accessible |
| **Plyr** | Video player | Lightweight, CSS variable theming |
| **lite-youtube** | YouTube embeds | Facade pattern for performance |

### Removed Libraries (Do Not Re-introduce)

jQuery, Slick Slider, Magnific Popup, Lightbox, HoverIntent, Equalize, Video.js, AOS, JPList, Select2 — all replaced with native browser APIs or lighter alternatives.

---

## Git Workflow

| Branch type | Pattern | Example |
|---|---|---|
| Main | `development` | — |
| Feature | `feature/HCC-{number}` | `feature/HCC-1234` |
| Bugfix | `bugfix/HCC-{number}` | `bugfix/HCC-5678` |

No build step — commit, push, and HubSpot CI/CD deploys automatically.
