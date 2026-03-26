# HubL Standards

HubL is derived from Jinja (specifically Jinjava — Jinja + Java). When HubSpot's documentation does not cover a feature or filter, reference the Jinja documentation for compatible syntax and advanced techniques.

For all front-end output concerns (HTML structure, CSS, JavaScript, module wrapper patterns, naming conventions, accessibility, macro usage, and module directory structure), defer to the frontend-standards skill — it is the authority.

---

## Documentation Verification

HubSpot's HubL documentation changes frequently. Do not rely solely on training data for HubL-specific syntax.

**Before using or recommending any of the following, verify against current HubSpot documentation:**

- HubL filters and functions (availability, parameters, behaviour)
- HubDB API behaviour and query syntax
- Module field types and their available properties
- `content.*` and `request.*` available properties
- `{% require_css %}`, `{% require_js %}`, and asset loading tags
- `{% module_attribute %}` tag usage

**When referencing Jinja documentation for advanced techniques**, explicitly flag that the syntax is Jinja-compatible and may not be available in HubSpot's Jinjava implementation.

---

## Core Principles

- Separation of concerns: HubL handles logic and data; HTML structure, styling, and behaviour are governed by front-end standards
- DRY approach: use macros for repeated logic and maintain them centrally
- Template hierarchy: use `{% extends %}` for shared layouts and consistent architecture
- Render output within the scope where data is available — do not rely on building data structures for later use

---

## Performance Standards

- Cache all HubDB or blog queries in variables; never query inside loops
- Avoid using `request` unless data must change per visitor (e.g. search, personalisation)
- Use `content.*` properties for caching and prerendering compatibility
- Use `{%- … -%}` trim blocks to minimise whitespace in production
- Test caching with `?hsDebug=true` before deployment

---

## Data Validation and Safety

- Always check that data exists before outputting or looping
- Provide default values using the `|default()` filter
- Never use `|safe` on untrusted or user-generated input — only on trusted HubSpot rich text fields
- Sanitise query parameters with `|striptags` and limit text length with `|truncate()`
- Show meaningful empty-state messaging when data is missing or lists are empty
- Use `{% editor_placeholder %}` when content is empty and `is_in_editor` is true

```hubl
{# Defensive check for optional field #}
{% if module.image.src %}
  {# Render image — HTML structure per frontend-standards #}
{% endif %}

{# Default value for optional text #}
{{ module.subtitle|default("", true) }}

{# Safe empty-state handling #}
{% if items %}
  {% for item in items %}
    {# Render item #}
  {% endfor %}
{% else %}
  <p>No items available.</p>
{% endif %}
```

---

## Variable Scoping

### Core Problem

Arrays or objects built inside nested loops do not persist outside those loops in HubL. This is a fundamental limitation of HubL's variable scoping, which differs from most programming languages.

### Solution Pattern

Render output directly within the scope where data is available. Instead of building arrays for later rendering, generate the HTML immediately inside the active loop.

### Rules

- Never rely on building data structures inside loops for later use
- Render all output immediately while the data is accessible
- Use counters inside loops to limit results if needed
- Test variable accessibility with diagnostic output at each scope level
- Flatten nested logic whenever possible to avoid scope loss

```hubl
{# WRONG — array will be empty outside the loop #}
{% set filtered_items = [] %}
{% for item in items %}
  {% if item.status == "published" %}
    {% do filtered_items.append(item) %}
  {% endif %}
{% endfor %}
{# filtered_items is empty here #}

{# CORRECT — render immediately within scope #}
{% for item in items %}
  {% if item.status == "published" %}
    <div class="m-itemList__item">
      {{ item.title }}
    </div>
  {% endif %}
{% endfor %}
```

---

## HubL Variable Naming

- Variables: `snake_case` (e.g. `featured_image`, `post_count`)
- Booleans: prefix with `is_`, `has_`, or `show_` (e.g. `is_featured`, `has_sidebar`, `show_cta`)
- Collections: plural nouns (`posts`, `products`); single items use singular nouns (`post`, `product`)
- Use descriptive names — avoid abbreviations and unclear identifiers

---

## Template Logic

- Keep logic minimal in templates
- Validate field data before use (check for null/empty)
- Comment complex HubL logic for clarity
- Prefer module fields over hardcoded values
- Handle CMS preview vs published page context appropriately

```hubl
{# Conditional rendering with proper validation #}
{% if module.enable_feature and module.feature_content %}
  {# Render feature block #}
{% endif %}

{# Loop with counter limit #}
{% set max_items = module.max_display|default(6, true) %}
{% for item in items %}
  {% if loop.index0 < max_items %}
    {# Render item #}
  {% endif %}
{% endfor %}
```

---

## Security Requirements

- Escape all output by default; do not use `|safe` except for trusted HubSpot rich text fields
- Validate and sanitise all user inputs
- Always include `rel="noopener noreferrer"` for external links using `target="_blank"`
- Never expose API keys, tokens, or credentials in templates
- Do not output sensitive or unverified data in client-side code

```hubl
{# Safe rich text output — trusted HubSpot field #}
{{ module.rich_text_field }}

{# Sanitised query parameter #}
{{ request.query_dict.search|striptags|truncate(200) }}

{# NEVER do this #}
{{ request.query_dict.search|safe }}
```

---

## HubSpot-Specific Gotchas

### URL Properties

- `content.absolute_url` returns the full URL including domain — use for canonical URLs, social sharing, and structured data
- `content.url` returns the path only — use for internal linking and relative references
- Do not assume these are interchangeable

### Request Object

- `request.query_dict` returns a dictionary of query parameters — use when accessing specific parameter values
- `request.query` returns the raw query string — use only when the full string is needed
- Always sanitise values from either source before output

### Filter Behaviour Differences

HubL's filter implementations may differ from Jinja's. Known divergences include `|split` behaviour and filter chaining edge cases. When using filters for the first time or in unfamiliar combinations, test in a HubSpot sandbox.

### Asset Loading

- Use `{% require_css %}` and `{% require_js %}` to manage asset loading order and prevent duplicate includes
- Use `{% module_attribute %}` to pass data from HubL context into module CSS or JavaScript
- Do not rely on script or style tag ordering in the template for execution order

### Editor Context

- `is_in_editor` is true when the page is being previewed in the HubSpot editor
- Do not assume `is_in_editor` behaves identically in all editor contexts (page editor, template preview, module preview)
- Test modules in both editor preview and published page contexts

---

## Debugging and Testing

- Use the Developer Info menu to inspect available data structures
- Use filters like `|pprint` and `|type` for debugging safely
- Verify caching behaviour via `?hsDebug=true` or `?hsDebugOnly=true`
- Comment temporary debug output clearly and remove before delivery

```hubl
{# Debug — remove before delivery #}
{# {{ variable|pprint }} #}
{# {{ variable|type }} #}
```

---

## Comment Standards

- Comment why, not what — explain logic, intent, and important conditions
- Document complex conditional chains and their purpose
- Keep comments accurate and updated as code evolves

---

## Forbidden Practices

- Using `|safe` on user input (XSS risk)
- Querying HubDB or data inside loops
- Using `request` when static content suffices
- Hardcoding editable or localised content directly in templates
- Including inline event handlers (`onclick`, etc.) or unscoped JavaScript
- Exposing sensitive data in templates
- Building data structures inside loops for use outside the loop scope
- Relying on undocumented HubSpot global variables
