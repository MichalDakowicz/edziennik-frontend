## Part 16 – Timetable Page (Student)

File: `src/components/timetable/TimetablePage.tsx`

### Data fetched (parallel)

```typescript
const [plans, days, hours, subjects, zajecia, klasa] = await Promise.all([
    getTimetablePlan(classId),
    getDaysOfWeek(),
    getLessonHours(),
    getSubjects(),
    getZajecia(),
    getClass(classId),
]);
// Then: const entries = await getTimetableEntries(latestPlan.id)
```

### Grid layout

- Use the most recent plan (sort by `id` desc, take first)
- Days sorted by `Numer` (1=Monday … 5=Friday; only show Mon–Fri)
- Hours sorted by `Numer`
- Current day highlighted with `bg-blue-900/20` column
- Current lesson (matching today's time) highlighted with a pulsing ring
- Responsive: `overflow-x-auto` with `min-w-[700px]` table
- Each cell: subject name; empty cell shows `–`

### Today's schedule panel

Below the grid, a vertical list "Dzisiaj" showing only today's lessons in time order.

---

