---
name: js-debugging
description: Investigate and fix JavaScript bugs in HubSpot CMS modules using a structured audit-before-fix workflow. Use this skill whenever the user reports a JavaScript issue, broken interactivity, event handler not firing, carousel not initialising, focus management failure, or any JS-related defect. Also trigger when the user pastes a console error, mentions "JS bug", "JavaScript not working", "click handler broken", "carousel broken", "accordion won't open", "Splide not initialising", "focus trap not working", "event delegation issue", or describes interactive behaviour that is broken or missing. This skill enforces investigation of the existing JS architecture before any code changes are made.
argument-hint: module-path, description, or console error
---

# JavaScript Debugging

You are fixing a JavaScript bug in an existing HubSpot CMS module. Before writing any fix, you must understand the existing JS architecture — the event model, initialisation pattern, state management, and how the module interacts with shared utilities and vendor libraries.

## Reference Files

Before implementing any fix, load the relevant coding standards:

- **JavaScript Standards** → read `.claude/skills/frontend-standards/references/javascript-standards.md`
- **Accessibility Standards** → read `.claude/skills/frontend-standards/references/accessibility-standards.md`

Also review the shared utilities available in the project:

- `window.CoreCode.trapFocus(container)` — focus trapping, returns cleanup function
- `window.CoreCode.debounce(func, wait, immediate)` — debounce utility (default 200ms)
- These are defined in `js/modules/utilities.js` and loaded globally via `base.html`

## Skill Dependencies

This skill works in combination with `frontend-standards`. All JavaScript fixes must comply with the JS standards references loaded above. If you are unsure about a pattern (IIFE structure, event delegation, `.js-*` class targeting), consult the reference files.

## Core Principle

**Understand the existing JS architecture before changing anything.** A module's interactive behaviour is the result of multiple interacting systems — event listeners, DOM queries, state variables, vendor library APIs, IntersectionObserver triggers, and shared utilities. A fix that ignores this context may resolve the reported symptom while breaking another interaction, creating memory leaks, or disrupting accessibility.

## Workflow

Follow these steps in order. Do not skip to implementation.

### Step 1: Understand the reported issue

Read the bug report, console error, or user description carefully. Identify:

- **What is broken** — the specific interactive behaviour that fails (click handler not firing, animation not playing, focus not trapped, carousel not initialising, etc.)
- **Where it occurs** — the page, module, and browser/device if specified
- **What is expected** — what the correct behaviour should be
- **When it occurs** — on page load, on user interaction, after a specific sequence of actions, on specific viewport sizes
- **Console errors** — any JavaScript errors, warnings, or failed network requests

If the report is ambiguous about any of these, ask for clarification before proceeding.

### Step 2: Identify the affected module and JS files

Locate the JavaScript files involved. Map:

- The module's `module.js` file and its IIFE structure
- The `.js-*` classes used for DOM targeting and their corresponding HTML elements
- Any `data-*` attributes used for configuration
- Whether the module uses vendor libraries (Splide, Plyr, Odometer, lite-youtube)
- Whether the module uses shared utilities (`CoreCode.trapFocus`, `CoreCode.debounce`)
- Whether the module uses IntersectionObserver for lazy initialisation

### Step 3: Audit the existing JS architecture

Before writing any fix, analyse the current state of the module's JavaScript:

**Initialisation pattern:**
- How is the module initialised? (DOMContentLoaded, readyState check, IntersectionObserver)
- Does it handle multiple instances on the same page?
- Is there a guard against missing elements (`if (!container) return`)?
- If using IntersectionObserver: what are the threshold and rootMargin values? Is the observer being disconnected after init?

**Event model:**
- How are events attached? (direct binding on elements, event delegation on container, global listeners)
- If event delegation: what is the delegation target and what does the `.closest()` call match?
- Are there keyboard event handlers for accessibility (keydown for arrow keys, Enter, Escape)?
- Are scroll/resize handlers debounced?

