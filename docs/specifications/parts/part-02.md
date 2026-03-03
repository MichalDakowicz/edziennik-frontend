## Part 2 – Project Structure

```
frontend/src/
├── main.tsx                    # Entry point, QueryClientProvider, Toaster
├── App.tsx                     # Router, role-based route guards
├── index.css                   # Tailwind directives
├── vite-env.d.ts
├── constants.ts                # API_BASE_URL, POLL_INTERVAL, etc.
├── types/
│   ├── auth.ts                 # TokenPayload, User, Role
│   └── api.ts                  # All API response interfaces
├── services/
│   ├── auth.ts                 # login, logout, refreshAccessToken, getCurrentUser
│   ├── api.ts                  # All fetchWithAuth wrappers, grouped by domain
│   └── queryKeys.ts            # React Query key factories
├── hooks/
│   ├── useCurrentUser.ts       # Returns parsed user from localStorage
│   ├── useGrades.ts
│   ├── useAttendance.ts
│   ├── useTimetable.ts
│   ├── useMessages.ts
│   ├── useHomework.ts
│   ├── useEvents.ts
│   └── useBehavior.ts
├── components/
│   ├── ui/                     # Reusable primitives
│   │   ├── Button.tsx
│   │   ├── Badge.tsx
│   │   ├── Card.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   ├── EmptyState.tsx
│   │   └── ErrorState.tsx
│   ├── Layout.tsx              # Sidebar + Outlet (student/teacher/parent variants)
│   ├── Login.tsx
│   ├── DashboardHome.tsx
│   ├── grades/
│   │   ├── GradesPage.tsx
│   │   ├── GradeCard.tsx
│   │   ├── GradeModal.tsx
│   │   ├── GradeSimulator.tsx
│   │   ├── PeriodGrades.tsx
│   │   └── BehaviorPoints.tsx
│   ├── attendance/
│   │   ├── AttendancePage.tsx
│   │   ├── AttendanceStats.tsx
│   │   ├── AttendanceTable.tsx
│   │   └── ExcuseModal.tsx
│   ├── timetable/
│   │   ├── TimetablePage.tsx
│   │   └── TimetableGrid.tsx
│   ├── messages/
│   │   ├── MessagesPage.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageDetail.tsx
│   │   └── ComposeMessage.tsx
│   ├── homework/
│   │   ├── HomeworkPage.tsx
│   │   └── HomeworkCard.tsx
│   ├── events/
│   │   ├── EventsPage.tsx
│   │   └── EventCalendar.tsx
│   ├── profile/
│   │   └── ProfilePage.tsx
│   └── teacher/
│       ├── TeacherGradesPage.tsx
│       ├── TeacherAttendancePage.tsx
│       └── TeacherHomeworkPage.tsx
└── utils/
    ├── gradeUtils.ts           # formatGradeValue, getGradeColor, computeAverage
    └── dateUtils.ts            # formatDate, formatRelative (pl locale)
```

---

