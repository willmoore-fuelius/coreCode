---
name: frontend-standards
description: Enforce front-end coding standards for HTML, CSS, JavaScript, accessibility, performance, and design tokens across the Core Code HubSpot theme. Use when writing or reviewing any front-end code. Also trigger when the user says "check the standards", "review this CSS", "review this JS", "does this follow conventions", "coding standards", or asks about BEM naming, ITCSS prefixes, design tokens, or accessibility requirements for front-end output.
argument-hint: file-path, review, css, js, accessibility, performance, or tokens
---

# Front-End Standards Skill

You are enforcing and applying the Core Code front-end coding standards. These standards govern all HTML, CSS, and JavaScript output in the HubSpot CMS theme.

**Target environment:** Evergreen browsers only (latest stable Chrome, Edge, Firefox, Safari).

## Reference Files

Load the relevant reference file(s) based on the task:

- **CSS** → read [references/css-standards.md](references/css-standards.md)
- **JavaScript** → read [references/javascript-standards.md](references/javascript-standards.md)
- **Accessibility** → read [references/accessibility-standards.md](references/accessibility-standards.md)
- **Performance** → read [references/performance-standards.md](references/performance-standards.md)
- **Design Tokens** → read [references/design-tokens.md](references/design-tokens.md)

When writing new code, load **all five** reference files. When reviewing existing code, load the relevant subset.

## Invocation Modes

Based on `$ARGUMENTS`:

- **File path** (e.g. `modules/page/accordion.module/module.css`) — review that file against standards
- **`review`** — review all recently changed files against standards
- **`css`** — load CSS standards only, apply to current task
- **`js`** — load JavaScript standards only, apply to current task
- **`accessibility`** — load accessibility standards only, apply to current task
- **`performance`** — load performance standards only, apply to current task
- **`tokens`** — load design tokens reference only
- **No arguments** — load all standards for the current coding task

## When Writing Code

1. Load all five reference files
2. Apply standards as you write — do not retrofit after the fact
3. Ensure every CSS class follows BEM + ITCSS naming
4. Ensure every interactive element is keyboard-accessible with `:focus-visible`
5. Use design system tokens — no magic numbers
6. Follow the module patterns documented in the references

## When Reviewing Code

1. Load the relevant reference files
2. Check the code against each applicable standard
3. Report findings grouped by severity:
   - **Error** — violates a must-follow rule (will cause issues)
   - **Warning** — violates a should-follow convention
   - **Info** — suggestion for improvement
4. For each finding, cite the specific standard and reference file

## Rules

- These standards are mandatory for all new code
- Existing code should be updated to match when it is being modified
- Never introduce jQuery, preprocessors, or `var` declarations
- No Sass-style nesting concatenation (`&__element`, `&--modifier`) - native CSS does not support this
- No nesting deeper than 2 levels
- Always use media query range syntax (`width >= 992px`)
- Always use `:focus-visible` for keyboard focus indicators
- Always use design system tokens from `design-tokens.md`
