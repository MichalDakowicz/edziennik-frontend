## Part 13 – Dashboard Home

File: `src/components/DashboardHome.tsx`

**Role-aware content.** Fetch all data in parallel with `Promise.all`.

### Student dashboard widgets

1. **Lucky Number card** – calls `getLuckyNumber(classId)`. Shows a large number with "Szczęśliwy numer dnia". Refresh daily.
2. **Attendance summary** – percentage bar + counts. Links to `/dashboard/attendance`.
3. **Today's timetable** – shows today's lessons from timetable. "Brak lekcji" if none.
4. **Next upcoming lesson** – countdown/time of next lesson today.
5. **Recent grades** (last 5) – clickable, opens grade modal.
6. **Overall GPA** – weighted average across all subjects.
7. **Unread messages** (last 3) – clickable, opens messages.
8. **Upcoming homework** – next 3 due dates.
9. **Upcoming events/tests** – next 3 events from calendar.

### Teacher dashboard widgets

1. Today's class schedule (zajecia for this teacher).
2. Quick links: Enter grades, Mark attendance, Add homework.
3. Recent unread messages.

### Parent dashboard widgets

1. Child selector (dropdown if `childrenIds.length > 1`).
2. Child's attendance summary.
3. Child's recent grades.
4. Unread messages.

---

