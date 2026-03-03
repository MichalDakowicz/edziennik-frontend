## Part 11 – Layout Component

File: `src/components/Layout.tsx`

The layout renders a collapsible sidebar (hidden on mobile; burger menu on mobile). Navigation items are role-aware.

### Sidebar structure

```
[Logo / App Name "Modéa"]
[User name + role badge]
─────────────────────────
Navigation links (role-based, see below)
─────────────────────────
[Logout button]
```

### Nav items by role

**Student (`uczen`)**

- Pulpit → `/dashboard`
- Oceny → `/dashboard/grades`
- Obecność → `/dashboard/attendance`
- Plan lekcji → `/dashboard/timetable`
- Prace domowe → `/dashboard/homework`
- Terminarz → `/dashboard/events`
- Wiadomości → `/dashboard/messages` (with unread count badge)
- Profil → `/dashboard/profile`

**Teacher (`nauczyciel`)**

- Pulpit → `/dashboard`
- Wystawianie ocen → `/dashboard/teacher/grades`
- Sprawdzanie obecności → `/dashboard/teacher/attendance`
- Zadania domowe → `/dashboard/teacher/homework`
- Wiadomości → `/dashboard/messages`
- Profil → `/dashboard/profile`

**Parent (`rodzic`)**

- Pulpit → `/dashboard` (shows child selector if multiple children)
- Oceny → `/dashboard/grades`
- Obecność → `/dashboard/attendance`
- Plan lekcji → `/dashboard/timetable`
- Prace domowe → `/dashboard/homework`
- Wiadomości → `/dashboard/messages`
- Profil → `/dashboard/profile`

### Mobile layout

On screens below `md` breakpoint, hide sidebar, show top bar with hamburger (`Menu` icon from lucide-react). Clicking hamburger toggles a slide-in sidebar overlay.

### Active link highlighting

Use `useLocation()` and compare `pathname` to set active tab: `bg-zinc-800 text-zinc-100` on active, `text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900` on inactive.

---

