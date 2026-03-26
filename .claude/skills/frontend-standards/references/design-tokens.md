# Design Tokens

The Core Code theme uses CSS custom properties with **camelCase naming**. All tokens are defined in `templates/layouts/base.html` (inline `<style>`) and `css/theme_overrides.css`.

---

## Spacing Scale (4px–128px)

```css
--space0: 0;
--space4: 0.25rem;    /* 4px */
--space8: 0.5rem;     /* 8px */
--space12: 0.75rem;   /* 12px */
--space16: 1rem;      /* 16px */
--space20: 1.25rem;   /* 20px */
--space24: 1.5rem;    /* 24px */
--space32: 2rem;      /* 32px */
--space40: 2.5rem;    /* 40px */
--space48: 3rem;      /* 48px */
--space64: 4rem;      /* 64px */
--space80: 5rem;      /* 80px */
--space96: 6rem;      /* 96px */
--space128: 8rem;     /* 128px */
```

---

## Colours

```css
/* Greyscale — numbered by lightness (10 lightest, 90 darkest) */
--grey10: #E8E9EA;
--grey20: #D2D3D5;
--grey30: #C2C2C2;
--grey40: #BBBEC0;
--grey50: #6C7378;
--grey60: #5E646A;
--grey90: #1D252D;

/* Brand colours — base tokens */
--primary10: #46107b;
--primary20: #ee52ac;
--primary30: #e3f7e8;

/* Semantic aliases */
--primaryColour: var(--primary10);
--secondaryColour: var(--grey60);
--tertiaryColour: var(--primary20);
--highlightColour: var(--primary30);

/* State colours */
--colorSuccess: #10b981;
--colorWarning: #f59e0b;
--colorError: #ef4444;
--colorInfo: #3b82f6;

/* Base */
--white: #fff;
--black: #000;
```

---

## Typography (fluid with clamp)

```css
/* Headings */
--h1: clamp(2.1875rem, 4vw + 1rem, 3.875rem);     /* 35px → 62px */
--h2: clamp(2rem, 3vw + 0.5rem, 2.875rem);         /* 32px → 46px */
--h3: clamp(1.75rem, 2vw + 0.5rem, 2rem);           /* 28px → 32px */
--h4: clamp(1.25rem, 1.5vw + 0.5rem, 1.5rem);       /* 20px → 24px */
--h5: clamp(0.9375rem, 1vw + 0.5rem, 1.0625rem);    /* 15px → 17px */
--h6: 0.8125rem;                                      /* 13px */

/* Paragraph */
--pXs: 0.75rem;     /* 12px */
--pSm: 0.875rem;    /* 14px */
--pBase: 1rem;      /* 16px */
--pLg: 1.125rem;    /* 18px */
--pXl: 1.25rem;     /* 20px */

/* Families */
--fontPrimary: "Montserrat", sans-serif;
--fontSecondary: 'open-sans', sans-serif;

/* Weights */
--fontLight: 300;
--fontRegular: 400;
--fontSemibold: 600;
--fontBold: 700;
--fontXbold: 900;
```

---

## Z-Index Scale

```css
--zBelow: -1;
--zBase: 0;
--zDropdown: 100;
--zSticky: 200;
--zFixed: 300;
--zModalBackdrop: 400;
--zModal: 500;
--zPopover: 600;
--zTooltip: 700;
```

---

## Border & Radius

```css
/* Border widths */
--border1: 1px;
--border2: 2px;
--border3: 3px;

/* Border radius */
--radiusNone: 0;
--radiusXxs: 0.25rem;   /* 4px */
--radiusXs: 0.5rem;     /* 8px */
--radiusSm: 0.75rem;    /* 12px */
--radiusMd: 1rem;       /* 16px */
--radiusLg: 1.5rem;     /* 24px */
--radiusXl: 2rem;       /* 32px */
--radiusAvatar: 50%;
```

---

## Animation

```css
--transitionSpeed: 0.3s;
--easeIn: cubic-bezier(0.4, 0, 1, 1);
--easeOut: cubic-bezier(0, 0, 0.2, 1);
--easeInOut: cubic-bezier(0.4, 0, 0.2, 1);
```

Usage:
```css
.m-accordion__item {
  transition: box-shadow var(--transitionSpeed) var(--easeOut);
}
```

---

## Layout & Grid (CMS configurable)

```css
--containerWidth: 1440px;          /* Configurable 1200-2000px */
--moduleTopSpacing: 80px;          /* Responsive: mobile 30px, desktop 80px */
--moduleBottomSpacing: 80px;       /* Responsive: mobile 30px, desktop 80px */
--moduleLeftSpacing: 40px;         /* Responsive: mobile 24px, desktop 40px */
--moduleRightSpacing: 40px;        /* Responsive: mobile 24px, desktop 40px */
--gridGutters: 20px;               /* Column gaps */
--gridColumns: 12;                 /* Grid system columns */
```

---

## Breakpoints

```css
--breakpointSmall: 576px;
--breakpointMedium: 768px;
--breakpointLarge: 992px;          /* Primary breakpoint */
--breakpointXlarge: 1200px;
--breakpointXxlarge: 1400px;
```

Use raw pixel values in `@media` queries with range syntax:
```css
@media (width >= 992px) { /* Desktop */ }
@media (width < 768px) { /* Mobile only */ }
@media (768px <= width < 1200px) { /* Tablet only */ }
```

---

## Usage Rules

- Always use design system tokens — no magic numbers (e.g. `var(--space20)` not `17px`)
- All variable names use **camelCase** (`--primaryColour`, not `--primary-colour`)
- Module spacing uses inline `style` attribute on `.o-wrapper--module` injecting `--moduleTopSpacingMobile`, `--moduleBottomSpacingMobile`, `--moduleTopSpacingDesktop`, `--moduleBottomSpacingDesktop`
