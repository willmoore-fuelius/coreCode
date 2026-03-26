# Performance Optimisation Reference

Checklist of front-end performance fixes to maximise Google PageSpeed Insights / Lighthouse scores. Each item includes the fix pattern and which Core Web Vital it improves.

---

## Image Optimisation

### 1. Add `loading="lazy"` to below-fold images — **LCP / Page Weight**

**Current state:** Only 4 of ~20 image-rendering modules use `loading="lazy"`.

**Rule:** All images below the fold should have `loading="lazy"`. Above-fold images (hero banners, first visible content) should use `loading="eager"` (browser default) and `fetchpriority="high"`.

**Fix pattern:**
```html
<!-- Below-fold images -->
<img src="{{ item.image.src }}"
     alt="{{ item.image.alt }}"
     width="{{ item.image.width }}"
     height="{{ item.image.height }}"
     loading="lazy"
     decoding="async">

<!-- Above-fold / hero images -->
<img src="{{ item.image.src }}"
     alt="{{ item.image.alt }}"
     width="{{ item.image.width }}"
     height="{{ item.image.height }}"
     fetchpriority="high">
```

**Modules needing `loading="lazy"`:**
- `features.module`
- `card_grid.module`
- `icon_grid.module`
- `quick_links.module`
- `large_image_cta.module`
- `logo_section.module`
- `testimonial.module`
- `gallery.module`
- `thumbnail_gallery.module`
- `text_and_media.module`
- `team_grid.module`
- `full_width_cta.module`
- Any other module rendering `<img>` tags without `loading` attribute

**Modules that should NOT use lazy loading:**
- `banner_hero.module` (already has `fetchpriority="high"`)
- `banner_static.module` (above-fold content)

### 2. Add `decoding="async"` to all images — **INP / Main Thread**

**Current state:** Not used anywhere in the codebase.

**Rule:** Add `decoding="async"` to all `<img>` tags. This allows the browser to decode images off the main thread, reducing input delay.

**Fix:** Add `decoding="async"` attribute to every `<img>` tag. Safe to add alongside `loading="lazy"` or `fetchpriority="high"`.

### 3. Add `width` and `height` attributes to all images — **CLS**

**Rule:** Every `<img>` must have explicit `width` and `height` attributes to prevent Cumulative Layout Shift. These are available from HubSpot image fields as `item.image.width` and `item.image.height`.

**Fix pattern:**
```html
<img src="{{ item.image.src }}"
     alt="{{ item.image.alt }}"
     width="{{ item.image.width }}"
     height="{{ item.image.height }}"
     loading="lazy"
     decoding="async">
```

### 4. Use `<picture>` with responsive sources — **Page Weight / LCP**

**Current state:** Only 2 modules use `<picture>` elements.

**Note:** The `image_helper.render_responsive_images()` macro exists but is never used. Either use the macro or implement inline:

**Fix pattern (inline):**
```html
<picture>
  <source srcset="{{ resize_image_url(item.image.src, 0, 0, 767) }}"
          media="(max-width: 767px)" type="image/webp">
  <source srcset="{{ resize_image_url(item.image.src, 0, 0, 1200) }}"
          media="(min-width: 768px)" type="image/webp">
  <img src="{{ item.image.src }}"
       alt="{{ item.image.alt }}"
       width="{{ item.image.width }}"
       height="{{ item.image.height }}"
       loading="lazy"
       decoding="async">
</picture>
```

**Priority modules for `<picture>` adoption:**
- `features.module` (multiple images per page)
- `card_grid.module` (multiple images per page)
- `gallery.module` (many images)
- `text_and_media.module` (large single image)

---

## CSS Optimisation

### 5. Add `content-visibility: auto` to below-fold module sections — **Render Performance**

**Current state:** Not used anywhere.

**Rule:** Add `content-visibility: auto` with a `contain-intrinsic-size` to module sections that are typically below the fold. This defers rendering of off-screen content.

**Fix pattern (in module.css):**
```css
.m-moduleName {
  content-visibility: auto;
  contain-intrinsic-size: auto 500px;
}
```

**Do NOT apply to:**
- Banner/hero modules (above fold)
- Any module that may be the first visible content

**Good candidates:**
- `accordion.module`
- `features.module`
- `card_grid.module`
- `icon_grid.module`
- `testimonial.module`
- `gallery.module`
- `statistics.module`
- `tabs_horizontal.module`
- `tabs_vertical.module`

### 6. Use `contain: content` on isolated module sections — **Render Performance**

**Current state:** Only used on video container.

**Fix pattern:**
```css
.m-moduleName {
  contain: content;
}
```

Appropriate for modules whose content is fully self-contained and doesn't overflow or affect surrounding layout.

---

## JavaScript Optimisation

### 7. Extend `lazyModuleInit` to all interactive modules — **INP / TBT**

**Current state:** Only 5 of ~7 interactive modules use `data-lazy-init`.

**Rule:** All modules with JavaScript that aren't above-fold should register with `window.lazyModuleInit` instead of initialising immediately on `DOMContentLoaded`.

**Modules to add lazy init:**
- `accordion.module`
- `pricing_comparison.module`
- `thumbnail_gallery.module`
- `article_grid.module` (if not already)
- `sitemap.module`
- `pricing_grid.module`

**Fix pattern (in module.html, replacing direct init):**
```html
<section id="{{ name }}" class="m-moduleName" data-lazy-init>
```

Then in module.js, register with the lazy init system instead of running on DOMContentLoaded.

### 8. Add `prefers-reduced-motion` JS check for carousels/animations — **Accessibility + Performance**

**Current state:** CSS-level reduced-motion exists but no JS-level checks.

