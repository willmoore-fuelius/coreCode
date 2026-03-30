# Validation and Self-Correction Layer - Implementation Brief

This document is the implementation brief for adding automated validation and self-correction to the stitch-to-hubspot skill. It covers all agreed decisions, reference data, script specifications, conventions file corrections, and SKILL.md pipeline updates.

Use this as the single source of truth when implementing in Claude Code.

---

## Architecture Overview

Two validation layers run at different points in the pipeline:

- **Layer 1 (per-module):** JSON validation of `fields.json` and `meta.json` immediately after each module is generated during Phase 3. Findings are auto-fixed where possible.
- **Layer 2 (full-theme):** CSS and HubL lint checks after all modules are generated (end of Phase 3). Findings are warnings only - no auto-fix.

### Tooling

- Shell scripts using `jq` for JSON validation, `grep`/`sed` for pattern matching
- No Node dependencies, no `package.json`
- Scripts are pipeline-internal only (called by the skill, not standalone CLI tools)
- Scripts live in `.claude/skills/stitch-to-hubspot/scripts/`
- **`jq` dependency:** Claude Code's Ubuntu container includes `jq` by default. If not present, install via `sudo apt-get install -y jq` at the start of the pipeline. Each script should check for `jq` availability and exit with a clear error if missing.

### Output Format

Plain text, one finding per line:

```
SEVERITY|FILE|RULE|MESSAGE
```

Severities: `ERROR` (auto-fixable, blocks progress), `WARNING` (reported only)

Examples:

```
ERROR|modules/hero.module/fields.json|invalid_type|Field "description" has type "textarea" - expected valid type from whitelist
ERROR|modules/hero.module/fields.json|reserved_name|Field has name "label" - reserved field name
ERROR|modules/hero.module/fields.json|missing_default|Field "subtitle" (type: text) has no "default" property
ERROR|modules/hero.module/fields.json|missing_help_text|Field "subtitle" has no "help_text" or "inline_help_text"
ERROR|modules/hero.module/meta.json|invalid_content_type|content_types contains "GLOBAL_CONTENT" - not in valid set
WARNING|modules/hero.module/meta.json|deprecated_key|"host_template_types" is deprecated - use "content_types"
WARNING|css/modules/hero.css|raw_hex|Line 14: hex value "#333333" found outside :root
WARNING|css/modules/hero.css|missing_media_query|No @media block found
WARNING|css/modules/hero.css|ungated_animation|Line 22: transition not wrapped in prefers-reduced-motion
```

---

## Layer 1 Failure Sequence

When per-module validation finds errors:

1. **Validate** - run the validation script against the module's `fields.json` and `meta.json`
2. **Auto-fix** - apply deterministic corrections for all ERROR findings, re-validate
3. **Doc lookup** - if still failing, fetch the relevant HubSpot developer documentation URL from the reference file, review current platform requirements, attempt an informed fix, re-validate
4. **Hard stop** - if still failing after doc-informed fix, stop and report the full context of what was tried and what failed

---

## Reference File: HubSpot Documentation URLs

Create file: `.claude/skills/stitch-to-hubspot/references/hubspot-doc-urls.md`

```markdown
# HubSpot Developer Documentation URLs

Reference URLs for validation and self-correction. Fetch these when automated
validation fails after the first auto-fix attempt, to check whether platform
requirements have changed.

## Module Fields Reference

Valid field types, field properties, default structures:
https://developers.hubspot.com/docs/cms/building-blocks/module-theme-fields

## Module Fields Overview

Field groups, repeating fields, style fields, visibility, inheritance:
https://developers.hubspot.com/docs/cms/reference/fields/overview

## Module Configuration (meta.json)

Module meta.json properties, content_types, categories, icons, dependencies:
https://developers.hubspot.com/docs/cms/reference/modules/configuration

## Theme Structure

theme.json, theme fields.json, theme file organisation:
https://developers.hubspot.com/docs/cms/building-blocks/themes

## Modules Overview

Module structure, file layout, HubL rendering, drag-and-drop:
https://developers.hubspot.com/docs/cms/building-blocks/modules
```

