# Accessibility Optimisation Reference (WCAG 2.2 AA)

Checklist of accessibility fixes to achieve WCAG 2.2 AA compliance. Each item references the specific WCAG criterion, current codebase state, and fix pattern.

WCAG 2.2 adds criteria beyond 2.1 — items marked **[2.2 NEW]** are criteria introduced in WCAG 2.2.

---

## ARIA Live Regions — WCAG 4.1.3 Status Messages

### 1. Add `aria-live` regions for dynamic content updates — **High**

**Current state:** No `aria-live` regions exist anywhere in the codebase. Dynamic content updates are invisible to screen readers.

**Modules needing live regions:**

**Search results (search_box, search_results):**
```html
<!-- Wrap results container -->
<div aria-live="polite" aria-atomic="true">
  <p class="show-for-sr">{{ results|length }} results found for "{{ query }}"</p>
  <!-- results list -->
</div>
```

**Blog filters (blog_filters):**
```html
<!-- After filter is applied, announce result count -->
<div aria-live="polite" class="show-for-sr">
  Showing {{ filtered_count }} posts
</div>
```

**Carousel/slider position (testimonial, gallery, logo_section):**
```html
<!-- Add SR-only live region for slide position -->
<div aria-live="polite" class="show-for-sr js-carouselStatus">
  Slide {{ current }} of {{ total }}
</div>
```

Update via JS when slide changes:
```javascript
const statusEl = container.querySelector('.js-carouselStatus');
if (statusEl) {
  statusEl.textContent = `Slide ${currentIndex + 1} of ${totalSlides}`;
}
```

**Pagination (blog_listing, search_results):**
```html
<div aria-live="polite" class="show-for-sr">
  Page {{ current_page }} of {{ total_pages }}
</div>
```

---

## Focus Management — WCAG 2.4.3 Focus Order, 2.4.7 Focus Visible

### 2. Add focus restoration after dialog/lightbox close — **High**

**Current state:** `video_popup.js` returns focus correctly. `thumbnail_gallery` lightbox does NOT.

**Fix pattern:**
```javascript
// Store trigger before opening
const triggerElement = document.activeElement;
dialog.showModal();

// On close, return focus
dialog.addEventListener('close', () => {
  if (triggerElement) {
    triggerElement.focus();
  }
});
```

### 3. Add `aria-modal="true"` to all `<dialog>` elements — **Medium**

**Current state:** Not set on any dialog.

**Fix:** Add `aria-modal="true"` to every `<dialog>` element in the codebase. While native `<dialog>` + `showModal()` provides modal behaviour, `aria-modal="true"` improves compatibility with older assistive technology.

```html
<dialog class="m-thumbnailGallery__lightbox" aria-modal="true" aria-label="Image gallery">
```

### 4. Standardise focus styles to `:focus-visible` — **Low**

**Current state:** Most modules use `:focus-visible` but some (skip-link, lightbox, popup) still use plain `:focus`.

**Fix:** Replace `:focus` with `:focus-visible` in:
- `css/global/elements/skip-link.css`
- `css/modules/lightbox.css`
- `css/modules/popup.css`
- `css/modules/video.css`

Retain a `:focus:not(:focus-visible)` fallback for Safari versions that may not fully support `:focus-visible`:
```css
.element:focus-visible {
  outline: 2px solid var(--primaryColour);
  outline-offset: 2px;
}
```

---

## New WCAG 2.2 Criteria

### 5. [2.2 NEW] 2.4.11 Focus Not Obscured (Minimum) — **High**

**Criterion:** When a UI component receives keyboard focus, it must not be entirely hidden by other content (sticky headers, footers, overlays).

**Current risk:** The sticky header (`c-header`) may obscure focused elements when scrolling.

**Fix pattern (CSS):**
```css
/* Ensure focused elements scroll clear of the sticky header */
:target {
  scroll-margin-top: 120px; /* height of sticky header + buffer */
}

/* For programmatic focus, use scroll-padding on html */
html {
  scroll-padding-top: 120px;
}
```

Also check `sticky_anchor_links.module` — its sticky bar adds another layer that could obscure focus.

### 6. [2.2 NEW] 2.4.12 Focus Not Obscured (Enhanced) — **Medium**

**Criterion (AAA but good practice):** No part of the focused component is hidden. Add generous `scroll-margin-top` to interactive elements within scrollable containers.

