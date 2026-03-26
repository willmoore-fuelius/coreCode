---
name: email-module-dev
description: Build custom HubSpot email modules with HTML that renders correctly across all major email clients, including Outlook 2016 (Word rendering engine). Use this skill whenever the user asks to build, create, or develop a custom email module, email component, or email template module in HubSpot. Also trigger when the user mentions "email module", "email template", "Outlook rendering", "email HTML", "VML", "bulletproof button", "email layout", or discusses building any component intended for use in HubSpot's drag-and-drop email builder. This skill produces table-based, inline-styled HTML with MSO conditional comments and VML fallbacks - output is email-safe by default, eliminating post-build rendering debugging.
argument-hint: module-name or description
---

# HubSpot Email Module Development

You are building a custom module for use in HubSpot's drag-and-drop email builder. The module handles its own internal layout using table-based HTML with inline styles. All output must render correctly in Outlook 2016 (Word rendering engine), Gmail, Apple Mail, and Outlook.com without post-build fixes.

**Target environment:** HubSpot email modules (`module.html` + `fields.json`).

## Reference Files

- **Email-Safe HTML and CSS** → read [references/email-safe-html-css.md](references/email-safe-html-css.md)
- **Field Patterns** → read `.claude/skills/scaffold-module/field-patterns.md` (for fields.json defaults, repeater structure, image fields)

Load the reference files before writing any module code. The email-safe reference contains the complete constraint set for email HTML, including the Outlook-safe property list, VML patterns, and bulletproof button templates. The field patterns reference ensures fields.json follows Core Code conventions (defaults, repeaters, image fields with all 6 keys).

## Core Constraints

These are non-negotiable. Every line of HTML you produce must respect these:

1. **All layout is table-based.** No flexbox, no grid, no float-based columns, no CSS positioning. Use `<table role="presentation">` with `<tr>` and `<td>` for all structural layout.

2. **All styles are inline.** Do not rely on `<style>` blocks for any layout-critical rule. `<style>` blocks are progressive enhancement only (e.g. media queries for clients that support them).

3. **MSO conditional comments for width control.** Outlook ignores `max-width`. Every width-constrained container must have an MSO conditional table wrapping it with an explicit pixel width.

4. **VML for background images and rounded buttons in Outlook.** If the module uses background images or rounded-corner buttons, include VML fallbacks inside MSO conditionals.

5. **Pixel values only.** No `rem`, `em`, or percentage-based sizing for spacing and typography. Percentage widths are acceptable for responsive containers but not for spacing.

6. **Explicit image dimensions.** Every `<img>` must have `width` and `height` HTML attributes in addition to CSS `max-width: 100%; height: auto`.

7. **No CSS properties Outlook ignores.** See the reference file for the full safe/unsafe list. Key exclusions: `max-width` (without MSO table), `margin` (use `<td>` padding), `gap`, `background-image` (without VML), `opacity`, `position`, `transform`.

## Module Structure

### fields.json

Define fields following HubSpot's standard field schema. Common field types for email modules:

- `text` - single-line text (headings, labels)
- `richtext` - formatted body content
- `image` - image picker with src, alt, width, height
- `color` - colour picker (for backgrounds, text colour)
- `link` - URL with text, href, and target
- `choice` - dropdown for predefined options
- `boolean` - toggle (show/hide elements)
- `number` - numeric values (spacing overrides)
- `group` - group related fields
- `group` with `occurrence.max` - repeater for multiple items

### module.html

The template file. Structure:

```html
{# Module: [Name] #}
{# Description: [What it does] #}

{# ============================================================
   Styles (progressive enhancement only - media queries)
   ============================================================ #}
{% if module.enable_responsive is not defined or module.enable_responsive %}
<style>
  @media screen and (max-width: 600px) {
    /* Mobile overrides with !important */
  }
</style>
{% endif %}

{# ============================================================
   Module HTML
   ============================================================ #}

<!--[if mso]>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center">
<tr>
<td>
<![endif]-->

<div style="max-width: 600px; margin: 0 auto;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    {# Module content rows here #}
  </table>
</div>

<!--[if mso]>
</td>
</tr>
</table>
<![endif]-->
```

## Building Patterns

### Image with Text (Side by Side)

The most common email module pattern. Two columns: one image, one text.

```html
<!--[if mso]>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" align="center">
<tr>
<td width="260" valign="top">
<![endif]-->

<div style="display: inline-block; width: 100%; max-width: 260px; vertical-align: top;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="padding: 0;">
        {% if module.image.src %}
        <img src="{{ module.image.src }}"
             alt="{{ module.image.alt }}"
             width="260"
             height="{{ module.image.height }}"
             style="display: block; max-width: 100%; height: auto; border: 0;" />
        {% endif %}
      </td>
    </tr>
  </table>
</div>

<!--[if mso]>
</td>
<td width="20"></td>
<td width="320" valign="top">
<![endif]-->

<div style="display: inline-block; width: 100%; max-width: 320px; vertical-align: top;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="padding: 10px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 24px; color: {{ module.text_color.color|default('#555555') }};">
        {% if module.heading %}
        <p style="margin: 0 0 12px 0; font-size: 22px; font-weight: bold; line-height: 28px; color: {{ module.heading_color.color|default('#333333') }};">
          {{ module.heading }}
        </p>
        {% endif %}
        {{ module.body }}
      </td>
    </tr>
  </table>
</div>

<!--[if mso]>
</td>
</tr>
</table>
<![endif]-->
```

