---
name: scaffold-module
description: Scaffold a complete HubSpot CMS module with all required files (module.html, module.css, module.js, fields.json, meta.json). Handles spec intake, requirement gathering, and generates upload-ready code following Core Code conventions. Also trigger when the user says "create a module", "new module", "build a module", "scaffold module", "make a module", or describes a new component they want built for HubSpot CMS.
argument-hint: module-name or spec-path
---

# HubSpot Module Scaffolding Skill

You are scaffolding a new HubSpot CMS module for the Core Code theme. Follow this process exactly.

## Step 1 — Check for a specification

Ask the user:

> "Do you have a Jira ticket, specification document, or design file that describes this module?"

- **Yes** — fetch the spec (Jira/Confluence via Atlassian MCP, local file via Read, URL via WebFetch). Extract all requirements and proceed to Step 2.
- **No** — ask these questions one at a time:

1. Module name (snake_case, e.g. `feature_cards`)
2. Primary purpose (one sentence)
3. Content structure — single instance, repeater, or mixed
4. Required fields (format: `field_name | field_type | purpose`)
5. Interactive behaviour — none, basic, or complex
6. If interactive, describe the specific behaviour
7. Responsive requirements (mobile / tablet / desktop layouts)
8. Style variations needed (layout options, colour themes, other)
9. Content editor constraints (max items, required fields, conditional visibility)
10. Accessibility requirements beyond defaults
11. Integration points (HubDB, CRM, external API, none)

If `$ARGUMENTS` was provided and looks like a module name, use it as the answer to question 1 and proceed to question 2.

## Step 2 — Generate the module

Read the following reference files before generating code:

- [field-patterns.md](field-patterns.md) — all fields.json patterns, defaults, and gotchas
- [meta-reference.md](meta-reference.md) — meta.json template and validation rules
- [template.html](template.html) — canonical module.html boilerplate

Also read the coding standards references:
- `.claude/skills/frontend-standards/references/css-standards.md`
- `.claude/skills/frontend-standards/references/javascript-standards.md`
- `.claude/skills/frontend-standards/references/accessibility-standards.md`
- `.claude/skills/frontend-standards/references/design-tokens.md`

### Naming conventions

Convert the module name to all required formats:

| Source | Format | Example (`feature_cards`) |
|---|---|---|
| Directory | `snake_case.module` | `feature_cards.module` |
| CSS class | `.m-camelCase` | `.m-featureCards` |
| meta.json label | Title Case | `"Feature Cards"` |
| Field names | `snake_case` | `heading_text` |

Multi-word names use camelCase in CSS (`.m-featureCards`, NOT `.m-feature-cards`). Single-word names stay lowercase (`.m-card`).

### File generation order

Create all files in `modules/page/[module_name].module/` (or appropriate subdirectory):

1. **fields.json** — following field-patterns.md strictly
2. **meta.json** — following meta-reference.md strictly
3. **module.html** — using template.html as the base, with frontend-standards references for HTML standards
4. **module.css** — following `.claude/skills/frontend-standards/references/css-standards.md` for CSS standards
5. **module.js** — only if interactive behaviour is needed, following `.claude/skills/frontend-standards/references/javascript-standards.md` for JS standards

### Vendor library loading

Two patterns exist for loading vendor libraries. Choose based on whether the library is always needed or conditionally needed:

**Pattern 1: `meta.json` assets (always loaded)** — use when the vendor library is required whenever the module is on the page:

```json
{
  "css_assets": [{ "path": "../../../css/vendor/vendor.odometer.css", "autoload": true }],
  "js_assets": [{ "path": "../../../js/vendor/vendor.odometer.js", "autoload": true }]
}
```

**Pattern 2: `require_css`/`require_js` in `module.html` (conditionally loaded)** — use when the library is only needed under certain conditions (e.g., carousel only when multiple items exist):

