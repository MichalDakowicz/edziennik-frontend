## Part 17 – Homework Page

File: `src/components/homework/HomeworkPage.tsx`

### Data fetched

```typescript
const { data: homework } = useQuery({
    queryKey: keys.homework(classId),
    queryFn: () => getHomework(classId),
});
const { data: subjects } = useQuery({
    queryKey: keys.subjects(),
    queryFn: getSubjects,
});
```

### Layout

1. **Filter**: subject dropdown + "Show overdue" toggle
2. **Upcoming homework section** (due date ≥ today), sorted by `termin` ascending
3. **Past homework section** (due date < today), collapsed by default (expand button)

### HomeworkCard

```
[Subject badge]   [Due: 15.03.2026]   [OVERDUE badge if past due]
───────────────────────────────────────────────────────────────────
[opis text]
[Posted by: teacher name]   [Posted on: date]
```

Color of due badge: danger if past, warning if within 2 days, neutral otherwise.

---

