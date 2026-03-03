## Part 22 – Teacher: Attendance Entry Page

File: `src/components/teacher/TeacherAttendancePage.tsx`

### Layout

1. **Date picker** (default: today)
2. **Lesson hour selector** (dropdown of `LessonHour[]`)
3. **Class selector** (dropdown of `ClassInfo[]`)
4. **Attendance table**: one row per student in selected class, status dropdown per row

### Attendance status dropdown values

Populated from `GET /statusy/`. Each row: `[Student Name] [Status dropdown]`.

### Submit behavior

For each student, check if an existing attendance record exists for that date + lesson hour + student. If yes, PATCH; if no, POST.

```typescript
// For each student:
const existing = allAttendance.find(
    (a) =>
        a.uczen === s.id &&
        a.godzina_lekcyjna === selectedHourId &&
        a.Data === selectedDate,
);
if (existing) {
    await updateAttendance(existing.id, { status: statusId });
} else {
    await createAttendance({
        Data: selectedDate,
        uczen: s.id,
        godzina_lekcyjna: selectedHourId,
        status: statusId,
    });
}
```

"Zapisz wszystkie" button → toast on success.

---

