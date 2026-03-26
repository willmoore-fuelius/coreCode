---
name: hubspot-module-dev
description: HubSpot CMS module development standards covering HubL templating, data handling, variable scoping, caching, security, and module structure patterns. Also trigger when the user is writing or reviewing HubL code, asks about HubL syntax, macro usage, variable scoping, loop behaviour, content caching, or says "review this template", "check the HubL", or "is this HubL correct".
argument-hint: file-path or review
---

# HubSpot Module Development Skill

You are developing or reviewing HubSpot CMS modules for the Core Code theme. This skill covers HubL templating, data handling, and module-specific patterns.

**Target environment:** HubSpot CMS (HubL / Jinjava templating engine).

## Reference Files

- **HubL Standards** → read [references/hubl-standards.md](references/hubl-standards.md)
- **Front-end Standards** → read `.claude/skills/frontend-standards/SKILL.md` (for HTML/CSS/JS output)

HubL governs logic and data. HTML structure, CSS, JS, accessibility, and naming conventions are governed by the frontend-standards skill.

## Invocation Modes

Based on `$ARGUMENTS`:

- **File path** (e.g. `modules/page/accordion.module/module.html`) — review that file against HubL standards
- **`review`** — review all recently changed HubL files against standards
- **No arguments** — load HubL standards for the current development task

## When Writing HubL

1. Load `references/hubl-standards.md`
2. Load the frontend-standards skill references for HTML/CSS/JS output
3. Follow the module template pattern from CLAUDE.md
4. Validate all field data before use
5. Never use `|safe` on untrusted content
6. Render output within scope — do not build arrays in loops for later use

## When Reviewing HubL

1. Load `references/hubl-standards.md`
2. Check for common HubL gotchas (variable scoping, filter behaviour, asset loading)
3. Verify field validation and defensive coding
4. Check security (no `|safe` on user input, `rel="noopener"` on external links)
5. Report findings with specific file and line references

## Rules

- Keep template logic minimal — move complex logic to macros
- Cache all HubDB/blog queries in variables; never query inside loops
- Use `content.*` properties for caching compatibility, `request.*` only when per-visitor data is needed
- Use `{%- -%}` trim blocks to minimise whitespace
- Always validate field data before use
- Follow macro conventions documented in CLAUDE.md (safe vs deprecated macros)
