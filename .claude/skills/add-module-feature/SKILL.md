---
name: add-module-feature
description: Add a new field, field group, or feature to an existing HubSpot module. Handles fields.json updates, template changes, and CSS additions while preserving existing structure. Also trigger when the user says "add a field", "add feature to module", "extend this module", "add a repeater", "add a CTA", "add a heading to this module", or describes a new capability they want added to an existing module.
argument-hint: module-path
---

# Add Feature to Existing Module

Add a new field, field group, or interactive feature to an existing HubSpot module without breaking the current structure.

## Step 1 — Understand the existing module

Read all files from the module specified by `$ARGUMENTS`:

- `fields.json` — understand current field structure, IDs, and naming patterns
- `meta.json` — check category and template types
- `module.html` — understand current template structure and macro usage
- `module.css` — understand current CSS class naming
- `module.js` — understand current JS patterns (if present)

Also read the field patterns reference for any new fields:
- `.claude/skills/scaffold-module/field-patterns.md`

And the coding standards:
- `.claude/skills/frontend-standards/references/css-standards.md`
- `.claude/skills/frontend-standards/references/javascript-standards.md`
- `.claude/skills/frontend-standards/references/accessibility-standards.md`
- `.claude/skills/frontend-standards/references/design-tokens.md`

## Step 2 — Plan the addition

Ask the user what they want to add. Common additions:

- **New field** — text, image, link, choice, rich text, boolean
- **New field group** — grouped set of related fields
- **New repeater** — repeatable group with items
- **New layout variant** — choice field controlling CSS class
- **New interactive behaviour** — requires module.js changes
- **Footer CTA** — standardised button group for module bottom
- **Module heading** — render_heading macro integration

## Step 3 — Implement

### fields.json changes

- Match existing naming patterns (check `id` format used in existing fields)
- Place content fields before the `style` group (style/spacing is always last)
- Follow all field patterns from `field-patterns.md`
- For new groups: include `expanded`, `group_occurrence_meta`, `display_width`
- For new images: include all 6 default keys
- For new links: include complete default structure

### module.html changes

- Add new template code in the correct position within the existing structure
- Maintain the existing wrapper pattern
- Use `{{ name }}` for any new IDs
- Add null/empty checks before rendering optional fields
- Use `|safe` for rich text fields
- Follow the inline patterns for buttons/CTAs (NOT deprecated macros)

### module.css changes

- Use the existing module's BEM block name (`.m-existingName__newElement`)
- Follow camelCase within BEM segments
- Add mobile-first styles with `@media (width >= 992px)` for desktop
- Use design system tokens

### module.js changes (if needed)

- Follow existing patterns in the file
- Use `.js-*` classes for new DOM targets
- Add to existing IIFE — don't create a separate one
- Guard against missing elements

## Step 4 — Validate

After making changes, verify:

1. All new field IDs are unique across the entire fields.json
2. All field references in module.html match fields.json paths exactly
3. All new CSS classes in module.html have styles in module.css
4. All new `.js-*` classes have corresponding JS targeting
5. No deprecated macros introduced
6. Spacing group is still last in fields.json

## Rules

- Never restructure or rename existing fields — this breaks live content
- Preserve all existing field IDs — changing them orphans saved content
- Add new fields, don't modify defaults of existing ones (unless explicitly requested)
- If adding a feature that requires JS and the module doesn't have module.js yet, create it following the IIFE pattern from `.claude/skills/frontend-standards/references/javascript-standards.md`

## Post-Implementation

After implementing the feature and validating:

1. Offer to run `/qa-review` against the module to verify the addition meets all standards
2. If Confluence documentation exists for this module, note that it may need updating via `/write-module-docs`
