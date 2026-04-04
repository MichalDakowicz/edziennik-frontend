## ADDED Requirements

### Requirement: Instant theme application from localStorage on page load
The system SHALL read the user's theme preference from localStorage synchronously before React hydration and apply the corresponding CSS class to `<html>`. This MUST happen via an inline script in `<head>` to prevent any flash of incorrect theme.

#### Scenario: User has dark theme stored
- **WHEN** the page loads and localStorage contains `edziennik-theme` = `"dark"`
- **THEN** the `.dark` class is applied to `<html>` before any content renders
- **AND** no flash of light mode occurs

#### Scenario: User has oled theme stored
- **WHEN** the page loads and localStorage contains `edziennik-theme` = `"oled"`
- **THEN** the `.oled` class is applied to `<html>` before any content renders
- **AND** no flash of light mode occurs

#### Scenario: User has system theme stored
- **WHEN** the page loads and localStorage contains `edziennik-theme` = `"system"`
- **THEN** the inline script evaluates `window.matchMedia("(prefers-color-scheme: dark)")`
- **AND** applies `.dark` or no class based on the OS preference

#### Scenario: No theme stored (first visit)
- **WHEN** the page loads and localStorage has no `edziennik-theme` value
- **THEN** no class is applied (light mode default)
- **AND** the ThemeProvider initializes with `"system"` as the default

### Requirement: ThemeProvider manages theme state with localStorage persistence
The ThemeProvider component SHALL manage the current theme state, apply CSS classes on change, and persist the selection to localStorage under the key `edziennik-theme`. It SHALL support four theme values: `"light"`, `"dark"`, `"oled"`, and `"system"`.

#### Scenario: User selects dark theme
- **WHEN** `setTheme("dark")` is called
- **THEN** `edziennik-theme` is set to `"dark"` in localStorage
- **AND** the `.dark` class is added to `<html>`
- **AND** the `.oled` class is removed from `<html>` if present

#### Scenario: User selects oled theme
- **WHEN** `setTheme("oled")` is called
- **THEN** `edziennik-theme` is set to `"oled"` in localStorage
- **AND** the `.oled` class is added to `<html>`
- **AND** the `.dark` class is removed from `<html>` if present

#### Scenario: User selects light theme
- **WHEN** `setTheme("light")` is called
- **THEN** `edziennik-theme` is set to `"light"` in localStorage
- **AND** both `.dark` and `.oled` classes are removed from `<html>`

#### Scenario: User selects system theme
- **WHEN** `setTheme("system")` is called
- **THEN** `edziennik-theme` is set to `"system"` in localStorage
- **AND** the system preference listener is activated
- **AND** the appropriate class (`.dark` or none) is applied based on `prefers-color-scheme`

#### Scenario: System preference changes while on system theme
- **WHEN** the user's OS switches between light and dark mode
- **AND** the current theme is `"system"`
- **THEN** the CSS class on `<html>` updates automatically to match the new OS preference

### Requirement: ThemeProvider syncs theme preference to API
After React hydration, the ThemeProvider SHALL fetch the user's theme preference from the API via `getUserSettings` and sync it with the localStorage value. If they differ, the API value takes precedence and localStorage is updated. When the user changes theme, the new value SHALL be sent to the API via `updateUserSettings`.

#### Scenario: API value differs from localStorage on hydration
- **WHEN** the app hydrates and the API theme preference differs from localStorage
- **THEN** the API value is applied as the current theme
- **AND** localStorage is updated to match the API value

#### Scenario: User changes theme triggers API sync
- **WHEN** the user changes theme via `setTheme()`
- **THEN** the new theme is sent to the API via `updateUserSettings`
- **AND** the API call is non-blocking (fire-and-forget, errors do not revert the change)

#### Scenario: API sync fails
- **WHEN** the API call to update theme settings fails
- **THEN** the localStorage value remains unchanged
- **AND** the UI continues to use the localStorage theme
- **AND** no error is shown to the user

### Requirement: ThemeProvider wraps the entire application
The ThemeProvider SHALL wrap the application in `main.tsx`, providing theme context to all components. The orphaned `applyTheme()` function in `main.tsx` SHALL be removed.

#### Scenario: ThemeProvider is mounted
- **WHEN** the app renders
- **THEN** ThemeProvider wraps the QueryClientProvider and App components
- **AND** all child components can access `useTheme()` context

#### Scenario: ProfilePage uses ThemeProvider
- **WHEN** the user changes theme in ProfilePage
- **THEN** ProfilePage calls `setTheme()` from the ThemeProvider context
- **AND** ProfilePage does NOT directly manipulate `document.documentElement.classList`
