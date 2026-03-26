# fields.json Field Patterns Reference

This file contains every field pattern used in Core Code modules. All patterns are validated against HubSpot's upload API.

---

## Standard field properties

Every field object MUST include:

```json
{
  "id": "unique-id",
  "name": "field_name",
  "label": "Field Label",
  "type": "text",
  "required": false,
  "locked": false,
  "display_width": null
}
```

Use `inline_help_text` (NOT `help_text`) for field guidance.

---

## Group fields

```json
{
  "type": "group",
  "children": [],
  "expanded": false,
  "group_occurrence_meta": null,
  "display_width": null,
  "default": {}
}
```

**WARNING**: Do NOT add populated defaults at group level alongside children with their own defaults — this corrupts HubSpot's field data resolution. Only use `"default": {}` for regular groups.

---

## Repeater groups

```json
{
  "type": "group",
  "group_occurrence_meta": {
    "min": 0,
    "max": null,
    "sorting_label_field": "title",
    "default": 3
  },
  "default": [
    { "heading": "Item 1" },
    { "heading": "Item 2" },
    { "heading": "Item 3" }
  ]
}
```

- Property is `group_occurrence_meta` — NOT `occurrence`
- `default` MUST be an array (`[]` or `[{...}]`), NEVER `{}`
- `sorting_label_field` must reference a valid child field name
- Always populate the `default` array with the same number of items as `group_occurrence_meta.default`
- Each default item must include complete values for child fields (including full image and link structures)

---

## Image fields

```json
{
  "type": "image",
  "responsive": true,
  "resizable": false,
  "show_loading": true,
  "default": {
    "size_type": "auto",
    "src": "https://placehold.co/1200x800",
    "alt": "Descriptive alt text",
    "loading": "lazy",
    "width": 1200,
    "height": 800
  }
}
```

- ALL 6 keys required in defaults: `size_type`, `src`, `alt`, `loading`, `width`, `height`
- Placeholder service: `https://placehold.co/WIDTHxHEIGHT`
- For `auto_custom_max` size type, also include `max_width` and `max_height`
- Image defaults inside repeater group defaults must also be complete

### Image in repeater default

```json
"default": [
  {
    "image_field": {
      "size_type": "auto",
      "src": "https://placehold.co/1200x800",
      "alt": "Placeholder image 1",
      "loading": "lazy",
      "width": 1200,
      "height": 800
    },
    "title": "Default title"
  }
]
```

---

## Link fields

```json
{
  "type": "link",
  "supported_types": ["EXTERNAL", "CONTENT", "FILE", "EMAIL_ADDRESS", "BLOG"],
  "show_advanced_rel_options": false,
  "default": {
    "url": {
      "type": "EXTERNAL",
      "href": "",
      "content_id": null
    },
    "open_in_new_tab": false,
    "no_follow": false
  }
}
```

Template access pattern:

```html
{% set href = item.link_field.url.href %}
{% if item.link_field.url.type is equalto "EMAIL_ADDRESS" %}
  {% set href = "mailto:" ~ href %}
{% endif %}

<a href="{{ href }}"
   {% if item.link_field.open_in_new_tab %}target="_blank" rel="noopener"{% endif %}
   {% if item.link_field.no_follow %}rel="nofollow"{% endif %}>
  Link text
</a>
```

---

## Choice fields

Format: `[["value", "Label"], ["value2", "Label2"]]` — NOT `{"value": "Label"}`

```json
{
  "type": "choice",
  "display": "select",
  "choices": [
    ["image", "Image"],
    ["video", "Video"]
  ],
  "default": "image"
}
```

---

## Rich text fields

Valid `enabled_features` values ONLY:

- Emphasis: `"bold"`, `"italic"`, `"underline"`, `"strikethrough"`
- Lists: `"bulleted_list"`, `"numbered_list"` (NOT `"ul"`, `"ol"`)
- Content: `"link"`, `"anchor"`, `"image"`, `"table"`, `"video"`, `"embed"`
- Formatting: `"alignment"`, `"text_color"`, `"background_color"`, `"font_size"`, `"font_family"`
- Advanced: `"cta"`, `"personalize"` (NOT `"personalization_token"`), `"source_code"`

