## 1. CSS Custom Properties Migration

- [x] 1.1 Convert existing Tailwind color tokens in `tailwind.config.js` to reference CSS custom properties using `rgb(var(...) / <alpha-value>)` pattern for all 50+ surface colors
- [x] 1.2 Define complete light mode CSS custom properties in `:root` block of `index.css` matching the existing Tailwind palette values
- [x] 1.3 Add dark mode CSS custom properties under `.dark` selector using midnight blue palette from `design-dark.md` (surface `#0c1324`, surface_container_low `#151b2d`, etc.)
- [x] 1.4 Add OLED mode CSS custom properties under `.oled` selector using true black palette from `design-oled.md` (surface `#131313`, surface_container `#1f1f1f`, surface_container_lowest `#000000`, etc.)
- [x] 1.5 Add OLED-specific utility classes in `@layer utilities` (`.oled-shadow`, `.oled-glass`, etc.)

## 2. Inline Pre-Hydration Script

- [x] 2.1 Add inline `<script>` in `index.html` `<head>` that reads `edziennik-theme` from localStorage and applies `.dark` or `.oled` class to `<html>` before page renders
- [x] 2.2 Handle `"system"` theme value in inline script using `matchMedia("(prefers-color-scheme: dark)")`
- [x] 2.3 Handle missing/null theme value (default to no class = light mode)

## 3. ThemeProvider Rewrite

- [x] 3.1 Update `ThemeProvider.tsx` type definitions to support `"light" | "dark" | "oled" | "system"`
- [x] 3.2 Change storage key from `"vite-ui-theme"` to `"edziennik-theme"`
- [x] 3.3 Implement `.oled` class handling alongside `.dark` class in the useEffect
- [x] 3.4 Add system preference change listener for `"system"` theme mode
- [x] 3.5 Add API sync logic: fetch `getUserSettings` on mount, compare with localStorage, reconcile differences
- [x] 3.6 Add API sync on theme change: call `updateUserSettings` when `setTheme()` is invoked (fire-and-forget, non-blocking)
- [x] 3.7 Wrap app with `ThemeProvider` in `main.tsx`
- [x] 3.8 Remove orphaned `applyTheme()` async function from `main.tsx`

## 4. ProfilePage Theme Selector Update

- [x] 4.1 Update theme selector UI to expose all four options: light, dark, oled, system
- [x] 4.2 Replace direct DOM manipulation with `setTheme()` from `useTheme()` context
- [x] 4.3 Remove local `applyTheme()` function from ProfilePage
- [x] 4.4 Ensure the selected theme value is displayed correctly from context

## 5. Component Dark Mode Review

- [x] 5.1 Audit all 57 existing `dark:` Tailwind class usages to verify they render correctly with the new dark palette
- [x] 5.2 Add `oled:` class variants where OLED-specific styling differs from dark mode (grade badges, status indicators)
- [x] 5.3 Verify glassmorphic elements (navbar, sidebar) use correct backdrop-blur and opacity for both dark and oled modes
- [x] 5.4 Verify input fields have correct dark/oled focus states (primary border + glow)
- [x] 5.5 Verify CTA buttons display gradient styling in both dark and oled modes
- [x] 5.6 Verify no 1px solid borders exist in dark/oled modes (no-line rule compliance)

## 6. Verification and Testing

- [x] 6.1 Verify zero flash on page refresh for all four theme values (light, dark, oled, system)
- [x] 6.2 Verify theme persists across page reloads via localStorage
- [x] 6.3 Verify theme syncs across devices via API (change on one device, refresh on another)
- [x] 6.4 Verify system theme follows OS preference changes in real-time
- [x] 6.5 Visual review of all pages in dark mode against `design-dark.md` spec
- [x] 6.6 Visual review of all pages in OLED mode against `design-oled.md` spec
