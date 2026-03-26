# CSS Standards

**Default: vanilla CSS with native nesting.** No SCSS, Sass, Less, or preprocessors. If the project uses a preprocessor, the user will say so - do not assume one. Native CSS nesting is permitted within the constraints documented in the "Nesting Guidelines" subsection below.

---

## Naming Conventions — BEM + ITCSS Prefixes

Use BEM methodology with **camelCase within each segment** and mandatory ITCSS prefixes:

| Prefix | Layer | Example |
|--------|-------|---------|
| `.o-` | Objects (layout) | `.o-wrapper`, `.o-container` |
| `.c-` | Components (header/footer) | `.c-header`, `.c-footer` |
| `.e-` | Elements (base HTML) | `.e-button`, `.e-toggle` |
| `.m-` | Modules (page modules) | `.m-cardGrid`, `.m-accordion` |

**BEM structure:** `.m-blockName__elementName--modifierName`
- Block: `.m-productGrid`
- Element: `.m-productGrid__headerImage`
- Modifier: `.m-productGrid__headerImage--largeFeatured`

Single-word names stay lowercase: `.m-card`, `.m-accordion`.

### State Classes

- `is-` for states: `is-active`, `is-loading`, `is-disabled`, `is-hidden`, `is-visible`, `is-initialized`
- `has-` for conditions: `has-error`, `has-success`, `has-content`, `has-submenu`

### Other Naming

- **CSS variables:** camelCase — `--primaryColour`, `--space20`
- **File names:** snake_case — `card_grid.module`, `video_popup.js`

---

## Nesting Guidelines

Native CSS nesting is the default. Use it to co-locate related rules, reducing selector repetition and improving readability. The following constraints apply.

**Nest these inside a block selector:**
- Pseudo-classes and pseudo-elements (`&:hover`, `&::before`, `&:focus-visible`)
- State classes (`&.is-active`, `&.has-error`)
- Compound modifier selectors (`&.m-card--featured`)
- Media queries, container queries, and feature queries
- User preference queries (`prefers-reduced-motion`, `prefers-color-scheme`)

**Keep these flat at root level:**
- BEM element selectors (`.m-card__title`, `.m-card__image`) - the class name already encodes the relationship. Nesting would add specificity without adding clarity.
- Unrelated selectors that happen to share a parent in the DOM

**Never do these:**
- Sass-style concatenation (`&__element`, `&--modifier`) - native CSS does not support selector string concatenation. Write the full class name.
- Nesting deeper than 2 levels - if you are nesting 3+ levels, split into smaller component blocks.

**Specificity note:** When the parent rule has a selector list (e.g. `.m-card, .m-panel { ... }`), the browser expands nested selectors using `:is()`, which takes the highest specificity from the list. If one selector in the list is an ID, all nested rules inherit ID-level specificity. Avoid selector lists with mixed specificity weights as nesting parents.

**Example - component with nesting:**

```css
.m-card {
  padding: var(--space20);
  isolation: isolate;

  &:hover {
    box-shadow: var(--shadowElevated);
  }

  &.is-active {
    border-color: var(--primaryColour);
  }

  &.m-card--featured {
    grid-column: span 2;
  }

  @media (prefers-reduced-motion: no-preference) {
    transition: box-shadow 0.2s ease-out;
  }

  @media (width >= 768px) {
    padding: var(--space32);
  }
}

/* BEM elements stay flat */
.m-card__title {
  font-size: var(--fontSize20);
  font-weight: 700;
}

.m-card__image {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}
```

Mobile-first approach still applies. Nest the wider breakpoint media query inside the block; repeat the full selector at each breakpoint only if nesting would exceed 2 levels.

---

## Breakpoints — Range Syntax

Always use range syntax, never `min-width`/`max-width`:

```css
@media (width >= 992px) { /* Desktop */ }
@media (width < 768px) { /* Mobile only */ }
@media (768px <= width < 1200px) { /* Tablet only */ }
```

| Name | Value |
|------|-------|
| sm | `>= 576px` |
| md | `>= 768px` |
| lg | `>= 992px` (primary) |
| xl | `>= 1200px` |
| xxl | `>= 1400px` |

---

## Scoping and Methodology

- All CSS must be scoped under a module root class (with ITCSS prefix) to prevent leakage and collisions
- Use BEM (Block Element Modifier) methodology with camelCase within each segment and ITCSS prefixes
- Avoid deep nesting in selectors and BEM class names
- Minimise utility classes — prefer well-defined BEM components
- Use CSS custom properties extensively for repeated values and brand-related properties

---

## Modern CSS Features

**`:is()` and `:where()`** — simplify compound selectors:

```css
/* Concise */
.m-card__title a:is(:hover, :focus-visible) {
  color: var(--primaryColour);
}

/* Zero specificity — easily overridden */
:where(ul, ol):not([class]) {
  padding-left: var(--space20);
}
```

