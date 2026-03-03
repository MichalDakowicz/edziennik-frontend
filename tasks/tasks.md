# Modéa Frontend – Implementation Tasks

Derived from `docs/specifications.md` (normative), ordered for execution.

Primary navigation: `../docs/specifications/README.md`

## 0) Project setup
- [ ] Install required dependencies:
  - [ ] `@tanstack/react-query`
  - [ ] `react-hook-form`
  - [ ] `zod`
  - [ ] `date-fns`
  - [ ] `sonner`
  - [ ] `recharts`
  - [ ] `@tanstack/react-virtual`
- [ ] Create `.env.example` with `VITE_API_BASE_URL=https://dziennik.polandcentral.cloudapp.azure.com/api`
- [ ] Ensure `src/constants.ts` reads `import.meta.env.VITE_API_BASE_URL` fallback

Notes ([Part 1](../docs/specifications/parts/part-01.md), [Part 28](../docs/specifications/parts/part-28.md))
- Include `@tanstack/react-virtual` from stack requirements even if used later.
- Keep API base URL env-driven and preserve default fallback from spec.

## 1) Core architecture and shared modules
- [ ] Create `src/constants.ts` (API + storage keys + poll interval)
- [ ] Create `src/types/auth.ts`
- [ ] Create `src/types/api.ts`
- [ ] Create `src/utils/gradeUtils.ts`
- [ ] Create `src/utils/dateUtils.ts`
- [ ] Create `src/services/queryKeys.ts`
- [ ] Rewrite `src/services/auth.ts` per token/login/refresh contract
- [ ] Rewrite `src/services/api.ts`:
  - [ ] `fetchWithAuth` with refresh-on-401
  - [ ] Domain endpoint functions (grades, attendance, timetable, messages, users, homework, events, lucky number)
  - [ ] Defensive handling for known API quirks

Notes ([Part 3](../docs/specifications/parts/part-03.md), [Part 4](../docs/specifications/parts/part-04.md), [Part 5](../docs/specifications/parts/part-05.md), [Part 6](../docs/specifications/parts/part-06.md), [Part 7](../docs/specifications/parts/part-07.md), [Part 30](../docs/specifications/parts/part-30.md))
- Add small normalizers/utils early for API quirks (`nazwa/Nazwa`, attendance status object-or-id, timetable fallback field names).
- Keep `nadawca`/`odbiorca` as `user.id` (not teacher/student entity IDs).
- Return `undefined` on `204` in `fetchWithAuth` exactly as specified.

## 2) App shell, providers, and routing
- [ ] Update `src/main.tsx`:
  - [ ] `QueryClientProvider`
  - [ ] global `Toaster`
  - [ ] query defaults (`staleTime`, `retry`)
- [ ] Update `src/App.tsx`:
  - [ ] router tree
  - [ ] role guard (`uczen`, `nauczyciel`, `rodzic`, `admin`)
  - [ ] protected teacher routes
- [ ] Build `src/components/Layout.tsx`:
  - [ ] role-based nav variants
  - [ ] active link styling
  - [ ] unread messages badge
  - [ ] mobile hamburger + slide-in sidebar
  - [ ] logout action

Notes ([Part 8](../docs/specifications/parts/part-08.md), [Part 11](../docs/specifications/parts/part-11.md))
- Implement `RoleGuard` once and keep route tree flat/explicit to reduce auth regressions.
- Match active/inactive nav classes exactly from spec for consistent UX.

## 3) Shared UI system
- [ ] Implement reusable UI primitives:
  - [ ] `components/ui/Button.tsx`
  - [ ] `components/ui/Badge.tsx`
  - [ ] `components/ui/Card.tsx`
  - [ ] `components/ui/Modal.tsx` (escape to close + focus behavior)
  - [ ] `components/ui/Spinner.tsx`
  - [ ] `components/ui/EmptyState.tsx`
  - [ ] `components/ui/ErrorState.tsx`
- [ ] Extend `src/index.css` with utility classes from spec (`page-title`, `input-base`, `btn-primary`, etc.)

