# Module Documentation Templates

These templates define the structure for Client Guide and Technical Specification documents. All content must be derived from the actual module codebase files — never inferred or invented.

---

## Client Guide Template

```markdown
# [Module Name] — Client Guide

## What is this module?

[2-3 sentences in plain English. What it displays, what purpose it serves, when a CMS user would reach for it.]

## When should you use it?

- **[Context]** — [one-line explanation]
- **[Context]** — [one-line explanation]
- [4-6 items total]

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

## Technical Specification Template

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

[Paste exact meta.json content from codebase]

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

## Key Rules

**Field specification**
- Every field table must include: Field label, `machine_name`, Type, Required, Default, Null behaviour, Notes.
- Machine names must come from `fields.json` exactly — do not rename or guess.
- Null behaviour must be explicit for every optional field.
- Spacing group is always last in `fields.json`.

**HTML structure**
- Copy `module.html` content exactly. Do not rewrite or improve it.
- Present it as a single fenced code block.

**JavaScript**
- If `module.js` is empty or absent, omit the Behaviour specification section entirely.
- If JS is present, the responsibility boundary section is mandatory.

**Accessibility**
- All images require meaningful alt text fields — note in field guide and QA checklist.
- Modules with autoplay media: note `prefers-reduced-motion` requirements.