**State management:**
- How is module state tracked? (CSS classes, data attributes, ARIA attributes, JS variables)
- Is state shared between instances or scoped per container?
- Are there race conditions between animation callbacks and user interactions?

**Vendor library integration:**
- If the module uses Splide: is it initialised with correct options? Is the instance stored for later cleanup?
- If using IntersectionObserver for lazy init: is the observer threshold/rootMargin appropriate? Does the callback properly initialise the library?
- Are vendor library events handled correctly?

**Cleanup and memory:**
- Are event listeners removed when appropriate (e.g., when a modal closes)?
- Are IntersectionObservers disconnected after triggering?
- Are intervals/timeouts cleared on cleanup?
- Is `CoreCode.trapFocus()` cleanup function called when focus trapping ends?

**Accessibility integration:**
- Does the JS manage ARIA attributes (`aria-expanded`, `aria-hidden`, `aria-selected`)?
- Does it handle focus management (moving focus on open, restoring focus on close)?
- Does it check `prefers-reduced-motion` before animating?

Document your findings from this audit before proceeding. Output a brief summary of the audit findings.

### Step 4: Determine the fix approach

Based on the audit, decide on the fix approach. The key question is:

**Is the bug caused by a missing/incorrect implementation detail, or by a flawed architectural approach?**

- **Detail fix:** The architecture is sound. The bug is caused by a wrong selector, missing null check, incorrect event type, wrong vendor API call, or timing issue. Fix the specific detail.

- **Architectural fix:** The approach itself is the problem. For example:
  - Direct event binding when event delegation is needed (breaks for dynamically added elements)
  - Global state when per-instance state is needed (instances interfere with each other)
  - Synchronous init when lazy init is needed (blocks main thread)
  - Missing accessibility layer (no keyboard handling, no ARIA management, no focus management)

If an architectural fix is needed, propose the structural change and its rationale before implementing. Get user confirmation.

**Architectural fix guidelines:**
- Prefer event delegation on the module container over direct binding on child elements
- Prefer per-instance state scoped in the `initModuleName(container)` closure over shared variables
- Prefer `CoreCode.trapFocus()` over inline focus trapping implementations
- Prefer `CoreCode.debounce()` over inline debounce implementations
- Prefer IntersectionObserver lazy init for heavy modules (carousels, video, counters)
- Always add keyboard handlers alongside click handlers for interactive elements
- Always manage ARIA attributes to reflect visual state changes

### Step 5: Implement the fix

Apply the fix following these rules:

1. **Follow the IIFE pattern.** All module JS must be wrapped in `(function () { 'use strict'; ... })();`. Do not break this structure.

2. **Use `.js-*` classes for DOM targeting.** Never target BEM classes from JS. If a new DOM target is needed, add a `.js-*` class to the HTML.

3. **Use `const`/`let` only.** Never introduce `var`.

4. **Handle multiple instances.** Use `querySelectorAll` + `forEach`. Never assume a single instance exists on the page.

5. **Guard against missing elements.** Check that containers and targets exist before attaching listeners or calling methods.

6. **Test mentally across scenarios.** Before committing, trace the fix through: page load, user interaction, multiple instances, keyboard navigation, reduced motion preference, and missing/empty content states.

7. **Do not break existing event listeners.** If you are changing an event handler, ensure other functionality that depends on the same events still works.

8. **Clean up after yourself.** If you add event listeners, ensure they are removed when no longer needed. If you add observers, ensure they are disconnected.

9. **Use shared utilities.** Use `CoreCode.trapFocus()` and `CoreCode.debounce()` instead of inline implementations.

### Step 6: Summarise the fix

After implementation, produce a brief summary covering:

- What was broken (the root cause, not just the symptom)
- What was changed (the structural approach, not line-by-line detail)
- What to verify (which interactions, browsers, and states to check during QA)
- Any accessibility implications (focus management changes, ARIA updates)

## Common Patterns

