# Email-Safe HTML and CSS Reference

This reference covers the constraints of HTML email rendering, with particular focus on Microsoft Outlook 2013-2019 (Word rendering engine) and Outlook.com/OWA.

## The Outlook Problem

Microsoft Outlook 2007-2019 uses the Microsoft Word rendering engine (not a browser engine) to display HTML emails. This means most modern CSS is ignored or misinterpreted. Outlook.com and OWA use a browser engine but strip many CSS properties.

**The practical implication:** All layout must be table-based. CSS is limited to inline styles on individual elements, with a narrow subset of supported properties.

---

## Layout: Tables Only

### Basic Structure

Every email module that handles its own layout must use nested HTML tables. The outer table constrains width; inner tables create columns.

```html
<!--[if mso]>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600">
<tr>
<td>
<![endif]-->

<div style="max-width: 600px; margin: 0 auto;">
  <!-- Module content here -->
</div>

<!--[if mso]>
</td>
</tr>
</table>
<![endif]-->
```

The `<!--[if mso]>` conditional comments target Microsoft Office (Outlook). The inner `<div>` with `max-width` handles modern clients. The MSO table provides the fixed width that Outlook requires because it ignores `max-width`.

### Multi-Column Layout

For two or more columns, use ghost tables for Outlook with inline-block fallbacks for modern clients.

```html
<!--[if mso]>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600">
<tr>
<td width="290" valign="top">
<![endif]-->

<div style="display: inline-block; width: 100%; max-width: 290px; vertical-align: top;">
  <!-- Column 1 content -->
</div>

<!--[if mso]>
</td>
<td width="20"></td>
<td width="290" valign="top">
<![endif]-->

<div style="display: inline-block; width: 100%; max-width: 290px; vertical-align: top;">
  <!-- Column 2 content -->
</div>

<!--[if mso]>
</td>
</tr>
</table>
<![endif]-->
```

**Key points:**
- Column widths in MSO tables must be explicit pixel values
- Gutters are created with empty `<td>` spacer cells in the MSO table
- `display: inline-block` on the divs handles modern clients
- `width: 100%` combined with `max-width` allows columns to stack on mobile
- `valign="top"` on MSO `<td>` elements - Outlook ignores `vertical-align` CSS

### Three-Column Layout

Same pattern, three `<td>` elements with spacer cells between them. Keep total width (columns + gutters) equal to the container width.

---

## Spacing

### Padding

Padding is the safest spacing mechanism in email. Apply it on `<td>` elements.

```html
<td style="padding: 20px 30px;">
  Content here
</td>
```

**Outlook quirks:**
- `padding` on `<div>`, `<p>`, or `<a>` is inconsistent in Outlook. Always use padding on `<td>`.
- Percentage-based padding is unreliable. Use pixel values only.

### Margin

Margin is unreliable in Outlook. Avoid it where possible.

- `margin` on block elements is stripped or inconsistent in Outlook 2013-2019
- Use padding on the containing `<td>` instead
- If margin is unavoidable, use `margin: 0` resets and control spacing exclusively via `<td>` padding

### Spacer Rows

For vertical spacing between sections, use dedicated spacer rows:

```html
<tr>
  <td style="padding: 0; font-size: 1px; line-height: 1px; height: 20px;">&nbsp;</td>
</tr>
```

The `&nbsp;`, `font-size`, and `line-height` prevent Outlook from collapsing the row.

---

## Typography

### Safe Properties

These work across all major email clients:

- `font-family` (web-safe stacks only - see below)
- `font-size` (px only - Outlook ignores rem, em)
- `font-weight`
- `font-style`
- `line-height` (px values safest; unitless ratios work in most clients but not all)
- `color`
- `text-align`
- `text-decoration`
- `text-transform`
- `letter-spacing`

### Web-Safe Font Stacks

```
font-family: Arial, Helvetica, sans-serif;
font-family: Georgia, 'Times New Roman', Times, serif;
font-family: 'Trebuchet MS', Helvetica, sans-serif;
font-family: Verdana, Geneva, sans-serif;
```

### Custom Fonts (@font-face)

Custom fonts work in Apple Mail, iOS Mail, and some Android clients. They do not work in Outlook (any version) or Gmail. Always provide a web-safe fallback.

```html
<style>
  @font-face {
    font-family: 'CustomFont';
    src: url('https://example.com/font.woff2') format('woff2');
    font-weight: 400;
    font-style: normal;
  }
</style>

<!-- In the body -->
<td style="font-family: 'CustomFont', Arial, Helvetica, sans-serif; font-size: 16px;">
```

**Important:** Host fonts on a CDN with CORS headers. Do not use Google Fonts links in email - Gmail strips them.

### Headings

