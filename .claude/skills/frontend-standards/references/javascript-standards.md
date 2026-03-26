# JavaScript Standards

**Vanilla JS only.** No jQuery, no frameworks.

---

## Core Rules

- `const` by default, `let` only when reassignment needed, **never `var`**
- Arrow functions for callbacks and anonymous functions
- Template literals for string interpolation
- Strict equality only: `===` and `!==`

---

## DOM Targeting — Hybrid Approach

- **`.js-*` classes** for selecting elements from JS
- **`data-*` attributes** for configuration and state
- **Never target BEM classes** (`.m-*`, `.o-*`) from JavaScript

```html
<div class="m-contentAccordion" data-allow-multiple="true">
  <button class="m-contentAccordion__trigger js-accordionTrigger" aria-expanded="false">Toggle</button>
  <div class="m-contentAccordion__panel js-accordionPanel">Content</div>
</div>
```

```javascript
const container = document.querySelector('.js-contentAccordion');
const triggers = container.querySelectorAll('.js-accordionTrigger');
const allowMultiple = container.getAttribute('data-allow-multiple') === 'true';
```

---

## File Structure

All JavaScript files must follow this order: **variables at top, functions in middle, initialisation at bottom.** This structure makes dependencies clear, grouped functions improve readability, and initialisation at the bottom ensures the DOM is ready.

---

## Module Scoping

- Code must be module-scoped and self-contained, assuming multiple instances per page
- Use IIFEs with `'use strict'` for module isolation (ES modules not supported by HubSpot asset pipeline)
- Event delegation must be attached to the module container
- Module-scoped listeners tied to the container are acceptable without teardown
- Explicit cleanup is required only for observers, intervals, timeouts, or global listeners
- State should be minimal and module-local using closures or object literals

---

## Module Pattern

```javascript
(function() {
  'use strict';

  // Variables
  const containers = document.querySelectorAll('.js-contentAccordion');
  const activeClass = 'is-active';

  // Functions
  function handleToggle(e) {
    const trigger = e.target.closest('.js-accordionTrigger');
    if (!trigger) return;

    e.preventDefault();
    const panel = trigger.closest('.js-contentAccordion')
      .querySelector('.js-accordionPanel');

    if (!panel) return;

    trigger.classList.toggle(activeClass);
    panel.classList.toggle(activeClass);

    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!isExpanded));
  }

  function initModule(container) {
    container.addEventListener('click', handleToggle);
  }

  function init() {
    if (containers.length === 0) return;
    containers.forEach(initModule);
  }

  // Initialise on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
```

---

## Error Handling

Guard against missing elements and invalid data:

```javascript
function initModule(container) {
  const trigger = container.querySelector('.js-accordionTrigger');
  const panel = container.querySelector('.js-accordionPanel');

  if (!trigger || !panel) {
    console.warn('Module: required elements not found', container);
    return;
  }

  let parsedConfig = {};
  try {
    parsedConfig = container.dataset.config ? JSON.parse(container.dataset.config) : {};
  } catch (e) {
    console.warn('Module: invalid config data');
  }
}
```

---

## JS Performance

- Debounce scroll/resize handlers
- Event delegation on module container, not individual elements
- Cache DOM queries — don't repeatedly query the same elements
- Lazy-init expensive operations (observers, carousels)
- Minimise DOM manipulation, avoid layout thrashing
- Graceful degradation if JS fails

---

## Shared Utilities (global)

Available via `window.CoreCode` — use instead of re-implementing:

- `CoreCode.trapFocus(container)` — traps Tab focus, returns cleanup function
- `CoreCode.debounce(func, wait, immediate)` — debounce (default 200ms)

---

## Common Patterns

```javascript
// Selecting elements (scoped to module container via .js-* classes)
const element = container.querySelector('.js-targetElement');
const elements = container.querySelectorAll('.js-toggleTrigger');

// Reading configuration from data attributes
const allowMultiple = container.getAttribute('data-allow-multiple') === 'true';
const rotatorId = container.dataset.rotator;

// Class manipulation
element.classList.add('is-active');
element.classList.remove('is-active');
element.classList.toggle('is-active');
element.classList.contains('is-active');

// Event delegation on module container
container.addEventListener('click', (e) => {
  const trigger = e.target.closest('.js-toggleTrigger');
  if (!trigger) return;
  // Handle click
});

// Async data fetching
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Fetch error:', error);
    return null;
  }
}
```

---

## Comment Standards

```javascript
/**
 * Multi-line function description
 * @param {string} param - Parameter description
 * @returns {boolean} Return value description
 */
function functionName(param) {
  // Single line comment for complex logic
  return true;
}
```

Comment when explaining WHY, not WHAT. Comment workarounds, complex business logic, and performance optimisations. Do not comment obvious code.

---

## Anti-Patterns — Never Do These

- No jQuery or legacy libraries
- No `document.write` or blocking scripts
- No targeting BEM classes from JS (use `.js-*` and `data-*`)
- No `var` declarations
- No `==` or `!=` (use `===` and `!==`)
- No inline event handlers (`onclick`, etc.)
- No reliance on undocumented HubSpot global JavaScript variables
