# HubSpot Module Spec Writing Brief

This file is for Claude Code. Read it in full before taking any action.

---

## What you are doing

For each of the five modules listed below, you will:

1. Read the existing module files from this codebase (`module.html`, `module.js`, `fields.json`, `meta.json`).
2. Create two new Confluence child pages under the module's existing parent page:
   - `[Module Name] — Client Guide`
   - `[Module Name] — Technical Specification`
3. Update the existing module parent page to a clean index (two-line description + links to both child pages), matching the Accordion parent page pattern.

The codebase is the authoritative source. All machine names, field types, defaults, HTML structure, class names, data attributes, and JS patterns must be derived from the actual files — not inferred or invented.

---

## Confluence connection

- **Base URL:** `https://fuelius.atlassian.net/wiki`
- **Space key:** `HSS`
- **Cloud ID:** `8189e593-65b5-4b22-aa75-50a8779ffd27`
- **Content Modules parent page ID:** `2654276`

Use the Atlassian MCP server to create and update pages. All pages use `markdown` content format.

---

## Reference pages — read these before writing any spec

These are the canonical examples. Read them before writing any module.

| Page | URL | Purpose |
|---|---|---|
| Accordion parent (index pattern) | https://fuelius.atlassian.net/wiki/spaces/HSS/pages/18448394 | Shows the correct parent page structure |
| Accordion — Client Guide | https://fuelius.atlassian.net/wiki/spaces/HSS/pages/1399160836 | Canonical client guide template |
| Accordion — Technical Specification | https://fuelius.atlassian.net/wiki/spaces/HSS/pages/1397096472 | Canonical technical spec template |
| fields.json & meta.json Reference | https://fuelius.atlassian.net/wiki/spaces/HSS/pages/1399160858 | Field type definitions, global component JSON — read before writing any fields.json section |
| Content Modules parent | https://fuelius.atlassian.net/wiki/spaces/HSS/pages/2654276 | Global component definitions (module heading, footer CTA, spacing) |

---

## Five modules to action

| Module | Existing Confluence page ID | Module directory (find in codebase) |
|---|---|---|
| Banner - Static | `18677782` | `banner_static.module` (or similar snake_case) |
| Banner - Hero | `18710529` | `banner_hero.module` (or similar) |
| Features | `18710573` | `features.module` (or similar) |
| Call to action | `18710643` | `call_to_action.module` (or similar) |
| Testimonial | `18448476` | `testimonial.module` (or similar) |

Locate each module directory in the repo. If the directory name differs from the pattern above, use whatever name is present in the filesystem.

---

## Client guide template

Reproduce this structure exactly for each module. Sections marked optional may be omitted if not applicable to the module.

```markdown
# [Module Name] — Client Guide

## What is this module?

[2–3 sentences in plain English. What it displays, what purpose it serves, when a CMS user would reach for it.]

## When should you use it?

- **[Context]** — [one-line explanation]
- **[Context]** — [one-line explanation]
- [4–6 items total]

## Design reference

Design mockups will be provided per project. Contact your project lead for design assets before populating this module.

## Content preparation checklist

Before building this module, prepare:

1. [Action item]
2. [Action item]
[Numbered list of what the CMS user needs ready before they start]

## Field guide

| Field | What it does | Required | Guidance |
|---|---|---|---|
| [Field label] | [Plain-English description] | Yes / No | [Character limits, format hints, constraints] |

[If the module has repeatable groups, add a sub-heading per group with its own table.]

## Best practices

- [Specific guidance with numeric ranges where possible]
- [Character count recommendations]
- [Content quality guidance]

## Common pitfalls to avoid

- [Pitfall 1]
- [Pitfall 2]
[Maximum 5 items]
```

---

## Technical specification template

Reproduce this structure exactly. All content must be derived from the codebase files.

