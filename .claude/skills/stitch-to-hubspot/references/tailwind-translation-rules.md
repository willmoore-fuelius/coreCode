# Tailwind to Core Code CSS Translation Rules

This reference defines how to convert Tailwind CSS utility classes from a Stitch HTML export into vanilla CSS using Core Code custom properties. No Tailwind classes should survive into the final output.

---

## Spacing

Tailwind spacing utilities map to Core Code `--space*` tokens. Always snap to the nearest token value.

| Tailwind | Value | Core Code token |
|---|---|---|
| `p-1`, `m-1` | 4px | `var(--space4)` |
| `p-2`, `m-2` | 8px | `var(--space8)` |
| `p-3`, `m-3` | 12px | `var(--space12)` |
| `p-4`, `m-4` | 16px | `var(--space16)` |
| `p-5`, `m-5` | 20px | `var(--space20)` |
| `p-6`, `m-6` | 24px | `var(--space24)` |
| `p-8`, `m-8` | 32px | `var(--space32)` |
| `p-10`, `m-10` | 40px | `var(--space40)` |
| `p-12`, `m-12` | 48px | `var(--space48)` |
| `p-16`, `m-16` | 64px | `var(--space64)` |
| `p-20`, `m-20` | 80px | `var(--space80)` |
| `p-24`, `m-24` | 96px | `var(--space96)` |
| `p-32`, `m-32` | 128px | `var(--space128)` |

For directional spacing (`px-`, `py-`, `pt-`, `pb-`, `pl-`, `pr-`, `mx-`, `my-`, `mt-`, `mb-`, `ml-`, `mr-`), use the same token mapping with the corresponding CSS property. Prefer logical properties where appropriate: `padding-inline` for `px-*`, `padding-block` for `py-*`.

### Gap
| Tailwind | Core Code |
|---|---|
| `gap-*` | `gap: var(--space*);` |
| `gap-x-*` | `column-gap: var(--space*);` |
| `gap-y-*` | `row-gap: var(--space*);` |

---

## Typography

### Font families
| Tailwind | Core Code |
|---|---|
| `font-headline` (Inter in Stitch) | `font-family: var(--fontPrimary);` |
| `font-body` (Work Sans in Stitch) | `font-family: var(--fontSecondary);` |

Note: Check the actual font assignment per project. Stitch may assign fonts differently from the client brand.

### Font sizes
Map Tailwind text sizes to Core Code fluid type tokens:

| Tailwind | Approx size | Core Code token |
|---|---|---|
| `text-xs` | 0.75rem | `font-size: var(--pXs);` |
| `text-sm` | 0.875rem | `font-size: var(--pSm);` |
| `text-base` | 1rem | `font-size: var(--pMd);` (or base body size) |
| `text-lg` | 1.125rem | `font-size: var(--pLg);` |
| `text-xl` | 1.25rem | `font-size: var(--pXl);` |
| `text-2xl` | 1.5rem | `font-size: var(--h5);` or `var(--h6);` |
| `text-3xl` | 1.875rem | `font-size: var(--h4);` |
| `text-4xl` | 2.25rem | `font-size: var(--h3);` |
| `text-5xl` | 3rem | `font-size: var(--h2);` |
| `text-6xl` | 3.75rem | `font-size: var(--h1);` |
| `text-7xl` | 4.5rem | `font-size: var(--h1);` (at upper bound) |
| `text-8xl` | 6rem | `font-size: var(--h1);` (may need a custom `--displaySize` token) |

Core Code uses `clamp()` for fluid sizing. If a Stitch design uses a size larger than `--h1`, define a `--displaySize` token:
```css
--displaySize: clamp(3rem, 5vw + 1rem, 6rem);
```

### Font weights
| Tailwind | Core Code |
|---|---|
| `font-light` | `font-weight: var(--fontLight);` (300) |
| `font-normal` | `font-weight: var(--fontRegular);` (400) |
| `font-medium` | `font-weight: var(--fontMedium);` (500) |
| `font-semibold` | `font-weight: var(--fontSemibold);` (600) |
| `font-bold` | `font-weight: var(--fontBold);` (700) |
| `font-extrabold` | `font-weight: var(--fontXbold);` (800) |
| `font-black` | 900 (no Core Code token - define `--fontBlack: 900;` if needed) |