Do not use `<h1>`-`<h6>` tags in email. Different clients apply wildly different default styles. Use styled `<td>` or `<p>` elements instead:

```html
<td style="font-family: Arial, Helvetica, sans-serif; font-size: 24px; font-weight: bold; line-height: 30px; color: #333333; padding-bottom: 10px;">
  Heading Text
</td>
```

### Paragraphs

Use `<p>` tags with explicit resets:

```html
<p style="margin: 0 0 16px 0; font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 24px; color: #555555;">
  Paragraph text.
</p>
```

Always set `margin: 0` or explicit margins on `<p>` tags. Default paragraph margins vary significantly across clients.

---

## Images

### Basic Image Pattern

```html
<img src="https://example.com/image.jpg"
     alt="Descriptive alt text"
     width="600"
     height="400"
     style="display: block; max-width: 100%; height: auto; border: 0; outline: none; text-decoration: none;"
/>
```

**Critical rules:**
- Always include `width` and `height` HTML attributes (not just CSS). Outlook requires them.
- `display: block` prevents the gap below images in some clients.
- `border: 0` removes the blue border on linked images in older clients.
- `max-width: 100%; height: auto` allows responsive scaling in modern clients while the HTML attributes provide Outlook's fixed dimensions.

### Responsive Images

Outlook ignores `max-width`. The HTML `width` attribute is the final word in Outlook. For modern clients, CSS `max-width: 100%` with `height: auto` handles scaling.

### Background Images

Background images require VML for Outlook support:

```html
<!--[if gte mso 9]>
<v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:600px; height:400px;">
<v:fill type="tile" src="https://example.com/bg.jpg" color="#333333" />
<v:textbox inset="0,0,0,0">
<![endif]-->

<div style="background-image: url('https://example.com/bg.jpg'); background-color: #333333; background-size: cover; background-position: center;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
    <tr>
      <td style="padding: 40px 30px;">
        Content over background
      </td>
    </tr>
  </table>
</div>

<!--[if gte mso 9]>
</v:textbox>
</v:rect>
<![endif]-->
```

**Note:** VML background images do not scale. Set explicit dimensions matching the container. Always provide a `background-color` fallback.

---

## Buttons (Bulletproof)

### Padding-Based Button (Recommended)

```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" bgcolor="#007bff" style="border-radius: 4px;">
      <!--[if mso]>
      <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word"
        href="https://example.com"
        style="height: 44px; v-text-anchor: middle; width: 200px;"
        arcsize="9%"
        strokecolor="#007bff"
        fillcolor="#007bff">
      <w:anchorlock/>
      <center style="color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold;">
        Button Text
      </center>
      </v:roundrect>
      <![endif]-->
      <!--[if !mso]><!-->
      <a href="https://example.com"
         style="display: inline-block; background-color: #007bff; color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; line-height: 44px; text-align: center; text-decoration: none; width: 200px; border-radius: 4px; -webkit-text-size-adjust: none;">
        Button Text
      </a>
      <!--<![endif]-->
    </td>
  </tr>
</table>
```

**Why this pattern:**
- VML `<v:roundrect>` renders a clickable, rounded button in Outlook with the entire surface as the click target
- The `<!--[if !mso]><!-->` block handles all non-Outlook clients with a standard `<a>` tag
- `line-height` equal to the button height vertically centres text without padding (avoids Outlook padding bugs)
- `border-radius` on the `<td>` and `<a>` provides rounded corners in modern clients; VML `arcsize` handles Outlook

### Simple Button (No Border Radius Needed)

If rounded corners are not required, a simpler approach:

```html
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td align="center" bgcolor="#007bff">
      <a href="https://example.com"
         style="display: inline-block; background-color: #007bff; color: #ffffff; font-family: Arial, Helvetica, sans-serif; font-size: 16px; font-weight: bold; line-height: 44px; text-align: center; text-decoration: none; width: 200px; -webkit-text-size-adjust: none;">
        Button Text
      </a>
    </td>
  </tr>
</table>
```

---

## CSS Properties: Safe vs Unsafe

### Safe (use freely)

| Property | Notes |
|----------|-------|
| `background-color` | Use on `<td>`, `<table>`, `<div>` |
| `border` | Full shorthand works. Also `border-top`, `border-bottom`, etc. |
| `border-collapse` | On `<table>` elements |
| `border-radius` | Ignored by Outlook but safe to include for modern clients |
| `color` | |
| `direction` | |
| `display: block / inline-block / none` | Outlook ignores `none` on some elements |
| `font-family / font-size / font-weight / font-style` | px values for size |
| `height` | On `<td>`, `<img>`. Outlook respects HTML attribute over CSS. |
| `line-height` | px values safest |
| `list-style-type` | |
| `padding` | On `<td>` only for reliability. px values. |
| `text-align` | |
| `text-decoration` | |
| `text-transform` | |
| `vertical-align` | On `<td>` elements. Use `valign` HTML attribute for Outlook. |
| `width` | On `<td>`, `<table>`, `<img>`. Outlook respects HTML attribute over CSS. |