---

## Reference File: Valid Field Types

Create file: `.claude/skills/stitch-to-hubspot/references/valid-field-types.json`

This is the authoritative whitelist sourced from the HubSpot developer docs
(https://developers.hubspot.com/docs/cms/building-blocks/module-theme-fields).

```json
{
  "valid_module_field_types": [
    "alignment",
    "backgroundimage",
    "blog",
    "boolean",
    "border",
    "choice",
    "color",
    "cta",
    "crmobject",
    "crmobjectproperty",
    "date",
    "datetime",
    "email",
    "embed",
    "file",
    "followupemail",
    "font",
    "form",
    "gradient",
    "group",
    "hubdbrow",
    "hubdbtable",
    "icon",
    "image",
    "link",
    "logo",
    "menu",
    "number",
    "page",
    "richtext",
    "simplemenu",
    "spacing",
    "tag",
    "text",
    "textalignment",
    "url",
    "videoplayer"
  ],
  "known_invalid_types": {
    "textarea": {
      "auto_fix": "richtext",
      "reason": "Not a valid HubSpot field type. Use richtext for formatted text or text for plain text."
    }
  },
  "style_only_types": [
    "alignment",
    "backgroundimage",
    "border",
    "gradient",
    "spacing",
    "textalignment"
  ],
  "default_templates": {
    "text": "",
    "richtext": null,
    "boolean": false,
    "number": null,
    "image": { "src": "", "alt": "", "loading": "lazy" },
    "link": { "url": { "content_id": null, "type": "EXTERNAL", "href": "" }, "open_in_new_tab": false, "no_follow": false },
    "url": { "content_id": null, "href": "", "type": "EXTERNAL" },
    "color": { "color": "#000000", "opacity": 100 },
    "choice": "",
    "icon": { "name": "accessible-icon", "unicode": "f368", "type": "REGULAR" },
    "font": { "size": 16, "size_unit": "px", "color": "#000000", "styles": {} },
    "blog": null,
    "date": null,
    "datetime": null,
    "email": null,
    "file": null,
    "form": { "response_type": "inline", "message": "Thanks for submitting the form." },
    "menu": null,
    "page": null,
    "tag": null,
    "cta": null,
    "embed": { "source_type": "oembed" },
    "logo": { "override_inherited_src": false, "src": null, "alt": null },
    "videoplayer": [],
    "spacing": { "padding": { "top": { "value": 0, "units": "px" }, "bottom": { "value": 0, "units": "px" }, "left": { "value": 0, "units": "px" }, "right": { "value": 0, "units": "px" } } },
    "alignment": { "horizontal_align": "CENTER", "vertical_align": "MIDDLE" },
    "backgroundimage": { "src": "", "background_position": "MIDDLE_CENTER", "background_size": "cover" },
    "border": {},
    "gradient": { "colors": [], "side_or_corner": { "verticalSide": "BOTTOM", "horizontalSide": null } },
    "textalignment": { "text_align": "LEFT" },
    "simplemenu": [],
    "crmobject": null,
    "crmobjectproperty": null,
    "hubdbrow": null,
    "hubdbtable": null,
    "followupemail": null,
    "group": "__SKIP__"
  }
}
```

---

## Reference File: Valid meta.json Values

Create file: `.claude/skills/stitch-to-hubspot/references/valid-meta-values.json`

```json
{
  "valid_content_types": [
    "ANY",
    "LANDING_PAGE",
    "SITE_PAGE",
    "BLOG_POST",
    "BLOG_LISTING",
    "EMAIL",
    "KNOWLEDGE_BASE",
    "QUOTE_TEMPLATE",
    "CUSTOMER_PORTAL",
    "WEB_INTERACTIVE",
    "SUBSCRIPTION",
    "MEMBERSHIP"
  ],
  "valid_categories": [
    "blog",
    "body_content",
    "commerce",
    "design",
    "functionality",
    "forms_and_buttons",
    "media",
    "social",
    "text"
  ],
  "deprecated_keys": {
    "host_template_types": {
      "replacement": "content_types",
      "severity": "WARNING",
      "message": "host_template_types is deprecated. Use content_types instead."
    }
  }
}
```

---

## Script Specification: validate-module.sh

Location: `.claude/skills/stitch-to-hubspot/scripts/validate-module.sh`

**Purpose:** Validate a single module's `fields.json` and `meta.json` against platform rules.

**Usage:** `bash .claude/skills/stitch-to-hubspot/scripts/validate-module.sh <module-path>`

Where `<module-path>` is the path to the `.module` directory (e.g. `modules/page/hero.module`).

**Inputs:**
- `<module-path>/fields.json`
- `<module-path>/meta.json`
- `.claude/skills/stitch-to-hubspot/references/valid-field-types.json` (whitelist)
- `.claude/skills/stitch-to-hubspot/references/valid-meta-values.json` (meta.json valid values)

**Path resolution:** The script must resolve reference file paths relative to its own location, not the working directory. Use `SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"` and reference files as `"$SCRIPT_DIR/../references/valid-field-types.json"`.

**Dependencies:** `jq` must be available. The script should check for `jq` on first run and exit with a clear error if missing.

**Exit codes:**
- `0` - no errors (warnings may still be present in output)
- `1` - one or more errors found

### fields.json Checks

**1. invalid_type (ERROR)**
Walk every field at every nesting depth (including inside group `children` arrays and repeater fields). Check that `type` is in the `valid_module_field_types` whitelist.

Auto-fix: replace `textarea` with `richtext` (the only known mis-generation). For any other unknown type, no deterministic auto-fix is available - this triggers the doc lookup step in the failure sequence immediately (skip the re-validate-after-auto-fix step for this finding).

**2. reserved_name (ERROR)**
Walk every field at every nesting depth. Check that `name` is not `"label"`.

Auto-fix: prefix with contextual name derived from nearest parent group name. If no parent group, use `field_label`. E.g. `"label"` inside group `"stats"` becomes `"stat_label"`.

**3. missing_default (ERROR)**
Every field where `type` is not `"group"` must have a `"default"` property. The value `"__SKIP__"` in `default_templates` for `group` means groups are excluded from this check.

Auto-fix: insert a sensible default based on the field's type, using the `default_templates` lookup from `valid-field-types.json`.

**4. missing_help_text (ERROR)**
Every field where `type` is not `"group"` must have at least one of `"help_text"` or `"inline_help_text"`.

Auto-fix: generate `help_text` from the field's `label` value. Pattern: `"Controls the {lowercase label} for this module."`. E.g. label `"Hero Heading"` becomes `"Controls the hero heading for this module."`. Imperfect but passes validation and is editable by the developer later.

**5. style_field_placement (WARNING)**
Fields with types in the `style_only_types` list (`alignment`, `backgroundimage`, `border`, `gradient`, `spacing`, `textalignment`) should only appear inside a group with `"name": "styles"` and `"tab": "STYLE"`. If found outside a styles group, emit a warning - HubSpot may accept the upload but the field will not render correctly in the editor.

No auto-fix (requires understanding the module's field architecture).

### meta.json Checks

**6. missing_label (ERROR)**
`label` must be present and a non-empty string.

Auto-fix: derive from the module directory name. E.g. `hero.module` becomes `"Hero"`.

**7. invalid_content_type (ERROR)**
If `content_types` is present, every value must be in the `valid_content_types` whitelist.

Auto-fix: remove invalid values. If array becomes empty, replace with `["SITE_PAGE"]`.

**8. deprecated_key (WARNING)**
If `host_template_types` is present, emit a warning suggesting migration to `content_types`.

No auto-fix (both still work).

**9. invalid_category (ERROR)**
If `categories` is present, every value (lowercased) must be in the `valid_categories` whitelist.

Auto-fix: remove invalid values.

**10. icon_type_check (ERROR)**
If `icon` is present, it must be a string.

Auto-fix: remove the `icon` key if it is not a string.

---

## Script Specification: lint-theme.sh

Location: `.claude/skills/stitch-to-hubspot/scripts/lint-theme.sh`

**Purpose:** Run CSS and HubL quality checks across the full generated theme.

**Usage:** `bash .claude/skills/stitch-to-hubspot/scripts/lint-theme.sh <theme-root>`

Where `<theme-root>` is the root directory of the theme.

**Path resolution:** Same pattern as `validate-module.sh` - resolve paths relative to the script's own location using `SCRIPT_DIR`.

**Dependencies:** Standard shell utilities only (`grep`, `sed`, `find`). No `jq` required for this script.

**Exit codes:**
- `0` - always (warnings do not block)

All findings are `WARNING` severity. No auto-fix.

### CSS Checks

Run against all `.css` files inside `modules/` directories (i.e. `module.css` files). Global CSS files (`css/` directory at theme root) are excluded - these may legitimately contain hex values in `:root` and other global declarations.

**1. raw_hex (WARNING)**
Any hex colour value (`#` followed by 3, 4, 6, or 8 hex characters) found in a module CSS file. Module CSS should use CSS custom properties exclusively - hex values belong only in the theme's global `:root` declaration.

Implementation: `grep -nE '#[0-9a-fA-F]{3,8}' <file>`. May produce false positives in comments or data URIs, which is acceptable for a warning.

**2. missing_media_query (WARNING)**
A module CSS file that contains no `@media` rule at all.

Implementation: `grep -c '@media' <file>` returns 0.

**3. ungated_animation (WARNING)**
Any `transition` or `animation` CSS property found in a module CSS file that does not also contain a `prefers-reduced-motion` media query.

Implementation: find files containing `transition:`, `transition-`, `animation:`, or `animation-` properties. If the same file does NOT contain the string `prefers-reduced-motion`, emit a warning. This is a file-level heuristic - it cannot verify that a specific animation is inside the correct media query block, only that the concept is present in the file. Acceptable for a warning.

**4. bem_naming (WARNING)**
CSS class selectors that don't follow the `.m-moduleName__element--modifier` pattern.

Implementation: extract class selectors from CSS files using `grep -oE '\.[a-zA-Z][a-zA-Z0-9_-]*'`, then check against regex `^\.m-[a-z][a-zA-Z0-9]+(__[a-z][a-zA-Z0-9]+)?(--[a-z][a-zA-Z0-9]+)?$`. Report selectors that don't match. Exclude pseudo-elements, pseudo-classes, and known framework utility classes (e.g. `.sr-only`, `.visually-hidden`). Note: element selectors (`h1`, `p`, etc.) and attribute selectors are not class selectors and should not be flagged.

**5. important_usage (WARNING)**
Any use of `!important` in module CSS.

Implementation: `grep -n '!important' <file>`

### HubL Checks

Run against all `.html` files in the theme's `templates/` and `partials/` directories.

**6. invalid_module_path (WARNING)**
`{% module %}` and `{% module_block %}` tags that reference a module path where the corresponding `.module` directory does not exist in the theme.

Implementation: extract the module path parameter from HubL tags. The path is typically the first string parameter, e.g. `{% module "hero" path="../modules/page/hero.module" %}` - extract the `path` value. Also check for the shorthand `{% module "module_name" path="..." %}` syntax. Resolve the path relative to the template file's location (for relative paths starting with `../`) or relative to the theme root (for absolute paths). Check whether the resolved `.module` directory exists.

---

## Conventions File Corrections

The following changes need to be applied to `.claude/skills/stitch-to-hubspot/references/core-code-conventions.md` to align with the authoritative HubSpot developer documentation.

### 1. meta.json Template

Replace the current meta.json template and rules section with:

```json
{
  "label": "Hero Banner",
  "css_assets": [],
  "js_assets": [],
  "content_types": ["SITE_PAGE"],
  "categories": ["design"],
  "is_available_for_new_content": true
}
```

Note: `icon` is omitted from the template. Custom SVG icons require a URL to a file hosted in the HubSpot File Manager, which is not available at theme generation time. HubSpot will display its default module icon. Icons can be added manually post-upload if needed.

**meta.json rules (platform constraints):**

- **`label` is required.** The display name shown to content editors.
- **`content_types` controls where the module is available.** Valid values: `ANY`, `LANDING_PAGE`, `SITE_PAGE`, `BLOG_POST`, `BLOG_LISTING`, `EMAIL`, `KNOWLEDGE_BASE`, `QUOTE_TEMPLATE`, `CUSTOMER_PORTAL`, `WEB_INTERACTIVE`, `SUBSCRIPTION`, `MEMBERSHIP`. Use `["SITE_PAGE"]` for standard page content modules. Use `["ANY"]` for modules that should be available everywhere.
- **Do not use `host_template_types`.** It is the deprecated name for `content_types`. Both still work, but `content_types` is the current standard.
- **`icon` accepts a URL to an SVG file** (max 10kb, single colour, hosted in HubSpot File Manager). If no custom icon is available, omit the `icon` property entirely - HubSpot will use the default wrench/paintbrush icon.
- **`categories` values must be from the valid set** (case-insensitive): `blog`, `body_content`, `commerce`, `design`, `functionality`, `forms_and_buttons`, `media`, `social`, `text`. A module can have up to three categories.
- **`is_available_for_new_content`** should be `true` for content modules. Set to `false` only for modules used exclusively in templates that should not appear in the editor's module picker.

### 2. Remove the `description` Requirement

Remove any rule stating that `description` is required in `meta.json`. The HubSpot developer documentation does not list `description` as a `meta.json` property for modules. The test run finding that reported this may have had a different root cause.

### 3. Remove the Icon Keyword Restriction

Remove the rule stating "always use `"icon": "module"` unless the icon name is confirmed valid" and the list of known valid keyword values (`module`, `equal`, `menu`, `company`). The `icon` property accepts a URL to an SVG file, not a keyword.

### 4. Update SKILL.md meta.json Template

The `SKILL.md` file also contains a meta.json template (in the Phase 3 module generation instructions). This template must match the corrected conventions. Replace it with the same template shown above (without `description`, without `icon` keyword, using `content_types` instead of `host_template_types`).

---

## SKILL.md Pipeline Updates

### Phase 3 Changes

After each module is generated (all four files: `module.html`, `module.css`, `fields.json`, `meta.json`), add this step before moving to the next module:

```
### Per-module validation

After generating each module, run:

bash .claude/skills/stitch-to-hubspot/scripts/validate-module.sh <module-path>

The script checks fields.json and meta.json and outputs findings in the format:
SEVERITY|FILE|RULE|MESSAGE

The script does NOT auto-fix files. It only reports findings. Claude Code
reads the output and applies fixes directly to the JSON files.

If the script exits with code 1 (errors found):

1. Parse each ERROR line. Apply the fix for each rule:
   - invalid_type: replace the type value (textarea -> richtext)
   - reserved_name: rename the field (prefix with parent group context)
   - missing_default: add a default from valid-field-types.json default_templates
   - missing_help_text: add help_text derived from the field label
   - missing_label: set label from module directory name
   - invalid_content_type: remove invalid values, default to ["SITE_PAGE"]
   - invalid_category: remove invalid values
   - icon_type_check: remove the icon key
   Note: style_field_placement is a WARNING and does not require a fix.
2. Re-run validation.
3. If errors persist after fix:
   a. Read the relevant HubSpot documentation URL from
      .claude/skills/stitch-to-hubspot/references/hubspot-doc-urls.md
   b. Fetch the page to check current platform requirements.
   c. Attempt an informed fix based on what the docs say.
   d. Re-run validation.
4. If errors still persist, STOP. Report the full validation output and
   the fixes that were attempted. Do not proceed to the next module.

WARNING findings are logged but do not block progress.
```

### Phase 3 Completion Step (new)

After all modules are generated and individually validated, add:

```
### Full-theme lint

Run:

bash .claude/skills/stitch-to-hubspot/scripts/lint-theme.sh <theme-root>

All findings are warnings. Review the output and note any patterns that
indicate systemic issues (e.g. raw hex values in every module CSS file
suggests the design token extraction missed colours). Report the full
lint output at the end of Phase 3.
```

### Phase 4 Changes

Phase 4 (QA Checklist) should reference the validation results rather than re-checking the same rules manually. Update Phase 4 to:

```
### Phase 4: QA Summary

1. Confirm all modules passed Layer 1 validation (zero ERROR findings).
2. Review Layer 2 lint warnings and note any that require manual attention.
3. Check the following items that are NOT covered by automated validation:
   - Layout-critical fields have required: true where appropriate
   - Repeater fields have sensible min/max occurrence limits
   - Module preview renders correctly with default field values
   - Editor UX: field labels are clear, tab assignment (CONTENT/STYLE) is logical
   - Responsive behaviour matches design intent at all breakpoints
   - Accessibility: focus states, ARIA attributes, keyboard interaction
   - Performance: no unnecessary DOM nesting, images use lazy loading
```

---

## Implementation Order

Recommended sequence for implementing in Claude Code:

1. **Apply the conventions file corrections** to `core-code-conventions.md` first. The validation scripts and the SKILL.md pipeline both reference the conventions, so they must be correct before anything else is built.
2. Create the three reference files (`hubspot-doc-urls.md`, `valid-field-types.json`, `valid-meta-values.json`)
3. Write `validate-module.sh` and test against a known-good module and a deliberately broken module
4. Write `lint-theme.sh` and test against existing theme output
5. Update `SKILL.md` with the Phase 3 and Phase 4 pipeline changes
6. Update `.claude/commands/new-theme.md` if it references Phase 3/4 steps directly
7. Run a test generation to verify the pipeline end-to-end

---

## Known Risks and Limitations

- **`jq` recursive field walking:** `fields.json` has arbitrary nesting depth (groups inside groups, repeaters inside groups). The `jq` queries must use recursive descent (`..`) to find all fields, not just top-level iteration. Test with at least 3 levels of nesting.
- **CSS lint false positives:** The hex, animation, and BEM checks are all heuristic. False positives are expected and acceptable since Layer 2 is warnings-only. Do not attempt to eliminate all false positives - the cost outweighs the benefit for a shell-based linter.
- **HubSpot doc URL stability:** If HubSpot restructures their developer docs, the URLs in `hubspot-doc-urls.md` will break. The failure mode is graceful - the doc lookup step fails, the pipeline hard-stops, and the developer investigates manually. Low frequency risk, easy to fix when it occurs.
- **`content_types` vs `host_template_types` migration:** The conventions correction tells the skill to use `content_types`, but existing modules in the Core Code scaffold (structural/kept modules) may still use `host_template_types`. The lint will emit warnings for these. They do not need fixing immediately - both still work.
- **Auto-fix for `reserved_name` is contextual:** The fix derives a prefix from the parent group name. If the field structure is flat (no parent group), the fallback `field_label` is generic. This may need manual review after fix.
- **`style_field_placement` check requires group context:** The script needs to track whether a field is nested inside a group with `"name": "styles"` and `"tab": "STYLE"`. This requires stateful traversal in `jq`, which is more complex than the other checks. If implementation proves too complex for a shell script, this check can be deferred to the prose checklist.
- **The scripts do not validate JSON syntax itself.** If `fields.json` or `meta.json` is malformed JSON (missing brackets, trailing commas), `jq` will fail to parse. The script should catch `jq` parse errors and report them as a separate `ERROR|<file>|json_parse_error|<jq error message>` finding before attempting any field-level checks.