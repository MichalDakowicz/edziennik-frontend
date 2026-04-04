## Context

The application is a Polish electronic school diary (e-dziennik) built with React 18, TypeScript, Vite, and Tailwind CSS. The current theming system has:

- A Tailwind config with class-based dark mode (`darkMode: ["class"]`) and ~50 custom color tokens for a light-mode-first Material Design-inspired palette
- CSS custom properties in `index.css` for shadcn-style HSL variables (defined but unused in components)
- An orphaned `ThemeProvider` component that supports `"dark" | "light" | "system"` but is never mounted
- Two separate `applyTheme()` functions in `main.tsx` (async API fetch) and `ProfilePage.tsx` (direct DOM manipulation)
- The user profile type includes `"oled"` as a theme option, but it renders identically to dark mode
- Two design documents exist: `docs/design-dark.md` (midnight blue editorial theme) and `docs/design-oled.md` (true black OLED theme)

## Goals / Non-Goals

**Goals:**
- Implement three visually distinct themes: light (existing), dark (midnight blue), OLED (true black)
- Eliminate flash on page load by applying theme from localStorage before React hydration
- Centralize theme management in a single ThemeProvider that wraps the app
- Sync theme preference to the API for cross-device consistency
- Use existing design documents (`design-dark.md`, `design-oled.md`) as the authoritative source for color tokens and component styling

**Non-Goals:**
- No redesign of individual components — existing components already use Tailwind color tokens; we change the token values per theme
- No new UI for theme switching beyond updating the existing ProfilePage selector
- No animation or transition effects between themes
- No per-page or per-section theme overrides

## Decisions

### 1. Three CSS class strategy: `.dark` and `.oled` as separate class hooks

**Decision:** Use `.dark` class for the dark theme and `.oled` class for the OLED theme. Light mode is the default (no class).

**Rationale:** Tailwind's `darkMode: ["class"]` already uses `.dark` as the trigger. Adding `.oled` as a parallel class lets us define completely separate CSS custom property values for each theme. Components that use `dark:` Tailwind modifiers will continue to work for both dark and oled (we'll also add `oled:` variants where needed via CSS custom properties).

**Alternatives considered:**
- Single `.dark` class with CSS media queries to switch between dark/oled palettes — rejected because it would require JavaScript to toggle media queries, adding complexity
- Data attribute (`data-theme="dark" | "oled"`) — rejected because it would require changing Tailwind's `darkMode` config and all existing `dark:` class usage

### 2. CSS custom properties as the single source of truth for theme colors

**Decision:** Define all surface colors as CSS custom properties in `index.css` under `:root`, `.dark`, and `.oled` selectors. Tailwind colors reference these via `rgb(var(...) / <alpha-value>)` pattern.

**Rationale:** This is the shadcn-ui approach and allows runtime theme switching without rebuilding Tailwind. The current Tailwind config has hardcoded hex values — migrating to CSS variables makes themes swappable at runtime.

**Implementation:**
- `:root` — existing light mode values (unchanged)
- `.dark` — midnight blue palette from `design-dark.md`: surface `#0c1324`, surface_container_low `#151b2d`, surface_container_high `#23293c`, primary `#adc6ff`, etc.
- `.oled` — true black palette from `design-oled.md`: surface `#131313`, surface_container `#1f1f1f`, surface_container_high `#2a2a2a`, primary `#adc6ff`, etc.

### 3. localStorage-first, API-sync theme persistence

**Decision:** On page load, read theme from localStorage immediately (synchronous, before any React renders). After hydration, fetch user settings from API and sync if they differ. When user changes theme, write to localStorage immediately (instant) and queue API sync.

**Rationale:** This eliminates the flash-on-refresh problem. The current `main.tsx` does an async API call before applying theme — during that async gap, the page renders in the wrong theme. localStorage is instant.

**Storage key:** `edziennik-theme` (namespaced to avoid conflicts with the existing `vite-ui-theme` from the orphaned ThemeProvider).

### 4. Inline script in `index.html` for pre-hydration theme application

**Decision:** Add a small inline `<script>` in `index.html` (in `<head>`) that reads localStorage and applies the appropriate class to `<html>` before the browser starts parsing the body.

**Rationale:** This is the industry-standard approach used by Next.js, Remix, and other frameworks. It runs before any JavaScript bundle loads, guaranteeing zero flash.

### 5. ThemeProvider manages both localStorage and API sync

**Decision:** The ThemeProvider component handles:
- Reading initial theme from localStorage (synchronous via lazy initializer)
- Applying/removing CSS classes on theme change
- Listening to system preference changes when theme is `"system"`
- Syncing to API via `updateUserSettings` when theme changes (debounced or fire-and-forget)

**Rationale:** Centralizes all theme logic in one place. ProfilePage simply calls `setTheme()` from context and doesn't need to know about DOM manipulation or API calls.

## Risks / Trade-offs

**[Risk] CSS custom property migration breaks existing component styling** → Mitigation: Keep existing Tailwind color names as-is; map them to CSS variables. Test all pages after migration. Components that use hardcoded `dark:` classes (57 instances) will need review to ensure they work with both `.dark` and `.oled`.

**[Risk] API sync fails silently, causing localStorage and server to diverge** → Mitigation: Fire-and-forget API sync is acceptable since localStorage is the source of truth for the current session. On next login, localStorage takes priority. Add a non-blocking retry on subsequent API calls.

**[Risk] OLED theme on non-OLED screens looks washed out** → Mitigation: The OLED palette (`#131313` base, not pure black everywhere) is designed to look good on any screen. True black (`#000000`) is used only for deep surfaces (modals, overlays). This is consistent with `design-oled.md` which specifies `#131313` as the system base.

**[Trade-off] Dual persistence adds complexity** → Acceptable trade-off. The benefit (cross-device sync + zero flash) outweighs the added complexity of managing two storage layers.

**[Trade-off] Keeping `dark:` Tailwind classes for both dark and oled** → Some components use `dark:bg-emerald-900/20` which will apply to both themes. This is acceptable for semantic colors (grade badges, status indicators) but may need `oled:`-specific overrides if visual differences are needed.
