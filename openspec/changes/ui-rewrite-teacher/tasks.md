## 1. Shared Infrastructure

- [x] 1.1 Create `src/components/teacher/shared/` directory structure
- [x] 1.2 Create `src/components/teacher/shared/types.ts` with shared TypeScript types
- [x] 1.3 Create `src/components/teacher/shared/PageHeader.tsx` component for consistent page headers
- [x] 1.4 Create `src/components/teacher/shared/TeacherFilterBar.tsx` compound component with ClassSelect, SubjectSelect, and DatePicker sub-components

## 2. Grade Picker Component

- [x] 2.1 Create `src/components/teacher/grades/GradePicker.tsx` as a controlled component with value, onChange, disabled, and config props
- [x] 2.2 Implement the 1-6 grade grid with color-coded cells matching current grade colors
- [x] 2.3 Implement modifier buttons (+, -, 0) with grade value computation logic
- [ ] 2.4 Add unit tests for GradePicker value selection and modifier logic
- [ ] 2.5 Add unit tests for GradePicker disabled state

## 3. Grade Entry Modals

- [ ] 3.1 Create `src/components/teacher/grades/AddGradeModal.tsx` using the new GradePicker component with react-hook-form + Zod validation
- [x] 3.2 Create `src/components/teacher/grades/AddPeriodGradeModal.tsx` reusing GradePicker with semester selector
- [x] 3.3 Migrate all validation rules from existing modals to new implementations
- [x] 3.4 Verify visual parity with existing modals (same layout, styling, animations)
- [ ] 3.5 Test grade submission flow for both modals against the API

## 4. Student Grade Table

- [x] 4.1 Create `src/components/teacher/grades/StudentGradeTable.tsx` using the shared Table primitive
- [x] 4.2 Implement student row with name, recent grade badges, and action buttons
- [x] 4.3 Implement grade badge color coding using existing `getGradeColor` utility
- [x] 4.4 Add loading, error, and empty state handling
- [ ] 4.5 Test table rendering with various class/subject combinations

## 5. Batch Grade Entry

- [ ] 5.1 Create `src/components/teacher/grades/BatchGradePicker.tsx` component for multi-student grade entry
- [ ] 5.2 Implement student selection checkboxes in StudentGradeTable
- [ ] 5.3 Implement batch grade submission logic using existing API functions
- [ ] 5.4 Add success/error notifications for batch operations
- [ ] 5.5 Test batch mode with multiple students

## 6. Grades Page Refactor

- [x] 6.1 Create new `src/components/teacher/grades/TeacherGradesPage.tsx` composing PageHeader, TeacherFilterBar, StudentGradeTable, and modals
- [x] 6.2 Migrate filter state management from monolithic component to new structure
- [x] 6.3 Migrate data fetching hooks (useQuery for classes, subjects, students, grades)
- [x] 6.4 Replace old TeacherGradesPage in App.tsx routes
- [ ] 6.5 Remove old grade entry files (`src/components/teacher/AddGradeModal.tsx`, `src/components/teacher/AddPeriodGradeModal.tsx`)
- [ ] 6.6 Manual testing: verify all grade entry scenarios work correctly

## 7. Attendance Page Refactor

- [ ] 7.1 Create `src/components/teacher/attendance/StudentAttendanceRow.tsx` with status buttons (Present, Absent, Late, Excused)
- [ ] 7.2 Create `src/components/teacher/attendance/AttendanceLessonSelector.tsx` component
- [ ] 7.3 Create new `src/components/teacher/attendance/TeacherAttendancePage.tsx` composing PageHeader, TeacherFilterBar, and attendance components
- [ ] 7.4 Migrate attendance marking logic and API integration
- [ ] 7.5 Implement batch attendance submission
- [ ] 7.6 Add loading, error, and empty state handling
- [ ] 7.7 Replace old TeacherAttendancePage in App.tsx routes
- [ ] 7.8 Remove old attendance files
- [ ] 7.9 Manual testing: verify all attendance marking scenarios

## 8. Homework Page Refactor

- [ ] 8.1 Create `src/components/teacher/homework/HomeworkList.tsx` component with homework item cards
- [ ] 8.2 Create `src/components/teacher/homework/AddHomeworkModal.tsx` with react-hook-form + Zod validation
- [ ] 8.3 Create `src/components/teacher/homework/EditHomeworkModal.tsx` with pre-filled data
- [ ] 8.4 Create new `src/components/teacher/homework/TeacherHomeworkPage.tsx` composing PageHeader, TeacherFilterBar, and HomeworkList
- [ ] 8.5 Migrate homework CRUD logic and API integration
- [ ] 8.6 Implement delete confirmation dialog
- [ ] 8.7 Replace old TeacherHomeworkPage in App.tsx routes
- [ ] 8.8 Remove old homework files
- [ ] 8.9 Manual testing: verify all homework CRUD scenarios

## 9. Dashboard Teacher Components

- [ ] 9.1 Review and update `src/components/dashboard/teacher/` components for consistency with new patterns
- [ ] 9.2 Update any imports referencing moved components

## 10. Cleanup and Verification

- [ ] 10.1 Remove all old teacher component files from `src/components/teacher/` root
- [ ] 10.2 Run TypeScript type checking (`tsc --noEmit`) and fix any errors
- [ ] 10.3 Run linting (`npm run lint`) and fix any violations
- [ ] 10.4 Run existing test suite and ensure no regressions
- [ ] 10.5 Add unit tests for new shared components (TeacherFilterBar, PageHeader)
- [ ] 10.6 Verify all routes work correctly in development mode
- [ ] 10.7 Verify theme compatibility (light, dark, oled) for all new components
