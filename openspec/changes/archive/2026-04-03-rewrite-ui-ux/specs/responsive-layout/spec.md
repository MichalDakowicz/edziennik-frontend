## ADDED Requirements

### Requirement: Tonal Layering
The system SHALL support the defined surface hierarchy using Material-inspired tonal layering without using 1px solid borders.

#### Scenario: Background to card transition
- **WHEN** displaying primary content cards
- **THEN** the card SHALL use the `surface-container-lowest` background against a `surface-container-low` page section

### Requirement: Typography System
The system SHALL use the Manrope font family for all Display and Headline text, and the Inter font family for all Titles, Body, and Labels text.

#### Scenario: Displaying a dashboard greeting
- **WHEN** a user logs in and views their dashboard
- **THEN** the system SHALL display the greeting using `display-md` (Manrope) for a "Tech-Forward" vibe
- **THEN** the system SHALL display standard labels (e.g., "Weight: 5") using `label-md` (Inter)

### Requirement: Fluid Grid with Whitespace Separation
The system SHALL provide a fluid grid layout that utilizes whitespace (`Spacing Scale`) and tonal transitions to define sections instead of lines.

#### Scenario: Separating sections on desktop
- **WHEN** the viewport width is 1024px or greater and multiple sections are present
- **THEN** the layout grid SHALL separate content using vertical whitespace (e.g., Spacing 8 or 12) rather than dividers
