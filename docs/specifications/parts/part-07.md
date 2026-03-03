## Part 7 – React Query Setup

File: `src/services/queryKeys.ts`

```typescript
export const keys = {
    grades: (studentId: number) => ["grades", studentId] as const,
    periodGrades: (studentId: number) => ["period-grades", studentId] as const,
    finalGrades: (studentId: number) => ["final-grades", studentId] as const,
    behavior: (studentId: number) => ["behavior", studentId] as const,
    attendance: (studentId: number) => ["attendance", studentId] as const,
    timetable: (classId: number) => ["timetable", classId] as const,
    subjects: () => ["subjects"] as const,
    teachers: () => ["teachers"] as const,
    students: () => ["students"] as const,
    classes: () => ["classes"] as const,
    inbox: (userId: number) => ["inbox", userId] as const,
    sent: (userId: number) => ["sent", userId] as const,
    homework: (classId: number) => ["homework", classId] as const,
    events: (classId: number) => ["events", classId] as const,
    luckyNumber: (classId: number) => ["lucky-number", classId] as const,
    userProfile: (userId: number) => ["user-profile", userId] as const,
};
```

File: `src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 60_000,
            retry: 1,
        },
    },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <QueryClientProvider client={queryClient}>
            <App />
            <Toaster richColors position="top-right" />
        </QueryClientProvider>
    </React.StrictMode>,
);
```

---

