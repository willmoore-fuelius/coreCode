# Design System Document

## 1. Overview & Creative North Star

### The Creative North Star: "The Digital Architect"
This design system is built for the high-stakes world of B2B growth marketing. It rejects the generic "SaaS-template" aesthetic in favor of **The Digital Architect**—a persona that is authoritative, technically precise, and vibrantly energetic. We move beyond simple layouts by utilizing intentional asymmetry, high-contrast typography scales, and a sophisticated layering of surfaces that feel more like a physical workspace than a flat screen.

To break the "template" look, the system relies on **Editorial Tension**: large, bold headlines paired with generous whitespace, overlapping imagery that breaks container bounds, and a rigorous adherence to tonal depth rather than structural lines.

---

## 2. Colors

The palette is anchored by deep, authoritative purples (`primary`) and energized by high-octane accents in pink (`secondary`) and green (`tertiary`).

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to define sections. Layout boundaries must be established solely through background color shifts. For example, a `surface-container-low` section should sit directly against a `background` or `surface` section. This creates a modern, seamless flow that feels integrated rather than boxed-in.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Hierarchy is defined by "stacking" the surface-container tiers:
- **Surface (Base):** Your primary canvas (`#fafaf3`).
- **Surface-Container-Low:** Use for large structural sections to provide a subtle shift in focus.
- **Surface-Container-Highest:** Use for "elevated" elements like cards or navigation bars that need to feel closest to the user.

### The "Glass & Gradient" Rule
To add visual "soul," utilize Glassmorphism for floating elements (e.g., sticky headers or overlays). Use semi-transparent versions of `surface` colors with a `backdrop-blur` (12px–20px). Main CTAs and hero backgrounds should utilize subtle gradients transitioning from `primary` (#31006f) to `primary_container` (#491d8e) to provide depth and professional polish.

---

## 3. Typography

The typography strategy leverages **Inter** for technical precision and **Work Sans** for approachable, readable body copy.

*   **Display (Inter):** Used for "Hero" moments. These should be set with tight letter-spacing and high contrast against the background.
*   **Headlines (Inter):** The primary driver of authority. Use `headline-lg` (2rem) for major section headers.
*   **Body (Work Sans):** Chosen for its exceptional readability in B2B contexts. `body-lg` (1rem) is the standard for content-heavy sections.
*   **Labels (Inter):** High-density information (like chips or small buttons) uses Inter for its geometric clarity.

**Identity Expression:** The contrast between the rigid, tech-focused Inter headlines and the softer, more human Work Sans body text creates a "Trusted Partner" feel—technical expertise delivered by real people.

---

## 4. Elevation & Depth

We achieve hierarchy through **Tonal Layering** rather than traditional shadows or lines.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural lift.
*   **Ambient Shadows:** If a floating effect is required, shadows must be ultra-diffused. 
    *   *Spec:* Blur: 30px–60px | Opacity: 4%–8% | Color: A tinted version of `on-surface` (`#1a1c19`). Avoid pure grey or black shadows.
*   **The "Ghost Border" Fallback:** If a container requires a boundary for accessibility, use a "Ghost Border": the `outline-variant` token at **10%–20% opacity**. Never use 100% opaque borders.
*   **Glassmorphism:** Use backdrop blurs to allow the vibrant primary and secondary colors to bleed through containers, making the layout feel immersive.

---

## 5. Components

### Buttons
*   **Primary:** A gradient fill (Primary to Primary Container) with `on_primary` text. Use `roundedness.full` for an organic, modern feel.
*   **Secondary:** A solid `secondary` (#b80f55) fill. Used for high-conversion B2B triggers like "Book a Call."
*   **Tertiary:** No background; `primary` text with an underline that appears on hover.

### Cards & Content Sections
*   **Rule:** Forbid divider lines. Separate content using the `Spacing Scale` (specifically `spacing.12` to `spacing.20`) or subtle background shifts between surface tiers.
*   **Styling:** Use `roundedness.xl` (0.75rem) for a premium, softened tech aesthetic.

### Input Fields
*   **State:** Default fields use `surface_container_high` backgrounds. 
*   **Focus:** Instead of a heavy border, use a 2px `primary` glow or a subtle background shift to `surface_container_highest`.

### Signature Component: The "Growth Chip"
For a B2B agency, use `tertiary_fixed` (vibrant green) chips to highlight stats or "Ready to Grow" indicators. This creates an immediate visual link between the brand and positive results.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts where text is left-aligned and imagery overlaps the container edges.
*   **Do** leverage the `primary_fixed` (light purple) for large background areas to create a "tinted" brand world.
*   **Do** prioritize whitespace. If a section feels crowded, jump two levels up the `Spacing Scale`.

### Don't
*   **Don't** use 1px solid borders to separate list items or cards. Use `spacing.4` gaps instead.
*   **Don't** use pure black (#000000) for text. Always use `on_surface` (#1a1c19) for a softer, more professional contrast.
*   **Don't** use traditional "Drop Shadows" with high opacity. They break the architectural "frosted glass" aesthetic.