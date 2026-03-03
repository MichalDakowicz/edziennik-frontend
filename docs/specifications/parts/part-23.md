## Part 23 – Teacher: Homework Management Page

File: `src/components/teacher/TeacherHomeworkPage.tsx`

### Layout

1. **Class + Subject filter**
2. **Homework list**: edit/delete buttons per item
3. **"Dodaj pracę domową" button** → opens `AddHomeworkModal`

### AddHomeworkModal

```typescript
const hwSchema = z.object({
    klasa: z.number(),
    przedmiot: z.number(),
    opis: z.string().min(1),
    termin: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
```

Fields: Klasa picker, Przedmiot picker, Opis (textarea), Termin (date picker).

On submit: `POST /prace-domowe/` with `{ klasa, przedmiot, nauczyciel: teacherId, opis, termin }`.

---

