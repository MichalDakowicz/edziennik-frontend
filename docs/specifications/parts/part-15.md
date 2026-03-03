## Part 15 – Attendance Page (Student)

File: `src/components/attendance/AttendancePage.tsx`

### Data fetched

```typescript
const { data: attendance } = useQuery({
    queryKey: keys.attendance(studentId),
    queryFn: () => getAttendance(studentId),
});
const { data: statuses } = useQuery({
    queryKey: ["statuses"],
    queryFn: getAttendanceStatuses,
});
const { data: hours } = useQuery({
    queryKey: ["lesson-hours"],
    queryFn: getLessonHours,
});
```

### Layout

1. **Stats row** (3 cards):
    - Frekwencja % (color-coded: ≥90% green, ≥75% yellow, <75% red)
    - Liczba nieobecności
    - Liczba spóźnień

2. **Monthly chart** (recharts `BarChart`):
    - X axis: months
    - Series: obecność, nieobecność, spóźnienie
    - Only render if ≥2 data points

3. **Filters row**:
    - Status filter chips: Wszystkie | Nieobecność | Obecność | Spóźnienie | Usprawiedliwienie | Zwolnienie
    - Date range: Od – Do inputs

4. **Table** (`AttendanceTable`):
   Columns: Data | Godzina lekcyjna | Status
    - Sorted by date descending
    - Status column: colored badge per status name substring matching

5. **Excuse modal**: button "Zgłoś usprawiedliwienie" → opens modal. For student portal this is read-only (shows existing excuse notes if implemented). Currently just show: "Usprawiedliwienia składane są przez rodzica lub wychowawcę."

### Status color mapping

```typescript
function getStatusVariant(
    statusName: string,
): "danger" | "success" | "warning" | "info" | "neutral" {
    const s = statusName.toLowerCase();
    if (s.includes("nieobecn")) return "danger";
    if (s.includes("usprawiedliw")) return "success";
    if (s.includes("spóźn") || s.includes("spozn")) return "warning";
    if (s.includes("zwoln")) return "info";
    return "neutral";
}
```

---

