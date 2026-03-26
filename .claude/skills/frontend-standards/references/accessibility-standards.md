# Accessibility Standards — WCAG 2.1 AA

Accessibility is mandatory, not optional. All HTML output must meet WCAG 2.1 AA standards.

---

## Semantic HTML

- Use semantic elements: `header`, `nav`, `main`, `article`, `section`, `footer` — not generic divs
- Proper heading hierarchy: h1 > h2 > h3 — never skip levels, one H1 per page
- Use `<button>` for JS actions, `<a>` for navigation only
- Use `<fieldset>` and `<legend>` to group related form fields

---

## Images

- Descriptive `alt` for content images, `alt=""` for decorative
- Use `aspect-ratio` or `width`/`height` to prevent CLS
- `loading="lazy"` and `decoding="async"` for non-critical images
- `fetchpriority="high"` for LCP candidates
- Use `srcset`/`sizes` or `<picture>` for responsive images

---

## Colour Contrast

- 4.5:1 minimum for normal text
- 3:1 for large text (18pt+)
- 3:1 for focus indicators against adjacent colours

---

## Keyboard Navigation

- All functionality must work keyboard-only
- Visible `:focus-visible` indicators on all interactive elements — never remove focus styles
- `:focus-visible` (not `:focus`) for keyboard-only indicators
- Focus styles must use at least `outline: 2px solid` with sufficient contrast
- Manage focus when JS changes visibility (dialogs, toggles)
- Do not trap focus unexpectedly
- Store and restore focus when opening/closing dialogs

```css
.e-button:focus-visible {
  outline: 2px solid var(--primaryColour);
  outline-offset: 2px;
}
```

---

## ARIA

Use ARIA only when semantic HTML is insufficient — never as a replacement:

- `aria-label` or `aria-labelledby` to clarify purpose
- `aria-expanded` for expandable content (accordions, dropdowns)
- `aria-controls` to link triggers to panels
- `aria-live` regions for dynamic content that updates without page reload
- `aria-modal="true"` on `<dialog>` elements
- Generate unique IDs for ARIA relationships

---

## Forms

```html
<form>
  <fieldset>
    <legend>Contact Information</legend>
    <label for="fullname">Full Name <span aria-label="required">*</span></label>
    <input type="text" id="fullname" name="fullname" required aria-required="true">
    <label for="email">Email Address</label>
    <input type="email" id="email" name="email" aria-describedby="emailHelp">
    <span id="emailHelp" class="e-helpText">We'll never share your email</span>
  </fieldset>
  <button type="submit">Submit Form</button>
</form>
```

- Every input must have an associated `<label>` with matching `for` attribute
- Use appropriate input types: `email`, `tel`, `number`, `date`
- Include visible error messages and validation feedback
- Mark required fields with `aria-required="true"`

#### CSS-Only Visited Field Indicator

To show validation cues only after a field has been interacted with - without JavaScript - use a paused CSS animation that fires on `:focus-within`. The animation runs instantly and retains its end state via `animation-fill-mode: forwards`, acting as a one-way state toggle.

```css
.m-form__field {
  --wasVisited: false;
  animation: trackVisit 0.00001s linear forwards paused;

  &:focus-within {
    animation-play-state: running;
  }
}

@keyframes trackVisit {
  to { --wasVisited: true; }
}

@container style(--wasVisited: true) {
  input:invalid {
    border-color: var(--dangerColour);
  }
}
```

This avoids the common problem of showing validation errors on fields the user has not yet reached. Use it for progressive disclosure of validation state in form-heavy modules. Falls back gracefully - if the browser does not support container style queries, no visited styling is applied (the safer default).

**Browser support note:** Container style queries for custom properties are supported in Chrome/Edge 111+ and Safari 18+. Firefox support is not yet stable. Use as a progressive enhancement, not a required behaviour path.

---

## Touch Targets

- WCAG 2.2 AA requires 24px minimum target size
- WCAG 2.1 AA recommends 44px for touch targets — aim for 44px where possible
- Use padding to achieve target size when element content is smaller

```css
.m-socialIcons__link {
  padding: var(--space8);
  min-width: 44px;
  min-height: 44px;
}
```

---

## Links

- External links with `target="_blank"` must include `rel="noopener noreferrer"`
- Add `aria-label` with "(opens in new window)" for screen reader users

```html
<a href="{{ url }}" target="_blank" rel="noopener noreferrer"
   aria-label="{{ link_text }} (opens in new window)">
  {{ link_text }}
</a>
```

---

## Dynamic Content

- Use `aria-live="polite"` for content updates (search results, filter counts, carousel position)
- Use `aria-atomic="true"` when the entire region should be re-announced
- Announce page/slide position changes to screen readers

```html
<div aria-live="polite" class="show-for-sr js-carouselStatus">
  Slide 1 of 5
</div>
```

---

## Reduced Motion

Respect `prefers-reduced-motion` in both CSS and JavaScript:

```css
@media (prefers-reduced-motion: reduce) {
  .m-module__item {
    transition: none;
  }
}
```

```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (prefersReducedMotion.matches) {
  // Disable autoplay, counter animations, scroll-triggered effects
}
```

---

## Carousels

- Auto-rotating carousels must have a visible pause/play button (WCAG 2.2.2)
- Provide prev/next buttons as alternatives to dragging (WCAG 2.5.7)
- Announce slide position to screen readers via `aria-live` region

---

## Focus Not Obscured

Ensure focused elements are not hidden by sticky headers or overlays (WCAG 2.4.11):

```css
:target {
  scroll-margin-top: 120px;
}

html {
  scroll-padding-top: 120px;
}
```

---

## Landmarks

- Use `aria-labelledby` or `aria-label` on `<section>` elements to distinguish landmarks
- Use `role="search"` on search form containers
- Provide skip-to-content links for bypassing repeated content blocks

---

## Screen Reader Utilities

Use the `.show-for-sr` class for visually hidden but screen-reader-accessible content:

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