### Line height
| Tailwind | CSS |
|---|---|
| `leading-tight` | `line-height: 1.1;` |
| `leading-snug` | `line-height: 1.3;` |
| `leading-normal` | `line-height: 1.5;` |
| `leading-relaxed` | `line-height: 1.625;` |
| `leading-loose` | `line-height: 2;` |

### Letter spacing
| Tailwind | CSS |
|---|---|
| `tracking-tighter` | `letter-spacing: -0.05em;` |
| `tracking-tight` | `letter-spacing: -0.025em;` |
| `tracking-normal` | `letter-spacing: 0;` |
| `tracking-wide` | `letter-spacing: 0.025em;` |
| `tracking-wider` | `letter-spacing: 0.05em;` |
| `tracking-widest` | `letter-spacing: 0.1em;` |

---

## Colours

Stitch uses Material 3-style semantic colour tokens in its Tailwind config. These must be mapped to Core Code custom properties.

### Translation approach
1. Extract hex values from the Stitch Tailwind config
2. Map to the nearest Core Code semantic token
3. If no semantic token exists, map to the grey scale or define a new project-specific token

### Common mappings
| Stitch pattern | CSS equivalent |
|---|---|
| `text-primary` | `color: var(--primaryColour);` |
| `text-secondary` | `color: var(--secondaryColour);` |
| `text-on-surface` | `color: var(--textColour);` |
| `text-on-surface-variant` | `color: var(--textColourLight);` |
| `text-on-primary` | `color: var(--textColourInverse);` (or `#fff`) |
| `bg-primary` | `background-color: var(--primaryColour);` |
| `bg-secondary` | `background-color: var(--secondaryColour);` |
| `bg-surface` | `background-color: var(--backgroundColour);` |
| `bg-surface-container-low` | `background-color: var(--grey10);` (or project-defined `--surfaceLow`) |
| `bg-surface-container-high` | `background-color: var(--grey20);` (or project-defined `--surfaceHigh`) |

### Opacity modifiers
Tailwind uses `/opacity` syntax (e.g. `text-on-surface/70`). Translate to CSS opacity or rgba:
```css
/* Tailwind: text-[#1a1c19]/70 */
color: rgb(26 28 25 / 0.7);
```

Or if using a custom property:
```css
color: color-mix(in srgb, var(--textColour) 70%, transparent);
```

---

## Layout

### Container
| Tailwind | Core Code |
|---|---|
| `max-w-7xl` (80rem) | `max-width: var(--containerWidth);` + `margin-inline: auto;` + `padding-inline: var(--space32);` |

### Grid
| Tailwind | CSS |
|---|---|
| `grid` | `display: grid;` |
| `grid-cols-2` | `grid-template-columns: repeat(2, 1fr);` |
| `grid-cols-3` | `grid-template-columns: repeat(3, 1fr);` |
| `grid-cols-12` | `grid-template-columns: repeat(12, 1fr);` |
| `col-span-5` | `grid-column: span 5;` |
| `col-span-7` | `grid-column: span 7;` |

### Flexbox
| Tailwind | CSS |
|---|---|
| `flex` | `display: flex;` |
| `flex-col` | `flex-direction: column;` |
| `flex-wrap` | `flex-wrap: wrap;` |
| `items-center` | `align-items: center;` |
| `justify-between` | `justify-content: space-between;` |
| `justify-center` | `justify-content: center;` |
| `flex-1` | `flex: 1 1 0%;` |

### Responsive prefixes
| Tailwind prefix | Core Code media query |
|---|---|
| `sm:` | `@media (width >= 576px)` |
| `md:` | `@media (width >= 768px)` |
| `lg:` | `@media (width >= 992px)` |
| `xl:` | `@media (width >= 1200px)` |
| `2xl:` | `@media (width >= 1400px)` |

Write mobile-first. Base styles apply at all sizes. Add media queries for larger breakpoints only.

