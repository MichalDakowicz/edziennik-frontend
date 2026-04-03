## Why

The application currently has incomplete dark mode support and a non-functional OLED mode. The "oled" theme type exists in the user profile but renders identically to dark mode — no true black surfaces, no OLED-specific styling. Additionally, theme application relies on direct DOM manipulation in two separate places (`main.tsx` and `ProfilePage.tsx`), causing potential flash on page load and inconsistent behavior. The unused `ThemeProvider` context should be integrated to centralize theme management with instant localStorage-based application before React hydration.

## What Changes

- **OLED mode** gets its own distinct visual identity using the `design-oled.md` specification: true black (`#000000`) surfaces, higher contrast ratios, OLED-optimized tonal layering
- **Dark mode** is refined per `design-dark.md` specification: deep midnight blue surfaces (`#0c1324`), glassmorphic elements, editorial typography treatment
- **Theme persistence** shifts to a two-tier system: instant localStorage read on page load (prevents flash), then API sync for cross-device consistency
- **ThemeProvider** is activated and wraps the app, replacing scattered `applyTheme()` calls in `main.tsx` and `ProfilePage.tsx`
- **Three distinct themes** are supported: `light`, `dark`, `oled`, and `system` (follows OS preference)

## Capabilities

### New Capabilities
- `oled-theme`: True black OLED-optimized theme with distinct surface hierarchy, tonal layering, and component styling per design-oled.md
- `dark-theme-refinement`: Refined dark mode with midnight blue palette, glassmorphism, and editorial typography per design-dark.md
- `client-theme-persistence`: Instant theme application from localStorage before React hydration to prevent flash on page refresh

### Modified Capabilities
- `theme-system`: Extended to support three explicit themes (light, dark, oled) plus system, with dual persistence (localStorage + API)

## Impact

- `src/index.css` — New CSS custom properties for dark and OLED surface palettes, `.dark` and `.oled` class variants
- `tailwind.config.js` — Extended color tokens for OLED-specific surfaces
- `src/components/ThemeProvider.tsx` — Rewritten to manage three themes with localStorage-first persistence
- `src/main.tsx` — ThemeProvider wraps the app, inline script for pre-hydration theme application
- `src/pages/ProfilePage.tsx` — Theme selector updated to expose all three modes, uses ThemeProvider context
- `src/services/api.ts` — User settings sync continues for cross-device consistency
- `openspec/specs/` — New spec files for oled-theme, dark-theme-refinement, client-theme-persistence
