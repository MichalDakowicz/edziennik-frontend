# Design System Specification: Editorial Academic Excellence

## 1. Overview & Creative North Star
**The Creative North Star: "The Digital Curator"**

This design system moves away from the cluttered, utilitarian "spreadsheet" aesthetic common in educational software. Instead, it adopts the persona of a high-end digital curator. The goal is to transform the school register from a data-entry tool into a calm, authoritative editorial experience.

We achieve this through **Organic Minimalism**: a philosophy that prioritizes breathing room, intentional asymmetry, and tonal depth over rigid grids and heavy borders. By using high-contrast typography scales and layered surfaces, we reduce cognitive load for teachers and students, making the complex data of education feel organized, prestigious, and effortless.

---

2. Colors & Surface Philosophy

Our palette is rooted in professional blues and clean neutrals, designed to feel "High-Trust." However, we avoid the flat, "default" look by using Material-inspired tonal layering.

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders to section off content. Boundaries must be defined solely through:
1. **Background Color Shifts:** A `surface-container-low` section sitting on a `background` surface.
2. **Tonal Transitions:** Using the `surface` hierarchy to imply containment.
3. **Whitespace:** Utilizing the `Spacing Scale` (e.g., `8` or `12`) to create mental groupings.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—stacked sheets of fine paper or frosted glass.
* **Base:** `background` (#f8f9fa)
* **Page Sections:** `surface-container-low` (#f3f4f5)
* **Primary Content Cards:** `surface-container-lowest` (#ffffff)
* **Floating/Active Elements:** `surface-bright` (#f8f9fa) with Glassmorphism.

### The "Glass & Gradient" Rule
To inject "soul" into the professional blue palette, use subtle linear gradients for primary actions:
* **Primary CTA Gradient:** `primary` (#0040a1) to `primary-container` (#0056d2).
* **Status Glass:** For 'Work Modes', use semi-transparent versions of `primary_fixed` with a `backdrop-blur` of 12px to create a frosted glass effect that feels modern and tech-forward.

---

## 3. Typography: The Editorial Voice

We pair **Manrope** (Display/Headline) with **Inter** (Body/Labels) to balance character with extreme legibility.

* **Display & Headlines (Manrope):** Large, bold, and authoritative. Use `display-md` for dashboard greetings and `headline-sm` for widget titles. The wide aperture of Manrope gives the system a friendly yet sophisticated "Tech-Forward" vibe.
* **Titles & Body (Inter):** Highly functional. Use `title-md` for interactive list headers and `body-md` for the bulk of student data. Inter’s tall x-height ensures readability even in dense grading tables.
* **Labels (Inter):** Use `label-md` for metadata (e.g., "Weight: 5") to maintain a clean, organized hierarchy without competing with primary data.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows and borders create visual "noise." This system uses **Tonal Layering** to communicate hierarchy.

* **The Layering Principle:** Depth is achieved by "stacking." Place a `surface-container-lowest` card on top of a `surface-container-low` background. This creates a soft, natural lift that mimics high-quality stationery.
* **Ambient Shadows:** For floating command bars or modals, use an extra-diffused shadow:
* *Blur:* 32px | *Spread:* -4px | *Color:* `on-surface` at 6% opacity.
* **The "Ghost Border" Fallback:** If a divider is strictly required for accessibility (e.g., in high-density data tables), use a **Ghost Border**: `outline-variant` (#c3c6d6) at **15% opacity**. Never use 100% opaque borders.
* **Glassmorphism:** Use for "Work Mode" toggles. A container with `surface_tint` at 10% opacity and a heavy blur creates a sophisticated "HUD" (Heads-Up Display) feel for teachers switching between 'Grading' and 'Attendance' modes.

---

## 5. Components

### Cards & Widgets
* **Style:** No borders. Use `moderate` (2) roundedness.
* **Layout:** Use vertical whitespace (Spacing `2`) instead of dividers to separate the header from the content. Use `surface-container-lowest` for the card body against a `surface-container` page background.

### Input Fields & Command Bar
* **Form Elements:** Inputs should use `surface-container-highest` for the field background with a `sm` (0.125rem) bottom-only accent in `primary` when focused.
* **Command Bar:** A floating, glassmorphic bar at the bottom or top of the screen using `surface-bright` at 80% opacity.

### Buttons & Chips
* **Primary Button:** Gradient fill (`primary` to `primary-container`), `full` roundedness for a modern "pill" look.
* **Status Chips:**
* *Attendance (Success):* `tertiary_fixed` background with `on_tertiary_fixed` text.
* *Pending (Warning):* Custom amber using a 10% opacity tint of `tertiary`.
* **Work Mode Toggles:** High-contrast `primary` background for active states, using `inverse_on_surface` text for maximum "Tech-Forward" punch.

### Lists (The Gradebook)
* **Rule:** Forbid divider lines. Use alternating row tints using `surface` and `surface-container-low`, or simply ample vertical padding (Spacing `2`) to define rows.

---

## 6. Do's and Don'ts

### Do:
* **Use Asymmetry:** Place the student's name in `headline-sm` and offset the grade data slightly to the right to create an editorial layout.
* **Embrace White Space:** If a screen feels "empty," don't fill it with boxes. Let the typography and `background` color provide the breathing room.
* **Use Tonal Accents:** Use `primary_fixed` for subtle background highlights behind important icons.

### Don't:
* **Don't use 1px Borders:** It breaks the "Digital Curator" aesthetic and makes the app feel like a legacy tool.
* **Don't use Pure Black Shadows:** Always tint shadows with the `on-surface` or `primary` color at very low opacities.
* **Don't Over-Color:** Keep the UI mostly white and blue. Save the "Success Green" or "Warning Amber" for the actual data points (grades/attendance) to ensure they pop.

### Accessibility Note:
While we use subtle tonal shifts, ensure that text-to-background contrast ratios always meet WCAG AA standards. If a `surface-container` shift is too subtle for a specific monitor, the `title` typography weight should be increased to maintain hierarchy.