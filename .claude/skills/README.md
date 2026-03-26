# Claude Code Skills

This directory contains skills that Claude Code loads automatically. Each skill provides a standardised workflow for a common development task.

## How Skills Work

- Skills are triggered via slash commands (e.g. `/scaffold-module`, `/qa-review`)
- Each skill has a `SKILL.md` file with YAML frontmatter defining its name, description, and argument hints
- Reference files in `references/` subdirectories provide domain-specific standards and checklists
- Scripts in `scripts/` subdirectories provide automated tooling (e.g. axe-core audits, Lighthouse)

## Available Skills

### Coding Standards & Development

| Skill | Command | Purpose |
|---|---|---|
| `frontend-standards` | `/frontend-standards` | Enforce HTML, CSS, JS, accessibility, performance, and design token standards |
| `hubspot-module-dev` | `/hubspot-module-dev` | HubL templating, data handling, variable scoping, and module patterns |
| `css-debugging` | `/css-debugging` | Structured audit-before-fix workflow for CSS/styling bugs |
| `js-debugging` | `/js-debugging` | Structured audit-before-fix workflow for JavaScript bugs |
| `email-module-dev` | `/email-module-dev` | Email-safe HTML with table layouts, VML fallbacks, MSO conditionals |

### Module Lifecycle

| Skill | Command | Purpose |
|---|---|---|
| `scaffold-module` | `/scaffold-module` | Create a new HubSpot module from spec or requirements |
| `add-module-feature` | `/add-module-feature` | Add fields, features, or groups to an existing module |
| `fix-module` | `/fix-module` | Diagnose and fix HubSpot upload errors |
| `qa-review` | `/qa-review` | 15-section quality audit against module standards |
| `write-module-docs` | `/write-module-docs` | Generate Confluence documentation from module code |

### Auditing & Optimisation

| Skill | Command | Purpose |
|---|---|---|
| `accessibility-checker` | `/accessibility-checker` | WCAG 2.2 AA audit with axe-core script |
| `frontend-performance` | `/frontend-performance` | Core Web Vitals audit with Lighthouse script |
| `optimise-codebase` | `/optimise-codebase` | Combined performance, accessibility, and SEO optimisation |

### Client Communication & Handover

| Skill | Command | Purpose |
|---|---|---|
| `client-response-translator` | `/client-response-translator` | Translate technical findings into client-ready responses |
| `client-handover-guide` | `/client-handover-guide` | Generate usage guides for non-technical content editors |

### Planning & Review

| Skill | Command | Purpose |
|---|---|---|
| `grill-me` | `/grill-me` | Stress-test a plan or design by interviewing through every decision branch |

## Directory Structure

```
skills/
├── README.md                          # This file
├── frontend-standards/
│   ├── SKILL.md
│   └── references/
│       ├── css-standards.md
│       ├── javascript-standards.md
│       ├── accessibility-standards.md
│       ├── performance-standards.md
│       └── design-tokens.md
├── hubspot-module-dev/
│   ├── SKILL.md
│   └── references/
│       └── hubl-standards.md
├── accessibility-checker/
│   ├── SKILL.md
│   └── scripts/
│       └── axe-audit.mjs
├── frontend-performance/
│   ├── SKILL.md
│   └── scripts/
│       └── lighthouse-audit.mjs
├── scaffold-module/
│   ├── SKILL.md
│   ├── field-patterns.md
│   ├── meta-reference.md
│   └── template.html
├── add-module-feature/
│   └── SKILL.md
├── fix-module/
│   └── SKILL.md
├── qa-review/
│   └── SKILL.md
├── optimise-codebase/
│   ├── SKILL.md
│   ├── accessibility.md          # Canonical — shared with accessibility-checker
│   ├── performance.md            # Canonical — shared with frontend-performance
│   └── seo.md
├── write-module-docs/
│   ├── SKILL.md
│   └── references/
│       └── doc-templates.md
├── css-debugging/
│   └── SKILL.md
├── js-debugging/
│   └── SKILL.md
├── email-module-dev/
│   ├── SKILL.md
│   └── references/
│       └── email-safe-html-css.md
├── client-response-translator/
│   └── SKILL.md
├── client-handover-guide/
│   └── SKILL.md
└── grill-me/
    └── SKILL.md
```

## Inherited by Projects

This skills directory is part of the boilerplate repository. When a developer clones a project from this boilerplate, the skills are already in place and Claude Code loads them automatically. No additional setup is required.
