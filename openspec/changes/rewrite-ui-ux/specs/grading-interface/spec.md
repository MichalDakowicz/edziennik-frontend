## ADDED Requirements

### Requirement: Borderless Gradebook
The system SHALL display the grading interface using alternating row tints (`surface` and `surface-container-low`) or ample vertical padding (Spacing `2`) to define rows.

#### Scenario: Displaying student list
- **WHEN** a teacher selects an assignment
- **THEN** the system SHALL present the list of students without divider lines

### Requirement: Ghost Border Fallback
The system SHALL use a "Ghost Border" (`outline-variant` #c3c6d6 at 15% opacity) only if a divider is strictly required for accessibility in high-density data tables.

#### Scenario: High-density data view
- **WHEN** the system detects a high-density grading view and a divider is necessary
- **THEN** the system SHALL display the boundary using the "Ghost Border" fallback

### Requirement: Tonal Inputs
The system SHALL use `surface-container-highest` for form element backgrounds.

#### Scenario: Editing a grade
- **WHEN** a teacher focuses on an input field to enter a grade
- **THEN** the field SHALL display a `sm` (0.125rem) bottom-only accent in `primary`

### Requirement: Work Mode Toggles
The system SHALL provide a "HUD" feel for Work Mode toggles.

#### Scenario: Switching to Attendance mode
- **WHEN** a teacher toggles from 'Grading' to 'Attendance' mode
- **THEN** the toggle SHALL use a high-contrast `primary` background with `inverse_on_surface` text
- **THEN** the container SHALL use a `surface_tint` at 10% opacity and a heavy blur for a "Tech-Forward" HUD effect
