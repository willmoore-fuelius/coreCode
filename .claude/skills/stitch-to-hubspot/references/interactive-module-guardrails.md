# Interactive Module Guardrails

This reference defines the required standards for generating modules with JavaScript interactivity. Read this before generating any module that includes `module.js`.

Every interactive module must meet the standards in this file in addition to the `frontend-standards` skill's JavaScript, accessibility, and performance references.

---

## Table of Contents

1. [Universal Requirements](#universal-requirements)
2. [Navigation Modules](#navigation-modules)
3. [Search Modules](#search-modules)
4. [Carousel / Slider Modules](#carousel--slider-modules)
5. [Accordion / Toggle Modules](#accordion--toggle-modules)
6. [Tab Modules](#tab-modules)
7. [Modal / Dialog Modules](#modal--dialog-modules)
8. [Counter / Animation Modules](#counter--animation-modules)
9. [Sticky / Scroll-Driven Modules](#sticky--scroll-driven-modules)

---

## Universal Requirements

These apply to every interactive module without exception.

### JavaScript structure

```javascript
(function() {
  'use strict';

  // Constants
  const SELECTORS = {
    container: '.js-moduleName',
    trigger: '.js-moduleName-trigger',
    panel: '.js-moduleName-panel'
  };

  const CLASSES = {
    active: 'is-active',
    hidden: 'is-hidden',
    initialized: 'is-initialized'
  };

  // Functions
  function initModule(container) {
    // Guard against missing elements
    const trigger = container.querySelector(SELECTORS.trigger);
    if (!trigger) {
      console.warn('ModuleName: required elements not found', container);
      return;
    }

    // Event delegation on container
    container.addEventListener('click', handleClick);
    container.addEventListener('keydown', handleKeydown);

    // Mark as initialized
    container.classList.add(CLASSES.initialized);
  }

  function init() {
    const containers = document.querySelectorAll(SELECTORS.container);
    if (containers.length === 0) return;
    containers.forEach(initModule);
  }

  // Initialise
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
```

### DOM targeting

- `.js-*` classes for selecting elements from JS. Never target BEM classes.
- `data-*` attributes for configuration (e.g. `data-allow-multiple="true"`).
- One `.js-*` class per functional role. Name them `js-moduleName-role` (e.g. `js-siteNav-trigger`, `js-siteNav-panel`).

### Keyboard accessibility

- All interactive elements must be operable with keyboard alone.
- Use `:focus-visible` for focus indicators (never `:focus`).
- Focus indicators: `outline: 2px solid var(--primaryColour); outline-offset: 2px;` minimum.
- Manage focus programmatically when visibility changes (opening panels, dialogs, drawers).
- Store previous focus and restore it when closing.
- Arrow keys for navigation within composite widgets (menus, tabs, carousels).
- Escape to close open panels, drawers, dialogs.

### ARIA

- `aria-expanded="true|false"` on triggers that toggle visibility.
- `aria-controls="panel-id"` linking triggers to their panels.
- `aria-hidden="true"` on visually hidden panels (and remove when shown). **Set by JS only** - never in the source HTML. This ensures the no-JS fallback shows all content without aria-hidden blocking screen readers. **Set by JS only** - never in the source HTML. This ensures the no-JS fallback shows all content without aria-hidden blocking screen readers.
- `aria-current="page"` on active navigation items.
- `aria-live="polite"` for dynamic content updates (search results, carousel position).
- Generate unique IDs for ARIA relationships. Pattern: `moduleName-index-role` (e.g. `siteNav-0-panel`).

### Reduced motion

```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Check at init
if (prefersReducedMotion.matches) {
  // Disable autoplay, slide animations, counter animations
}

// Listen for changes
prefersReducedMotion.addEventListener('change', (e) => {
  if (e.matches) {
    // Pause/disable animations
  }
});
```

### Graceful degradation

- Content must be accessible without JavaScript. Use CSS-only fallbacks where possible.
- For navigation: all links must be visible/reachable without JS (mobile menu can default to expanded).
- For accordions: content should be visible by default; JS adds the toggle behaviour.
- For carousels: all slides should be visible in a scrollable row without JS.

### Cleanup

- Module-scoped listeners on the container do not require teardown.
- Explicit cleanup is required for: `IntersectionObserver`, `MutationObserver`, `setInterval`, `setTimeout`, `window`-level listeners, `ResizeObserver`.

### Performance

- Use `window.lazyModuleInit(moduleId, initFn)` for below-fold modules (defers init via IntersectionObserver).
- Debounce scroll/resize handlers using `CoreCode.debounce()`.
- Cache DOM queries - never re-query the same elements.
- Event delegation on the module container, not individual child elements.

---

## Navigation Modules

Navigation modules slot into the header partial shell. They are among the most complex generated modules.

### Required features

- **Mobile toggle.** Hamburger/close button toggling a mobile drawer or panel.
- **Multi-level support.** At minimum two levels (top-level items + dropdowns). Three levels if the design shows it.
- **Keyboard navigation:**
  - `Tab` / `Shift+Tab` moves between top-level items.
  - `Enter` or `Space` opens a dropdown.
  - `Arrow Down` / `Arrow Up` moves within a dropdown.
  - `Arrow Right` / `Arrow Left` moves between top-level items (for horizontal navs).
  - `Escape` closes the current dropdown and returns focus to its trigger.
  - `Home` / `End` jump to first/last item within a dropdown.
- **Focus trapping in mobile drawer.** Use `CoreCode.trapFocus(container)`. Returns a cleanup function - call it on close.
- **Close on outside click.** Click outside the nav closes any open dropdown.
- **Close on Escape.** Closes the most recently opened panel.
- **Scroll lock on mobile.** When mobile drawer is open, prevent body scroll (`overflow: hidden` on `<body>` or `overscroll-behavior: contain` on the drawer).

### ARIA pattern

This is the **source HTML** (no-JS state - all dropdowns visible/accessible):

```html
<nav aria-label="Main navigation" class="m-siteNav js-siteNav">
  <ul role="menubar" class="m-siteNav__list">
    <li role="none" class="m-siteNav__item">
      <a role="menuitem" href="/about" class="m-siteNav__link">About</a>
    </li>
    <li role="none" class="m-siteNav__item">
      <button role="menuitem"
              aria-haspopup="true"
              aria-expanded="true"
              aria-controls="nav-services-panel"
              class="m-siteNav__trigger js-siteNav-trigger">
        Services
      </button>
      <ul role="menu"
          id="nav-services-panel"
          class="m-siteNav__dropdown js-siteNav-panel">
        <li role="none">
          <a role="menuitem" href="/services/web" class="m-siteNav__subLink">Web Development</a>
        </li>
      </ul>
    </li>
  </ul>
</nav>
```

On init, JS sets `aria-expanded="false"` on dropdown triggers, adds `aria-hidden="true"` on closed dropdown panels, and adds `is-initialized` to the nav container (which activates CSS hiding of inactive dropdowns).

### Mobile toggle

```html
<button class="m-siteNav__mobileToggle js-siteNav-mobileToggle"
        aria-expanded="false"
        aria-controls="mobile-nav-panel"
        aria-label="Open menu">
  <span class="m-siteNav__mobileToggleIcon" aria-hidden="true"></span>
</button>
```

### CSS considerations

- Mobile-first: nav items stacked vertically by default, horizontal at desktop breakpoint.
- Dropdown panels: visible by default (no-JS fallback). Once JS adds `is-initialized` to the nav container, dropdowns are hidden and revealed via `is-active`:
  ```css
  .m-siteNav.is-initialized .m-siteNav__dropdown {
    display: none;
  }
  .m-siteNav.is-initialized .m-siteNav__dropdown.is-active {
    display: block; /* or grid/flex as needed */
  }
  ```
- Transition dropdown visibility with opacity/translate for smooth appearance (inside `prefers-reduced-motion: no-preference`).
- Z-index: use `var(--zHeader)` for the nav container, `var(--zDropdown)` for dropdown panels.
- If glassmorphism is specified: `@supports (backdrop-filter: blur())` with solid fallback.

### HubSpot menu integration

For navigation items sourced from HubSpot's managed menu system, use the `menu()` HubL function:

```hubl
{% set nav_menu = menu("site-menu", "site_root") %}
{% for item in nav_menu.children %}
  {# Render item #}
  {% if item.children %}
    {# Render dropdown #}
  {% endif %}
{% endfor %}
```

For navigation items defined in module fields (e.g. a mega menu with custom content per dropdown), use a repeater field group with nested groups for sub-items.

Determine which approach to use based on the design:
- Simple link-based nav with standard dropdowns -> HubSpot managed menu.
- Mega menu with images, descriptions, featured content per dropdown -> Field-based repeater.
- Hybrid (some items from menu, some custom) -> Managed menu for the link structure, field groups for custom dropdown content panels.

---

## Search Modules

### Required features

- **Toggle input.** Search box hidden by default, revealed on trigger click.
- **HubSpot search API.** Use the HubSpot site search API endpoint or the `search_results` HubL tag.
- **Results display.** Paginated results with title, excerpt, URL.
- **Loading state.** Visual indicator while fetching results.
- **Empty state.** Message when no results are found.
- **Keyboard:** Escape closes search overlay. Focus moves to the input when opened. Focus returns to trigger when closed.
- **ARIA:** `role="search"` on the form container. `aria-live="polite"` on the results region. `aria-expanded` on the toggle trigger.

### ARIA pattern

Source HTML (no-JS state - search form visible, submit navigates to results page):

```html
<div class="m-siteSearch js-siteSearch">
  <button class="m-siteSearch__trigger js-siteSearch-trigger"
          aria-expanded="true"
          aria-controls="site-search-panel"
          aria-label="Toggle search">
    {# Search icon SVG #}
  </button>
  <div class="m-siteSearch__panel js-siteSearch-panel"
       id="site-search-panel">
    <form role="search" action="/search" class="m-siteSearch__form js-siteSearch-form">
      <label for="site-search-input" class="show-for-sr">Search this site</label>
      <input type="search"
             id="site-search-input"
             name="q"
             class="m-siteSearch__input js-siteSearch-input"
             placeholder="Search..."
             autocomplete="off">
      <button type="submit" class="m-siteSearch__submit" aria-label="Submit search">
        {# Search icon SVG #}
      </button>
    </form>
    <div class="m-siteSearch__results js-siteSearch-results"
         aria-live="polite"
         aria-atomic="true">
    </div>
  </div>
</div>
```

On init, JS sets `aria-expanded="false"` on the trigger, adds `is-initialized` to the container (hiding the panel), and intercepts form submission to fetch results via AJAX instead of navigating.

### HubSpot search integration

For AJAX-based search, use the HubSpot content search API:

```javascript
async function fetchResults(query) {
  const response = await fetch(
    `/_hcms/search?term=${encodeURIComponent(query)}&type=SITE_PAGE&type=BLOG_POST&limit=10`
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return await response.json();
}
```

The response includes `results` (array of `{title, url, description}`) and `total` for pagination.

### Degradation

Without JS, the search trigger should link to a dedicated search results page (HubSpot system page). The form's `action="/search"` provides native fallback.

---

## Carousel / Slider Modules

### Required features

- **Previous/Next buttons.** Always visible, not just on hover. Minimum 44px touch targets.
- **Slide position indicator.** Dots, numbers, or fraction (e.g. "2 / 5").
- **Keyboard navigation:** Arrow keys to navigate between slides.
- **Screen reader announcements.** `aria-live="polite"` region announcing current slide position.
- **Autoplay (if specified by design):**
  - Visible pause/play button (WCAG 2.2.2).
  - Pauses on hover and on focus within the carousel.
  - Disabled when `prefers-reduced-motion: reduce`.
  - Pause button has `aria-label="Pause slideshow"` / `"Play slideshow"`.

### Degradation

Without JS, all slides visible in a horizontally scrollable row:
```css
.m-testimonialCarousel__track {
  display: flex;
  gap: var(--space24);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline-start: var(--space24);
}

.m-testimonialCarousel__slide {
  flex: 0 0 100%;
  scroll-snap-align: start;
}
```

Prev/next buttons are hidden without JS (they require JS to function). The horizontal scroll with snap provides native swipe/scroll navigation.

### ARIA pattern

```html
<div class="m-testimonialCarousel js-carousel"
     role="region"
     aria-label="Testimonials"
     aria-roledescription="carousel">
  <div class="m-testimonialCarousel__track" aria-live="polite">
    <div class="m-testimonialCarousel__slide"
         role="group"
         aria-roledescription="slide"
         aria-label="Slide 1 of 3">
      {# Slide content #}
    </div>
  </div>
  <button class="m-testimonialCarousel__prev js-carousel-prev" aria-label="Previous slide">
    {# Icon #}
  </button>
  <button class="m-testimonialCarousel__next js-carousel-next" aria-label="Next slide">
    {# Icon #}
  </button>
</div>
```

**Multi-slide visibility:** For carousels showing one slide at a time, set `aria-hidden="true"` on non-active slides via JS (not in source HTML). Remove `aria-hidden` from the active slide. Update on every slide change. This prevents screen readers from reading all slides simultaneously.

If the design requires a complex carousel (multiple visible slides, breakpoint-responsive slide counts, fade transitions, thumbnail sync), consider wiring Splide from `js/vendor/`. The guardrails still apply - Splide must be configured with accessible defaults:

```javascript
new Splide(container, {
  type: 'slide',
  perPage: 1,
  arrowPath: false, // Use custom arrow markup
  pagination: true,
  accessibility: true,
  i18n: {
    prev: 'Previous slide',
    next: 'Next slide',
    first: 'Go to first slide',
    last: 'Go to last slide',
    slideX: 'Go to slide %s',
    pageX: 'Go to page %s'
  }
});
```

For simple single-slide carousels, generate vanilla JS instead.

---

## Accordion / Toggle Modules

### Required features

- **Toggle individual panels.** Click or Enter/Space on trigger toggles its panel.
- **Optional: allow multiple open.** Configurable via `data-allow-multiple="true"`.
- **Keyboard:** Enter/Space toggles. Arrow Up/Down moves between triggers. Home/End jump to first/last trigger.
- **Animation:** Panel height transition (inside `prefers-reduced-motion: no-preference`). Use `grid-template-rows: 0fr` to `1fr` for smooth height animation without JS height calculation.

### ARIA pattern

This is the **source HTML** (no-JS state - all panels visible):

```html
<div class="m-faqAccordion js-accordion" data-allow-multiple="false">
  <div class="m-faqAccordion__item">
    <button class="m-faqAccordion__trigger js-accordion-trigger"
            aria-expanded="true"
            aria-controls="faq-0-panel"
            id="faq-0-trigger">
      Question text
    </button>
    <div class="m-faqAccordion__panel js-accordion-panel"
         id="faq-0-panel"
         role="region"
         aria-labelledby="faq-0-trigger">
      <div class="m-faqAccordion__panelContent">
        Answer content
      </div>
    </div>
  </div>
</div>
```

On init, JS sets `aria-expanded="false"` on closed triggers, adds `aria-hidden="true"` on closed panels, and adds `is-initialized` to the container (which activates the CSS height animation).

### CSS height animation

The animation is gated behind `.is-initialized` so that without JS, panels remain visible at their natural height:

```css
.m-faqAccordion.is-initialized .m-faqAccordion__panel {
  display: grid;
  grid-template-rows: 0fr;
  overflow: hidden;
}

.m-faqAccordion.is-initialized .m-faqAccordion__panel.is-active {
  grid-template-rows: 1fr;
}

.m-faqAccordion__panelContent {
  min-height: 0;
}

@media (prefers-reduced-motion: no-preference) {
  .m-faqAccordion.is-initialized .m-faqAccordion__panel {
    transition: grid-template-rows var(--transitionSpeed) var(--easeOut);
  }
}
```

### Degradation

Without JS, all panels visible (content is accessible). JS adds the toggle behaviour and hides panels on init.

---

## Tab Modules

### Required features

- **Tab list with tab panels.** One panel visible at a time.
- **Keyboard:** Arrow Left/Right (horizontal tabs) or Arrow Up/Down (vertical tabs) to move between tabs. Home/End to first/last. Tab key moves focus into the active panel.
- **Activation:** Tabs activate on focus (automatic activation) by default. Manual activation (Enter/Space required) is acceptable if noted.

### ARIA pattern

This is the **source HTML** (no-JS state - all panels visible in sequence, tabs are plain buttons):

```html
<div class="m-serviceTabs js-tabs">
  <div role="tablist" aria-label="Service categories" class="m-serviceTabs__tabList">
    <button role="tab"
            aria-selected="true"
            aria-controls="tab-0-panel"
            id="tab-0"
            class="m-serviceTabs__tab js-tabs-tab">
      Tab 1
    </button>
    <button role="tab"
            aria-selected="true"
            aria-controls="tab-1-panel"
            id="tab-1"
            class="m-serviceTabs__tab js-tabs-tab">
      Tab 2
    </button>
  </div>
  <div role="tabpanel"
       id="tab-0-panel"
       aria-labelledby="tab-0"
       class="m-serviceTabs__panel js-tabs-panel"
       tabindex="0">
    Panel 1 content
  </div>
  <div role="tabpanel"
       id="tab-1-panel"
       aria-labelledby="tab-1"
       class="m-serviceTabs__panel js-tabs-panel"
       tabindex="0">
    Panel 2 content
  </div>
</div>
```

On init, JS sets `aria-selected="false"` and `tabindex="-1"` on inactive tabs, adds `hidden` to inactive panels, sets `tabindex="0"` on the active tab, and adds `is-initialized` to the container. It also adds keyboard arrow-key navigation between tabs.

### Degradation

Without JS, all panels visible in sequence. JS hides inactive panels and adds tab interaction.

### Responsive consideration

Tabs commonly convert to an accordion at mobile breakpoints. If the design shows this pattern, the module needs both ARIA patterns and a breakpoint switch in JS:

```javascript
const mql = window.matchMedia('(width >= 992px)');

function handleBreakpoint(e) {
  if (e.matches) {
    initTabs(container);
  } else {
    initAccordion(container);
  }
}

mql.addEventListener('change', handleBreakpoint);
handleBreakpoint(mql);
```

---

## Modal / Dialog Modules

### Required features

- **`<dialog>` element.** Use the native HTML `<dialog>` with `.showModal()`.
- **Focus trap.** Use `CoreCode.trapFocus(dialog)` on open. Call cleanup on close.
- **Focus restore.** Store the trigger element before opening. Return focus to it on close.
- **Close mechanisms:** Close button inside dialog, Escape key, click on backdrop.
- **Scroll lock.** `<dialog>` with `.showModal()` handles this natively. If using a custom implementation, apply `overflow: hidden` to `<body>`.
- **ARIA:** `aria-modal="true"`, `aria-labelledby` pointing to the dialog heading.

### CSS

```css
.m-videoModal__dialog {
  border: none;
  padding: 0;
  max-width: min(90vw, 960px);
  background: transparent;
  overscroll-behavior: contain;

  &::backdrop {
    background: rgb(0 0 0 / 0.7);
  }
}
```

---

## Counter / Animation Modules

### Required features

- **IntersectionObserver trigger.** Counter starts when the element enters the viewport.
- **Reduced motion.** If `prefers-reduced-motion: reduce`, show the final number immediately without animation.
- **Duration.** Keep counter animations under 2 seconds.
- **Screen readers.** The final value must be the text content (not an intermediate animation frame). Use `aria-label` with the final value on the counter element.

### Degradation

Without JS, the final number is displayed statically (set as the text content in HubL).

---

## Sticky / Scroll-Driven Modules

### Required features

- **Sticky anchor nav.** Uses `position: sticky` with `top` offset accounting for the site header height (`var(--siteHeaderHeight)`).
- **Active state tracking.** IntersectionObserver watches target sections and updates the active link.
- **Smooth scroll.** `scroll-behavior: smooth` on `<html>` (CSS), with `prefers-reduced-motion` check:
  ```css
  @media (prefers-reduced-motion: no-preference) {
    html {
      scroll-behavior: smooth;
    }
  }
  ```
- **Scroll offset.** Account for sticky header + sticky nav height in scroll targets:
  ```css
  :target {
    scroll-margin-top: calc(var(--siteHeaderHeight) + 60px);
  }
  ```

### Z-index

Sticky modules sit below the header: use `var(--zSticky)`.
