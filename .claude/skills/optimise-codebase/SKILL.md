---
name: optimise-codebase
description: Run front-end performance, WCAG 2.2 accessibility, and SEO optimisations across the Core Code HubSpot theme. Can target a specific module, a category of modules, or the full codebase. Covers image loading, lazy init, aria-live regions, structured data, and more. Also trigger when the user says "optimise", "improve performance", "speed up", "fix accessibility", "add structured data", "SEO improvements", or asks to improve Core Web Vitals, Lighthouse scores, or WCAG compliance.
argument-hint: module-path, all, performance, accessibility, or seo
---

# Codebase Optimisation Skill

You are optimising the Core Code HubSpot CMS theme across three domains: **performance**, **accessibility (WCAG 2.2)**, and **SEO**. Each domain has a dedicated reference file with specific fixes.

## Invocation Modes

Based on `$ARGUMENTS`:

- **Module path** (e.g. `modules/page/accordion.module`) — optimise that specific module only
- **`all`** or no arguments — full codebase scan across all three domains
- **`performance`** — performance optimisations only
- **`accessibility`** — accessibility fixes only
- **`seo`** — SEO enhancements only
- **Module path + domain** (e.g. `modules/page/gallery.module accessibility`) — single module, single domain

## Step 1 — Scope the work

Determine what to scan based on the arguments:

**Single module:** Read that module's `module.html`, `module.css`, `module.js`, `fields.json`, `meta.json`.

**Full codebase:** Use Glob to find all module directories, then process them. Also check:
- `templates/layouts/base.html` (head tags, resource hints, font loading)
- `css/main.css` (global CSS patterns)
- `templates/partials/header.html` (skip links, nav)
- `templates/partials/footer.html` (footer landmark)
- `templates/blog_post.html` (structured data)
- `templates/blog_listing.html` (structured data)

## Step 2 — Run domain audits

For each applicable domain, read the reference file and apply its checklist:

- **Performance** → read [performance.md](performance.md)
- **Accessibility** → read [accessibility.md](accessibility.md)
- **SEO** → read [seo.md](seo.md)

Also read the coding standards for implementation guidance:
- `.claude/skills/frontend-standards/references/css-standards.md`
- `.claude/skills/frontend-standards/references/javascript-standards.md`
- `.claude/skills/frontend-standards/references/accessibility-standards.md`
- `.claude/skills/frontend-standards/references/design-tokens.md`

## Step 3 — Present findings

Before making changes, present a structured report:

### Optimisation Report

For each finding, include:
- **File** and line reference
- **Domain** (Performance / Accessibility / SEO)
- **Severity** (High / Medium / Low)
- **What's wrong**
- **Proposed fix** (specific code change)
- **Impact** (what metric it improves: LCP, CLS, INP, Lighthouse score, WCAG criterion, etc.)

Group findings by priority:
1. **High impact** — directly affects Core Web Vitals, WCAG failures, or missing critical structured data
2. **Medium impact** — improves scores but not critical failures
3. **Low impact** — best practices and polish

### Summary counts

```
Performance: X high, Y medium, Z low
Accessibility: X high, Y medium, Z low
SEO: X high, Y medium, Z low
Total fixes: N
```

## Step 4 — Apply fixes (with confirmation)

Ask the user which fixes to apply:
- **All** — apply everything
- **High only** — apply only high-impact fixes
- **By domain** — apply one domain at a time
- **Cherry pick** — user selects specific items

Apply fixes file by file. After each file is modified, briefly note what changed.

## Step 5 — Validation

After applying fixes:

1. List all modified files
2. For each module changed, run a quick validation that HTML is well-formed and no HubL syntax errors were introduced
3. Summarise what was improved and estimated impact

## Rules

- **Never break existing functionality** — all optimisations must be additive or non-destructive
- **Preserve HubL syntax** — don't accidentally break template tags when editing HTML
- **Don't duplicate attributes** — check before adding `loading="lazy"` or `decoding="async"` that they don't already exist
- **Respect above-the-fold** — banner/hero modules should use `loading="eager"` and `fetchpriority="high"`, not lazy loading
- **Don't add JSON-LD for empty content** — structured data output must be wrapped in null checks
- **Follow existing patterns** — use the project's `.show-for-sr` class, `--space*` tokens, etc.
- **HubSpot constraints** — `{{ standard_header_includes }}` handles canonical, OG, and meta robots. Don't duplicate these.
- **Test in context** — note which changes require visual testing in HubSpot preview

## Self-improvement

- If a new optimisation pattern is discovered during use, update the relevant reference file
- If a fix causes HubSpot upload issues, document the constraint
- Track which modules have been optimised to avoid re-processing