---

## Border Radius

| Tailwind | Core Code |
|---|---|
| `rounded` | `border-radius: var(--radiusSm);` |
| `rounded-lg` | `border-radius: var(--radiusMd);` |
| `rounded-xl` | `border-radius: var(--radiusLg);` |
| `rounded-2xl` | `border-radius: var(--radiusLg);` (snap up) |
| `rounded-3xl` | `border-radius: var(--radiusXl);` |
| `rounded-full` | `border-radius: 9999px;` (pill shape) |

---

## Shadows

Core Code avoids heavy shadows. Translate Tailwind shadows conservatively:

| Tailwind | CSS |
|---|---|
| `shadow-sm` | `box-shadow: 0 1px 2px rgb(0 0 0 / 0.05);` |
| `shadow` | `box-shadow: 0 1px 3px rgb(0 0 0 / 0.1);` |
| `shadow-xl` | `box-shadow: 0 8px 24px rgb(0 0 0 / 0.08);` |
| `shadow-2xl` | `box-shadow: 0 12px 40px rgb(0 0 0 / 0.1);` |

Use tinted shadows where possible (colour-mix with the primary colour at low opacity) for a more cohesive feel.

---

## Transitions and Animations

| Tailwind | Core Code |
|---|---|
| `transition-colors` | `transition: color var(--transitionSpeed) var(--easeOut), background-color var(--transitionSpeed) var(--easeOut);` |
| `transition-transform` | `transition: translate var(--transitionSpeed) var(--easeOut), rotate var(--transitionSpeed) var(--easeOut), scale var(--transitionSpeed) var(--easeOut);` |
| `transition-all` | `transition: all var(--transitionSpeed) var(--easeOut);` (use sparingly - prefer specific properties) |
| `duration-500` | Override `--transitionSpeed` locally or use `0.5s` directly |
| `duration-700` | `0.7s` |

Always add reduced-motion fallback:
```css
@media (prefers-reduced-motion: reduce) {
  .m-element {
    transition: none;
  }
}
```

---

## Transforms

Use individual transform properties (composable, independently animatable):

| Tailwind | CSS |
|---|---|
| `rotate-1` | `rotate: 1deg;` |
| `rotate-2` | `rotate: 2deg;` |
| `rotate-3` | `rotate: 3deg;` |
| `-rotate-1` | `rotate: -1deg;` |
| `scale-110` | `scale: 1.1;` |
| `hover:scale-95` | `.element:hover { scale: 0.95; }` |
| `translate-x-1` | `translate: 4px 0;` |

---

## Visibility and Overflow

| Tailwind | CSS |
|---|---|
| `hidden` | `display: none;` |
| `overflow-hidden` | `overflow: hidden;` |
| `truncate` | `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;` |
| `sr-only` | See Core Code skip-link pattern in `css/elements/skip-link.css` |

---

## Pseudo-classes (interactive states)

| Tailwind | CSS |
|---|---|
| `hover:bg-primary` | `.element:hover { background-color: var(--primaryColour); }` |
| `focus:ring-2` | `.element:focus-visible { outline: 2px solid var(--primaryColour); outline-offset: 2px; }` |
| `group-hover:text-white` | `.m-parent:hover .m-parent__child { color: #fff; }` |
| `active:scale-90` | `.element:active { scale: 0.9; }` |

Note: Always use `:focus-visible` not `:focus` for keyboard-only focus indicators.

---

## Aspect Ratio and Object Fit

| Tailwind | CSS |
|---|---|
| `aspect-video` | `aspect-ratio: 16 / 9;` |
| `aspect-square` | `aspect-ratio: 1;` |
| `object-cover` | `object-fit: cover;` |
| `object-center` | `object-position: center;` |

---

## Z-index

Map to Core Code z-index scale:

| Tailwind | Core Code |
|---|---|
| `z-0` | `z-index: var(--zDefault);` |
| `z-10` | `z-index: var(--zDefault);` |
| `z-50` | `z-index: var(--zHeader);` (for nav/header elements) |
| `-z-0` | `z-index: var(--zBelow);` |
