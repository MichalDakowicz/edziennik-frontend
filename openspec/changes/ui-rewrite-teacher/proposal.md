## Why

The teacher-facing UI components are the most complex in the application, handling grade entry, attendance marking, and homework management. The current implementation has grown organically with duplicated patterns (grade picker logic in both `AddGradeModal` and `AddPeriodGradeModal`), inconsistent UI conventions between teacher pages and the rest of the app, and monolithic page components that are difficult to test and maintain. A rewrite will establish consistent patterns, reduce code duplication, and improve the teacher experience.

## What Changes

- Refactor monolithic teacher page components into smaller, composable, and testable units
- Extract shared grade picker UI into a reusable component (currently duplicated across `AddGradeModal` and `AddPeriodGradeModal`)
- Standardize filter bar patterns across all teacher pages (grades, attendance, homework)
- Improve loading, error, and empty state handling consistency
- Unify table rendering patterns using the shared `Table` primitive where appropriate
- Standardize form handling with consistent `react-hook-form` + `zod` patterns
- **BREAKING**: File structure under `src/components/teacher/` will be reorganized

## Capabilities

### New Capabilities
- `teacher-grade-entry`: Reusable grade picker component and grade entry flow shared across individual and period grade modals
- `teacher-filter-bar`: Standardized filter bar component for class, subject, date, and other filters used across teacher pages
- `teacher-attendance-marking`: Refactored attendance marking UI with consistent patterns for student status selection and lesson context
- `teacher-homework-management`: Refactored homework CRUD UI with consistent form patterns and list display

### Modified Capabilities
<!-- No existing specs to modify -->

## Impact

- **Affected components**: All files under `src/components/teacher/`, `src/components/dashboard/teacher/`
- **New shared components**: Grade picker, filter bar, student table row components
- **No API changes**: Backend contracts remain unchanged
- **No routing changes**: All existing routes preserved
- **Testing**: New components will be unit-testable; existing test patterns in `utils/*.test.ts` will be extended
