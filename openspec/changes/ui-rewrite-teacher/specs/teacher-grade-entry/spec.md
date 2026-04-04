## ADDED Requirements

### Requirement: Grade Picker Component
The system SHALL provide a reusable `GradePicker` component that displays a visual grid of grade values (1 through 6) with optional modifier buttons (+, -, 0) for fine-grained grade entry. The component SHALL be a controlled component accepting `value`, `onChange`, and configuration props.

#### Scenario: User selects a grade from the grid
- **WHEN** user clicks a grade value in the grid
- **THEN** the component calls `onChange` with the selected grade value

#### Scenario: User applies a modifier to a grade
- **WHEN** user selects a grade and then clicks a modifier button (+, -, 0)
- **THEN** the component calls `onChange` with the modified grade value

#### Scenario: Component reflects current value
- **WHEN** the component renders with a `value` prop
- **THEN** the corresponding grade cell is visually highlighted

#### Scenario: Component supports disabled state
- **WHEN** the `disabled` prop is true
- **THEN** all grade cells and modifier buttons are non-interactive and visually dimmed

### Requirement: Add Grade Modal
The system SHALL provide an `AddGradeModal` component that allows a teacher to add a single grade for a student. The modal SHALL include the `GradePicker` component, a weight selector, a category selector, a comment field, and form validation using react-hook-form + Zod.

#### Scenario: Teacher opens the add grade modal
- **WHEN** teacher clicks "Add Grade" for a student
- **THEN** the modal opens with the GradePicker, weight, category, and comment fields

#### Scenario: Teacher submits a valid grade
- **WHEN** teacher selects a grade, fills required fields, and clicks "Save"
- **THEN** the grade is submitted via the API and the modal closes

#### Scenario: Teacher submits an invalid grade
- **WHEN** teacher clicks "Save" without selecting a grade
- **THEN** a validation error is displayed and the grade is not submitted

### Requirement: Add Period Grade Modal
The system SHALL provide an `AddPeriodGradeModal` component that allows a teacher to add a period/semester grade (I or II półrocze) for a student. The modal SHALL reuse the `GradePicker` component and include a semester selector, weight selector, and comment field.

#### Scenario: Teacher opens the add period grade modal
- **WHEN** teacher clicks "Add Period Grade" for a student
- **THEN** the modal opens with the GradePicker, semester selector, and comment fields

#### Scenario: Teacher submits a valid period grade
- **WHEN** teacher selects a grade, selects a semester, and clicks "Save"
- **THEN** the period grade is submitted via the API and the modal closes

### Requirement: Batch Grade Entry
The system SHALL allow a teacher to enter grades for multiple students simultaneously from the grades page. When batch mode is active, a grade picker SHALL appear that applies the selected grade to all selected students.

#### Scenario: Teacher enters batch mode
- **WHEN** teacher clicks "Batch Mode" on the grades page
- **THEN** checkboxes appear next to each student and a batch grade picker is displayed

#### Scenario: Teacher applies a grade to multiple students
- **WHEN** teacher selects multiple students and chooses a grade in batch mode
- **THEN** the grade is submitted for each selected student via the API

### Requirement: Student Grade Table
The system SHALL display a table of students with their recent grades for the selected class and subject. Each student row SHALL show the student name, recent grade badges, and action buttons for adding grades.

#### Scenario: Table displays students with grades
- **WHEN** a class and subject are selected
- **THEN** the table shows each student with their recent grades as colored badges

#### Scenario: Table shows empty state
- **WHEN** no students exist for the selected class and subject
- **THEN** an empty state message is displayed