Output: `{{ field|safe }}`

---

## Visibility (conditional fields)

```json
{
  "visibility": {
    "controlling_field": null,
    "controlling_field_path": "parent_group.controlling_field_name",
    "controlling_value_regex": "target_value",
    "property": null,
    "operator": "EQUAL",
    "access": null
  }
}
```

---

## Button group (standardised pattern)

Every module with buttons uses this structure. Render inline — do NOT use `link_helper.render_button()`.

```json
{
  "name": "button",
  "label": "Button",
  "type": "group",
  "children": [
    {
      "name": "button_type",
      "label": "Button type",
      "type": "choice",
      "display": "select",
      "choices": [
        ["none", "None"],
        ["link", "Link"],
        ["cta", "CTA"]
      ],
      "default": "none"
    },
    {
      "name": "button_style",
      "label": "Button style",
      "type": "choice",
      "display": "select",
      "choices": [
        ["primary", "Primary"],
        ["secondary", "Secondary"],
        ["tertiary", "Tertiary"]
      ],
      "default": "primary",
      "visibility": {
        "controlling_field_path": "button.button_type",
        "operator": "EQUAL",
        "controlling_value_regex": "link"
      }
    },
    {
      "name": "link_settings",
      "label": "Link settings",
      "type": "group",
      "visibility": {
        "controlling_field_path": "button.button_type",
        "operator": "EQUAL",
        "controlling_value_regex": "link"
      },
      "children": [
        {
          "name": "link_field",
          "label": "Link",
          "type": "link",
          "default": {
            "url": { "type": "EXTERNAL", "href": "" },
            "open_in_new_tab": false,
            "no_follow": false
          }
        },
        {
          "name": "link_text",
          "label": "Link text",
          "type": "text",
          "default": "Learn more"
        }
      ]
    },
    {
      "name": "cta_settings",
      "label": "CTA settings",
      "type": "group",
      "visibility": {
        "controlling_field_path": "button.button_type",
        "operator": "EQUAL",
        "controlling_value_regex": "cta"
      },
      "children": [
        {
          "name": "cta_field",
          "label": "CTA",
          "type": "cta",
          "default": null
        }
      ]
    }
  ]
}
```

Field names must be `link_field` and `link_text` (NOT `link_url` or `button_text`).

---

## Spacing structure (Style tab)

Core Code uses number fields with `inherited_value`, NOT spacing field type.

### Structure tree

```
style (group, tab: "STYLE")
  spacing_alignment (group)
    spacing (group)
      desktop (group)
        padding_top (number, inherited_value → theme.spacing.desktop.vertical_spacing)
        padding_bottom (number, inherited_value → theme.spacing.desktop.vertical_spacing)
      mobile (group)
        padding_top (number, inherited_value → theme.spacing.mobile.vertical_spacing)
        padding_bottom (number, inherited_value → theme.spacing.mobile.vertical_spacing)
```

### Complete spacing JSON

