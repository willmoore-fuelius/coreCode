# Performance Standards

Prioritise Core Web Vitals: **LCP** (Largest Contentful Paint), **CLS** (Cumulative Layout Shift), **INP** (Interaction to Next Paint).

---

## Images

- Lazy-load non-critical images: `loading="lazy"` and `decoding="async"`
- Above-fold images: `loading="eager"` (default) and `fetchpriority="high"`
- Avoid background images for primary LCP content
- Every `<img>` must have `width` and `height` attributes to prevent CLS
- Use `<picture>` with responsive sources to reduce page weight
- Use `aspect-ratio` on image containers for dynamic ratios

```html
<!-- Below-fold -->
<img src="{{ image.src }}" alt="{{ image.alt }}"
     width="{{ image.width }}" height="{{ image.height }}"
     loading="lazy" decoding="async">

<!-- Above-fold / hero -->
<img src="{{ image.src }}" alt="{{ image.alt }}"
     width="{{ image.width }}" height="{{ image.height }}"
     fetchpriority="high" decoding="async">
```

---

## CSS Performance

- Animate only `transform`/`translate`/`rotate`/`scale` and `opacity` (GPU-accelerated)
- Never animate `width`, `height`, `margin`, `padding` (triggers layout)
- Use `will-change` sparingly, remove after animation completes
- Keep selectors under 3 levels deep
- Minimise universal selectors (`*`)

### Content Visibility

Add `content-visibility: auto` to below-fold module sections to defer rendering:

```css
.m-moduleName {
  contain: content;
}

@supports (content-visibility: auto) {
  .m-moduleName {
    content-visibility: auto;
    contain-intrinsic-size: auto 500px;
    contain: initial;
  }
}
```

Do NOT apply to banner/hero modules or first visible content.

---

## JavaScript Performance

- Debounce scroll/resize handlers
- Event delegation on module container, not individual elements
- Cache DOM queries — don't repeatedly query the same elements
- Lazy-init expensive operations (observers, carousels, media APIs)
- Minimise DOM manipulation, avoid layout thrashing
- Graceful degradation if JS fails
- Use `IntersectionObserver` to defer initialisation of below-fold modules

---

## Resource Loading

- `font-display: swap` for web fonts
- `async`/`defer` for scripts
- Preconnect for frequently-used third-party origins
- `dns-prefetch` for rarely-used third parties
- Do not inject render-blocking `<link>` or `<script>` tags into `<head>`

---

## Layout Stability (CLS)

- Always set `width` and `height` on images
- Use `aspect-ratio` on containers holding dynamic images
- Avoid inserting content above existing content after load
- Reserve space for dynamic content (ads, embeds, lazy-loaded elements)

---

## Resilience

- Code defensively for missing/malformed CMS content
- Provide graceful degradation without JS
- Validate field data before use (null/empty checks)
- Handle CMS preview vs published page context appropriately
