## ADDED Requirements

### Requirement: Dark theme with midnight blue surface hierarchy
The system SHALL provide a refined dark mode activated by the `.dark` class on `<html>`, using the color palette defined in `docs/design-dark.md`. The surface hierarchy SHALL use:
- `surface` (`#0c1324`) as the infinite void base layer
- `surface_container_low` (`#151b2d`) for large content areas
- `surface_container_high` (`#23293c`) for cards and modals
- `surface_container_lowest` (`#070d1f`) for shadow/occlusion color
- Primary accent colors: `primary` (`#adc6ff`), `primary_container` (`#4d8eff`)
- Text colors: `on_surface` (`#dce1fb`), `on_surface_variant` (`#c2c6d6`)

#### Scenario: Dark theme is activated
- **WHEN** the `.dark` class is present on `<html>`
- **THEN** all surface colors resolve to the midnight blue palette defined above
- **AND** the background is `#0c1324` (deep midnight blue, not pure black)

#### Scenario: Dark theme is deactivated
- **WHEN** the `.dark` class is removed from `<html>`
- **THEN** all surface colors revert to the light mode palette

### Requirement: Dark theme glassmorphic floating elements
Floating elements (navigation bars, sidebars) in dark mode SHALL use `surface_container_low` at 70% opacity with a 20px backdrop blur.

#### Scenario: Navigation bar in dark mode
- **WHEN** the navigation bar renders in dark mode
- **THEN** it has a background of `surface_container_low` at 70% opacity
- **AND** it has a 20px backdrop blur
- **AND** content scrolls visibly behind it

### Requirement: Dark theme CTA gradient styling
Primary call-to-action buttons in dark mode SHALL use a linear gradient from `primary` (`#adc6ff`) to `primary_container` (`#4d8eff`) to simulate soft luminescence.

#### Scenario: Primary button in dark mode
- **WHEN** a primary button renders in dark mode
- **THEN** it displays a linear gradient from `#adc6ff` to `#4d8eff`
- **AND** the text color is `on_primary`
- **AND** it has no border

### Requirement: Dark theme tonal layering without borders
The dark theme SHALL NOT use 1px solid borders for sectioning. Depth MUST be achieved through tonal layering — placing brighter surfaces on darker backgrounds.

#### Scenario: Card nesting in dark mode
- **WHEN** a card renders inside a section in dark mode
- **THEN** the card uses `surface_container_high` (`#23293c`) on a `surface_container_low` (`#151b2d`) section
- **AND** no border is used to define the card boundary

#### Scenario: Ghost border fallback in dark mode
- **WHEN** a container boundary requires definition against a similar color in dark mode
- **THEN** it uses `outline_variant` (`#424754`) at 15% opacity
- **AND** the border is barely visible, disappearing into the background on quick glance

### Requirement: Dark theme typography hierarchy
Text in dark mode SHALL follow the editorial typography system:
- Headlines use `on_surface` (`#dce1fb`)
- Body text uses `on_surface_variant` (`#c2c6d6`) for reduced eye strain
- Labels use uppercase with +5% letter spacing for academic tag styling

#### Scenario: Body text in dark mode
- **WHEN** body text renders in dark mode
- **THEN** it uses `on_surface_variant` (`#c2c6d6`) — slightly lower contrast than headlines
- **AND** the reduced contrast mimics ink on grey paper for comfortable long-form reading

#### Scenario: Label text in dark mode
- **WHEN** a label (metadata, academic tag) renders in dark mode
- **THEN** it is set in uppercase with +5% letter spacing
- **AND** it uses `label-sm` or `label-md` typography scale

### Requirement: Dark theme input field styling
Input fields in dark mode SHALL use `surface_container_low` background with `outline_variant` at 20% opacity in the default state. On focus, the background shifts to `surface_container_high` and the border becomes `primary` (`#adc6ff`) at 100% opacity with a 2px outer glow.

#### Scenario: Input field default state in dark mode
- **WHEN** an input field renders in dark mode without focus
- **THEN** it has a `surface_container_low` background
- **AND** a subtle `outline_variant` border at 20% opacity

#### Scenario: Input field focus state in dark mode
- **WHEN** an input field receives focus in dark mode
- **THEN** the background shifts to `surface_container_high`
- **AND** the border becomes `primary` (`#adc6ff`) at full opacity
- **AND** a 2px outer glow (shadow) appears

### Requirement: Dark theme ambient shadows
Floating elements in dark mode SHALL use shadows with `surface_container_lowest` (`#070d1f`) color at 6%-10% opacity with 32px-64px blur to feel like natural occlusion of light.

#### Scenario: Dropdown shadow in dark mode
- **WHEN** a dropdown opens in dark mode
- **THEN** it has a shadow using color `#070d1f` at 6%-10% opacity
- **AND** the shadow blur is between 32px and 64px
- **AND** the shadow feels like a natural dark room occlusion, not a muddy grey smudge
