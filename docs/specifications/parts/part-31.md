## Part 31 – Implementation Checklist

When implementing, complete in this order:

- [ ] Set up dependencies (`pnpm add @tanstack/react-query react-hook-form zod date-fns sonner recharts`)
- [ ] Create `constants.ts`, `types/`, `utils/`
- [ ] Rewrite `services/auth.ts` and `services/api.ts`
- [ ] Apply Django backend changes (Part 0)
- [ ] Implement layout + routing with role guards
- [ ] Login page (all roles, no role restriction)
- [ ] Dashboard Home (student view first, then teacher/parent)
- [ ] Grades page (all 3 tabs + simulator)
- [ ] Attendance page (with chart)
- [ ] Timetable page
- [ ] Homework page
- [ ] Events/calendar page
- [ ] Messages page (inbox + compose + sent)
- [ ] Profile page
- [ ] Teacher: grade entry page
- [ ] Teacher: attendance entry page
- [ ] Teacher: homework management page
- [ ] Responsive / mobile layout
- [ ] Accessibility pass (role/tabindex/keyboard)
- [ ] Theme system