### 7. [2.2 NEW] 2.4.13 Focus Appearance — **Medium**

**Criterion:** Focus indicators must have a minimum area (at least 2px outline or equivalent) and sufficient contrast (3:1 against adjacent colours).

**Audit:** Check all `:focus-visible` styles use at least `outline: 2px solid` with a colour that has 3:1 contrast against the surrounding background.

**Fix pattern:**
```css
.e-button:focus-visible {
  outline: 2px solid var(--primaryColour);
  outline-offset: 2px;
}
```

### 8. [2.2 NEW] 2.5.7 Dragging Movements — **Medium**

**Criterion:** Any functionality that uses dragging must have a single-pointer alternative (no drag required).

**Current risk:** Check if any carousel/slider requires drag/swipe to operate. Splide provides prev/next buttons as alternatives, which satisfies this criterion. Verify buttons are present and keyboard-accessible.

**Modules to check:**
- `gallery.module` (Splide)
- `testimonial.module` (Splide)
- `logo_section.module` (Splide)
- `banner_hero.module` (Splide)

### 9. [2.2 NEW] 2.5.8 Target Size (Minimum) — **High**

**Criterion:** Interactive targets must be at least 24x24 CSS pixels, OR have sufficient spacing so the target + spacing is at least 24px.

**Common violations to check:**
- Carousel pagination dots (Splide dots)
- Close buttons on modals/lightboxes
- Social media icon links
- Filter checkboxes/toggles
- Breadcrumb links when text is very short

**Fix pattern (CSS):**
```css
/* Ensure minimum tap target */
.m-carousel__dot {
  min-width: 24px;
  min-height: 24px;
}

/* Or use padding to achieve target size */
.m-socialIcons__link {
  padding: var(--space8);
  min-width: 44px; /* Aim for 44px for touch-friendly */
  min-height: 44px;
}
```

**Note:** WCAG 2.2 AA requires 24px minimum. WCAG 2.1 AA recommends 44px for touch targets. Aim for 44px where possible.

---

## Screen Reader Improvements

### 10. Update `.show-for-sr` to modern clip-path pattern — **Low**

**Current state:** Uses deprecated `clip: rect(0,0,0,0)`.

**Fix (in `css/global/objects/layout.css`):**
```css
.show-for-sr {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}
```

### 11. Add landmark roles where missing — **Medium**

**Check and fix:**
- `<footer>` in footer partial should use `<footer>` element (implies `role="contentinfo"`)
- Consider adding `role="search"` to search form containers
- Verify `<aside>` is used for sidebar/supplementary content

---

## Interactive Component Improvements

### 12. Accordion: ensure proper ARIA pattern — **Medium**

**Current state:** Has `aria-expanded` and `aria-controls`. Verify full compliance:

```html
<button class="m-accordion__trigger js-accordionTrigger"
        aria-expanded="false"
        aria-controls="panel-{{ name }}-{{ loop.index }}">
  {{ item.heading }}
</button>
<div id="panel-{{ name }}-{{ loop.index }}"
     class="m-accordion__panel js-accordionPanel"
     role="region"
     aria-labelledby="trigger-{{ name }}-{{ loop.index }}">
  {{ item.content|safe }}
</div>
```

### 13. Carousel: add pause/stop control — **WCAG 2.2.2 Pause, Stop, Hide**

**Current state:** Autoplay carousels may not have a visible pause button.

**Fix:** Ensure all autoplay carousels have a visible pause/play toggle button. Splide supports this via its `autoplay` and `pauseOnHover` options, but a visible button is required by WCAG.

---

## Reduced Motion (JS Level)

### 14. Respect `prefers-reduced-motion` in JavaScript — **Medium**

**Current state:** CSS global rule disables transitions/animations. JS-driven animations are NOT paused.

**Fix pattern:**
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

// Check at init
if (prefersReducedMotion.matches) {
  // Disable autoplay, counter animations, scroll-triggered effects
}

