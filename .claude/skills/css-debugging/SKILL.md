---
name: css-debugging
description: Investigate and fix CSS/styling bugs using a structured audit-before-fix workflow. Use this skill whenever the user reports a visual bug, styling issue, layout problem, spacing discrepancy, responsive breakage, or any CSS-related defect in an existing component or page. Also trigger when the user pastes a bug report from Jira or QA, mentions "fix the styling", "the spacing is wrong", "this looks broken on mobile", "layout issue", "CSS bug", or shares a screenshot of a rendering problem. This skill enforces investigation of the existing styling context before any code changes are made - it prevents minimal patches that introduce regressions or conflict with the existing layout approach. Works in combination with the frontend-standards skill for code quality rules.
argument-hint: module-path, description, or Jira ticket
---

# CSS Debugging and Refactoring

You are fixing a CSS or styling bug in an existing component. Your instinct may be to apply the smallest possible change to resolve the reported symptom. Resist that instinct. Minimal patches applied without understanding the existing styling context are the primary cause of CSS regressions, specificity conflicts, and accumulated technical debt.

## Reference Files

Before implementing any fix, load the relevant coding standards:

- **CSS Standards** → read `.claude/skills/frontend-standards/references/css-standards.md`
- **Design Tokens** → read `.claude/skills/frontend-standards/references/design-tokens.md`
- **Accessibility Standards** → read `.claude/skills/frontend-standards/references/accessibility-standards.md`

These govern BEM naming, breakpoint syntax, flat selectors, design token usage, and focus-visible requirements. All fixes must comply.

## Skill Dependencies

This skill works in combination with `frontend-standards`. When implementing a fix (Step 5), the CSS code you write must comply with the frontend-standards references loaded above. If you are unsure about a naming convention, breakpoint syntax, or design token, consult the reference files rather than guessing.

## Core Principle

**Understand the existing approach before changing anything.** A component's spacing, layout, and visual behaviour are the result of multiple interacting rules - inherited styles, theme defaults, module-level overrides, and responsive breakpoints. A fix that ignores this context may resolve the reported symptom while breaking something else.

## Workflow

Follow these steps in order. Do not skip to implementation.

### Step 1: Understand the reported issue

Read the bug report, Jira ticket, or user description carefully. Identify:

- **What is wrong** - the specific visual symptom (spacing too large, element misaligned, layout broken at a breakpoint, etc.)
- **Where it occurs** - the page, component, and viewport/breakpoint if specified
- **What is expected** - what the correct behaviour should look like (from the report, a design reference, or by asking)

If the report is ambiguous about any of these, ask for clarification before proceeding.

### Step 2: Identify the affected components

Locate the HTML element(s) involved and the CSS files that style them. Map:

- The element's class names and their BEM/ITCSS structure
- The file(s) where those classes are defined
- Any parent or sibling elements whose styles affect the target (e.g. a flex container affecting child spacing)

### Step 3: Audit the existing styling context

Before writing any fix, analyse the current state of the affected elements:

**Layout model:**
- What layout system is in use? (block flow, flexbox, grid, table, float)
- If flexbox or grid: what are the container properties? (direction, wrap, alignment, gap)
- How are child elements sized and positioned within the container?

**Spacing model:**
- How is spacing currently applied? (margin, padding, gap, or a combination)
- Is there a consistent spacing strategy, or has spacing been applied ad hoc?
- Are there inherited margins or padding from parent elements, theme styles, or resets?
- Check for margin collapsing if block-level elements with vertical margins are involved

**Responsive behaviour:**
- What breakpoints affect this component?
- Does the layout model change across breakpoints (e.g. block on mobile, flex on desktop)?
- Are there conflicting rules across breakpoints?

**Inheritance and specificity:**
- Are styles being inherited or overridden from a parent theme, global stylesheet, or utility class?
- Are there specificity conflicts (e.g. an ID selector overriding a class-level rule)?
- Is `!important` in play? If so, where and why?

Document your findings from this audit before proceeding. If working in Claude Code, output a brief summary of the audit findings.

### Step 4: Determine the structural approach

Based on the audit, decide on the fix approach. The key question is:

**Can this be fixed by adjusting the existing approach, or does the existing approach need refactoring?**

- **Adjust:** The existing layout and spacing model is sound. The bug is caused by a missing rule, an incorrect value, or a breakpoint gap. Fix by correcting the specific issue within the existing pattern.

- **Refactor:** The existing approach is the root cause. For example:
  - Spacing is applied via ad hoc margins on individual elements when gap on the container would be more robust
  - A float-based layout would work better as flexbox
  - Conflicting margin and padding create unpredictable spacing that a clean gap-based approach would resolve