```json
{
  "id": "unique-style-id",
  "name": "style",
  "label": "Style",
  "required": false,
  "locked": false,
  "type": "group",
  "tab": "STYLE",
  "expanded": false,
  "group_occurrence_meta": null,
  "display_width": null,
  "default": {
    "spacing_alignment": {
      "spacing": {
        "desktop": {},
        "mobile": {}
      }
    }
  },
  "children": [
    {
      "id": "unique-spacing-id",
      "name": "spacing_alignment",
      "label": "Spacing & alignment",
      "inline_help_text": "Settings for customising the modules padding, vertical alignment and maximum width.",
      "required": false,
      "locked": false,
      "type": "group",
      "tab": "STYLE",
      "expanded": false,
      "group_occurrence_meta": null,
      "display_width": null,
      "default": {
        "spacing": {
          "desktop": {},
          "mobile": {}
        }
      },
      "children": [
        {
          "id": "spacing-group",
          "name": "spacing",
          "label": "Spacing",
          "required": false,
          "locked": false,
          "type": "group",
          "tab": "STYLE",
          "expanded": false,
          "group_occurrence_meta": null,
          "display_width": null,
          "default": {
            "desktop": {},
            "mobile": {}
          },
          "children": [
            {
              "id": "desktop-spacing",
              "name": "desktop",
              "label": "Desktop",
              "required": false,
              "locked": false,
              "type": "group",
              "tab": "STYLE",
              "expanded": false,
              "group_occurrence_meta": null,
              "display_width": null,
              "default": {},
              "children": [
                {
                  "id": "padding-top-desktop",
                  "name": "padding_top",
                  "label": "Top padding",
                  "required": false,
                  "locked": false,
                  "type": "number",
                  "display": "text",
                  "display_width": null,
                  "inline_help_text": "Space above the module content (in pixels).",
                  "inherited_value": {
                    "default_value_path": "theme.spacing.desktop.vertical_spacing"
                  },
                  "min": 0,
                  "step": 1,
                  "suffix": "px"
                },
                {
                  "id": "padding-bottom-desktop",
                  "name": "padding_bottom",
                  "label": "Bottom padding",
                  "required": false,
                  "locked": false,
                  "type": "number",
                  "display": "text",
                  "display_width": null,
                  "inline_help_text": "Space below the module content (in pixels).",
                  "inherited_value": {
                    "default_value_path": "theme.spacing.desktop.vertical_spacing"
                  },
                  "min": 0,
                  "step": 1,
                  "suffix": "px"
                }
              ]
            },
            {
              "id": "mobile-spacing",
              "name": "mobile",
              "label": "Mobile",
              "required": false,
              "locked": false,
              "type": "group",
              "tab": "STYLE",
              "expanded": false,
              "group_occurrence_meta": null,
              "display_width": null,
              "default": {},
              "children": [
                {
                  "id": "padding-top-mobile",
                  "name": "padding_top",
                  "label": "Top padding",
                  "required": false,
                  "locked": false,
                  "type": "number",
                  "display": "text",
                  "display_width": null,
                  "inherited_value": {
                    "default_value_path": "theme.spacing.mobile.vertical_spacing"
                  },
                  "min": 0,
                  "step": 1,
                  "suffix": "px"
                },
                {
                  "id": "padding-bottom-mobile",
                  "name": "padding_bottom",
                  "label": "Bottom padding",
                  "required": false,
                  "locked": false,
                  "type": "number",
                  "display": "text",
                  "display_width": null,
                  "inherited_value": {
                    "default_value_path": "theme.spacing.mobile.vertical_spacing"
                  },
                  "min": 0,
                  "step": 1,
                  "suffix": "px"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### Template access pattern

```
module.style.spacing_alignment.spacing.desktop.padding_top
module.style.spacing_alignment.spacing.desktop.padding_bottom
module.style.spacing_alignment.spacing.mobile.padding_top
module.style.spacing_alignment.spacing.mobile.padding_bottom
```

---

## UUID format

HubSpot field UUIDs must be valid hex. Characters `g-z` are NOT valid hex digits. Always use `a-f` range only.

---

## Common errors to avoid

1. Using `"occurrence"` instead of `"group_occurrence_meta"` for repeaters
2. Using `{}` instead of `[]` for repeater defaults
3. Using `"property_value_paths"` instead of `"default_value_path"` for spacing
4. Including `content_tags` in meta.json (causes deserialization errors)
5. Using lowercase categories like `"content"` (must be `"BODY_CONTENT"`)
6. Adding `{% import %}` or `{% from %}` for macros
7. Using deprecated macros instead of inline patterns
8. Using `"ul"`, `"ol"`, or `"personalization_token"` in rich text enabled_features
9. Using hyphenated CSS class names (`.m-feature-cards`) instead of camelCase (`.m-featureCards`)
10. Missing `expanded`, `display_width`, or `group_occurrence_meta` on group fields
11. Using `"help_text"` instead of `"inline_help_text"`
12. Group-level defaults with populated values alongside children defaults (corrupts data)
13. Missing `padding_top`/`padding_bottom` names in spacing (using `top`/`bottom` instead)
