## ADDED Requirements

### Requirement: Filter Bar Component
The system SHALL provide a `TeacherFilterBar` component as a compound component that renders a consistent filter section across all teacher pages. It SHALL support class selector, subject selector, date picker, and arbitrary custom filter slots.

#### Scenario: Filter bar renders with class and subject selectors
- **WHEN** a teacher page renders the filter bar with class and subject options
- **THEN** both dropdowns are displayed with the current selections highlighted

#### Scenario: Filter bar responds to selection changes
- **WHEN** a teacher changes a filter value
- **THEN** the corresponding `onChange` callback is invoked with the new value

#### Scenario: Filter bar supports responsive layout
- **WHEN** the viewport is narrow (mobile)
- **THEN** filter controls stack vertically

### Requirement: Class Selector
The system SHALL provide a `ClassSelect` component within the filter bar that displays a dropdown of available classes for the current teacher. It SHALL show the class name in the standardized format (e.g., "4a") and subject name.

#### Scenario: Teacher selects a class
- **WHEN** teacher clicks the class dropdown and selects a class
- **THEN** the `onChange` callback is called with the selected class ID

#### Scenario: No classes available
- **WHEN** the teacher has no assigned classes
- **THEN** the dropdown shows "No classes available" and is disabled

### Requirement: Subject Selector
The system SHALL provide a `SubjectSelect` component within the filter bar that displays a dropdown of subjects for the selected class. The subject list SHALL be filtered to only subjects the teacher teaches for that class.

#### Scenario: Teacher selects a subject
- **WHEN** teacher selects a class and then clicks the subject dropdown
- **THEN** only subjects taught by the teacher for that class are shown

#### Scenario: Subject selector disabled without class
- **WHEN** no class is selected
- **THEN** the subject dropdown is disabled

### Requirement: Date Picker Filter
The system SHALL provide a `DatePicker` component within the filter bar that allows the teacher to select a specific date. It SHALL default to the current date and support navigation to past and future dates.

#### Scenario: Teacher changes the date
- **WHEN** teacher selects a different date
- **THEN** the `onChange` callback is called with the new date