```html
{%- if module.items|length > 1 -%}
{{ require_css(get_asset_url('../../../css/vendor/vendor.splide.css')) }}
{{ require_js(get_asset_url('../../../js/vendor/vendor.splide.js'), { position: "footer", async: true }) }}

{% require_js position='footer' %}
<script>
  window.lazyModuleInit('.js-moduleName', function(container) {
    // Initialise vendor library when module scrolls into view
  });
</script>
{% end_require_js %}
{%- endif -%}
```

**Key details:**
- `window.lazyModuleInit()` uses IntersectionObserver for deferred init — use it for heavy modules (carousels, video, counters)
- Path convention: modules are 3 directories deep, so vendor paths use `../../../` to reach project root
- When using `meta.json` assets, `host_template_types` is **mandatory** — without it HubSpot blocks CSS/JS
- Available vendor libraries: Splide (carousels), Plyr (video), lite-youtube (YouTube embeds), Odometer (animated counters). Check `css/vendor/` and `js/vendor/` for files

### Code standards summary

- **CSS**: BEM with `.m-[camelCase]` prefix, flat selectors (no nesting), mobile-first, design system tokens
- **HTML**: Semantic, WCAG 2.1 AA, no macro imports, `{{ name }}` for unique IDs
- **JS**: Vanilla only, IIFE with `'use strict'`, `.js-*` classes for targeting, `data-*` for config
- **Fields**: All required fields must have defaults, image fields need all 6 keys, link fields need complete structure

### Macros — safe vs deprecated

**Use these:**
- `text_helpers.render_heading(module.module_heading, module.enable_module_heading, name)`
- `image_helper.render_responsive_images(item, 'class-name')`

**Do NOT use (silently fail):**
- `style_helpers.render_module_padding()` — REMOVED from codebase; use inline `style` attribute on `.o-wrapper--module` instead
- `link_helper.render_button()` — render buttons inline
- `link_helper.render_module_footer_cta()` — use inline CTA pattern

## Step 3 — Validate before output

Run through this quick checklist mentally before presenting files:

1. **Repeaters** — `group_occurrence_meta` + array defaults?
2. **Buttons** — Core Code structure with `button_type`, `link_settings.link_field`, `link_settings.link_text`?
3. **Links** — Complete defaults with `url`, `open_in_new_tab`, `no_follow`?
4. **Images** — All 6 default keys: `size_type`, `src`, `alt`, `loading`, `width`, `height`?
5. **Spacing** — `inherited_value.default_value_path` on number fields? Path: `style > spacing_alignment > spacing > desktop/mobile > padding_top/padding_bottom`?
6. **Meta** — UPPERCASE categories, has `icon`, `description`, `host_template_types`? No `content_tags` or `module_id`?
7. **Template** — No imports, correct macro calls, `|safe` for rich text, inline `style` attribute on `.o-wrapper--module` for spacing?
8. **CSS class** — camelCase (`.m-featureCards`, not `.m-feature_cards`)?
9. **All required fields** — Have defaults?
10. **Rich text features** — `"bulleted_list"`, `"numbered_list"` (NOT `"ul"`, `"ol"`)?

## Rules

- Generate complete, upload-ready files — no placeholders or TODOs in field structures
- Include `inline_help_text` on non-obvious fields
- Provide sensible defaults that demonstrate the module's intended layout
- Spacing field names MUST be `padding_top` and `padding_bottom` (NOT `top`/`bottom`)
- Footer CTAs and module spacing MUST use inline patterns (NOT deprecated macros)
- Use `{%- -%}` whitespace-trimming tags for clean HTML output
- Use `{% editor_placeholder %}` for empty content when `is_in_editor`
- Asset paths for modules in subdirectories: `../../../css/vendor/...` (3 levels up)

## Post-Generation

After generating all module files, offer to run `/qa-review` against the new module to catch any issues before upload. If the user accepts, invoke the qa-review skill with the new module's path.

## Self-improvement

- If this module reveals a new HubSpot upload error, update [meta-reference.md](meta-reference.md) with the error and fix
- If a field pattern causes issues, update [field-patterns.md](field-patterns.md) with the correction
- If the user corrects a naming convention or template pattern, update this SKILL.md accordingly