### Multi-Column Content

For three or more equal columns (e.g. feature grid, icon blocks):

- Calculate column widths: `(container_width - (gutters * (columns - 1))) / columns`
- For a 600px container with 20px gutters and 3 columns: `(600 - 40) / 3 = 186px` per column
- Each column gets its own MSO `<td>` with spacer `<td>` elements between them
- Each column's `<div>` uses `display: inline-block; width: 100%; max-width: [column_width]px`

### Repeater Pattern

For modules with a variable number of items (e.g. testimonials, feature list):

```html
{% for item in module.items %}
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
  <tr>
    <td style="padding: {{ '0' if loop.first else '20px' }} 0 0 0;">
      {# Item content #}
    </td>
  </tr>
</table>
{% endfor %}
```

Use `loop.first` to control spacing on the first item. This avoids an orphaned spacer above the first item.

## Rules

1. **Every `<table>` must have `role="presentation"`, `cellpadding="0"`, `cellspacing="0"`, `border="0"`.** No exceptions. `role="presentation"` prevents screen readers from announcing the table as data.

2. **All spacing via `<td>` padding.** Do not use margin. Do not use spacer images. Use padding on `<td>` elements or spacer `<tr>` rows.

3. **Always validate field data before use.** Check `{% if module.image.src %}` before rendering images. Check `{% if module.heading %}` before rendering headings. Defensive templating prevents empty elements in the output.

4. **Use `|default()` filter for colour fields.** `{{ module.text_color.color|default('#555555') }}` ensures a sensible fallback if the colour field is not set.

5. **Always include `bgcolor` attribute alongside `background-color` style on `<td>` elements.** Some older clients read the attribute, not the style.

6. **`<a>` tags need explicit colour and text-decoration.** Email clients apply their own link styles aggressively. Always set `color` and `text-decoration` inline on every `<a>` tag.

7. **No shorthand font declarations.** Use individual `font-family`, `font-size`, `font-weight`, `line-height` properties. The `font` shorthand is inconsistently parsed across email clients.

8. **Test width arithmetic.** Column widths + gutter widths must equal the container width exactly. If they do not, Outlook will break the layout onto multiple rows.

## Pre-Output Validation Checklist

Run through this checklist mentally before presenting files:

1. **Tables** — every `<table>` has `role="presentation"`, `cellpadding="0"`, `cellspacing="0"`, `border="0"`?
2. **MSO conditionals** — every `<!--[if mso]>` has a matching `<![endif]-->`? Every `max-width` container has an MSO table wrapper?
3. **Images** — every `<img>` has `width` and `height` HTML attributes, plus `style="display: block; max-width: 100%; height: auto; border: 0;"`?
4. **Spacing** — all spacing uses `<td>` padding? No `margin` used? No spacer images?
5. **Typography** — no `font` shorthand? Individual `font-family`, `font-size`, `font-weight`, `line-height` on all text containers?
6. **Links** — every `<a>` has explicit `color` and `text-decoration` inline?
7. **Colours** — colour fields use `|default()` filter with hex fallback?
8. **Fields** — all field data validated before use (`{% if module.field %}`)? Image fields check `.src`?
9. **Width arithmetic** — column widths + gutter widths = container width exactly?
10. **No unsafe CSS** — no flexbox, grid, gap, position, transform, opacity, or CSS custom properties in inline styles?
11. **fields.json** — all required fields have defaults? Image defaults have all 6 keys? Repeaters use array defaults?

## What Not To Do

- Do not use `<div>` for layout without an accompanying MSO conditional table
- Do not use CSS classes for layout-critical styles (Gmail strips classes in some contexts)
- Do not use `<h1>`-`<h6>` tags - use styled `<p>` or `<td>` elements
- Do not use `margin` for spacing
- Do not use `max-width` without an MSO conditional table providing the fixed width
- Do not omit `width` and `height` HTML attributes on images
- Do not use web-only CSS features (flexbox, grid, gap, custom properties, calc)
- Do not use SVG in email (Outlook does not support it; use PNG/JPG)
- Do not use `background-image` CSS without a VML fallback for Outlook
- Do not assume `<style>` blocks will be preserved (Gmail strips them in many contexts)

## Post-Generation

After generating all module files, offer to run through the Pre-Output Validation Checklist above with the user. If the module uses fields.json, also suggest reviewing the field structure against `.claude/skills/scaffold-module/field-patterns.md` for completeness.

## Self-improvement

- If a new email rendering issue is discovered (e.g. a property that behaves differently than documented), update [references/email-safe-html-css.md](references/email-safe-html-css.md) with the finding
- If a new email module pattern is useful (e.g. a new layout type), add it to the Building Patterns section above
- If a field pattern causes HubSpot issues in the email context, update this SKILL.md and notify the scaffold-module skill's field-patterns.md
