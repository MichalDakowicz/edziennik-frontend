## ADDED Requirements

### Requirement: OLED theme with true black surface hierarchy
The system SHALL provide an OLED-optimized theme activated by the `.oled` class on `<html>`, using the color palette defined in `docs/design-oled.md`. The surface hierarchy SHALL use:
- `surface` (`#131313`) as the base desk surface
- `surface_container` (`#1f1f1f`) for primary content areas
- `surface_container_high` (`#2a2a2a`) for active/hover states
- `surface_container_low` (`#1b1b1b`) for soft lift layering
- `surface_container_lowest` (`#000000`) for deep immersion surfaces (modals, overlays)
- Primary accent colors: `primary` (`#adc6ff`), `primary_container` (`#4d8eff`)

#### Scenario: OLED theme is activated
- **WHEN** the `.oled` class is present on `<html>`
- **THEN** all surface colors resolve to the OLED palette defined above
- **AND** the background is `#131313` for standard views and `#000000` for deep surfaces

#### Scenario: OLED theme is deactivated
- **WHEN** the `.oled` class is removed from `<html>`
- **THEN** all surface colors revert to the default (light or dark) palette

### Requirement: No-line rule for OLED theme
The OLED theme SHALL NOT use 1px solid borders for sectioning. Boundaries MUST be defined through background color shifts and tonal transitions only.

#### Scenario: Card boundaries in OLED mode
- **WHEN** a card component renders in OLED mode
- **THEN** it has no visible border
- **AND** its boundary is defined by the contrast between `surface_container_high` (`#2a2a2a`) and `surface` (`#131313`)

#### Scenario: List item separation in OLED mode
- **WHEN** a list renders in OLED mode
- **THEN** items are separated by vertical spacing (`spacing.8` / 2rem) or alternating background tones
- **AND** no divider lines are present

### Requirement: OLED glassmorphic floating elements
Floating elements (navigation bars, modals, dropdowns) in OLED mode SHALL use a semi-transparent `surface` color with `backdrop-blur` of 12px and a 10% opacity `primary` tint overlay.

#### Scenario: Navigation bar in OLED mode
- **WHEN** the navigation bar renders in OLED mode
- **THEN** it has a semi-transparent background with 12px backdrop blur
- **AND** content scrolls visibly behind it

#### Scenario: Modal in OLED mode
- **WHEN** a modal opens in OLED mode
- **THEN** it uses `surface_container_lowest` (`#000000`) as its base with a 10% `primary` tint overlay
- **AND** it has a 12px backdrop blur

### Requirement: OLED CTA gradient styling
Primary call-to-action buttons in OLED mode SHALL use a linear gradient from `primary` (`#adc6ff`) to `primary_container` (`#4d8eff`) at 135° angle.

#### Scenario: Primary button in OLED mode
- **WHEN** a primary button renders in OLED mode
- **THEN** it displays a 135° linear gradient from `#adc6ff` to `#4d8eff`
- **AND** the text color is white (`on_primary`)

### Requirement: OLED typography and contrast
Text in OLED mode SHALL use `on_surface` (light grey) for body content and `on_primary` (white) for CTAs. Pure white (`#FFFFFF`) SHALL be used sparingly, only for display-level typography.

#### Scenario: Body text in OLED mode
- **WHEN** body text renders in OLED mode
- **THEN** it uses the `on_surface` color (light grey, not pure white)
- **AND** it has a line-height of 1.6 for readability

#### Scenario: Display text in OLED mode
- **WHEN** display-level text (section titles) renders in OLED mode
- **THEN** it may use pure white (`#FFFFFF`) for maximum impact
- **AND** it uses `display-lg` scale (3.5rem) with -0.02em letter spacing

### Requirement: OLED ambient shadows
Shadows for floating elements in OLED mode SHALL use pure black (`rgba(0, 0, 0, 0.6)`) with wide diffusion (20px-40px blur) to blend into the OLED background.

#### Scenario: Dropdown shadow in OLED mode
- **WHEN** a dropdown opens in OLED mode
- **THEN** it has a shadow of `0 20px 40px rgba(0, 0, 0, 0.6)`
- **AND** the shadow blends into the black background rather than appearing as a separate grey shape
