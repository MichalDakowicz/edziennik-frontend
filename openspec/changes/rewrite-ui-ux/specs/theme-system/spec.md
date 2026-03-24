## ADDED Requirements

### Requirement: Tonal Surface Theme Provider
The system SHALL support the new "High-Trust" tonal surface hierarchy (`background`, `surface-container-low`, `surface-container-lowest`, `surface-bright`) for light and dark modes.

#### Scenario: Switching to dark mode
- **WHEN** the user selects the dark theme option
- **THEN** the system SHALL apply the corresponding tonal shifts and gradients across the application without breaking the "No-Line Rule"

### Requirement: Glassmorphic Floating Elements
The system SHALL use "Glass & Gradient" elements for floating commands or Work Mode toggles.

#### Scenario: Displaying floating command bar
- **WHEN** a user opens a command bar
- **THEN** the system SHALL display the floating bar using `surface-bright` at 80% opacity and an extra-diffused shadow (`blur: 32px`, `spread: -4px`, `color: on-surface` at 6% opacity)
- **THEN** the system SHALL apply a `backdrop-blur` of 12px for the frosted glass effect

### Requirement: Action Gradients
The system SHALL apply gradient fills to primary buttons.

#### Scenario: Rendering primary call-to-action
- **WHEN** a user encounters a primary button (e.g., "Save Grade")
- **THEN** the system SHALL display a button with a `primary` to `primary-container` linear gradient fill and `full` roundedness
