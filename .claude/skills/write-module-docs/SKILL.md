---
name: write-module-docs
description: Generate Confluence documentation (Client Guide + Technical Specification) for a HubSpot module by reading its codebase files. Creates structured pages following the Core Code documentation standard. Also trigger when the user says "document this module", "write the spec", "generate docs", "Confluence page for this module", "technical specification", or asks for module documentation to be created or published.
argument-hint: module-path
---

# Write Module Documentation

Generate Confluence documentation for a HubSpot module. Read the module's codebase files and create two documents: a Client Guide and a Technical Specification.

## Step 1 — Read the module

Read all files from the module directory specified by `$ARGUMENTS`:

- `fields.json` — extract all field names, types, defaults, and structure
- `meta.json` — extract label, category, description
- `module.html` — extract HTML structure, macro usage, HubL logic
- `module.css` — extract CSS class names, responsive behaviour
- `module.js` — extract JavaScript behaviour (if present)

Also read the documentation templates:
- [references/doc-templates.md](references/doc-templates.md) — Client Guide and Technical Specification templates with formatting rules

Note: `.claude/specs/spec-writing-brief.md` is a project-specific brief for batch documentation tasks. For individual module documentation, use the generic templates above.

## Step 2 — Generate Client Guide

Follow the Client Guide template from `spec-writing-brief.md` exactly:

1. **What is this module?** — 2-3 sentences in plain English
2. **When should you use it?** — 4-6 bulleted contexts
3. **Design reference** — standard boilerplate about contacting project lead
4. **Content preparation checklist** — numbered list of what to prepare
5. **Field guide** — table with Field, What it does, Required, Guidance columns
6. **Best practices** — specific guidance with numeric ranges
7. **Common pitfalls to avoid** — maximum 5 items

## Step 3 — Generate Technical Specification

Follow the Technical Specification template from `spec-writing-brief.md`:

1. **Module reference** — table with directory, CSS class, JS class, meta label, category
2. **Global components** — which global components (heading, footer CTA, spacing) apply
3. **Fields specification** — detailed field tables with machine names, types, defaults, null behaviour
4. **meta.json** — exact content from codebase
5. **fields.json** — complete JSON from codebase
6. **HTML structure** — complete module.html as code block
7. **Behaviour specification** — only if module has JavaScript
8. **Accessibility requirements** — WCAG criteria table
9. **QA checklist** — responsive, interaction, ARIA, and content validation checks

## Key rules

- All machine names, field types, defaults, HTML structure must come from the actual files — never invented
- Copy module.html content exactly — do not rewrite or improve it
- If module.js is empty/absent, omit the Behaviour specification section entirely
- Spacing group is always documented last in field specification
- Global component groups (module_heading, module_footer_cta, style) reference the standard patterns

## Output

Present the two documents as markdown. If the user wants them published to Confluence, ask for the parent page ID and use Atlassian MCP tools.
