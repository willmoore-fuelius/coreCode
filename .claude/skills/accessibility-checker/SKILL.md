---
name: accessibility-checker
description: Run a WCAG 2.2 AA accessibility audit against HubSpot modules or the full codebase. Checks ARIA patterns, focus management, colour contrast, keyboard navigation, semantic HTML, and new WCAG 2.2 criteria. Also trigger when the user says "accessibility audit", "WCAG check", "a11y review", "check accessibility", "is this accessible", "run axe", or asks about keyboard navigation, screen reader support, focus management, or ARIA compliance.
argument-hint: module-path or all
---

# Accessibility Checker Skill

You are auditing the Core Code HubSpot CMS theme for WCAG 2.2 AA accessibility compliance.

## Reference Files

- **WCAG Audit Checklist** → read `../optimise-codebase/accessibility.md` (canonical checklist — shared with optimise-codebase)
- **Front-end Accessibility Standards** → read `.claude/skills/frontend-standards/references/accessibility-standards.md`

## Invocation Modes

Based on `$ARGUMENTS`:

- **Module path** (e.g. `modules/page/accordion.module`) — audit that specific module
- **`all`** or no arguments — full codebase accessibility scan

## Step 1 — Scope the Audit

**Single module:** Read `module.html`, `module.css`, `module.js`, `fields.json`.

**Full codebase:** Scan all module directories plus:
- `templates/layouts/base.html` (skip links, landmarks)
- `templates/partials/header.html` (sticky header focus obscuring)
- `templates/partials/footer.html` (footer landmark)
- `css/global/` (focus styles, SR utilities)

## Step 2 — Run the WCAG Audit

Load `../optimise-codebase/accessibility.md` and check every applicable criterion against the code.

For each finding, record:
- **File** and line reference
- **WCAG Criterion** (e.g. 2.4.7 Focus Visible)
- **Severity** (High / Medium / Low)
- **What's wrong**
- **Proposed fix** (specific code change)

## Step 3 — Present Findings

Group findings by severity:

1. **High** — WCAG failures (missing ARIA, no keyboard access, focus traps, missing pause controls)
2. **Medium** — Partial compliance or best-practice gaps
3. **Low** — Polish and enhancement opportunities

### Summary

```
High: X findings
Medium: Y findings
Low: Z findings
Total: N
```

## Step 4 — Apply Fixes (with confirmation)

Ask the user which fixes to apply:
- **All** — apply everything
- **High only** — apply only WCAG failures
- **Cherry pick** — user selects specific items

## Automated Audit Script

An axe-core audit script is available at `scripts/axe-audit.mjs`. This can be run against a live URL to complement the static code audit. Note: this requires Node.js and the `@axe-core/playwright` package.

```bash
node .claude/skills/accessibility-checker/scripts/axe-audit.mjs https://your-site.com/page
```

## Rules

- Never break existing functionality
- Preserve HubL syntax when editing HTML
- Follow the project's existing patterns (`.show-for-sr` class, design tokens)
- WCAG 2.2 items marked [2.2 NEW] are criteria beyond WCAG 2.1
- Focus on AA compliance; note AAA recommendations as informational