Notes ([Part 9](../docs/specifications/parts/part-09.md), [Part 24](../docs/specifications/parts/part-24.md), [Part 27](../docs/specifications/parts/part-27.md))
- Build UI primitives first; all feature pages should consume these instead of custom one-offs.
- `Modal` must support close on `Escape` and focus first interactive element.

## 4) Authentication flow
- [ ] Implement `src/components/Login.tsx`:
  - [ ] username/password form
  - [ ] loading state + inline error
  - [ ] redirect if already authenticated
  - [ ] support all roles (no student-only restriction)

Notes ([Part 12](../docs/specifications/parts/part-12.md))
- Redirect authenticated users away from login on mount to avoid flicker and duplicate form submits.

## 5) Dashboard home (role-aware)
- [ ] Implement `src/components/DashboardHome.tsx` with parallel data loading
- [ ] Student widgets:
  - [ ] lucky number
  - [ ] attendance summary
  - [ ] today timetable
  - [ ] next lesson
  - [ ] recent grades
  - [ ] overall weighted GPA
  - [ ] unread messages
  - [ ] upcoming homework
  - [ ] upcoming events/tests
- [ ] Teacher widgets:
  - [ ] today schedule
  - [ ] quick action links
  - [ ] unread messages
- [ ] Parent widgets:
  - [ ] child selector (if multiple)
  - [ ] child attendance summary
  - [ ] child recent grades
  - [ ] unread messages

Notes ([Part 13](../docs/specifications/parts/part-13.md))
- Fetch widget data in parallel (`Promise.all`) and render partial sections defensively when some calls fail.
- Student dashboard is priority path; teacher/parent can reuse data formatters from student widgets.

## 6) Student/parent feature pages

### 6.1 Grades
- [ ] Create `components/grades/GradesPage.tsx`
- [ ] Add tabs: partial, period, behavior
- [ ] Implement `GradeCard`, `GradeModal`, `PeriodGrades`, `BehaviorPoints`, `GradeSimulator`
- [ ] Add subject filtering and weighted averages
- [ ] Group period/final grades by subject and semester

Notes ([Part 14](../docs/specifications/parts/part-14.md), [Part 10](../docs/specifications/parts/part-10.md))
- Reuse `computeWeightedAverage`, `formatGradeValue`, and simulator utility to avoid duplicate grading math.

### 6.2 Attendance
- [ ] Create `components/attendance/AttendancePage.tsx`
- [ ] Implement stats cards + thresholds
- [ ] Implement monthly `BarChart` (render only with >=2 points)
- [ ] Implement filters (status chips + date range)
- [ ] Implement `AttendanceTable` with date-desc sorting
- [ ] Implement `ExcuseModal` informational content
- [ ] Normalize status display and variant mapping

Notes ([Part 15](../docs/specifications/parts/part-15.md), [Part 30](../docs/specifications/parts/part-30.md))
- Normalize `status` before filtering/rendering because backend may return object or numeric id.

### 6.3 Timetable
- [ ] Create `components/timetable/TimetablePage.tsx`
- [ ] Implement `TimetableGrid` using latest plan
- [ ] Mon–Fri columns only, sorted day/hour
- [ ] Highlight current day and current lesson
- [ ] Add responsive overflow behavior
- [ ] Add "Dzisiaj" lesson panel

Notes ([Part 16](../docs/specifications/parts/part-16.md), [Part 30](../docs/specifications/parts/part-30.md))
- Always select latest plan by descending `id` and then fetch entries by `plan_id` endpoint.

### 6.4 Homework
- [ ] Create `components/homework/HomeworkPage.tsx`
- [ ] Implement subject filter + overdue toggle
- [ ] Split upcoming vs past sections (past collapsed by default)
- [ ] Implement `HomeworkCard` with due-state badges

Notes ([Part 17](../docs/specifications/parts/part-17.md))
- Keep past section collapsed by default; this is part of required UX, not optional.

### 6.5 Events
- [ ] Create `components/events/EventsPage.tsx`
- [ ] Implement view toggle: list (default) / calendar
- [ ] List: group by month, separate past events, expandable description
- [ ] Implement `EventCalendar` month grid with day dots and side panel

Notes ([Part 18](../docs/specifications/parts/part-18.md))
- Default to list view and keep calendar as explicit toggle state.

