## Quick Start

### What is Core Code?

Core Code is a HubSpot CMS theme by Fuelius. It provides modular, responsive website components using HubL (HubSpot's Hubl-based templating language), vanilla CSS, and vanilla JavaScript.

### Key Facts

| **Feature** | **Detail** |
| --- | --- |
| Deployment | Git → HubSpot CI/CD (no build step, no npm/webpack) |
| CSS | Vanilla CSS with native nesting, ITCSS architecture, BEM naming |
| JavaScript | Vanilla JS (zero jQuery dependencies) |
| Templating | HubL/Hubl with reusable macros |
| Accessibility | WCAG 2.2 Level AA target |
| Breakpoint | Mobile-first, desktop at 992px |
| Main branch | development |

### Naming Conventions at a Glance

| **Artifact** | **Convention** | **Example** |
| --- | --- | --- |
| Module directory | snake_case.module | `feature_cards.module` |
| CSS class | `.m-camelCase` | `.m-featureCards` |
| CSS variable | `--camelCase` | `--primaryColour` |
| `meta.json` label | Title Case | `"Feature Cards"` |
| Field names | `snake_case` | `heading_text` |
| JS variables | camelCase | `accordionTrigger` |

---

## Module Template Pattern (Copy-Paste Starter)

Every module follows this wrapper structure:

```
{%- if module.scrollid -%}
<div id="{{ module.scrollid }}" class="js-module">
{%- endif -%}

<section id="{{ name }}" class="m-moduleName">
  <div class="o-wrapper o-wrapper--module" style="--moduleTopSpacingMobile: {{ module.style.spacing_alignment.spacing.mobile.padding_top }}px; --moduleBottomSpacingMobile: {{ module.style.spacing_alignment.spacing.mobile.padding_bottom }}px; --moduleTopSpacingDesktop: {{ module.style.spacing_alignment.spacing.desktop.padding_top }}px; --moduleBottomSpacingDesktop: {{ module.style.spacing_alignment.spacing.desktop.padding_bottom }}px;">
    <div class="o-container">

      {{ text_helpers.render_heading(module.module_heading, module.enable_module_heading, name) }}

      {%- if module.items -%}
      <!-- Module content here -->
      {%- else -%}
      {%- if is_in_editor -%}
      {% editor_placeholder %}
      {%- endif -%}
      {%- endif -%}

      {# Inline footer CTA - do NOT use link_helper.render_module_footer_cta() #}
      {%- set footer = module.module_footer_cta -%}
      {%- if footer.button_type == 'link' and footer.link_settings.link_field.url.href and footer.link_settings.link_text -%}
      <div class="m-moduleFooter">
        <a id="{{ name }}__footer_cta"
           class="e-button e-button--{{ footer.button_style|default('primary') }}"
           href="{{ footer.link_settings.link_field.url.href }}"
           {% if footer.link_settings.link_field.open_in_new_tab %}target="_blank" rel="noopener noreferrer" aria-label="{{ footer.link_settings.link_text }} (opens in new window)"{% else %}aria-label="{{ footer.link_settings.link_text }}"{% endif %}>
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

* `render_heading(model, enabled, name)` - 3rd `name` param is optional but recommended to avoid ID collisions
* **Footer CTA** is rendered inline - do NOT use `link_helper.render_module_footer_cta()` (it silently fails due to internal cross-macro calls without namespace prefixes)
* **Module spacing** uses inline `style` attribute on `.o-wrapper--module` to inject `--moduleTopSpacingMobile`, `--moduleBottomSpacingMobile`, `--moduleTopSpacingDesktop`, `--moduleBottomSpacingDesktop`. The CSS in `containers_dnd.css` switches between mobile/desktop at 992px. Do NOT use `style_helpers.render_module_padding()` (removed) or inline `<style>` blocks.
* Spacing field names must be `padding_top` and `padding_bottom` (NOT `top`/`bottom`)
* Scrollid wrapper is optional - provides anchor link targets
* Use `{%- -%}` whitespace-trimming tags for clean HTML output
* Use `<section>` (not `<div>`) as the outer element for semantic landmark support

**Important:** Do **NOT** use `{% from %}` or `{% import %}` for macros - call them directly (e.g. `text_helpers.render_heading()`). HubSpot makes macros globally available.

---

## Project Structure

```
CoreCode/
├── .claude/
│   ├── CLAUDE.md                   # AI assistant project context
│   ├── skills/                     # Slash-command skills (see Skills section)
│   └── subagents/                  # Reference docs for coding standards
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
│   ├── modules/                    # Shared JS (utilities, rotators, etc.)
│   └── vendor/                     # Third-party JS
├── macros/                         # Reusable HubL template functions
│   ├── link_helpers.html
│   ├── image_helpers.html
│   ├── text_helpers.html
│   └── style_helpers.html
├── modules/
│   ├── banners/                    # Banner hero, banner static
│   ├── blog/                       # Blog filters, blog listing
│   ├── components/                 # Search box, search results
│   ├── elements/                   # Logo, rich text, social icons
│   ├── menus/                      # Mega menu, simple menu
│   └── page/                       # All page content modules (~30+)
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

---

## Module Anatomy

Each module lives in `modules/[category]/[name].module/` and is fully self-contained:

| **File** | **Purpose** |
| --- | --- |
| `module.html` | HubL/Hubl template |
| `module.css` | Module-specific styles (`.m-*` prefix) |
| `module.js` | Optional vanilla JavaScript |
| `fields.json` | CMS editor field definitions |
| `meta.json` | Module metadata, categories, assets |

---

## CSS Architecture (ITCSS)

Styles follow the Inverted Triangle CSS pattern - specificity increases as you move down:

* **Generic** → Reset, normalise (lowest specificity)
* **Objects** → Layout patterns: `.o-wrapper`, `.o-container`
* **Components** → Global UI: `.c-header`, `.c-footer`
* **Elements** → Base HTML: `.e-button`, `.e-form`
* **Modules** → Module-specific: `.m-accordion`, `.m-featureCards` (highest specificity)

### Module Spacing Architecture

Module vertical spacing is controlled via CSS custom properties injected on the `.o-wrapper--module` element:

**How it works:**

1. Each module's `module.html` injects four CSS custom properties via the `style` attribute on `.o-wrapper--module`:

    * `--moduleTopSpacingMobile` / `--moduleBottomSpacingMobile` — mobile spacing values
    * `--moduleTopSpacingDesktop` / `--moduleBottomSpacingDesktop` — desktop spacing values
    
2. The global CSS in `css/global/objects/containers_dnd.css` consumes these variables with a media query:

```
.o-wrapper--module {
  padding: var(--moduleTopSpacingMobile, var(--moduleTopSpacing)) var(--moduleRightSpacing) var(--moduleBottomSpacingMobile, var(--moduleBottomSpacing)) var(--moduleLeftSpacing);
}

@media (width >= 992px) {
  .o-wrapper--module {
    padding: var(--moduleTopSpacingDesktop, var(--moduleTopSpacing)) var(--moduleRightSpacing) var(--moduleBottomSpacingDesktop, var(--moduleBottomSpacing)) var(--moduleLeftSpacing);
  }
}
```

3. The fallback values (`--moduleTopSpacing`, `--moduleBottomSpacing`) come from the theme's global defaults in `css/theme_overrides.css`, ensuring spacing still works if the inline variables are absent.

**Benefits over the old approach:**

* No per-module `<style>` blocks in the DOM
* Cleaner DOM, easier debugging in DevTools
* Better CSS caching (no inline style elements to parse)
* Reduced HTML payload size

### CSS Rules

* Vanilla CSS with native nesting - no Sass, Less, or preprocessors
* BEM with camelCase - `.m-accordion__triggerText`, not `.m-accordion__trigger-text`
* ITCSS prefixes - `.o-` objects, `.c-` components, `.e-` elements, `.m-` modules
* Design system tokens - always use CSS variables, never magic numbers
* Mobile-first - base styles are mobile, use `@media (width >= 992px)` for desktop
* Native nesting for pseudo-classes, states, modifiers, and media queries inside a block selector
* BEM element selectors stay flat at root level (the class name encodes the relationship)
* No Sass-style concatenation (`&__element`, `&--modifier`) - native CSS does not support this
* No nesting deeper than 2 levels

### CSS Class Pattern

```
/* Base (mobile) styles */
.m-moduleName {
  padding: var(--space16);

  @media (width >= 992px) {
    padding: var(--space24);
  }
}

/* BEM elements stay flat */
.m-moduleName__title {
  font-size: var(--pLg);
  font-weight: var(--fontSemibold);
  color: var(--grey90);

  &:hover {
    color: var(--primaryColour);
  }

  @media (width >= 992px) {
    font-size: var(--h4);
  }
}

/* Opt-in animation — no transition by default */
.m-moduleName__panel {
  @media (prefers-reduced-motion: no-preference) {
    transition: height 0.3s ease-out;
  }
}
```

---

## JS Hook Classes

Use `.js-*` classes for JavaScript targeting - never target BEM classes from JS:

```
<div class="m-accordion js-accordion" data-allow-multiple="true">
  <button class="m-accordion__trigger js-accordionTrigger">
```

```
// Correct - targets .js- class
document.querySelectorAll('.js-accordion');

// Wrong - never target BEM from JS
document.querySelectorAll('.m-accordion');
```

---

## Design System Tokens

All tokens are defined in `templates/layouts/base.html` and use camelCase naming.

### Spacing Scale

| **Token** | **Value** | **Token** | **Value** |
| --- | --- | --- | --- |
| `--space4` | 4px | `--space32` | 32px |
| `--space8` | 8px | `--space40` | 40px |
| `--space12` | 12px | `--space48` | 48px |
| `--space16` | 16px | `--space64` | 64px |
| `--space20` | 20px | `--space80` | 80px |
| `--space24` | 24px | `--space96` | 96px |

### Typography (Fluid)

| **Token** | **Range** | **Usage** |
| --- | --- | --- |
| `--h1` | 35px → 62px | Page title |
| `--h2` | 32px → 46px | Section heading |
| `--h3` | 24px → 34px | Subsection |
| `--h4` | 20px → 24px | Card title |
| `--pXs` | 12px | Small print |
| `--pSm` | 14px | Captions |
| `--pBase` | 16px | Body text |
| `--pLg` | 18px | Lead text |

* **Font families:** `--fontPrimary` (Montserrat), `--fontSecondary` (Open Sans)
* **Weights:** `--fontLight` (300), `--fontRegular` (400), `--fontSemibold` (600), `--fontBold` (700), `--fontXbold` (900)

### Colours

| **Token** | **Purpose** |
| --- | --- |
| `--primaryColour` | Brand primary |
| `--secondaryColour` | Brand secondary |
| `--tertiaryColour` | Brand tertiary |
| `--highlightColour` | Accent/highlight |
| `--grey10` → `--grey90` | Greyscale (light → dark) |
| `--colorSuccess` | Green - success states |
| `--colorWarning` | Amber - warning states |
| `--colorError` | Red - error states |
| `--colorInfo` | Blue - informational |

### Z-Index Scale

* `--zBelow`: -1
* `--zBase`: 0
* `--zDropdown`: 100
* `--zSticky`: 200
* `--zFixed`: 300
* `--zModalBackdrop`: 400
* `--zModal`: 500
* `--zPopover`: 600
* `--zTooltip`: 700

### Borders & Radius

* **Borders:** `--border1` (1px), `--border2` (2px), `--border3` (3px)
* **Radius:** `--radiusNone` → `--radiusXxs` (0.25rem) → `--radiusSm` (0.5rem) → `--radiusMd` (0.75rem) → `--radiusLg` (1rem) → `--radiusXl` (2rem)

### Animation

```
transition: color var(--transitionSpeed) var(--easeOut);

/* --transitionSpeed: 0.3s */
/* --easeIn, --easeOut, --easeInOut available */
```

---

## Core Macros

These are globally available - call them directly without `{% import %}`.

> **Macro alias gotcha:** `link_helper`, `image_helper`, `video_helper` are **singular**; `text_helpers`, `style_helpers` are **plural**. Defined in `templates/layouts/base.html`.

### `text_helpers.render_heading(model, enabled, name)` - Active

Renders a module heading block with optional summary text and CTA.

```
{{ text_helpers.render_heading(module.module_heading, module.enable_module_heading, name) }}
```

**Field structure expected:**

```
module_heading: {
  "heading": "Section Title",
  "heading_type": "h2",        // h1-h6
  "summary": "<p>Optional</p>",
  "add_link_cta_": true/false, // NOTE: trailing underscore — this is the exact field name
  "button": { ... },
  "position": {
    "margin": {
      "mobile":  { "margin_top": 0, "margin_bottom": 16 },
      "desktop": { "margin_top": 0, "margin_bottom": 24 }
    }
  }
}
```

> **Important:** The CTA toggle field is named `add_link_cta_` with a **trailing underscore**. This is the exact name in `fields.json`. Renaming it will silently break the heading CTA toggle.

### `image_helper.render_responsive_images(item, class)` - Active

Renders a `<picture>` element with device-specific sources (mobile/tablet/desktop) and WebP.

```
{{ image_helper.render_responsive_images(item.image, 'm-moduleName__image') }}
```

### Deprecated Macros - Do NOT Use

The following macros are **deprecated** and must not be used in new modules:

| **Macro** | **Issue** | **Replacement** |
| --- | --- | --- |
| `style_helpers.render_module_padding()` | **REMOVED** from codebase — was suppressed by HubSpot | Inline `style` attribute on `.o-wrapper--module` (see Module Template Pattern above) |
| `link_helper.render_button()` | Internal cross-macro calls without namespace prefixes cause silent empty output | Render `<a>` elements directly inline |
| `link_helper.render_module_footer_cta()` | Calls `render_button()` internally, which silently fails | Inline footer CTA pattern (see Module Template Pattern above) |

---

## JavaScript Patterns

### Shared JS Utilities

`js/modules/utilities.js` is loaded globally via `base.html` and provides shared utility functions on the `window.CoreCode` namespace:

| **Function** | **Signature** | **Purpose** |
| --- | --- | --- |
| `CoreCode.trapFocus(container)` | `trapFocus(HTMLElement) → removeTrap()` | Traps Tab key focus within a container element. Returns a cleanup function to remove the listener. |
| `CoreCode.debounce(func, wait, immediate)` | `debounce(Function, number, boolean) → Function` | Debounces a function call. Default wait is 200ms. Set `immediate` for leading-edge execution. |

**Usage in module JS:**

```
// Focus trapping (e.g. for dialogs, dropdowns)
var removeTrap = window.CoreCode.trapFocus(dialogElement);
// Later, to clean up:
removeTrap();

// Debouncing (e.g. for search input, resize handlers)
var debouncedSearch = window.CoreCode.debounce(function() {
  // search logic
}, 250);
searchField.addEventListener('input', debouncedSearch);
```

Use these shared utilities instead of inlining duplicate implementations in module JS files.

### Lazy Initialization

Heavy modules use `IntersectionObserver` to defer initialization until the module is near the viewport, reducing main thread work on content-heavy pages:

| **Module** | **File** | **Trigger** | **rootMargin / threshold** |
| --- | --- | --- | --- |
| Carousels (Splide) | `js/modules/rotators.js` | `.js-rotator` enters viewport | `rootMargin: 200px` |
| Statistics (Odometer) | `js/modules/statistics.js` | `.js-statistics` enters viewport | `threshold: 0.25` |

Both include a fallback for browsers without `IntersectionObserver` support (immediate initialization).

### Module JS Template

```
(function () {
  'use strict';

  function initModuleName(container) {
    const triggers = Array.from(container.querySelectorAll('.js-moduleTrigger'));

    // Event delegation on container
    container.addEventListener('click', function (e) {
      const trigger = e.target.closest('.js-moduleTrigger');
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
    const containers = document.querySelectorAll('.js-moduleName');
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

* IIFE wrapper - all module JS wrapped in `(function () { ... })();`
* `'use strict'` - always at the top
* `const`/`let` - never `var`
* `.js-*` classes - for DOM targeting, never BEM classes
* `data-*` attributes - for configuration values
* Event delegation - attach to container, use `.closest()` to find targets
* Multiple instances - always use `querySelectorAll` + `forEach`, never assume single instance
* Reduced motion - check `window.matchMedia('(prefers-reduced-motion: reduce)').matches`
* Shared utilities - use `CoreCode.trapFocus()` and `CoreCode.debounce()` from `js/modules/utilities.js` instead of inlining

---

## Module Scaffolding Workflow

This is the step-by-step process for creating a new Core Code module.

### Step 1: Gather Requirements

Before writing any code, establish the spec:

1. Check for existing documentation - Is there a Jira ticket, design file, or specification document?
2. If no spec exists, answer these questions:

    * What is the module name? (snake_case, e.g. `feature_cards`)
    * What is its purpose?
    * What content fields does it need? (text, images, links, rich text, repeaters)
    * What behaviours does it need? (accordion, carousel, tabs, static)
    * What style options should editors have? (colour variants, alignment, column count)
    * Any responsive-specific requirements beyond the standard 992px breakpoint?
    

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

```
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

| **Rule** | **Detail** |
| --- | --- |
| Categories | MUST be UPPERCASE: `TEXT`, `BODY_CONTENT`, `MEDIA`, `FORMS_AND_BUTTONS`, `DESIGN`, `FUNCTIONALITY`, `BLOG`, `SOCIAL`, `COMMERCE` |
| `host_template_types` | MUST be present when `css_assets` or `js_assets` exist - otherwise HubSpot blocks CSS/JS |
| Never include | `content_tags`, `module_id`, `global`, `css_assets` (auto), `js_assets` (auto) |
| `description` + `icon` | Always include both - missing description triggers "internal error" on upload |

### Step 4: Write `fields.json`

Structure your fields following these patterns.

#### Standard Field Groups

Every module should include:

1. **Style tab** - spacing fields with inherited theme values
2. **Module heading** - toggle + heading fields (uses `text_helpers.render_heading()`)
3. **Content fields** - module-specific content
4. **Footer CTA** - optional bottom CTA (use inline pattern, NOT `link_helper.render_module_footer_cta()`)
5. **Scroll ID** - optional anchor text field

#### Field Authoring Rules

| **Rule** | **Correct** | **Wrong** |
| --- | --- | --- |
| Required fields | Always include `default` | Omit `default` |
| Image defaults | `{ "size_type": "auto", "src": "https://placehold.co/800x600", "alt": "Placeholder", "loading": "lazy", "width": 800, "height": 600 }` | Missing `size_type` or dimensions |
| Link defaults | Include `url.type`, `url.href`, `open_in_new_tab`, `no_follow` | Incomplete structure |
| Repeater defaults | Array: `"default": [{ ... }]` | Object: `"default": { ... }` |
| Repeater meta | `"group_occurrence_meta": { "min": 1, "max": null }` | Using `"occurrence"` |
| Rich text features | `"bulleted_list"`, `"numbered_list"`, `"link"`, `"anchor"` | `"ul"`, `"ol"`, `"personalization_token"` |
| Spacing fields | Number fields with `"inherited_value": { "default_value_path": "..." }` | Using spacing field type |
| Choice fields | `[["value", "Label"], ...]` | `[{"value": "", "label": ""}]` |

**Spacing Field Pattern**

```
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

Follow the Module Template Pattern from above.

**Key rules:**

* **No macro imports** - call macros directly (`text_helpers.render_heading()`, **not** `{% from 'macros/text_helpers.html' import render_heading %}`)
* **Inline footer CTA** - do NOT use `link_helper.render_module_footer_cta()` (silently fails)
* **Inline spacing** - use the `style` attribute on `.o-wrapper--module` to inject spacing variables. Do NOT use `style_helpers.render_module_padding()` (removed) or inline `<style>` blocks
* **Defensive checks** - always check fields exist before rendering: `{% if module.field.src %}`
* `|safe` filter - use on rich text fields from the CMS editor (these are trusted)
* **Security** - never use `|safe` on user-supplied input; add `rel="noopener noreferrer"` on external links
* **Editor placeholders** - use `{% if is_in_editor %}{% editor_placeholder %}{% endif %}` for empty states
* **Loop scoping** - render content inside the loop; arrays built in loops don't persist outside in HubL
* **Unique IDs** - use `{{ name }}` (module instance ID) to scope IDs and prevent collisions

### Step 6: Write `module.css`

Follow the CSS patterns from the CSS Architecture section:

* `.m-camelCase` prefix matching the module name
* Mobile-first with `@media (width >= 992px)` for desktop
* Design system tokens for all values
* `:focus-visible` outlines for interactive elements
* Opt-in animation: declare transitions inside `@media (prefers-reduced-motion: no-preference)` only

### Step 7: Write `module.js` (if needed)

Follow the JavaScript Patterns section:

* IIFE wrapper, strict mode
* Handle multiple instances via `querySelectorAll`
* `.js-*` classes for DOM targeting
* Keyboard navigation for interactive components
* Reduced motion support
* Use `CoreCode.trapFocus()` and `CoreCode.debounce()` from shared utilities

---

## Accessibility Checklist

Every module must target WCAG 2.2 Level AA:

* **Semantic HTML** - use `<button>`, `<nav>`, `<main>`, `<section>`, `<article>` over generic `<div>`
* **Keyboard navigation** - all interactive elements reachable and operable via keyboard
* **Focus indicators** - visible `:focus-visible` outlines (2px solid, 3:1 contrast) on interactive elements
* **Focus not obscured** - focused elements must not be hidden behind sticky headers/overlays (WCAG 2.4.11)
* **Focus appearance** - focus indicator has sufficient area and contrast (WCAG 2.4.13)
* **Focus restoration** - when a modal/menu closes, return focus to the element that opened it (WCAG 2.4.3)
* **ARIA attributes** - `aria-expanded`, `aria-controls`, `aria-hidden`, `aria-labelledby`, `aria-live` where needed
* **Colour contrast** - 4.5:1 minimum for text, 3:1 for large text and UI components
* **Touch targets** - 44px minimum for touch devices (24px WCAG 2.2 minimum)
* **Target size minimum** - interactive targets at least 24x24px CSS pixels (WCAG 2.5.8)
* **Dragging movements** - drag operations have single-pointer alternative (WCAG 2.5.7)
* **Alt text** - all images have meaningful `alt` attributes
* **Reduced motion** - opt-in animation pattern: transitions declared inside `@media (prefers-reduced-motion: no-preference)` only. JS-level `matchMedia` checks for interactive animations
* **Skip links** - provided at page level (handled by base template)
* **No auto-play** - media must not auto-play with sound; auto-rotating carousels must have a visible pause button
* **Landmark names** - `<section>` elements should have `aria-label` or `aria-labelledby` when multiple appear on a page
* **Live regions** - dynamic content updates (search results, filters, pagination) need `aria-live="polite"` announcements

---

## HubL Quick Reference

### Common Patterns

```
{# Defensive field check #}
{% if module.image.src %}
  <img src="{{ module.image.src }}" alt="{{ module.image.alt }}">
{% endif %}
```

```
{# Loop with index-based IDs #}
{% for item in module.items %}
  {% set item_id = name ~ "-item-" ~ loop.index %}
  <div id="{{ item_id }}">{{ item.title }}</div>
{% endfor %}
```

```
{# Conditional rendering #}
{% if module.show_section %}
  {# Render section #}
{% endif %}
```

```
{# Default filter for optional values #}
{{ module.optional_text|default("Fallback text") }}
```

```
{# Rich text (trusted CMS content) #}
{{ module.content|safe }}
```

```
{# Build rel attribute for links #}
{% set rel = [] %}
{% if link.no_follow %}{% do rel.append("nofollow") %}{% endif %}
{% if link.open_in_new_tab %}{% do rel.append("noopener") %}{% do rel.append("noreferrer") %}{% endif %}
<a href="{{ link.url.href }}"
   {% if link.open_in_new_tab %}target="_blank"{% endif %}
   {% if rel %}rel="{{ rel|join(' ') }}"{% endif %}>
```

### Variable Naming

* `snake_case` for all HubL variables
* `is_`, `has_`, `show_` prefixes for booleans
* Cache queries outside loops:  
  `{% set items = hubdb_table_rows(...) %}`

---

## Gotchas

| **Issue** | **Detail** |
| --- | --- |
| Loop scoping | Arrays/objects built inside `{% for %}` loops don't persist outside - render output inside loop |
| `content.absolute_url` vs `content.url` | `absolute_url` includes domain, `url` is path-only - not interchangeable |
| No macro imports | Core Code macros are globally available; `{% from %}` will cause upload errors |
| `\| safe` on user input | Never use `\|safe` on user-supplied values |
| Deprecated macros | `render_module_padding()` has been **removed**. `render_button()` and `render_module_footer_cta()` silently fail - use inline patterns |
| `[hidden]` attribute | Browser UA stylesheet applies `display: none !important` - use CSS class toggles for animated show/hide instead |
| `--h*Min` tokens required | `typography.css` uses `clamp()` with `--h1Min`–`--h6Min` variables. These are defined in `base.html`. Do not remove them — headings will render unsized without them |
| `add_link_cta_` trailing underscore | The heading CTA toggle field is named `add_link_cta_` (with trailing underscore) in `fields.json`. The macro checks this exact name. Renaming the field will silently break the CTA toggle |
| Focus restoration on menu close | When a flyout menu or modal closes, call `.focus()` on the element that opened it (e.g. the hamburger toggle). Required for WCAG 2.4.3 compliance |
| Debugging | Append `?hsDebug=true` to preview URL for caching/rendering debug info |

---

## Common Upload Errors

Most common errors shown below. The complete error table (12+ patterns) is maintained in the `/fix-module` skill — use it for full diagnosis and automated fixes.

| **Error** | **Cause** | **Fix** |
| --- | --- | --- |
| `internal error` | `meta.json` missing description, icon, or required fields | Add all required `meta.json` fields |
| `CSS or Javascript is not allowed on modules with ANY content type` | `meta.json` missing `host_template_types` | Add `"host_template_types": ["PAGE", "BLOG_POST", "BLOG_LISTING"]` |
| `'link' is required but no default is set` | Link field missing complete default, or cascade from broken `meta.json` | Fix `meta.json` first; then ensure all link fields have full defaults |
| `'X' is not a valid category` | Category in `meta.json` is lowercase | Use UPPERCASE: `"BODY_CONTENT"`, `"MEDIA"`, etc. |
| `Cannot deserialize value` | `content_tags` present in `meta.json` | Remove the `content_tags` key |
| `Value for field with occurrence must be array` | Repeater default is an object | Change to array: `"default": [{ ... }]` |
| `Cannot find method render_module_padding` | Macro has been removed — still referenced in old templates | Replace with inline `style` attribute on `.o-wrapper--module`. See Module Template Pattern |

---

## Claude Code Skills

The Core Code repository includes **Claude Code skills** - automated workflows triggered via slash commands in the Claude Code CLI or VSCode extension. Skills are defined in `.claude/skills/` and encode the team's processes, conventions, and error-handling knowledge so that Claude produces correct output first time.

### Prerequisites

* Claude Code CLI or VSCode extension installed and configured
* Repository cloned locally and open as your working directory
* Skills are automatically discovered from `.claude/skills/` - no additional setup needed

### How Skills Work

1. Type the slash command (e.g. `/scaffold-module`) in Claude Code
2. Optionally provide an argument after the command (e.g. `/scaffold-module feature_cards`)
3. Claude loads the skill's process definition and any reference files on demand
4. The skill runs its workflow - asking questions if needed, then generating or modifying code
5. You can also trigger skills using natural language (e.g. "scaffold a new module called feature_cards") - Claude will recognise the intent and load the appropriate skill

### Auto-Triggering

Many skills are designed to trigger automatically based on what you ask Claude to do, without needing to type the slash command:

* Report a CSS bug or paste a Jira ticket about a styling issue → `/css-debugging` activates
* Report a JS bug, broken click handler, or paste a console error → `/js-debugging` activates
* Ask to "explain this to the client" or "draft a response for the PM" → `/client-response-translator` activates
* Ask to "build an email module" or mention "Outlook rendering" → `/email-module-dev` activates
* Say "grill me" or "poke holes in this plan" → `/grill-me` activates
* Ask to "write a guide for the client" or "training doc" → `/client-handover-guide` activates

The trigger phrases are defined in each skill's `SKILL.md` frontmatter. Claude matches your request against these descriptions and loads the appropriate skill automatically.

### Skill Reference

#### Coding Standards & Development

| **Skill** | **Mode** | **What it does** | **Triggers** |
| --- | --- | --- | --- |
| `/frontend-standards` | Read-only (advisory) | Enforces HTML, CSS, JS, accessibility, performance, and design token standards | Writing or reviewing front-end code |
| `/hubspot-module-dev` | Read-only (advisory) | HubL templating, data handling, variable scoping, and module patterns | Writing or reviewing HubL code |
| `/css-debugging` | Edit (modifies files) | Structured audit-before-fix workflow for CSS/styling bugs | "CSS bug", "fix the styling", "layout issue", "broken on mobile", Jira styling tickets |
| `/js-debugging` | Edit (modifies files) | Structured audit-before-fix workflow for JavaScript bugs | "JS bug", "JavaScript not working", "click handler broken", "carousel broken", "Splide not initialising", console errors |
| `/email-module-dev` | Write (creates files) | Email-safe HTML with table layouts, VML fallbacks, MSO conditionals for Outlook | "Email module", "email template", "Outlook rendering", "VML", "bulletproof button" |

#### Module Lifecycle

| **Skill** | **Mode** | **What it does** | **Triggers** |
| --- | --- | --- | --- |
| `/scaffold-module` | Write (creates files) | Full module scaffolding from spec or questions | "Create module", "scaffold module", "new module" |
| `/qa-review` | Read-only (no changes) | 15-section quality audit with structured report | "QA review", "audit module", "check module" |
| `/fix-module` | Edit (modifies files) | Diagnose and fix HubSpot upload errors | Pasting a HubSpot upload error message |
| `/add-module-feature` | Edit (modifies files) | Add fields/features to existing modules | "Add field to module", "add feature" |
| `/write-module-docs` | Read-only (generates docs) | Create Client Guide + Technical Spec | "Write docs", "document module" |

#### Auditing & Optimisation

| **Skill** | **Mode** | **What it does** | **Triggers** |
| --- | --- | --- | --- |
| `/accessibility-checker` | Read-only (advisory) | WCAG 2.2 AA audit with axe-core script | "Accessibility audit", "WCAG check" |
| `/frontend-performance` | Read-only (advisory) | Core Web Vitals audit with Lighthouse script | "Performance audit", "Lighthouse check" |
| `/optimise-codebase` | Edit (with confirmation) | Performance, accessibility, and SEO fixes | "Optimise", "improve performance" |

#### Client Communication & Handover

| **Skill** | **Mode** | **What it does** | **Triggers** |
| --- | --- | --- | --- |
| `/client-response-translator` | Read-only (generates text) | Translates technical findings into non-technical client-ready responses | "Explain to client", "draft response for PM", "make this client-friendly", "soften this" |
| `/client-handover-guide` | Read-only (generates text) | Generates usage guides for non-technical content editors in HubSpot | "Write guide for client", "training doc", "handover documentation", "how to use this module" |

#### Planning & Review

| **Skill** | **Mode** | **What it does** | **Triggers** |
| --- | --- | --- | --- |
| `/grill-me` | Interactive (conversation) | Interviews you relentlessly about a plan or design, resolving each decision branch | "Grill me", "poke holes", "stress-test this", "what am I missing", "devil's advocate" |

---

### `/scaffold-module` - Create a New Module

**Purpose:** Generates a complete, upload-ready HubSpot module with all five required files.

**Usage:**

```
/scaffold-module feature_cards
/scaffold-module specs/HCC-1234-spec.md
/scaffold-module
```

**How it works:**

1. **Checks for a spec first** - asks if you have a Jira ticket, Confluence page, design file, or local spec document
2. If a spec is provided, reads it and extracts requirements automatically
3. If no spec, asks 11 structured questions about purpose, fields, interactivity, and styling
4. Generates all files following Core Code conventions:

    * `fields.json` - with correct field types, defaults, spacing structure, and UUIDs
    * `meta.json` - with UPPERCASE categories, `host_template_types`, description, and icon
    * `module.html` - using the inline CTA pattern and `style` attribute spacing (not deprecated macros)
    * `module.css` - with `.m-camelCase` BEM naming and design system tokens
    * `module.js` - IIFE pattern with keyboard nav (only if interactive behaviour needed)
    
5. Places the module in the appropriate category directory (e.g. `modules/page/`)
6. Offers to run `/qa-review` against the new module to catch any issues before upload

**Argument:** Module name in `snake_case` (e.g. `feature_cards`) or path to a spec file. If omitted, Claude will ask.

---

### `/qa-review` - Audit a Module

**Purpose:** Runs a comprehensive 15-section quality checklist against a module and outputs a structured report without making any code changes.

**Usage:**

```
/qa-review modules/page/accordion.module
/qa-review accordion
```

**How it works:**

1. Reads all five module files (fields.json, meta.json, module.html, module.css, module.js)
2. Audits across 15 dimensions:

    * Naming consistency (directory, CSS class, meta.json label)
    * `meta.json` validation (categories, host_template_types, description)
    * `fields.json` structure (defaults, repeaters, image fields, link fields)
    * Rich text feature names, spacing field configuration
    * HTML structure (wrapper pattern, whitespace trimming, editor placeholders)
    * HubL logic (null checks, loop scoping, macro usage)
    * CSS standards (BEM, ITCSS, design tokens, nesting guidelines)
    * JS patterns (IIFE, strict mode, `.js-*` hooks, event delegation)
    * Accessibility (WCAG 2.2 AA: ARIA, keyboard, focus, contrast, touch targets, WCAG 2.2 criteria)
    * Cross-file consistency (field names match between files)
    
3. Produces a structured report:

    * **Errors** (must fix) - issues that will block upload or break functionality
    * **Warnings** (should fix) - standards violations that won't block upload
    * **Passed** - count of checks that passed
    

**Argument:** Full module path or just the module name (Claude will search `modules/` for it).

**Note:** This skill runs in read-only mode - it will never modify your files.

---

### `/fix-module` - Fix Upload Errors

**Purpose:** Diagnoses HubSpot upload errors and applies targeted fixes. This skill maintains the canonical error table for the project.

**Usage:**

```
/fix-module modules/page/feature_cards.module
```

Then paste the error message from the HubSpot CLI when prompted.

**How it works:**

1. Asks for the error message from `hs watch` or `hs upload`
2. Matches the error against a known error table (12+ documented patterns)
3. Identifies the root cause and specific file(s) to fix
4. Applies the fix directly - e.g. adding `host_template_types`, fixing category casing, correcting field defaults
5. Handles deprecated macro replacement: converts `render_module_footer_cta()` → inline CTA, `render_module_padding()` → inline `style` attribute spacing
6. After fixing, offers to run `/qa-review` to catch any remaining standards violations

**Argument:** Module path. If omitted, Claude will ask.

**Common errors it handles:**

* `internal error` → missing meta.json fields
* `CSS or Javascript is not allowed` → missing `host_template_types`
* `'link' is required but no default` → incomplete link field defaults
* `'X' is not a valid category` → lowercase category values
* `Cannot deserialize value of type ArrayList` → `content_tags` in meta.json
* `Value for field with occurrence must be array` → repeater default is `{}` not `[]`
* `Cannot find method render_module_padding` → deprecated macro still in template

---

### `/write-module-docs` - Generate Documentation

**Purpose:** Creates Confluence-ready documentation from a module's codebase files.

**Usage:**

```
/write-module-docs modules/page/accordion.module
```

**How it works:**

1. Reads all module files to understand structure, fields, and behaviour
2. Generates two structured documents:

    * **Client Guide** - what it is, when to use it, content checklist, field-by-field guide, best practices, common pitfalls
    * **Technical Specification** - module reference, field details, raw JSON structure, behaviour spec, accessibility requirements, QA checklist
    
3. Outputs as markdown, ready to paste into Confluence or publish via the Atlassian API

**Argument:** Module path.

---

### `/add-module-feature` - Add to an Existing Module

**Purpose:** Safely adds a new field, field group, or feature to an existing module without breaking live content.

**Usage:**

```
/add-module-feature modules/page/feature_cards.module
```

**How it works:**

1. Reads the current module structure to understand existing naming patterns, field IDs, and CSS conventions
2. Asks what to add: new field, field group, repeater, layout variant, interactive behaviour, footer CTA, or module heading
3. Implements changes across all affected files:

    * `fields.json` - adds new fields while preserving existing field IDs and structure
    * `module.html` - adds template code with proper null checks and inline patterns
    * `module.css` - adds styles using the existing BEM block name
    * `module.js` - adds behaviour if needed
    
4. Validates cross-file consistency after changes
5. Offers to run `/qa-review` and notes if Confluence documentation may need updating

**Argument:** Module path.

**Critical rule:** This skill will never restructure or rename existing fields - doing so would break saved content on live pages.

---

### `/optimise-codebase` - Performance, Accessibility & SEO

**Purpose:** Audits and fixes front-end performance, WCAG 2.2 accessibility, and SEO issues across the codebase or a specific module.

**Usage:**

```
/optimise-codebase all
/optimise-codebase performance
/optimise-codebase accessibility
/optimise-codebase seo
/optimise-codebase modules/page/gallery.module
/optimise-codebase modules/page/gallery.module accessibility
```

**How it works:**

1. **Scope** - determines whether to audit the full codebase, a single module, or a specific domain
2. **Audit** - reads the module files and checks against the reference checklists:

    * **Performance** (15 items) - `loading="lazy"`, `decoding="async"`, `width`/`height`, `<picture>`, `content-visibility`, `contain`, `lazyModuleInit`, reduced-motion JS, preconnect hints, `aspect-ratio`, `fetchpriority`, debounced resize
    * **Accessibility** (21 items) - `aria-live` regions, focus restoration, `aria-modal`, `:focus-visible`, WCAG 2.2 criteria (Focus Not Obscured, Focus Appearance, Dragging Movements, Target Size), pause buttons on carousels, landmark names, `overflow: clip`, `rel="noopener noreferrer"`
    * **SEO** (16 items) - JSON-LD schemas (Organization, WebSite, BreadcrumbList, BlogPosting, FAQPage, ItemList), `<time datetime="">`, `rel="noreferrer"`, pagination `rel="next/prev"`, `<figure>`/`<figcaption>`, reading time, error page `noindex`
    
3. **Report** - presents findings organised by severity (High / Medium / Low), grouped by file and domain
4. **Fix** - asks which fixes to apply before making any changes (never auto-applies)
5. **Validate** - confirms changes are consistent and summarises improvements

**Arguments:**

| Input | Scope |
| --- | --- |
| `all` | Full codebase audit across all three domains |
| `performance` | Performance fixes only, full codebase |
| `accessibility` | WCAG 2.2 fixes only, full codebase |
| `seo` | SEO fixes only, full codebase |
| `modules/page/gallery.module` | All three domains, single module |
| `modules/page/gallery.module accessibility` | Single domain, single module |

---

### `/css-debugging` - Fix CSS and Styling Bugs

**Purpose:** Investigates and fixes CSS/styling bugs using a structured audit-before-fix workflow. Prevents minimal patches that introduce regressions or conflict with the existing layout approach.

**Usage:**

```
/css-debugging
```

Then describe the issue, paste a Jira ticket, or share a screenshot. Also triggers automatically when you report a visual bug in natural language.

**How it works:**

1. **Understand the issue** - identifies the specific visual symptom, where it occurs, and what correct behaviour looks like
2. **Identify affected components** - locates the HTML elements and CSS files involved, mapping BEM/ITCSS class structures
3. **Audit the existing styling context** - analyses the current layout model (flexbox, grid, block flow), spacing model (margin, padding, gap), responsive breakpoints, and specificity chain. This step is mandatory and cannot be skipped
4. **Determine the structural approach** - decides whether to adjust the existing approach (correct a value, add a missing rule) or refactor the approach (e.g. switching from ad hoc margins to gap-based spacing)
5. **Implement the fix** - applies changes following frontend-standards, testing mentally across all breakpoints
6. **Summarise** - documents root cause, what was changed, and what to verify during QA

**Key principles:**

* Never applies a fix without completing the styling audit first
* Prefers `gap` over margin stacking for sibling spacing in flex/grid containers
* Never uses `!important` to fix specificity issues - traces and resolves conflicts at source
* Removes old CSS rules when replacing with a new approach (no layering)
* Scopes fixes to the affected component - does not modify global styles unless the bug is genuinely at that level

**Common patterns it handles:**

| Pattern | Symptom | Typical approach |
| --- | --- | --- |
| Spacing inconsistency | Uneven gaps between items | Audit spacing mechanisms, consolidate to single approach (usually `gap`) |
| Element overflow | Content overflows container | Check flex sizing, `min-width: 0`, percentage calculations |
| Responsive breakage | Works on desktop, broken on mobile | Map all breakpoint rules, fix mobile-first cascade |
| Inherited style conflicts | Module styles overridden by theme | Trace cascade, resolve specificity without `!important` |

---

### `/js-debugging` - Fix JavaScript Bugs

**Purpose:** Investigates and fixes JavaScript bugs in HubSpot CMS modules using a structured audit-before-fix workflow. Mirrors the `/css-debugging` approach for interactive behaviour issues.

**Usage:**

```
/js-debugging
```

Then describe the issue, paste a console error, or share a bug report. Also triggers automatically when you report a JavaScript bug in natural language.

**How it works:**

1. **Understand the issue** - identifies the specific broken behaviour, where it occurs, and any console errors
2. **Identify affected module and JS files** - locates the module's JS, `.js-*` classes, `data-*` attributes, vendor library dependencies, and shared utility usage
3. **Audit the existing JS architecture** - analyses initialisation pattern, event model (delegation vs direct binding), state management, vendor library integration, cleanup/memory management, and accessibility integration. This step is mandatory
4. **Determine the fix approach** - decides whether the bug is a detail fix (wrong selector, missing null check, timing issue) or requires an architectural change (switching from direct binding to event delegation, adding per-instance state scoping)
5. **Implement the fix** - applies changes following frontend-standards JS rules
6. **Summarise** - documents root cause, what was changed, and what to verify during QA

**Common patterns it handles:**

| Pattern | Symptom | Typical approach |
| --- | --- | --- |
| Module not initialising | No interactivity at all | Trace init chain: readyState guard, querySelectorAll selector, IntersectionObserver config |
| Event handler not firing | Click/tap does nothing | Verify `.js-*` class in HTML and JS, check event delegation `.closest()` selector |
| Multiple instances conflicting | Only first instance works | Scope DOM queries to container, move state into init closure |
| Focus management failure | Focus doesn't trap/restore | Add `CoreCode.trapFocus()` on open, call cleanup on close, restore focus to trigger |
| Vendor library not initialising | Carousel stacked, counter static | Check IntersectionObserver trigger, verify vendor script loaded, check constructor options |
| Reduced motion not respected | Animations play regardless | Use opt-in pattern: transitions inside `@media (prefers-reduced-motion: no-preference)` only. JS: check `matchMedia('(prefers-reduced-motion: reduce)').matches` |

---

### `/email-module-dev` - Build Email Modules

**Purpose:** Builds custom HubSpot email modules with HTML that renders correctly across all major email clients, including Outlook 2016 (Word rendering engine).

**Usage:**

```
/email-module-dev
```

Then describe the email module you need. Also triggers automatically when you mention "email module", "email template", or "Outlook rendering".

**How it works:**

1. Loads the email-safe HTML/CSS reference file containing the complete constraint set for email HTML
2. Gathers requirements for the email module (layout, content fields, responsive behaviour)
3. Generates `module.html` and `fields.json` following email-specific constraints:

    * **Table-based layout** - all structure uses `<table role="presentation">`, no flexbox/grid/float
    * **Inline styles only** - no CSS classes for layout-critical rules; `<style>` blocks are progressive enhancement only (media queries)
    * **MSO conditional comments** - every width-constrained container wrapped in `<!--[if mso]>` tables with explicit pixel widths (Outlook ignores `max-width`)
    * **VML fallbacks** - background images and rounded buttons include VML markup for Outlook
    * **Pixel values** - no rem/em for spacing and typography; explicit `width`/`height` on all images
    
4. Runs an 11-point pre-output validation checklist before presenting files
5. Produces upload-ready module files that work in HubSpot's drag-and-drop email builder

**Key constraints:**

| Rule | Detail |
| --- | --- |
| Layout | Table-based only. No flexbox, grid, or float |
| Styles | All inline. `<style>` blocks for media queries only |
| Width control | MSO conditional table required alongside any `max-width` |
| Images | Must have `width` and `height` HTML attributes plus `max-width: 100%; height: auto` CSS |
| Spacing | `<td>` padding only. No margin, no spacer images |
| Typography | Individual properties only (`font-family`, `font-size`, etc.). No `font` shorthand |
| Headings | Styled `<p>` or `<td>` elements. No `<h1>`-`<h6>` tags |
| Links | Explicit `color` and `text-decoration` on every `<a>` tag |
| Background images | Require VML fallback inside MSO conditionals |
| SVG | Not supported in email. Use PNG/JPG |

**What it does NOT do:** This skill builds modules for HubSpot's email builder, not full email templates. The email template structure (header, footer, global styles) is handled at the template level.

---

### `/client-response-translator` - Translate Technical Findings for Clients

**Purpose:** Translates a technical finding or codebase analysis into a clear, non-technical response suitable for a client, project manager, or account manager.

**Usage:**

```
/client-response-translator
```

Then paste the technical analysis or describe the issue. Also triggers automatically when you say "explain this to the client", "draft a response for the PM", "make this client-friendly", or "soften this".

**How it works:**

1. Takes a technical analysis, diagnosis, or investigation summary as input
2. Strips all implementation terminology (no code references, file names, CSS properties, function names)
3. Produces a concise response (typically 2-4 sentences) that:

    * Leads with the answer to the client's question
    * Includes at most one level of "why" for context
    * Uses outcome language, not technical language
    * Makes no action commitments unless explicitly requested
    
4. Defaults to **relay format** (PM/AM can copy-paste directly). If you specify "Jira comment" or name the client, wraps with greeting and sign-off

**Output formats:**

| Format | When to use | Example trigger |
| --- | --- | --- |
| Relay (default) | PM or AM will forward to client | "Translate this for the PM" |
| Jira comment | Posting directly on a client-visible ticket | "Draft a Jira comment for Tom" |

**Examples of translation:**

| Technical input | Client-ready output |
| --- | --- |
| "The hero banner CTA has `pointer-events: none` from an inherited overlay with no z-index management" | "The button on the hero banner isn't clickable because another element on the page is overlapping it. This is a styling issue we can resolve with a targeted fix." |
| "The `blog_recent_posts` function uses a hardcoded limit of 10" | "The blog listing page is currently set to display 10 posts. This is a fixed setting rather than something configurable from the editor. We can update it or make it adjustable." |

---

### `/client-handover-guide` - Generate Client Usage Guides

**Purpose:** Generates a self-contained usage guide for a HubSpot CMS module or feature, written for non-technical client content editors.

**Usage:**

```
/client-handover-guide
/client-handover-guide modules/page/accordion.module
```

Then describe the module or feature, or point Claude at the module path. Also triggers automatically when you say "write a guide for the client", "training doc", "handover documentation", or "explain how to use this module".

**How it works:**

1. Takes module details as input - either a module path (reads the code automatically), a description, or both
2. Generates a structured guide in markdown format with:

    * **Overview** - what the module does and where it appears
    * **How to Edit** - numbered step-by-step instructions (one action per step)
    * **Field Reference** - table of all editable fields with purpose and constraints
    * **Tips and Notes** - non-obvious behaviour, limitations, and best practices
    
3. Uses HubSpot editor language throughout (not developer language):

    * "The text editor" not "the rich text field"
    * "The image picker" not "the image field"
    * "Toggle" not "boolean field"
    * "Dropdown" not "choice field"
    
4. Output is ready to paste into a Jira ticket, Confluence page, or Google Doc

**Key principles:**

* Completely self-contained - assumes no one is available to answer follow-up questions
* No references to code, file structure, or technical implementation
* Specific about locations ("in the left sidebar", "in the module settings panel")
* Includes image dimensions and constraints when known
* Covers common editor actions (formatting text, uploading images, adding/removing repeater items)

**Scales to larger deliverables:** When documenting multiple modules, add a table of contents, group by section, and include a "General Editing Tips" section covering save/preview/publish.

---

### `/grill-me` - Stress-Test a Plan or Design

**Purpose:** Interviews you relentlessly about every aspect of a plan, architecture, or design until reaching a shared understanding with all decision branches resolved.

**Usage:**

```
/grill-me
```

Then present your plan, architecture proposal, or design. Also triggers automatically when you say "grill me", "poke holes", "stress-test this", "what am I missing", "challenge this", or "devil's advocate".

**How it works:**

1. Asks **one focused question at a time** - never bundles multiple questions
2. Waits for your answer before moving on
3. Follows the dependency chain - if Decision B depends on Decision A, resolves A first
4. When an answer reveals a new branch, follows it immediately before returning to the original thread
5. Periodically summarises progress: which branches are resolved, which are still open
6. If a question can be answered by exploring the codebase, explores the codebase instead of asking

**What it probes:**

| Dimension | What it looks for |
| --- | --- |
| Unstated assumptions | What is being taken for granted that should be explicit? |
| Missing constraints | Non-functional requirements, edge cases, or failure modes not addressed |
| Dependency risks | What happens if an upstream dependency changes, breaks, or is unavailable? |
| Trade-off clarity | Has the user articulated what they are giving up with each decision? |
| Scope boundaries | Where does this plan end and what is deliberately excluded? |
| Operational reality | How will this be deployed, monitored, maintained, and rolled back? |
| Sequencing | Is the proposed order of work correct given the dependency graph? |

**Tone:** Direct, professional, and constructive. Challenges weak reasoning but acknowledges strong reasoning. If an answer is solid, says so and moves on - does not manufacture doubt.

**When it stops:** Every identified branch has been resolved or explicitly deferred with a rationale. Produces a final summary of confirmed decisions, open items, and identified risks.

---

## Vendor Libraries

| **Library** | **Purpose** | **Notes** |
| --- | --- | --- |
| Splide | Carousels/sliders | jQuery-free, accessible, lazy-initialised via IntersectionObserver |
| Plyr | Video player | Lightweight, CSS variable theming |
| lite-youtube | YouTube embeds | Facade pattern for performance |
| Odometer | Animated counters | Lazy-initialised via IntersectionObserver |

### Removed Libraries (Do Not Re-introduce)

jQuery, Slick Slider, Magnific Popup, Lightbox, HoverIntent, Equalize, Video.js, AOS, JPList, Select2 - all replaced with native browser APIs or lighter alternatives.

---

## Git Workflow

| **Branch type** | **Pattern** | **Example** |
| --- | --- | --- |
| Main | `development` |  |
| Feature | `feature/HCC-{number}` | `feature/HCC-1234` |
| Bugfix | `bugfix/HCC-{number}` | `bugfix/HCC-5678` |

No build step - commit, push, and HubSpot CI/CD deploys automatically.