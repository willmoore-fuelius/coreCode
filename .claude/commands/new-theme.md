# New Theme from Stitch Export

Generate a HubSpot CMS theme from a Stitch design export using the stitch-to-hubspot skill.

## Input

The Stitch export files must be in the `design/` directory at the repo root:
- `design/DESIGN.md` - design system document
- `design/stitch-export.html` - HTML + Tailwind CSS export
- `design/screenshot.png` - visual reference (optional but recommended)

Verify these files exist before proceeding. If any are missing, ask the user to provide them.

## Before Starting

Read all reference files in this order. Do not skip any.

**Stitch-to-HubSpot skill:**
1. `~/.claude/skills/stitch-to-hubspot/SKILL.md`
2. `~/.claude/skills/stitch-to-hubspot/references/core-code-conventions.md`
3. `~/.claude/skills/stitch-to-hubspot/references/tailwind-translation-rules.md`
4. `~/.claude/skills/stitch-to-hubspot/references/interactive-module-guardrails.md`

**Frontend standards skill:**
5. `~/.claude/skills/frontend-standards/SKILL.md`
6. `~/.claude/skills/frontend-standards/references/css-standards.md`
7. `~/.claude/skills/frontend-standards/references/javascript-standards.md`
8. `~/.claude/skills/frontend-standards/references/accessibility-standards.md`
9. `~/.claude/skills/frontend-standards/references/performance-standards.md`
10. `~/.claude/skills/frontend-standards/references/design-tokens.md`

**Repo context (read the current state before generating):**
11. `templates/layouts/base.html` - current `:root` token block and template structure
12. `css/global/elements/buttons.css` - current button styles (if exists)
13. Discover partial paths: `find templates/partials/ -name '*.html' -type f`

## Pipeline

Execute the phases sequentially as defined in the skill's SKILL.md. Present each phase output for user review before proceeding to the next.

### Phase 1: Design Token Extraction

Extract tokens from `design/DESIGN.md` and the Tailwind config in `design/stitch-export.html`. Scan the HTML for Tailwind arbitrary value classes (`[...]` patterns) that won't appear in the config object. Map everything to Core Code custom properties by comparing against the current `:root` block in `templates/layouts/base.html`.

**Present the token mapping table. Wait for user review before proceeding.**

### Phase 2: Module Specification

Parse `design/stitch-export.html` section by section. Reference `design/screenshot.png` for visual context. Generate a module specification for each section. This phase must also:
- Identify module reuse opportunities (same structure, different content)
- Map all icon replacements (Material Symbols to inline SVG or icon fields)
- Analyse shared button styles and output a button style table
- Standardise background colour choice field options across modules
- Specify complete repeater defaults per-item matching the Stitch design

**Present the specification table and button style table. Wait for user review before proceeding.**

### Phase 3: Theme Generation

Generate all theme files into the repo in this order:

1. **Update `:root` tokens** in `templates/layouts/base.html`
2. **Generate shared button CSS overrides** in `css/global/elements/buttons.css` (before individual modules, so modules can reference shared button classes)
3. **Generate all module files** in `modules/` - each module gets `meta.json`, `fields.json`, `module.html`, `module.css`, and `module.js` where interactive
4. **Generate page template** in `templates/`
5. **Update header and footer partials** to reference the generated navigation and footer modules
6. **Generate any other global CSS additions** (header glassmorphism, custom link styles)

### Phase 3.5: CSS Consistency Review

After all modules are generated, review all `module.css` files as a batch:
- Token compliance (no hex codes, no magic numbers)
- Responsive completeness (every module has `@media (width >= 992px)`)
- BEM naming consistency
- Duplicate patterns across modules (extract to global CSS if found in 3+ modules)
- Animation gating (all transitions inside `prefers-reduced-motion: no-preference`)
- Focus states on all interactive elements

Fix any issues found before proceeding.

### Phase 4: QA Checklist

Produce the verification checklist including:
- fields.json validation (no `textarea` types, no `label` names, complete defaults, `help_text` on all fields)
- meta.json validation (`description` present, valid icon, `host_template_types` present, no `content_types`)
- Token accuracy, module completeness, responsiveness, accessibility, performance

## Output

All generated files are written directly to the repo. After Phase 4, the repo is ready for commit, push, and preview in HubSpot.