### 6.6 Messages
- [ ] Create `components/messages/MessagesPage.tsx`
- [ ] Implement tabs: inbox/sent
- [ ] Inbox polling every `POLL_INTERVAL_MS`
- [ ] Implement `MessageList` item layout and unread/read markers
- [ ] Implement `MessageDetail` modal + mark-as-read mutation
- [ ] Implement floating compose action (Pencil icon)
- [ ] Implement `ComposeMessage` (react-hook-form + zod):
  - [ ] teacher recipient searchable dropdown
  - [ ] subject + body validation
  - [ ] send mutation + success/error toasts

Notes ([Part 19](../docs/specifications/parts/part-19.md), [Part 26](../docs/specifications/parts/part-26.md))
- Poll only inbox with `POLL_INTERVAL_MS`; avoid polling sent tab.
- Mutation errors must use toast only (no inline mutation errors).

### 6.7 Profile
- [ ] Create `components/profile/ProfilePage.tsx`
- [ ] Personal info card (read-only)
- [ ] Preferences card (theme selector + PATCH profile)
- [ ] Security info card
- [ ] Apply theme on `<html>` and support `system` mode media query listener

Notes ([Part 20](../docs/specifications/parts/part-20.md), [Part 25](../docs/specifications/parts/part-25.md))
- Persist theme via profile PATCH first, then apply class toggle locally for immediate feedback.

## 7) Teacher feature pages

### 7.1 Teacher grades
- [ ] Create `components/teacher/TeacherGradesPage.tsx`
- [ ] Filters: class + subject
- [ ] Student table with recent grades
- [ ] Add grade modal (react-hook-form + zod schema)
- [ ] Value controls: base grade + modifiers (`+`/`-`) and numeric input
- [ ] Submit `POST /oceny/` with `nauczyciel` from JWT
- [ ] Period grade modal for semester grade entry

Notes ([Part 21](../docs/specifications/parts/part-21.md))
- Keep grade value validation centralized in zod schema to prevent UI/API mismatch.

### 7.2 Teacher attendance
- [ ] Create `components/teacher/TeacherAttendancePage.tsx`
- [ ] Date/hour/class selectors
- [ ] Student rows with status dropdown from `/statusy/`
- [ ] Save-all flow with PATCH if record exists else POST

Notes ([Part 22](../docs/specifications/parts/part-22.md))
- Save-all should be idempotent for same date/hour/class by checking existing records first.

### 7.3 Teacher homework
- [ ] Create `components/teacher/TeacherHomeworkPage.tsx`
- [ ] Filters: class + subject
- [ ] Homework list with edit/delete controls
- [ ] AddHomework modal (react-hook-form + zod)
- [ ] Submit `POST /prace-domowe/` with `nauczyciel` id

Notes ([Part 23](../docs/specifications/parts/part-23.md))
- Keep create/edit/delete mutations in one page state to simplify invalidation.

## 8) Cross-cutting quality requirements
- [ ] Global query error handling via `ErrorState`
- [ ] Mutation failure handling via `toast.error(...)` only
- [ ] Accessibility pass:
  - [ ] keyboard support for clickable non-button elements (`role`, `tabIndex`, Enter/Space)
  - [ ] labels for all inputs
  - [ ] modal keyboard handling (`Escape`) and focus target
  - [ ] non-color indicators for state/meaning
- [ ] Mobile/responsive verification (sidebar behavior, table overflows, card grids)

Notes ([Part 26](../docs/specifications/parts/part-26.md), [Part 27](../docs/specifications/parts/part-27.md))
- Query errors render `ErrorState`; mutation errors trigger toasts.
- Ensure non-color indicators are present on status badges and attendance/grade meaning.

## 9) Validation and completion
- [ ] Verify all listed API endpoints are wired per spec
- [ ] Verify known API quirks are handled defensively
- [ ] Verify role access paths and redirects
- [ ] Final pass against [Part 31 checklist](../docs/specifications/parts/part-31.md) order

Notes ([Part 31](../docs/specifications/parts/part-31.md))
- `Apply Django backend changes (Part 0)` is listed in spec order but is out of scope for this frontend repository; track externally if backend repo is separate.
