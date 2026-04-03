# Design System Document: The Digital Archivist

## 1. Overview & Creative North Star: The Digital Archivist

This design system is engineered for **Modéa Academic**, a high-performance environment where scholarly rigor meets ultra-modern digital craftsmanship. The Creative North Star, **"The Digital Archivist,"** envisions the interface not as a website, but as a sophisticated, high-contrast vault of knowledge.

To break the "template" look, we move away from standard rigid grids in favor of **intentional asymmetry**. Primary content is anchored with heavy typographic weights, while secondary metadata "floats" in the periphery using OLED-optimized depth. We utilize the absolute black (`#000000`) of OLED displays to create a sense of infinite space, where information is illuminated rather than just displayed.

---

## 2. Colors & Surface Architecture

The palette is rooted in a "True Black" philosophy to maximize battery efficiency and visual contrast.

### Palette Highlights

- **Background:** `#131313` (System Base) transitioning to `#000000` for deep immersion.
- **Primary:** `primary (#adc6ff)` and `primary_container (#4d8eff)` provide the "Vibrant Blue" energy required for action.
- **Neutral/Slate:** Using `surface_container` tiers to define "The Digital Archivist's" shelves.

### The "No-Line" Rule

**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries must be defined solely through:

1. **Background Color Shifts:** Placing a `surface_container_high (#2a2a2a)` card against the `surface (#131313)` background.
2. **Tonal Transitions:** Using subtle value changes to imply a change in content focus.

### Surface Hierarchy & Nesting

Instead of flat containers, treat the UI as stacked layers of dark glass.

- **Base Level:** `surface` (`#131313`) – The desk surface.
- **Content Level:** `surface_container` (`#1f1f1f`) – The primary document.
- **Active/Hover Level:** `surface_container_high` (`#2a2a2a`) – The elevated record.

### The "Glass & Gradient" Rule

To add "soul," use a 10% opacity `primary` tint on top of `surface_container_lowest` for floating modals, combined with a `backdrop-blur` of 12px. Main CTAs should utilize a linear gradient from `primary` to `primary_container` (135° angle) to prevent a flat, "plastic" appearance.

---

## 3. Typography: The Editorial Voice

We use **Manrope** exclusively. Its geometric yet humane construction reflects the precision of academic research.

- **Display (Editorial Impact):** `display-lg` (3.5rem). Use this for section titles in Polish (e.g., _Archiwum_, _Publikacje_). Low letter-spacing (-0.02em) for a tight, high-end feel.
- **Headlines (Structure):** `headline-md` (1.75rem). Bold weights to anchor the "Digital Archivist" aesthetic.
- **Body (Readability):** `body-lg` (1rem). High line-height (1.6) to ensure long academic texts remain legible against the high-contrast black background.
- **Labels (Metadata):** `label-md` (0.75rem). Used for citations and dates. Always uppercase with +0.05em tracking for a "catalogued" look.

---

## 4. Elevation & Depth

In an OLED environment, traditional drop shadows are often invisible. We use **Tonal Layering**.

- **The Layering Principle:** Place a `surface_container_low (#1b1b1b)` element on the `surface_dim (#131313)` background. This creates a "soft lift" that feels organic.
- **Ambient Shadows:** For floating elements (like dropdowns), use a wide, diffused shadow: `box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6)`. The shadow must be pure black to blend into the OLED background.
- **The "Ghost Border" Fallback:** If a container requires definition against an identical color, use `outline_variant (#424754)` at **15% opacity**. Never use 100% opaque lines.
- **Glassmorphism:** Navigation bars must use a semi-transparent `surface` color with a heavy blur to allow the "Archivist's" content to scroll behind it beautifully.

---

## 5. Components

### Buttons

- **Primary:** Gradient from `primary` to `primary_container`. White text (`on_primary`). 8px roundness (`xl`).
- **Secondary:** `surface_container_highest` background with `primary` colored text. No border.
- **Tertiary:** Pure text with an underline that appears only on hover.

### Input Fields

- **State:** No visible box until focused.
- **Resting:** A simple `surface_container_low` fill with a `label-sm` floating above it.
- **Active:** A 1px "Ghost Border" of `primary` at 40% opacity appears.

### Cards & Lists

- **Rule:** Forbid divider lines.
- **Implementation:** Separate scholarly entries using `spacing.8` (2rem) of vertical white space or by alternating background tones between `surface_container_low` and `surface_container_lowest`.

### Academic Chips

- Use `secondary_container` for tag-based filtering (e.g., _Medycyna_, _Historia_). The text color should be `on_secondary_container`.

---

## 6. Do’s and Don’ts (Zasady i Błędy)

### Do’s

- **Use Polish phrasing with intent:** Use "Szukaj w zasobach" instead of a generic "Szukaj."
- **Maximize Contrast:** Ensure text on OLED black is either `on_surface` (light grey) or `primary` (blue). Pure white text (#FFFFFF) should be used sparingly for Display styles only to avoid eye strain.
- **Embrace Space:** Give academic content room to breathe. Use `spacing.12` or `spacing.16` between major sections.

### Don’ts

- **No Footers:** As per the creative direction, the experience ends with the content. Use a "End of Archive" typographic mark instead.
- **No Rigid Boxes:** Avoid 100% width containers. Let content align to an asymmetrical grid to feel like a modern editorial layout.
- **No Pure Grey Shadows:** Shadows must be black or tinted blue; never a generic mid-grey which looks "muddy" on OLED.
