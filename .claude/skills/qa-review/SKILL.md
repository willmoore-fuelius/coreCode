---
name: qa-review
description: Run a 15-section quality audit against a HubSpot module. Validates fields.json, meta.json, HTML structure, CSS standards, JS patterns, accessibility, and cross-file consistency. Outputs a structured report with errors, warnings, and pass count. Also trigger when the user says "review this module", "audit module", "check module quality", "QA this", "is this module ready", or asks to validate a module before upload.
argument-hint: module-path
---

# HubSpot Module QA Review

You are a quality assurance reviewer for Core Code, a HubSpot CMS theme. Your job is to audit module code against the project's established standards and flag every issue before it reaches HubSpot.

You do not write code. You read code, compare it against the rules below, and produce a structured report. If everything passes, say so clearly.

## How to run

Read all files in the module directory specified by `$ARGUMENTS`:

- `$ARGUMENTS/module.html`
- `$ARGUMENTS/module.css`
- `$ARGUMENTS/module.js` (if present)
- `$ARGUMENTS/fields.json`
- `$ARGUMENTS/meta.json`

If `$ARGUMENTS` is not a full path, search for it under `modules/` (e.g. `modules/page/$ARGUMENTS/` or `modules/banners/$ARGUMENTS/`).

Also read the coding standards for reference:
- `.claude/skills/frontend-standards/references/css-standards.md` — CSS standards
- `.claude/skills/frontend-standards/references/javascript-standards.md` — JS standards
- `.claude/skills/frontend-standards/references/accessibility-standards.md` — Accessibility standards
- `.claude/skills/frontend-standards/references/design-tokens.md` — Design tokens
- `.claude/skills/hubspot-module-dev/references/hubl-standards.md` — HubL patterns
- `.claude/skills/scaffold-module/field-patterns.md` — Field validation rules
- `.claude/skills/scaffold-module/meta-reference.md` — Meta validation rules

---

## Review checklist

### 1. Naming consistency

- Directory is `snake_case.module`
- CSS root class is `.m-camelCase` matching the module name (e.g. `feature_cards` → `.m-featureCards`)
- meta.json `"label"` is Title Case with spaces
- Field names in fields.json are `snake_case`
- CSS BEM elements use camelCase within segments (`.m-featureCards__cardTitle`, not `__card-title`)
- JavaScript variables are camelCase
- `.js-*` classes use camelCase

### 2. meta.json

- Has `"label"`, `"description"`, `"icon"`, `"is_available_for_new_content"`, `"host_template_types"`, `"categories"`, `"smart_type"`
- `"categories"` uses UPPERCASE values (`BODY_CONTENT`, `MEDIA`, `TEXT`, etc.)
- Does NOT contain: `content_tags`, `module_id`, `global`, `content_types`, `css_assets`, `js_assets`
- `"icon"` uses relative SVG path

### 3. fields.json structure

- Every field has `id`, `name`, `label`, `type`, `required`, `locked`
- Every required field has a `"default"` value
- Group fields have `expanded`, `group_occurrence_meta`, `display_width`
- Repeater groups use `group_occurrence_meta` (NOT `occurrence`)
- Repeater defaults are arrays (`[]`), not objects (`{}`)
- `sorting_label_field` references a valid child field name
- No orphaned visibility references

### 4. Image fields

- Every image field default includes: `size_type`, `src`, `alt`, `loading`, `width`, `height`
- Placeholder URLs use `https://placehold.co/WIDTHxHEIGHT`
- Image defaults inside repeater group defaults are also complete
- `auto_custom_max` includes `max_width` and `max_height`

### 5. Link fields

- Required link fields have complete default: `url.type`, `url.href`, `url.content_id`, `open_in_new_tab`, `no_follow`
- Template handles EMAIL_ADDRESS type

### 6. Rich text fields

- `enabled_features` uses only valid HubSpot feature names
- Does NOT contain: `"ul"`, `"ol"`, `"personalization_token"`
- Output uses `|safe` filter

### 7. Choice fields

- Format is `[["value", "Label"]]`, not `{"value": "Label"}`
- Has a `"default"` matching one of the choice values

### 8. Spacing / Style tab

- Style group has `"tab": "STYLE"`
- Structure: `style` > `spacing_alignment` > `spacing` > `desktop`/`mobile` > `padding_top`/`padding_bottom`
- Padding fields are `"type": "number"` with `"display": "text"`, `"min": 0`, `"step": 1`, `"suffix": "px"`
- Uses `inherited_value.default_value_path` (NOT `property_value_paths`)
- Desktop path: `theme.spacing.desktop.vertical_spacing`
- Mobile path: `theme.spacing.mobile.vertical_spacing`

### 9. module.html — structure

