## ADDED Requirements

### Requirement: Editorial Aesthetic
The system SHALL display information architecture on the dashboard based on the user's role using "Organic Minimalism".

#### Scenario: Student dashboard view
- **WHEN** a student logs in
- **THEN** they SHALL see an editorial layout with their name in `headline-sm` (Manrope) and grade data slightly offset to the right

### Requirement: Tonal Accents for Icons
The system SHALL use subtle tonal accents to highlight important icons and actions.

#### Scenario: Highlighting a new message
- **WHEN** the dashboard displays an unread message notification icon
- **THEN** the icon SHALL use `primary_fixed` for a subtle background highlight behind the icon instead of a solid colored badge

### Requirement: Borderless Cards and Widgets
The system SHALL display all cards and widgets without borders, using a `moderate` (2) roundedness.

#### Scenario: Rendering the activity widget
- **WHEN** the user views the recent activity widget
- **THEN** the widget SHALL use a `surface-container-lowest` background body against a `surface-container` page background
- **THEN** the widget header and content SHALL be separated by vertical whitespace (Spacing `2`) instead of dividers