If refactoring, propose the structural change and its rationale before implementing. If working with a user, get confirmation. If working autonomously (e.g. in the Jira ticket workflow), document the rationale in the commit or QA comment.

**Refactoring guidelines:**
- Prefer `gap` over margin stacking for sibling spacing in flex/grid containers
- Prefer flexbox or grid over float or absolute positioning for layout
- Prefer a single spacing mechanism (gap OR margin, not both) on the same axis
- Strip redundant margins/padding when switching to gap - do not layer gap on top of existing spacing
- Ensure the refactored approach handles all existing breakpoints, not just the one where the bug was reported

### Step 5: Implement the fix

Apply the fix following these rules:

1. **Reference frontend-standards** for all code patterns (BEM naming, breakpoint syntax, flat selectors, no magic numbers, reduced-motion fallbacks). If the `frontend-standards` skill is available in the project, defer to it for CSS code quality rules.

2. **Test mentally across all breakpoints.** Before committing, trace the fix through every breakpoint that affects this component. If the fix resolves the issue at 768px but breaks at 992px, it is not a fix.

3. **Do not add CSS on top of CSS without removing what it replaces.** If you are changing the spacing model (e.g. from margin to gap), remove the old margin declarations. Do not leave both in place.

4. **Do not increase specificity unnecessarily.** If the fix requires a higher-specificity selector to take effect, the root cause is a specificity conflict that should be resolved, not overridden.

5. **Do not use `!important` to fix specificity issues.** Trace the conflict and resolve it at source.

6. **Scope the fix to the affected component.** Do not modify global styles, theme-level rules, or shared utility classes unless the bug is genuinely at that level and the change is intentional.

### Step 6: Summarise the fix

After implementation, produce a brief summary covering:

- What was wrong (the root cause, not just the symptom)
- What was changed (the structural approach, not line-by-line detail)
- What to verify (which breakpoints and states to check during QA)

This summary feeds into QA handoff comments if using the Jira ticket workflow.

## Common Patterns

### Spacing inconsistency
**Symptom:** Uneven gaps between items in a list, card grid, or content stack.
**Likely cause:** Mixed spacing mechanisms - some items use margin-bottom, others rely on padding, and the container may or may not use gap.
**Typical fix:** Audit all spacing on the container and children. Choose one mechanism (usually `gap` on a flex/grid container). Strip individual margins. Verify across breakpoints.

### Element overflow or misalignment
**Symptom:** Content overflows its container, or elements are misaligned relative to siblings.
**Likely cause:** Fixed widths conflicting with flex sizing, missing `min-width: 0` on flex children, or percentage-based widths that do not account for gap/padding.
**Typical fix:** Audit the container's layout model. Check flex-basis, flex-shrink, and min-width on children. Replace fixed widths with flex-based sizing where appropriate.

### Responsive layout breakage
**Symptom:** Layout works on desktop but breaks on mobile (or vice versa).
**Likely cause:** Missing or conflicting breakpoint rules. Often a desktop-first rule that is not properly overridden at smaller breakpoints, or a mobile rule that leaks into desktop.
**Typical fix:** Map all breakpoint rules affecting the component. Ensure mobile-first cascade is intact. Add missing breakpoint overrides.

### Inherited theme styles causing conflicts
**Symptom:** A component's styles behave differently than expected despite correct module-level CSS.
**Likely cause:** Theme-level or global styles with higher specificity are overriding module rules.
**Typical fix:** Trace the cascade. Identify the overriding rule. Resolve by either increasing the module selector's specificity minimally (e.g. adding the parent context) or by working with the existing inheritance rather than fighting it.

## What Not To Do

- Do not apply a fix without completing Step 3 (audit). This is the most important step.
- Do not add margin to fix spacing without checking whether gap is already in use or would be more appropriate.
- Do not use `!important` as a fix.
- Do not modify global or theme-level styles to fix a module-level bug without explicit justification.
- Do not assume a bug exists at only one breakpoint - always check the component's behaviour across all defined breakpoints.
- Do not leave orphaned CSS (old rules that are no longer needed after the fix).

## Self-improvement

- If a fix reveals a common CSS pattern or gotcha specific to Core Code that is not listed in Common Patterns above, add it
- If a fix exposes a gap in the frontend-standards references (e.g. a pattern not covered), note it for future update
- If a recurring bug pattern emerges (e.g. same spacing issue across multiple modules), document it as a Common Pattern
