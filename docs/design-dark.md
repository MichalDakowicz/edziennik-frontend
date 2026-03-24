# Design System Specification: The Academic Editorial

## 1. Overview & Creative North Star

The Creative North Star for this design system is **"The Digital Archivist."**

Moving away from the cluttered, "app-like" density of traditional SaaS, this system adopts an editorial posture. It treats digital space like the pages of a high-end academic journal—prioritizing focus, authoritative calmness, and intellectual breathing room. We achieve this by rejecting the "standard grid" in favor of intentional asymmetry, where large typographic displays anchor the layout, and content "floats" within deep, atmospheric layers. The experience should feel like a premium dark-mode study; it is modern but rooted in the gravitas of academia.

---

## 2. Colors & Surface Philosophy

The palette is built on a foundation of deep, ink-like blues and vibrant, electric accents. The goal is to create "glow" within a dark environment without sacrificing legibility.

### Surface Hierarchy & Nesting

We do not use borders to define space. Depth is achieved through **Tonal Layering**.

- **Base Layer:** `surface` (#0c1324) is the infinite void.
- **Sectioning:** Use `surface_container_low` (#151b2d) for large content areas.
- **Interactive Elements:** Use `surface_container_high` (#23293c) for cards and modals.
- **The "No-Line" Rule:** Explicitly prohibit 1px solid borders for sectioning. Contrast must be achieved through the shift between `surface_container_lowest` and `surface_container`.

### The "Glass & Gradient" Rule

To elevate the "Academic" feel into "Modern Editorial," floating widgets (e.g., sidebars, navigation bars) must utilize **Glassmorphism**.

- **Value:** Apply `surface_container_low` at 70% opacity with a `20px` backdrop blur.
- **Gradients:** Use a subtle linear gradient on primary CTAs—from `primary` (#adc6ff) to `primary_container` (#4d8eff)—to simulate a soft luminescence rather than a flat plastic button.

---

## 3. Typography: The Editorial Voice

We use **Manrope** exclusively. Its geometric yet humanist qualities provide the "Academic Modern" aesthetic.

- **Display (lg/md):** Used for "Hero" moments or chapter headings. These should often be left-aligned with significant leading (tight) to create a blocky, architectural feel.
- **Headline (lg/md/sm):** Your primary navigational anchors. Use `on_surface` (#dce1fb).
- **Body (lg/md):** Use `on_surface_variant` (#c2c6d6) for long-form reading to reduce eye strain. The slightly lower contrast against the dark background mimics ink on grey paper.
- **Label (md/sm):** Used for metadata and "Academic Tags." These should be set in Uppercase with +5% letter spacing to feel like a curated index.

---

## 4. Elevation & Depth

In this system, "Up" means "Brighter," not "Shadowier."

### The Layering Principle

Stacking is our primary tool for hierarchy. A common pattern is placing a `surface_container_highest` card inside a `surface_container_low` section. This creates a soft, natural "lift" that feels integrated into the environment.

### Ambient Shadows

If a floating element requires a shadow (e.g., a dropdown or a glass widget):

- **Blur:** 32px – 64px.
- **Opacity:** 6% – 10%.
- **Color:** Use `surface_container_lowest` (#070d1f) to ensure the shadow feels like a natural occlusion of light in a dark room, rather than a muddy grey smudge.

### The "Ghost Border" Fallback

Where accessibility requires a container boundary, use the **Ghost Border**:

- **Token:** `outline_variant` (#424754) at **15% opacity**. This creates a hint of a structure that disappears into the background upon quick glance.

---

## 5. Component Guidelines

### Buttons (The Luminous Trigger)

- **Primary:** Linear gradient (`primary` to `primary_container`), `on_primary` text. No border. 8px radius.
- **Secondary:** `surface_container_highest` background with a `Ghost Border`.
- **Tertiary:** No background. Text-only using `primary` color.

### Cards & Lists (The Editorial Flow)

- **Forbid Divider Lines:** Use `Spacing Scale 6` (2rem) to separate list items or use alternating background shifts (`surface_container_low` vs `surface_container`).
- **Nesting:** Place a `surface_container_highest` image container inside a `surface_container_low` card for a "framed" academic look.

### Input Fields

- **Default State:** `surface_container_low` background with a subtle `outline_variant` (20% opacity).
- **Focus State:** Background shifts to `surface_container_high`, border becomes `primary` (#adc6ff) at 100% opacity with a 2px outer "glow" (shadow).

### Chips (Academic Tags)

- Use `secondary_container` (#3f465c) with `on_secondary_container` (#adb4ce) text. These should be small (`label-sm`) and serve as subtle taxonomical markers.

---

## 6. Do’s and Don’ts

### Do:

- **Use Asymmetry:** Place text on the left 2/3 of the screen and leave the right 1/3 as "Negative Space" (using `surface`).
- **Embrace Depth:** Nest containers to create a sense of information being "housed" safely.
- **Prioritize Type:** Let the typography scale do the work of the layout before adding icons or images.

### Don’t:

- **Don't use Pure Black:** Stick to `surface` (#0c1324). Pure black (#000000) kills the "Midnight Blue" atmosphere and causes visual vibration with white text.
- **Don't use High-Contrast Dividers:** Never use a 100% opaque `outline` for a line. It breaks the editorial flow.
- **Don't Over-Round:** Stick strictly to `8px` (`DEFAULT`). Going more rounded (e.g., 24px) makes the system feel "bubbly" and juvenile, stripping away the "Academic" authority.

### Creative Director's Final Note:

Every pixel should feel like it was placed with intent. If a section doesn't have a reason to be there, remove it. Let the "Digital Archivist" personality guide you—be quiet, be focused, and let the content breathe.```
