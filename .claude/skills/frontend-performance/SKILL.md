---
name: frontend-performance
description: Run a front-end performance audit against HubSpot modules or the full codebase. Checks image optimisation, CSS render performance, JavaScript efficiency, resource loading, and Core Web Vitals impact. Also trigger when the user says "performance audit", "Lighthouse check", "check page speed", "Core Web Vitals", "LCP", "CLS", "INP", "slow page", or asks about lazy loading, image optimisation, or resource loading improvements.
argument-hint: module-path or all
---

# Front-End Performance Skill

You are auditing the Core Code HubSpot CMS theme for front-end performance, targeting Google PageSpeed Insights / Lighthouse scores and Core Web Vitals.

## Reference Files

- **Performance Checklist** → read `../optimise-codebase/performance.md` (canonical checklist — shared with optimise-codebase)
- **Front-end Performance Standards** → read `.claude/skills/frontend-standards/references/performance-standards.md`

## Invocation Modes

Based on `$ARGUMENTS`:

- **Module path** (e.g. `modules/page/card_grid.module`) — audit that specific module
- **`all`** or no arguments — full codebase performance scan

## Step 1 — Scope the Audit

**Single module:** Read `module.html`, `module.css`, `module.js`, `fields.json`.

**Full codebase:** Scan all module directories plus:
- `templates/layouts/base.html` (resource hints, font loading, preconnects)
- `css/main.css` (global CSS patterns)
- `js/modules/` (lazy init, debouncing, observers)

## Step 2 — Run the Performance Audit

Load `../optimise-codebase/performance.md` and check every applicable item against the code.

For each finding, record:
- **File** and line reference
- **Core Web Vital** affected (LCP, CLS, INP, TBT, FCP)
- **Severity** (High / Medium / Low)
- **What's wrong**
- **Proposed fix** (specific code change)
- **Impact** (what metric it improves)

## Step 3 — Present Findings

Group findings by Core Web Vital impact:

1. **High** — directly affects LCP, CLS, or INP
2. **Medium** — improves TBT, FCP, or page weight
3. **Low** — best practices and maintenance

### Summary

```
Images: X findings
CSS: Y findings
JavaScript: Z findings
Resource Loading: W findings
Total: N
```

## Step 4 — Apply Fixes (with confirmation)

Ask the user which fixes to apply:
- **All** — apply everything
- **High only** — apply only high-impact fixes
- **Cherry pick** — user selects specific items

## Lighthouse Audit Script

A Lighthouse audit script is available at `scripts/lighthouse-audit.mjs`. This can be run against a live URL to complement the static code audit. Note: this requires Node.js and the `lighthouse` package.

```bash
node .claude/skills/frontend-performance/scripts/lighthouse-audit.mjs https://your-site.com/page
```

## Rules

- Never break existing functionality
- Preserve HubL syntax when editing HTML
- Don't add `loading="lazy"` to above-fold images (banners, heroes)
- Above-fold images should use `fetchpriority="high"`
- Don't duplicate attributes — check before adding
- Use `@supports` fallbacks for newer CSS features like `content-visibility`
- Follow existing patterns (design tokens, ITCSS structure)
