## Context

The teacher module is the most feature-rich part of the electronic gradebook, comprising three main pages (grades, attendance, homework) and supporting modals. The current codebase uses React 18 + TypeScript, Tailwind CSS with MD3 tokens, TanStack React Query for server state, and react-hook-form + Zod for forms.

Current pain points:
- `AddGradeModal.tsx` (483 lines) and `AddPeriodGradeModal.tsx` (430 lines) share ~80% of their logic but are separate files
- `TeacherGradesPage.tsx` (730 lines) mixes filtering, data fetching, student table rendering, batch mode, and portal-based grade picker in one component
- Filter logic is copy-pasted across pages with minor variations
- Table rendering uses raw `<table>` elements instead of the shared `Table` primitive
- No shared component for the visual grade picker (1-6 grid with modifiers)

Constraints:
- Backend API is external (Django/DRF) and cannot be changed
- All existing routes must continue to work
- Polish language UI text must be preserved
- Must work with existing theme system (light/dark/oled)

## Goals / Non-Goals

**Goals:**
- Eliminate duplicated grade picker logic between modals
- Reduce monolithic page components to compositions of smaller units
- Create reusable filter bar component used across all teacher pages
- Standardize loading/error/empty state patterns
- Make all new components individually testable
- Maintain visual parity with current UI

**Non-Goals:**
- No API contract changes
- No new features or capabilities beyond what exists today
- No redesign of the visual appearance (only structural refactoring)
- No changes to student or parent-facing components
- No changes to authentication or routing

## Decisions

### 1. Grade Picker as Standalone Component

**Decision**: Extract the visual grade picker (1-6 grid with +/- modifiers) into `GradePicker.tsx` as a controlled component accepting `value`, `onChange`, and configuration props.

**Rationale**: This component is the core UI element duplicated across both grade modals. Making it standalone allows reuse and independent testing.

**Alternatives considered**:
- Keep in modals but extract shared hooks → still duplicates UI rendering logic
- Use a render prop pattern → adds unnecessary indirection for a simple controlled input

### 2. Filter Bar as Composable Component

**Decision**: Create `TeacherFilterBar` as a compound component pattern:
```tsx
<TeacherFilterBar>
  <FilterBar.ClassSelect options={classes} value={selectedClass} onChange={...} />
  <FilterBar.SubjectSelect options={subjects} value={selectedSubject} onChange={...} />
  <FilterBar.DatePicker value={selectedDate} onChange={...} />
</TeacherFilterBar>
```

**Rationale**: Different pages need different filter combinations. Compound components allow flexible composition while maintaining consistent styling and layout.

**Alternatives considered**:
- Single config-driven component → less type-safe, harder to customize per page
- Separate components per page → defeats the purpose of standardization

### 3. Page Component Structure

**Decision**: Each teacher page follows this pattern:
```
PageComponent
├── PageHeader (title + actions)
├── FilterBar (page-specific composition)
├── DataSection
│   ├── LoadingState / ErrorState / EmptyState
│   └── DataTable or CardList
└── ActionModal (triggered by user action)
```

**Rationale**: Consistent structure across pages makes the codebase predictable and easier to navigate.

### 4. State Management Approach

**Decision**: Continue using local `useState` for UI state (filters, modal open/close) and React Query for server state. No introduction of global state management.

**Rationale**: The current approach works well for this scale. Adding global state would be over-engineering.

### 5. File Organization

**Decision**: New structure:
```
src/components/teacher/
├── grades/
│   ├── TeacherGradesPage.tsx
│   ├── GradePicker.tsx
│   ├── AddGradeModal.tsx
│   ├── AddPeriodGradeModal.tsx
│   ├── StudentGradeTable.tsx
│   └── BatchGradePicker.tsx
├── attendance/
│   ├── TeacherAttendancePage.tsx
│   ├── StudentAttendanceRow.tsx
│   └── AttendanceLessonSelector.tsx
├── homework/
│   ├── TeacherHomeworkPage.tsx
│   ├── AddHomeworkModal.tsx
│   ├── EditHomeworkModal.tsx
│   └── HomeworkList.tsx
└── shared/
    ├── TeacherFilterBar.tsx
    ├── PageHeader.tsx
    └── types.ts
```

**Rationale**: Groups related components by feature domain while extracting truly shared components into `shared/`.

## Risks / Trade-offs

| Risk | Mitigation |
|------|-----------|
| Regression in grade entry flow (most critical feature) | Manual testing of all grade entry scenarios before merge |
| Modal logic extraction may miss edge cases | Preserve all existing validation rules and error handling in extracted components |
| File reorganization may cause merge conflicts | Coordinate with any parallel work; use git move tracking |
| Compound component pattern adds complexity | Keep API simple; provide examples in component comments |
| Larger PR may be hard to review | Split into sequential PRs: shared components first, then page-by-page migration |