**Logical properties** — prefer over physical where appropriate:

```css
/* Preferred — logical */
.o-container {
  margin-inline: auto;
  padding-inline: var(--space20);
}

/* Avoid for inline axis */
.o-container {
  margin: 0 auto;
  padding-left: var(--space20);
  padding-right: var(--space20);
}
```

Common mappings:
- `margin: 0 auto` → `margin-inline: auto`
- `padding-left` / `padding-right` → `padding-inline` or `padding-inline-start` / `padding-inline-end`
- `margin-top` / `margin-bottom` → `margin-block` or `margin-block-start` / `margin-block-end`

Use physical properties when direction-specific behaviour is intentional (e.g. absolute positioning offsets).

**Individual transform properties** — for single-axis transforms:

```css
/* Preferred — individual property, composable */
.m-card:hover {
  translate: 0 -8px;
}

.m-accordion__icon {
  rotate: 180deg;
  transition: rotate var(--transitionSpeed) var(--easeOut);
}

/* Shorthand — only when combining multiple non-animated transforms */
.m-video__play {
  transform: translateY(-50%) translateX(-50%);
}
```

**`accent-color`** - style native form controls (checkboxes, radios, range inputs, progress bars) without replacing them with custom UI. Preserves accessibility and reduces implementation overhead:
```css
input[type="checkbox"],
input[type="radio"] {
  accent-color: var(--primaryColour);
}
```

**`color-scheme`** - declare supported colour schemes so the browser adapts native UI (scrollbars, form controls, system colours). Set on `:root` when the project supports dark mode:
```css
:root {
  color-scheme: light dark;
}
```

**`overscroll-behavior: contain`** - prevent scroll chaining on fixed overlays, modals, and drawers. Apply to any scrollable element that should not propagate scroll events to the page behind it:
```css
.m-modal__body {
  overflow-y: auto;
  overscroll-behavior: contain;
}
```

**`isolation: isolate`** - create a new stacking context without assigning a z-index. Use on component wrappers to prevent z-indexed children from leaking into the parent stacking context:
```css
.m-card {
  isolation: isolate;
}
```
Prefer `isolation: isolate` over arbitrary z-index values for containment. Reserve z-index tokens for cases where explicit stacking order between sibling contexts is required.

---

## CSS Performance

- Keep selectors under 3 levels deep
- Minimise universal selectors (`*`)
- Animate only `transform`/`translate`/`rotate`/`scale` and `opacity` (GPU-accelerated)
- Use `will-change` sparingly, remove after animation completes
- Never animate `width`, `height`, `margin`, `padding` (triggers layout)

---

## Reduced Motion

Use an opt-in animation pattern. Declare transitions and animations only inside a `prefers-reduced-motion: no-preference` media query. If the query fails to evaluate or the browser does not support it, the default is no animation - the safer outcome.

**Primary pattern (opt-in):**

```css
.m-imageGallery__item {
  /* No transition by default */
}

@media (prefers-reduced-motion: no-preference) {
  .m-imageGallery__item {
    transition: opacity 0.3s ease-out;
  }
}
```

**Legacy override pattern** - use only when overriding third-party CSS or existing code that already applies animation unconditionally:

```css
@media (prefers-reduced-motion: reduce) {
  .m-imageGallery__item {
    transition: none;
    animation: none;
  }
}
```

When reviewing code, flag the legacy pattern as a **Minor** finding if it could be refactored to opt-in instead.

---

## Module CSS Pattern

```css
/* ==========================================================================
   Image Gallery Module
   ========================================================================== */

.m-imageGallery {
  color: var(--grey90);
}

/* Grid
   ========================================================================== */

.m-imageGallery__grid {
  display: block;
  padding: var(--space20);

  @media (width >= 768px) {
    display: flex;
  }
}

.m-imageGallery__title {
  font-size: var(--h3);
  color: var(--primaryColour);

  @media (width >= 992px) {
    font-size: var(--h2);
  }
}

/* Focus states */
.m-imageGallery__trigger {
  &:focus-visible {
    outline: 2px solid var(--primaryColour);
    outline-offset: -2px;
  }
}

/* Reduced motion — opt-in animation pattern */
.m-imageGallery__item {
  @media (prefers-reduced-motion: no-preference) {
    transition: opacity 0.3s ease-out;
  }
}
```

---

## Comment Standards

```css
/* ==========================================================================
   Component Name
   ========================================================================== */

.m-componentName {
  /* Module styles */
}

/* Subsection
   ========================================================================== */

.m-componentName__element {
  /* Single line comment for complex logic */
  property: value;
}
```

Comment when explaining WHY, not WHAT. Comment workarounds, complex business logic, and performance optimisations. Do not comment obvious code.