// Listen for changes
prefersReducedMotion.addEventListener('change', (e) => {
  if (e.matches) {
    splide.Components.Autoplay.pause();
  } else {
    splide.Components.Autoplay.play();
  }
});
```

**Modules needing this:**
- Any Splide carousel with autoplay
- `statistics.module` with Odometer counter animations
- Any module with scroll-triggered IntersectionObserver animations

---

## Carousel Accessibility

### 15. Add visible pause/play button to all auto-rotating carousels — **High**

**Criterion:** WCAG 2.2.2 Pause, Stop, Hide — any auto-updating content must have a mechanism to pause.

**Current state:** Five Splide-based modules have autoplay enabled but no visible pause button:
- `testimonial.module`
- `gallery.module`
- `logo_section.module`
- `banner_hero.module`
- `article_grid.module` (if carousel mode)

**Fix pattern (HTML, add inside carousel container):**
```html
<button class="m-moduleName__pauseBtn js-carouselPause" aria-label="Pause carousel">
  <span class="m-moduleName__pauseIcon" aria-hidden="true">⏸</span>
</button>
```

**Fix pattern (JS):**
```javascript
const pauseBtn = container.querySelector('.js-carouselPause');
let isPaused = false;

pauseBtn.addEventListener('click', () => {
  if (isPaused) {
    splide.Components.Autoplay.play();
    pauseBtn.setAttribute('aria-label', 'Pause carousel');
    pauseBtn.querySelector('[aria-hidden]').textContent = '⏸';
  } else {
    splide.Components.Autoplay.pause();
    pauseBtn.setAttribute('aria-label', 'Play carousel');
    pauseBtn.querySelector('[aria-hidden]').textContent = '▶';
  }
  isPaused = !isPaused;
});
```

**Fix pattern (CSS):**
```css
.m-moduleName__pauseBtn {
  position: absolute;
  bottom: var(--space8);
  right: var(--space8);
  min-width: 44px;
  min-height: 44px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: var(--radiusSm);
  cursor: pointer;
  z-index: var(--zDropdown);
}
```

---

## Semantic Landmarks

### 16. Add accessible names to `<section>` landmarks — **Medium**

**Criterion:** WCAG 1.3.1 Info and Relationships — when a page has multiple `<section>` elements (each implying a `region` landmark), they must be distinguishable by screen readers.

**Current state:** `banner_hero.module` and `banner_static.module` use `<section>` without `aria-label` or `aria-labelledby`. With multiple banners on a page, screen readers announce "region" without context.

**Fix pattern:**
```html
<!-- If module has a heading, use aria-labelledby -->
<section id="{{ name }}" class="m-bannerHero" aria-labelledby="{{ name }}__heading">

<!-- If no heading, use aria-label -->
<section id="{{ name }}" class="m-bannerHero" aria-label="Hero banner">
```

**Modules to fix:** Any module using `<section>` without `aria-label` or `aria-labelledby`. Particularly important for modules that commonly appear multiple times on a page.

### 17. Replace `title` attribute with visible text or `aria-label` — **Medium**

**Criterion:** WCAG 4.1.2 Name, Role, Value — `title` attribute is not reliably announced by all screen readers and is inaccessible to touch/keyboard users.

**Current state:** `search_results.module` uses `title` as the sole accessible name on interactive elements.

**Fix:** Replace `title` with `aria-label` on interactive elements, or provide visible text:

```html
<!-- Before -->
<a href="{{ result.url }}" title="{{ result.title }}">{{ truncated_text }}</a>

<!-- After -->
<a href="{{ result.url }}" aria-label="{{ result.title }}">{{ truncated_text }}</a>
```

---

## Navigation & Orientation

### 18. Add skip-to-content / back-to-top link — **Medium**

**Criterion:** WCAG 2.4.1 Bypass Blocks — mechanisms must exist to skip repeated content blocks.

**Current state:** A skip-to-content link exists in `base.html`, but there is no back-to-top link for long pages. Users must tab through the entire page to return to navigation.

**Fix (add to `templates/layouts/base.html`, before `</body>`):**
```html
<a href="#top" class="m-backToTop js-backToTop show-for-sr" aria-label="Back to top of page">
  ↑ Back to top
</a>
```

**Fix (JS — make visible after scrolling):**
```javascript
const backToTop = document.querySelector('.js-backToTop');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('is-visible', window.scrollY > 500);
  }, { passive: true });
}
```

**Fix (CSS):**
```css
.m-backToTop {
  position: fixed;
  bottom: var(--space24);
  right: var(--space24);
  opacity: 0;
  pointer-events: none;
  transition: opacity var(--transitionSpeed) var(--easeOut);
  z-index: var(--zFixed);
}

