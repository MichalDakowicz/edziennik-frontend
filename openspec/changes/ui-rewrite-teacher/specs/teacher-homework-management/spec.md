## ADDED Requirements

### Requirement: Homework List Display
The system SHALL provide a `HomeworkList` component that displays a list of homework assignments for the selected class and subject. Each item SHALL show the description, due date, target students, and action buttons (edit, delete).

#### Scenario: Homework list loads successfully
- **WHEN** a class and subject are selected
- **THEN** the homework list displays all assignments sorted by due date

#### Scenario: No homework exists
- **WHEN** no homework assignments exist for the selected filters
- **THEN** an empty state message with an "Add Homework" prompt is displayed

### Requirement: Add Homework Modal
The system SHALL provide an `AddHomeworkModal` component that allows a teacher to create a new homework assignment. The modal SHALL include class selector, subject selector, description textarea, due date picker, and form validation using react-hook-form + Zod.

#### Scenario: Teacher creates homework
- **WHEN** teacher fills all required fields and clicks "Create"
- **THEN** the homework is submitted via the API and the modal closes

#### Scenario: Teacher submits incomplete homework form
- **WHEN** teacher clicks "Create" without filling required fields
- **THEN** validation errors are displayed for the missing fields

### Requirement: Edit Homework Modal
The system SHALL provide an `EditHomeworkModal` component that allows a teacher to modify an existing homework assignment. The modal SHALL pre-fill with current homework data and allow editing of description and due date.

#### Scenario: Teacher edits homework
- **WHEN** teacher clicks "Edit" on a homework item, modifies fields, and clicks "Save"
- **THEN** the updated homework is submitted via the API and the modal closes

#### Scenario: Teacher cancels editing
- **WHEN** teacher clicks "Cancel" or closes the modal
- **THEN** no changes are saved and the modal closes

### Requirement: Homework Delete Confirmation
The system SHALL display a confirmation dialog before deleting a homework assignment. The deletion SHALL be reversible only by creating a new homework assignment.

#### Scenario: Teacher deletes homework
- **WHEN** teacher clicks "Delete" on a homework item and confirms
- **THEN** the homework is deleted via the API and removed from the list

#### Scenario: Teacher cancels deletion
- **WHEN** teacher clicks "Delete" but cancels the confirmation
- **THEN** the homework remains unchanged

### Requirement: Homework Page Filter Integration
The system SHALL provide a refactored `TeacherHomeworkPage` component that uses the shared `TeacherFilterBar` for class and subject selection, consistent with other teacher pages.

#### Scenario: Teacher filters homework by class and subject
- **WHEN** teacher changes class or subject in the filter bar
- **THEN** the homework list updates to show assignments for the new selection