### Unsafe (avoid or use with fallbacks)

| Property | Issue |
|----------|-------|
| `background-image` | Requires VML for Outlook (see Background Images section) |
| `background-size / background-position` | Ignored by Outlook |
| `box-shadow` | Ignored by Outlook, stripped by Gmail |
| `display: flex / grid` | Not supported in Outlook or older Gmail |
| `float` | Unreliable in Outlook. Use table columns instead. |
| `gap` | Not supported in email layout |
| `margin` | Inconsistent in Outlook. Use `<td>` padding instead. |
| `max-width` | Ignored by Outlook. Use MSO conditional tables. |
| `opacity` | Ignored by Outlook |
| `overflow` | Ignored by Outlook |
| `position` | Not supported in email |
| `transform` | Not supported in email |
| `transition / animation` | Not supported in email |

### Gmail-Specific Stripping

Gmail (web and app) strips:
- `<style>` blocks in the `<head>` (moves some inline, strips others)
- `<link>` stylesheet references
- `class` and `id` attributes (in some contexts)
- `position`, `float` in many cases

**Implication:** All critical styles must be inline on the element. Do not rely on `<style>` blocks for layout-critical rules. Use `<style>` blocks only for progressive enhancement (e.g. media queries for clients that support them).

---

## Responsive Email

### Media Queries

Media queries work in Apple Mail, iOS Mail, Android (native), and Outlook.com/OWA. They do not work in Gmail (any platform) or Outlook desktop.

```html
<style>
  @media screen and (max-width: 600px) {
    .stack-column {
      display: block !important;
      width: 100% !important;
      max-width: 100% !important;
    }
    .mobile-padding {
      padding-left: 20px !important;
      padding-right: 20px !important;
    }
  }
</style>
```

**Note:** `!important` is required in email media queries because inline styles have higher specificity. This is one of the few legitimate uses of `!important` in email development.

### Fluid-Hybrid Approach

For clients that strip media queries (Gmail, Outlook desktop), use a fluid-hybrid approach:

- Outer container: fixed width via MSO conditional, `max-width` via CSS
- Columns: `display: inline-block` with `width: 100%` and `max-width: [column width]`
- On narrow viewports, `inline-block` elements naturally stack when the container is too narrow to hold them side by side

This is the pattern shown in the Multi-Column Layout section above. It provides responsive stacking without media queries.

---

## HubSpot Email Module Specifics

### Module Structure

HubSpot email modules follow the same `module.html` / `fields.json` structure as CMS modules, but the HTML output must follow email constraints.

### HubL in Email Modules

HubL templating works normally in email modules. Use it for:
- Field value rendering: `{{ module.heading }}`
- Conditional display: `{% if module.show_button %}`
- Loops for repeaters: `{% for item in module.items %}`

### Inline Styles with HubL

Use HubL to inject field values into inline styles:

```html
<td style="background-color: {{ module.background_color.color }}; padding: {{ module.padding }}px;">
```

### Image Fields

HubSpot image fields provide `src`, `alt`, `width`, and `height`. Use all of them:

```html
{% if module.image.src %}
<img src="{{ module.image.src }}"
     alt="{{ module.image.alt }}"
     width="{{ module.image.width }}"
     height="{{ module.image.height }}"
     style="display: block; max-width: 100%; height: auto; border: 0;" />
{% endif %}
```

### Rich Text Fields

HubSpot rich text in email context outputs `<p>`, `<a>`, `<strong>`, `<em>` tags. These need inline style resets in the email context:

```html
<td style="font-family: Arial, Helvetica, sans-serif; font-size: 16px; line-height: 24px; color: #555555;">
  {{ module.body }}
</td>
```

The `<td>` styles cascade into the rich text content. For finer control, use a `<style>` block to target elements within the module (works in clients that support `<style>`, progressive enhancement for others).

---

## Testing Checklist

After building an email module, verify rendering in:

1. **Outlook 2016** (Word rendering engine) - the most restrictive
2. **Outlook 365 / Outlook.com** (browser-based)
3. **Gmail** (web and mobile app)
4. **Apple Mail** (macOS and iOS)
5. **Mobile** - check stacking behaviour on narrow viewports

For each, check:
- Layout integrity (columns, spacing, alignment)
- Image rendering (dimensions, alt text display when images blocked)
- Button clickability and appearance
- Typography (font fallbacks, line spacing)
- Background colours and borders
- Responsive stacking (if applicable)
