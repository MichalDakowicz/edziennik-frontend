## Part 18 – Events/Calendar Page

File: `src/components/events/EventsPage.tsx`

### Data fetched

```typescript
const { data: events } = useQuery({
    queryKey: keys.events(classId),
    queryFn: () => getEvents(classId),
});
const { data: subjects } = useQuery({
    queryKey: keys.subjects(),
    queryFn: getSubjects,
});
```

### Layout

Two views toggled by a button: **List view** (default) and **Calendar view**.

**List view:**

- Group events by month (sorted ascending)
- Each event: title, date/time, subject badge (if `przedmiot`), description (collapsed, expand on click)
- Past events shown in a "Minione" section

**Calendar view (`EventCalendar`):**

- 7-column week grid for current month
- Days with events show a colored dot
- Clicking a day shows events for that day in a side panel
- Month navigation (prev/next)

---