**Fix pattern (add to carousel/animation JS):**
```javascript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// For Splide carousels:
const splideOptions = {
  autoplay: prefersReducedMotion ? false : true,
  speed: prefersReducedMotion ? 0 : 400,
  // ... other options
};
```

**Modules needing this:**
- Any module using Splide with autoplay
- `statistics.module` if it uses Odometer animations
- Any module with scroll-triggered animations

---

## Resource Hints

### 9. Add preconnect for third-party origins — **Connection Time / LCP**

**Current state:** Only Google Fonts has preconnect.

**Fix (in base.html `<head>`):**
```html
<!-- Already exists -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- Add if Vimeo embeds are used on the site -->
<link rel="preconnect" href="https://player.vimeo.com">
<link rel="preconnect" href="https://i.vimeocdn.com">

<!-- Add if YouTube embeds are used -->
<link rel="preconnect" href="https://www.youtube.com">
<link rel="preconnect" href="https://i.ytimg.com">
```

**Note:** Only add preconnects for origins that are used on most pages. For rarely-used third parties, use `dns-prefetch` instead.

---

## Render Blocking

### 10. Audit for render-blocking resources — **LCP / FCP**

**Current state:** CSS is loaded async via preload trick. JS is deferred to footer. Good baseline.

**Check:** Ensure no module is injecting `<link rel="stylesheet">` or `<script>` tags without async/defer into the `<head>` via `{% require_head %}`.

---

## Layout Stability

### 11. Add `aspect-ratio` to image containers — **CLS**

**Current state:** Image containers rely solely on `width`/`height` attributes. When CSS overrides dimensions (e.g., `width: 100%; height: auto`), the browser loses the intrinsic ratio until the image loads, causing layout shift.

**Fix pattern (in module.css):**
```css
.m-moduleName__image {
  aspect-ratio: 16 / 9; /* or match the expected image ratio */
  width: 100%;
  height: auto;
  object-fit: cover;
}
```

For dynamic ratios from CMS fields:
```html
<div class="m-moduleName__imageWrap" style="aspect-ratio: {{ item.image.width }} / {{ item.image.height }}">
  <img src="{{ item.image.src }}" alt="{{ item.image.alt }}"
       width="{{ item.image.width }}" height="{{ item.image.height }}"
       loading="lazy" decoding="async">
</div>
```

**Priority modules:** Any module using `width: 100%; height: auto` on images — `card_grid`, `features`, `text_and_media`, `team_grid`.

### 12. Add `fetchpriority="high"` and `imagesrcset` to `banner_static` — **LCP**

**Current state:** `banner_hero.module` has `fetchpriority="high"` but `banner_static.module` does not. Both are above-fold hero modules.

**Fix:** Add `fetchpriority="high"` and remove `loading="lazy"` (if present) from the banner_static image. Optionally add `imagesrcset` for responsive loading:

```html
<img src="{{ module.image.src }}"
     alt="{{ module.image.alt }}"
     width="{{ module.image.width }}"
     height="{{ module.image.height }}"
     fetchpriority="high"
     decoding="async">
```

---

## CSS Optimisation (Additional)

### 13. Add `@supports` fallback for `content-visibility` — **Render Performance**

**Current state:** `content-visibility: auto` (item 5) is not supported in Firefox < 125. Without a fallback, modules using `contain-intrinsic-size` may render with unexpected height.

**Fix pattern:**
```css
.m-moduleName {
  contain: content; /* Fallback for browsers without content-visibility */
}

@supports (content-visibility: auto) {
  .m-moduleName {
    content-visibility: auto;
    contain-intrinsic-size: auto 500px;
    contain: initial; /* Reset fallback — content-visibility handles containment */
  }
}
```

---

## JavaScript Optimisation (Additional)

### 14. Debounce resize event listener in header — **INP / Main Thread**

**Current state:** The header component (`c-header`) attaches a `resize` listener that fires on every pixel of window resize without debouncing, causing excessive main thread work.

**Fix pattern:**
```javascript
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    // Header resize logic here
  }, 150);
});
```

Alternatively, use `ResizeObserver` on the header element itself, which fires less frequently than the window `resize` event.

### 15. Use the existing `image_helper` macro or remove it — **Maintenance / Page Weight**

**Current state:** `image_helper.render_responsive_images()` exists in `macros/image_helpers.html` but is never called anywhere in the codebase. This is dead code.

**Fix (choose one):**
1. **Adopt the macro** — replace inline `<picture>` patterns (item 4) with `{{ image_helper.render_responsive_images() }}` calls for consistency
2. **Remove the macro** — if inline `<picture>` is preferred, delete unused code from `macros/image_helpers.html` to reduce maintenance burden

**Note:** If adopting the macro, verify it doesn't suffer from the same HubSpot `<style>` suppression issue that affects `style_helpers`. Image macros output HTML, not `<style>`, so they should be safe.

---

## Priority by Core Web Vital Impact

| Priority | Fix | Primary Metric |
|---|---|---|
| High | `loading="lazy"` on below-fold images | LCP / Page Weight |
| High | `decoding="async"` on all images | INP / Main Thread |
| High | `width`/`height` on all images | CLS |
| High | `content-visibility: auto` on below-fold modules | Render Time |
| High | `aspect-ratio` on image containers | CLS |
| High | `fetchpriority="high"` on `banner_static` | LCP |
| Medium | `<picture>` with responsive sources | Page Weight |
| Medium | Extend `lazyModuleInit` to all interactive modules | TBT / INP |
| Medium | `contain: content` on isolated modules | Render Performance |
| Medium | `@supports` fallback for `content-visibility` | Render Performance |
| Medium | Debounce resize listener in header | INP / Main Thread |
| Low | Additional preconnect hints | Connection Time |
| Low | JS-level reduced-motion checks | Accessibility |
| Low | Adopt or remove unused `image_helper` macro | Maintenance |
