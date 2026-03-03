## Part 14 – Grades Page (Student)

File: `src/components/grades/GradesPage.tsx`

### Data fetched

```typescript
const { data: grades } = useQuery({
    queryKey: keys.grades(studentId),
    queryFn: () => getGrades(studentId),
});
const { data: periodGrades } = useQuery({
    queryKey: keys.periodGrades(studentId),
    queryFn: () => getPeriodGrades(studentId),
});
const { data: finalGrades } = useQuery({
    queryKey: keys.finalGrades(studentId),
    queryFn: () => getFinalGrades(studentId),
});
const { data: behavior } = useQuery({
    queryKey: keys.behavior(studentId),
    queryFn: () => getBehaviorPoints(studentId),
});
const { data: subjects } = useQuery({
    queryKey: keys.subjects(),
    queryFn: getSubjects,
});
```

### Tab structure

Three tabs:

1. **Oceny cząstkowe** (Partial grades – default)
2. **Oceny okresowe** (Period/semester grades)
3. **Zachowanie** (Behavior points)

### Tab 1: Partial grades

- Subject search input (text filter)
- Grid of `GradeCard` components (one per subject)
- Each card shows: subject name, weighted average badge, list of grades
- Clicking a grade opens `GradeModal`
- `GradeSimulator` panel at bottom: select subject → input target average → shows needed grade

**GradeCard layout:**

```
[Subject name]                    [avg: 4.23 badge]
─────────────────────────────────────────────────
[description]   [date] · Waga: 2       [4+]
[description]   [date] · Waga: 1       [3]
[description]   [date] · Waga: 3       [5-]
```

**GradeModal fields:**

- Przedmiot
- Ocena (large badge with color)
- Waga
- Kategoria / Opis
- Data wystawienia
- Czy do średniej: Tak/Nie badge
- Czy punktowa: Tak/Nie badge

### Tab 2: Period grades

- Table with columns: Przedmiot | Ocena I półrocze | Ocena II półrocze | Ocena końcowa
- Group `PeriodGrade[]` by `przedmiot`, then by `okres`
- Show `FinalGrade` in last column if available

### Tab 3: Behavior points

- Summary bar: total points. Color: green if ≥0, red if <0.
- List of entries sorted by `data_wpisu` descending
- Each entry: points badge (`+3` green / `-2` red), description, date

### GradeSimulator component

```tsx
// State: selectedSubjectId, targetAvg (number input 1-6), newGradeWeight (number input 1-5)
// Result: call simulateGradeNeeded(), display the needed grade
// "Aby uzyskać średnią X.XX, potrzebujesz oceny: Y"
// If null: "Niemożliwe do osiągnięcia przy tej wadze"
```

---