.m-backToTop.is-visible {
  opacity: 1;
  pointer-events: auto;
  /* Override show-for-sr when visible */
  position: fixed;
  width: auto;
  height: auto;
  clip-path: none;
  overflow: visible;
}
```

---

## Responsive & Zoom

### 19. Audit `overflow: hidden` clipping at 200% zoom — **Medium**

**Criterion:** WCAG 1.4.10 Reflow — content must be usable at 200% zoom / 320px viewport without horizontal scrolling or clipping.

**Current state:** `card_grid.module` and other grid-based modules use `overflow: hidden` on containers. At 200% zoom, content may be clipped and inaccessible.

**Fix:** Replace `overflow: hidden` with `overflow: clip` where the goal is to hide decorative overflow (e.g., border-radius clipping), or remove it entirely where not needed:

```css
/* Before — clips all content including at zoom */
.m-cardGrid__card {
  overflow: hidden;
}

/* After — only clips visual overflow, allows text reflow */
.m-cardGrid__card {
  overflow: clip;
}
```

**Note:** `overflow: clip` does not create a scroll container, so it won't interfere with focus management. Test at 200% zoom after changes.

---

## Link Accessibility

### 20. Add `rel="noopener noreferrer"` to all `target="_blank"` links — **Medium**

**Criterion:** WCAG 3.2.5 Change on Request + security best practice — external links opening in new windows should be indicated and safe.

**Current state:** `mega_menu.module` and several other modules use `target="_blank"` without `rel="noopener noreferrer"`. Some have `rel="noopener"` but omit `noreferrer`.

**Fix:** Audit all `target="_blank"` usage across modules and ensure they include both:
```html
<a href="{{ url }}" target="_blank" rel="noopener noreferrer"
   aria-label="{{ link_text }} (opens in new window)">
  {{ link_text }}
</a>
```

**Key points:**
- `noopener` prevents `window.opener` access (security)
- `noreferrer` prevents referrer leakage (privacy)
- `aria-label` with "(opens in new window)" warns screen reader users

### 21. Use `<time>` with `datetime` attribute for all dates — **Low**

**Criterion:** WCAG 1.3.1 Info and Relationships — machine-readable dates help assistive technology parse temporal information.

**Current state:** Blog post dates and event-related dates are rendered as plain text without `<time>` elements.

**Fix pattern:**
```html
<!-- Blog post date -->
<time datetime="{{ content.publish_date|datetimeformat('%Y-%m-%d') }}">
  {{ content.publish_date|datetimeformat('%B %d, %Y') }}
</time>
```

**Locations to fix:**
- Blog listing template (`templates/blog_listing.html`)
- Blog post template (`templates/blog_post.html`)
- Any module rendering dates (events, news, etc.)

---

## Priority by Impact

| Priority | Fix | WCAG Criterion |
|---|---|---|
| High | `aria-live` regions for dynamic content | 4.1.3 Status Messages |
| High | Focus restoration after dialog close | 2.4.3 Focus Order |
| High | Focus not obscured by sticky header | 2.4.11 Focus Not Obscured [2.2] |
| High | Target size minimum 24px | 2.5.8 Target Size [2.2] |
| High | Visible pause button on auto-rotating carousels | 2.2.2 Pause, Stop, Hide |
| Medium | `aria-modal="true"` on dialogs | 4.1.2 Name, Role, Value |
| Medium | Focus appearance (2px, 3:1 contrast) | 2.4.13 Focus Appearance [2.2] |
| Medium | Dragging alternatives verified | 2.5.7 Dragging Movements [2.2] |
| Medium | Carousel pause/stop control | 2.2.2 Pause, Stop, Hide |
| Medium | JS-level reduced motion | 2.3.3 Animation from Interactions |
| Medium | Landmark roles complete | 1.3.1 Info and Relationships |
| Medium | Accessible names on `<section>` landmarks | 1.3.1 Info and Relationships |
| Medium | Replace `title` with `aria-label` on interactive elements | 4.1.2 Name, Role, Value |
| Medium | Back-to-top link for long pages | 2.4.1 Bypass Blocks |
| Medium | Audit `overflow: hidden` at 200% zoom | 1.4.10 Reflow |
| Medium | `rel="noopener noreferrer"` on `target="_blank"` links | 3.2.5 + Security |
| Low | Modern `.show-for-sr` pattern | Best practice |
| Low | `:focus-visible` consistency | 2.4.7 Focus Visible |
| Low | `<time>` with `datetime` for all dates | 1.3.1 Info and Relationships |