### Module not initialising
**Symptom:** Module appears static — no interactivity, no carousel movement, no accordion toggling.
**Likely causes:**
- Missing or incorrect `.js-*` class on the HTML container
- DOMContentLoaded listener not firing (script loaded async after DOM is ready)
- IntersectionObserver never triggers (element not in viewport, threshold too high, rootMargin too small)
- Guard clause returns early because a required element is missing
**Typical fix:** Trace the initialisation chain from page load to `initModuleName()`. Check the readyState guard, querySelectorAll selector, and IntersectionObserver config.

### Event handler not firing
**Symptom:** Clicking/tapping an element does nothing.
**Likely causes:**
- Wrong `.js-*` class (typo, or class missing from HTML)
- Event delegation `.closest()` not matching (selector does not match the target or its ancestors)
- Another element is intercepting the event (z-index, pointer-events, overlay)
- Event listener attached to wrong element or at wrong lifecycle point
**Typical fix:** Verify the `.js-*` class exists in both HTML and JS. Check event delegation selector. Check for CSS interference (`pointer-events: none`, overlapping elements).

### Multiple instances conflicting
**Symptom:** Only the first instance works, or interacting with one instance affects another.
**Likely causes:**
- Shared state at the module scope instead of per-instance in the init closure
- `querySelector` used instead of `container.querySelector` (queries the entire document instead of the instance)
- Global event listeners that do not scope to the correct container
**Typical fix:** Ensure all DOM queries are scoped to the `container` parameter. Ensure state variables are declared inside `initModuleName(container)`, not at the IIFE scope.

### Focus management failure
**Symptom:** Focus does not move into an opened panel/modal, does not return to trigger on close, or tabs escape a modal.
**Likely causes:**
- Missing `CoreCode.trapFocus()` call on modal/dialog open
- Trap cleanup function not called on close
- Focus not explicitly moved to the first focusable element on open
- Focus not restored to the trigger element on close
**Typical fix:** Add `CoreCode.trapFocus(container)` on open, store the cleanup function, call it on close. After cleanup, call `triggerElement.focus()`.

### Vendor library not initialising (Splide, Plyr, Odometer)
**Symptom:** Carousel shows all slides stacked, video player shows native controls, counter shows static number.
**Likely causes:**
- IntersectionObserver lazy init never triggers (module not in viewport during test)
- Vendor library script not loaded (missing from `base.html` includes or `require_js`)
- Incorrect Splide options (wrong selector, missing `type`, wrong `perPage`)
- Library initialised before DOM elements exist
**Typical fix:** Check IntersectionObserver config. Verify the vendor script is loaded. Check library constructor options against the actual DOM structure. Test with the module scrolled into view.

### Reduced motion not respected
**Symptom:** Animations play even when user has enabled "Reduce motion" in OS settings.
**Likely cause:** Missing `window.matchMedia('(prefers-reduced-motion: reduce)').matches` check before starting animations or transitions in JS.
**Typical fix:** Add the matchMedia check. For Splide carousels, set `speed: 0` and `type: 'fade'` or disable autoplay when reduced motion is preferred.

## What Not To Do

- Do not apply a fix without completing Step 3 (audit). This is the most important step.
- Do not use `var`. Use `const` for values that do not change, `let` for values that do.
- Do not target BEM classes from JS. Always use `.js-*` classes.
- Do not attach global event listeners (on `document` or `window`) without scoping the handler to check the event target is within the correct module instance.
- Do not use jQuery or any framework. All JS must be vanilla.
- Do not inline focus trapping or debounce logic. Use the shared utilities.
- Do not remove or modify vendor library source files in `js/vendor/`. Fix integration code in the module's `module.js`.
- Do not assume the module renders only once per page. Always handle multiple instances.

## Self-improvement

- If a fix reveals a common JS bug pattern specific to Core Code that is not listed in Common Patterns above, add it
- If a vendor library integration issue is resolved, document the specific API call or option that was incorrect
- If a new shared utility would prevent recurring bugs, propose adding it to `js/modules/utilities.js`
