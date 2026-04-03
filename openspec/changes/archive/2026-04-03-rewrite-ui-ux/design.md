## Context

The current `edziennik-frontend` application is functional but suffers from a cluttered, utilitarian "spreadsheet" aesthetic. We need to implement the "Editorial Academic Excellence" design specification, adopting the "Digital Curator" persona. The goal is to transform the complex data of education into an organized, prestigious, and effortless experience using "Organic Minimalism".

## Goals / Non-Goals

**Goals:**
- Implement "Organic Minimalism" prioritizing breathing room, intentional asymmetry, and tonal depth.
- Strictly enforce the "No-Line Rule" (designers/developers are prohibited from using 1px solid borders for sectioning).
- Adopt a Material-inspired tonal layering system for the surface hierarchy.
- Use "Glass & Gradient" elements to inject "soul" into the professional blue palette.

**Non-Goals:**
- Using pure black shadows or heavy dividers.
- Traditional spreadsheet-like grid lines in grading views.
- Changes to the backend API or database structure.

## Decisions

- **Typography**: We will pair **Manrope** (Display/Headline) for a "Tech-Forward" vibe with **Inter** (Body/Labels) for extreme legibility in dense data views.
- **Sectioning & Hierarchy**: Boundaries must be defined solely through background color shifts (e.g., `surface-container-low` on `background`), tonal transitions, and whitespace. If a divider is strictly required for a11y, we will use a "Ghost Border" (`outline-variant` at 15% opacity).
- **Elevation**: Depth is achieved by "stacking" (e.g., `surface-container-lowest` on `surface-container-low`). Shadows will be extra-diffused, tinted with `on-surface` or `primary` color at very low opacities (e.g., 6%).
- **Components**:
  - Cards will have no borders, `moderate` (2) roundedness, and vertical whitespace instead of dividers.
  - Floating command bars and "Work Modes" toggles will use Glassmorphism (`backdrop-blur: 12px`, semi-transparent backgrounds).
  - Primary buttons will use a gradient fill (`primary` to `primary-container`).

## Risks / Trade-offs

- [Risk: Data density feels too sparse with added whitespace] → Mitigation: Use high-contrast typography scales and alternating row tints (`surface` and `surface-container-low`) to keep lists readable without grid lines.
- [Risk: Contrast ratios fail accessibility standards due to subtle tonal shifts] → Mitigation: Ensure text-to-background contrast ratios meet WCAG AA standards; increase typography weight if a `surface-container` shift is too subtle.

## Migration Plan

1. Update `tailwind.config.js` with the new design tokens (surface colors, Manrope/Inter font families, gradient utilities).
2. Create baseline components (Cards, Command Bar, Buttons, Inputs) adhering to the "No-Line Rule".
3. Refactor layout shell and theme provider to support the surface hierarchy.
4. Iteratively replace existing views (dashboard, grading) with the new editorial, borderless layouts.

## Open Questions

- Should the "Ghost Border" fallback be enforced strictly as an a11y toggle or utilized universally on dense screens?
