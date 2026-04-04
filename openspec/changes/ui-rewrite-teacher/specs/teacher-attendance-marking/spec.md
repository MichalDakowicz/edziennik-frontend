## ADDED Requirements

### Requirement: Attendance Marking Page
The system SHALL provide a refactored `TeacherAttendancePage` component that allows a teacher to mark attendance for a class on a specific date and lesson hour. The page SHALL use the shared `TeacherFilterBar` for class and date selection.

#### Scenario: Teacher loads the attendance page
- **WHEN** teacher navigates to the attendance page
- **THEN** the page displays the filter bar with class selector and date picker

#### Scenario: Teacher selects a class and date
- **WHEN** teacher selects a class and date
- **THEN** the student list loads with current attendance status for each student

### Requirement: Student Attendance Row
The system SHALL provide a `StudentAttendanceRow` component that displays a student's name and attendance status buttons (Present, Absent, Late, Excused). The component SHALL highlight the currently selected status.

#### Scenario: Teacher marks a student as present
- **WHEN** teacher clicks the "Present" button for a student
- **THEN** the attendance status is updated and the button is visually highlighted

#### Scenario: Teacher changes a student's status
- **WHEN** teacher clicks a different status button for a student who already has a status
- **THEN** the new status replaces the old one

### Requirement: Attendance Lesson Selector
The system SHALL provide an `AttendanceLessonSelector` component that allows the teacher to select which lesson hour to mark attendance for when a class has multiple lessons on the selected date. If only one lesson exists, it SHALL be auto-selected.

#### Scenario: Multiple lessons on selected date
- **WHEN** the selected class has multiple lessons on the chosen date
- **THEN** a dropdown or list is shown for the teacher to select the lesson hour

#### Scenario: Single lesson on selected date
- **WHEN** the selected class has only one lesson on the chosen date
- **THEN** the lesson is auto-selected and no selector is shown

### Requirement: Attendance Submission
The system SHALL provide a "Save Attendance" action that submits all attendance changes for the selected class, date, and lesson hour. It SHALL use a batch API call to create or update all attendance records.

#### Scenario: Teacher saves attendance
- **WHEN** teacher clicks "Save Attendance" after marking students
- **THEN** all attendance records are submitted and a success notification is shown

#### Scenario: Network error during save
- **WHEN** the attendance submission fails
- **THEN** an error message is displayed and the unsaved changes are preserved