```markdown
# [Module Name] — Technical Specification

## Module reference

| Property | Value |
|---|---|
| Directory | `[snake_case.module]` |
| ITCSS block class | `.m-[camelCase]` |
| JS container class | `.js-[camelCase]` (omit row if no JS) |
| `meta.json` label | `"[Label]"` |
| `meta.json` category | `"[CATEGORY]"` |
| Client guide | [link] |

> **Claude Code:** Before writing any `fields.json` or `meta.json`, read the [HubSpot Module — fields.json & meta.json Reference](https://fuelius.atlassian.net/wiki/spaces/HSS/pages/1399160858) in full.

---

## Global components

| Component | Applies | Notes |
|---|---|---|
| Module heading | Yes / No | [If yes: rendered via `text_helpers.render_heading()`] |
| Module footer CTA | Yes / No | [If yes: rendered inline — `link_helper.render_module_footer_cta()` is deprecated] |
| Spacing / padding | Yes | Always present. Set via inline `style` attribute on `.o-wrapper--module` with `--moduleTopSpacingMobile`, `--moduleBottomSpacingMobile`, `--moduleTopSpacingDesktop`, `--moduleBottomSpacingDesktop`. |

---

## Fields specification

**Global null rule:** If an optional field is empty, its associated element must not be rendered. No empty wrappers, no placeholder markup.

### [Section name — e.g. Global module settings / [Group name] (repeatable group)]

**Group machine name:** `[name]` (include for repeatable groups only)
**Minimum items:** [n] (include for repeatable groups only)
**Maximum items:** [n or Unlimited] (include for repeatable groups only)

| Field label | `machine_name` | Type | Required | Default | Null behaviour | Notes |
|---|---|---|---|---|---|---|

---

## meta.json

[Paste exact meta.json content from codebase, or reconstruct from codebase values]

---

## fields.json

[Complete fields.json derived from codebase. Include global component groups in correct order: module-specific fields first, then module_heading (if applicable), then module_footer_cta (if applicable), then style/spacing last.]

---

## HTML structure

[Complete module.html content from codebase, formatted as a code block]

---

## Behaviour specification

[Only include this section if the module has JavaScript. Omit entirely for static/layout-only modules.]

### Initial state

[Describe the DOM state on page load]

### JavaScript responsibility boundary

JavaScript is responsible for state and animation class toggling only:

- [List what JS does — derived from module.js]

JavaScript must not:

- Inject inline styles (`element.style.*`) for any purpose.
- Restructure, move, clone, or otherwise modify the DOM.
- Calculate or set heights, widths, or offsets programmatically.

All visual transitions are handled exclusively by CSS.

### Interaction model

| Interaction | Result |
|---|---|

### ARIA state management

| Attribute | Element | Value |
|---|---|---|

### Focus management

[Describe focus behaviour]

---

## Accessibility requirements

| WCAG criterion | Requirement | Implementation for this module |
|---|---|---|
| 1.4.3 Contrast (Minimum) | 4.5:1 ratio for normal text, 3:1 for large text | [Module-specific note] |
| 2.1.1 Keyboard | All functionality operable via keyboard | [Module-specific note] |
| 2.4.7 Focus Visible | Keyboard focus indicator must be visible | [Module-specific note] |
| 4.1.2 Name, Role, Value | UI components must have accessible name, role, and state | [Module-specific note] |

[Add additional WCAG criteria relevant to this specific module. Remove criteria that are not applicable.]

---

## QA checklist

> This checklist is for internal use during development QA. All items must pass before handoff to client UAT.

### Responsive behaviour

- [ ] Renders correctly at 320px, 576px, 768px, 992px, 1200px, and 1400px
- [ ] No horizontal scrolling at any breakpoint
- [ ] [Module-specific responsive checks]

### [Interaction behaviour — only if JS is present]

- [ ] [Interaction checks derived from behaviour specification]
- [ ] No inline styles are present on any element after interaction
- [ ] DOM structure is identical before and after interaction

### ARIA and accessibility

- [ ] [ARIA checks specific to this module]

### Content validation

- [ ] [Content edge cases: minimum items, maximum items, optional fields omitted, optional fields populated]
- [ ] Module heading renders correctly when enabled; not rendered when disabled
- [ ] Module footer CTA renders correctly when populated; not rendered when empty
- [ ] Module padding applies correctly at all breakpoints

### Content quality flags (flag to project lead, not a hard block)

- [ ] [Module-specific content quality thresholds]
```

---

## Parent page index template

Replace each module's existing parent page content with this pattern:

```markdown
# [Module Name]

[2-sentence description of what the module does.]

- [Module Name — Client Guide](link)
- [Module Name — Technical Specification](link)
```

---

## Key rules — do not deviate from these

**Field specification**
- Every field table must include: Field label, `machine_name`, Type, Required, Default, Null behaviour, Notes.
- Machine names must come from `fields.json` exactly — do not rename or guess.
- Null behaviour must be explicit for every optional field.
- `required` is only valid on top-level fields in `fields.json`, not on children within groups.
- Spacing group is always last in `fields.json`.
- Global component groups (module_heading, module_footer_cta, style) are copied verbatim from the [fields.json reference page](https://fuelius.atlassian.net/wiki/spaces/HSS/pages/1399160858) — do not reconstruct them from memory.

**HTML structure**
- Copy `module.html` content exactly. Do not rewrite or improve it.
- Present it as a single fenced code block.

**JavaScript**
- If `module.js` is empty or absent, omit the Behaviour specification section entirely.
- If JS is present, the responsibility boundary section is mandatory.
- JS must not inject inline styles, restructure the DOM, or calculate dimensions programmatically. State this explicitly regardless of what the existing JS does — it is a constraint on future development.

**Accessibility**
- Use `<blockquote>` for testimonial quote markup — note this in the accessibility section.
- Hero banner with video: note autoplay must be disabled for users with prefers-reduced-motion; video must not autoplay with audio.
- All images require meaningful alt text fields — note in field guide and QA checklist.

**Confluence**
- Child pages must be created as children of the module's existing parent page ID (listed in the modules table above).
- Content format: `markdown`.
- After creating child pages, update the parent page using the parent page ID.
- Do not modify any page outside the five listed module parent page IDs and their new children.

---

## Execution order

Process one module at a time, in this order:

1. Call to action (simplest — no JS, no media)
2. Testimonial (no JS, single instance)
3. Features (no JS, repeatable items)
4. Banner - Static (no JS or minimal JS, single instance with image)
5. Banner - Hero (most complex — slider JS, media type toggle, video)

For each module:
1. Read `fields.json`, `meta.json`, `module.html`, `module.js` from the codebase.
2. Read the Accordion reference pages if not already in context.
3. Create the Client Guide page.
4. Create the Technical Specification page.
5. Update the parent page to the index pattern.
6. Confirm completion before moving to the next module.