---
name: fix-module
description: Diagnose and fix HubSpot module upload errors. Paste the error message and module path to get a targeted fix. Also trigger when the user pastes a HubSpot CLI error, mentions "upload failed", "hs upload error", "hs watch error", "internal error", "module won't upload", or describes an error when deploying a module to HubSpot.
argument-hint: module-path
---

# Fix HubSpot Module Upload Error

You are diagnosing and fixing a HubSpot module upload error. Follow this process:

## Step 1 — Get the error

If `$ARGUMENTS` includes a module path, read the module files. Ask for the error message if not provided.

Read these files from the module:
- `fields.json`
- `meta.json`
- `module.html`

## Step 2 — Diagnose

Match the error against the known error table below. If it doesn't match, analyse the module files against the validation rules.

### Known error table

| Error message | Root cause | Fix |
|---|---|---|
| `internal error` | Missing `description`, `icon`, or other required meta.json keys | Add all required meta.json fields |
| `CSS or Javascript is not allowed on modules with ANY content type` | Missing `host_template_types` in meta.json | Add `"host_template_types": ["PAGE", "BLOG_POST", "BLOG_LISTING"]` |
| `'link' is required but no default is set` | Incomplete link field default, or cascading from broken meta.json | Fix meta.json first; ensure all link fields have complete defaults with `url.type`, `url.href`, `url.content_id`, `open_in_new_tab`, `no_follow` |
| `'X' is not a valid category` | Lowercase category value | Use UPPERCASE: `"BODY_CONTENT"`, `"MEDIA"`, `"TEXT"`, etc. |
| `Cannot deserialize value of type java.util.ArrayList` | `content_tags` included in meta.json | Remove `content_tags` entirely — auto-generated |
| `Value for field with an occurrence must be an array` | Repeater default is `{}` instead of `[]` | Use `"default": []` or `"default": [{...}]` |
| `property_value_path can only be set for complex field types` | Wrong `inherited_value` key | Change to `"default_value_path"` |
| `Missing template: CoreCode/modules/macros/...` | Macro import in module.html | Remove import lines — macros are global in `base.html` |
| Empty footer CTA output | `link_helper.render_module_footer_cta()` macro silently fails | Replace with inline CTA pattern (see below) |
| No spacing / padding output | `style_helpers.render_module_padding()` macro has been REMOVED | Replace with inline `style` attribute on `.o-wrapper--module` (see below) |
| `'X' is required but no default is set` (image) | Image field missing complete default | Add all 6 keys: `size_type`, `src`, `alt`, `loading`, `width`, `height` |
| Form picker shows "No results found" | Using new-style HubSpot forms | Forms must be created with the legacy/classic form builder |

### Inline CTA pattern (replacement for deprecated macro)

```html
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
```

### Inline spacing pattern (replacement for REMOVED macro)

The `.o-wrapper--module` div gets a `style` attribute with four CSS custom properties:

```html
<div class="o-wrapper o-wrapper--module" style="--moduleTopSpacingMobile: {{ module.style.spacing_alignment.spacing.mobile.padding_top }}px; --moduleBottomSpacingMobile: {{ module.style.spacing_alignment.spacing.mobile.padding_bottom }}px; --moduleTopSpacingDesktop: {{ module.style.spacing_alignment.spacing.desktop.padding_top }}px; --moduleBottomSpacingDesktop: {{ module.style.spacing_alignment.spacing.desktop.padding_bottom }}px;">
```

If you find a module using the old inline `<style>` block pattern (setting `--moduleTopSpacing`/`--moduleBottomSpacing` with a `@media` query), migrate it to this `style` attribute pattern.

## Step 3 — Fix

Apply the fix directly to the module files. Explain what was wrong and what was changed.

## Step 4 — Validate

After fixing, run a quick validation:

1. **meta.json** — has label, description, icon, host_template_types, UPPERCASE categories, no forbidden fields?
2. **fields.json** — all required fields have defaults? Repeaters use `group_occurrence_meta` with array defaults? Images have all 6 keys?
3. **module.html** — no macro imports? No deprecated/removed macros? Inline `style` attribute on `.o-wrapper--module` with spacing variables?

## Rules

- Always fix meta.json issues first — many other errors cascade from broken meta.json
- If the error doesn't match the table, read all module files thoroughly and check against field-patterns.md and meta-reference.md in the scaffold-module skill
- If this is a new error pattern, update this SKILL.md's error table with the new entry. This is the single source of truth for upload errors — CLAUDE.md and scaffold-module/meta-reference.md reference this table rather than duplicating it

## Post-Fix

After fixing the upload error and validating, offer to run `/qa-review` against the module to catch any remaining standards violations beyond the upload error that was fixed.
