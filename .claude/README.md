# Project Setup for AI-Assisted Development

This document covers the standard setup process for using Claude Code on this project. It is consistent across all repositories. For project-specific context (client, repo structure, environment details), see `CLAUDE.md` in this directory.

## Prerequisites

- Repository cloned to local machine
- Claude Code installed and authenticated

## Directory Structure

```
.claude/
├── CLAUDE.md          # Project-specific context (generated via /init)
├── README.md          # This file — standard setup and process reference
├── skills/            # Claude Code skills (standards, workflows, audits)
│   ├── frontend-standards/
│   ├── hubspot-module-dev/
│   ├── css-debugging/
│   ├── js-debugging/
│   ├── email-module-dev/
│   ├── accessibility-checker/
│   ├── frontend-performance/
│   ├── scaffold-module/
│   ├── qa-review/
│   ├── fix-module/
│   ├── add-module-feature/
│   ├── optimise-codebase/
│   ├── write-module-docs/
│   ├── client-response-translator/
│   ├── client-handover-guide/
│   └── grill-me/
├── specs/             # Specification exports (from Confluence or equivalent)
└── designs/           # Client-supplied design files
```

## Setup Steps

1. **Clone the repository** — skills are included in the boilerplate and load automatically
2. **Place specification files** (exported from Confluence) in `.claude/specs/`
3. **Place design files** (client-supplied) in `.claude/designs/`
4. **Run `/init`** to generate `CLAUDE.md` with project-specific context (if not already present)

## When to Run /init

Run `/init` when beginning work on an existing project that does not yet have a `CLAUDE.md` file. This generates the project context file that Claude Code uses for ongoing work.

If `CLAUDE.md` already exists, review it for accuracy before starting work — project details may have changed since it was last generated.

## Reference Documents

- **Skills** — coding standards, workflows, and audit checklists. Located in `.claude/skills/`. Load automatically in Claude Code based on what you ask it to do.
- **CLAUDE.md** — project-specific context including client details, active modules, environment configuration. Generated per-project.