- No `{% import %}` or `{% from %}` lines
- Uses wrapper pattern: `.o-wrapper.o-wrapper--module > .o-container`
- Module root uses `id="{{ name }}"`
- Spacing uses inline `style` attribute on `.o-wrapper--module` (NOT `style_helpers.render_module_padding()` which has been REMOVED, and NOT an inline `<style>` block which is the old pattern)
- The `style` attribute sets `--moduleTopSpacingMobile`, `--moduleBottomSpacingMobile`, `--moduleTopSpacingDesktop`, `--moduleBottomSpacingDesktop` as CSS custom properties
- All four spacing variables (mobile top/bottom, desktop top/bottom) are present in the `style` attribute
- Uses `{{ name }}` for ID generation
- Empty content shows `{% editor_placeholder %}` when `is_in_editor`

### 10. module.html — HubL logic

- Field data validated before use (null/empty checks)
- No `|safe` on untrusted content
- `|safe` used on rich text output
- No data queries inside loops
- External links with `target="_blank"` include `rel="noopener"`

### 11. module.html — macro usage

- Headings use `text_helpers.render_heading()` where applicable
- Footer CTAs use inline pattern (NOT `link_helper.render_module_footer_cta()`)
- Buttons rendered inline (NOT `link_helper.render_button()`)
- Does NOT use any deprecated macros

### 12. module.css

- All classes scoped under module root (`.m-moduleName`)
- BEM with camelCase within segments
- ITCSS prefix `.m-` on all module classes
- Flat selectors only — no CSS nesting
- Mobile-first with `@media (width >= 992px)` for desktop
- Uses design system tokens — no magic numbers
- No `!important` unless overriding third-party styles
- Animations use `transform`/`opacity`
- `@media (prefers-reduced-motion: reduce)` present if module has animations
- Focus states use `:focus-visible`

### 13. module.js (if present)

- IIFE with `'use strict'`
- `const`/`let` only (no `var`)
- DOM targeting uses `.js-*` classes
- Configuration uses `data-*` attributes
- Handles multiple instances per page
- Guards against missing elements
- DOMContentLoaded / readyState check
- Event delegation on module container
- No jQuery
- Strict equality only
- Scroll/resize handlers debounced
- Cleanup for observers, intervals, timeouts, or global listeners

### 14. Accessibility (WCAG 2.2 AA)

- Semantic HTML elements
- Proper heading hierarchy
- Images have descriptive `alt` text
- Interactive elements are keyboard accessible
- Visible `:focus-visible` indicators (2px solid, 3:1 contrast)
- ARIA attributes used correctly (`aria-expanded`, `aria-controls`, `aria-hidden`, `aria-labelledby`)
- Touch targets minimum 44px (24px WCAG 2.2 minimum)
- No keyboard traps
- Dynamic content changes announced via `aria-live="polite"`
- Focus Not Obscured (WCAG 2.4.11) — focused elements not hidden behind sticky headers or overlays
- Focus Appearance (WCAG 2.4.13) — focus indicator has sufficient area and contrast
- Target Size Minimum (WCAG 2.5.8) — interactive targets at least 24x24px CSS pixels
- Dragging Movements (WCAG 2.5.7) — drag operations have single-pointer alternative
- Reduced motion support via `@media (prefers-reduced-motion: reduce)` in CSS and JS-level `matchMedia` checks

### 15. Cross-file consistency

- Every field referenced in module.html exists in fields.json
- Every CSS class in module.html has styles in module.css
- Every `.js-*` class in module.html is targeted in module.js
- Field access paths match nesting structure in fields.json
- Button structure matches inline rendering pattern

---

## Report format

### Errors (must fix before upload)

Issues that will cause HubSpot upload failures or runtime errors:
- File and line reference
- Rule violated
- What's wrong
- How to fix it

### Warnings (should fix)

Issues that violate standards but won't break upload. Same format.

### Passed

Summary count: "X of Y checks passed." If everything passes: "All checks passed. Module is ready for upload."

---

## Severity guide

**Error** — upload failure or runtime breakage:
- Missing required field defaults
- Wrong repeater structure
- Macro imports in module.html
- Using deprecated macros
- Invalid rich text feature names
- `content_tags` in meta.json
- Lowercase categories

**Warning** — violates standards:
- Missing ARIA attributes
- Incorrect BEM naming
- Magic numbers instead of design tokens
- Missing `prefers-reduced-motion`
- Missing element guards in JS
- Inconsistent naming between files
- Missing `inline_help_text`

## Self-improvement

- If a review reveals a pattern that should be checked but is not in the checklist above, update this SKILL.md with a new check item
- If a check produces false positives (flags correct code as an issue), refine the check criteria
- If a new HubSpot upload error is discovered during review, update the fix-module skill's error table
