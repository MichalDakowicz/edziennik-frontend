## Part 21 – Teacher: Grade Entry Page

File: `src/components/teacher/TeacherGradesPage.tsx`

### Data fetched

```typescript
// Teacher knows their nauczyciel_id from JWT
const { data: students } = useQuery({
    queryKey: keys.students(),
    queryFn: getStudents,
});
const { data: subjects } = useQuery({
    queryKey: keys.subjects(),
    queryFn: getSubjects,
});
```

### Layout

1. **Filters**: Class selector (derived from students list), Subject selector
2. **Student list table**:
   Columns: Imię i Nazwisko | Klasa | Recent grades (last 3) | Actions
3. **Add grade button** (per student row) → opens `AddGradeModal`

### AddGradeModal (react-hook-form + zod)

```typescript
const gradeSchema = z.object({
    uczen: z.number(),
    przedmiot: z.number({ required_error: "Wybierz przedmiot" }),
    wartosc: z
        .string()
        .regex(/^\d(\.\d{1,2})?$/)
        .refine((v) => {
            const n = parseFloat(v);
            return n >= 1 && n <= 6;
        }, "Ocena musi być od 1 do 6"),
    waga: z.number().int().min(1).max(5),
    opis: z.string().max(200).optional(),
    czy_do_sredniej: z.boolean(),
    czy_punkty: z.boolean(),
    czy_opisowa: z.boolean(),
});
```

**Fields:**

- Uczeń (pre-filled from row)
- Przedmiot (dropdown)
- Wartość: buttons for 1 | 2 | 3 | 4 | 5 | 6 and modifiers `+` (adds 0.5) / `-` (adds 0.25); alternatively a number input
- Waga: 1-5 (default: 1)
- Opis / Kategoria (text input)
- Czy do średniej (checkbox, default: true)

On submit: `POST /oceny/` with `{ uczen, przedmiot, wartosc, waga, opis, czy_do_sredniej, nauczyciel: teacherId, czy_punkty, czy_opisowa }`.
On success: invalidate `keys.grades(uczen_id)`, toast success.

Period grade button (separate modal): allows entering `OcenaOkresowa` with `okres` (1 or 2) + `wartosc`.

---

