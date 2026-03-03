# Modéa – Full Frontend Application Specification

> **Implementation note for LLM:** This document is a complete, self-contained specification. Every section is normative. Implement exactly what is described. Do not add features, libraries, or endpoints not listed here unless they are unavoidable transitive dependencies.

---

## Part 1 – Technology Stack

### Core

| Concern    | Library          | Version |
| ---------- | ---------------- | ------- |
| Framework  | React            | 18.x    |
| Language   | TypeScript       | 5.x     |
| Build tool | Vite             | 5.x     |
| Routing    | react-router-dom | 6.x     |
| Styling    | Tailwind CSS     | 3.x     |
| Icons      | lucide-react     | latest  |
| JWT decode | jwt-decode       | 4.x     |

### Added libraries (not in current PoC)

| Concern                 | Library                    | Rationale                                      |
| ----------------------- | -------------------------- | ---------------------------------------------- |
| Data fetching / caching | `@tanstack/react-query` v5 | Automatic refetch, loading/error states, cache |
| Forms                   | `react-hook-form`          | Grade entry, compose message, homework         |
| Validation              | `zod`                      | Schema validation for forms                    |
| Date formatting         | `date-fns`                 | Format Polish dates, relative time             |
| Toast notifications     | `sonner`                   | Non-blocking notifications                     |
| Charts                  | `recharts`                 | Grade averages, attendance chart               |
| Infinite scroll         | `@tanstack/react-virtual`  | Long message / grade lists                     |

### package.json additions

```json
{
    "dependencies": {
        "@tanstack/react-query": "^5.0.0",
        "react-hook-form": "^7.0.0",
        "zod": "^3.0.0",
        "date-fns": "^3.0.0",
        "sonner": "^1.0.0",
        "recharts": "^2.0.0"
    }
}
```

---

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

## Part 3 – Constants and Configuration

File: `src/constants.ts`

```typescript
export const API_BASE_URL =
    "https://dziennik.polandcentral.cloudapp.azure.com/api";
export const POLL_INTERVAL_MS = 30_000; // message polling
export const TOKEN_KEY = "access_token";
export const REFRESH_KEY = "refresh_token";
export const USER_KEY = "user";
```

---

## Part 4 – Types

File: `src/types/auth.ts`

```typescript
export type Role = "uczen" | "nauczyciel" | "rodzic" | "admin";

export interface TokenPayload {
    user_id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: Role;
    uczen_id?: number;
    klasa_id?: number;
    nauczyciel_id?: number;
    rodzic_id?: number;
    dzieci_ids?: number[];
    exp: number;
}

export interface CurrentUser {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    studentId?: number; // uczen_id
    classId?: number; // klasa_id
    teacherId?: number; // nauczyciel_id
    parentId?: number; // rodzic_id
    childrenIds?: number[]; // dzieci_ids
}
```

File: `src/types/api.ts`

```typescript
export interface Subject {
    id: number;
    nazwa: string;
    nazwa_skrocona?: string | null;
}

export interface Grade {
    id: number;
    wartosc: string; // decimal as string e.g. "4.50" (4+), "4.75" (5-)
    waga: number;
    opis: string | null;
    data_wystawienia: string; // ISO datetime
    czy_punkty: boolean;
    czy_opisowa: boolean;
    czy_do_sredniej: boolean;
    uczen: number;
    nauczyciel: number | null;
    przedmiot: number;
}

export interface PeriodGrade {
    id: number;
    uczen: number;
    wartosc: string;
    okres: number; // 1 = first semester, 2 = second semester
    przedmiot: number | null;
    nauczyciel: number | null;
}

export interface FinalGrade {
    id: number;
    uczen: number;
    wartosc: string;
    przedmiot: number;
    nauczyciel: number | null;
}

export interface BehaviorPoint {
    id: number;
    uczen: number;
    punkty: number; // positive = commendation, negative = note
    opis: string | null;
    data_wpisu: string; // ISO datetime
    nauczyciel_wpisujacy: number | null;
}

export interface AttendanceStatus {
    id: number;
    Wartosc: string;
}

export interface Attendance {
    id: number;
    Data: string; // ISO date "YYYY-MM-DD"
    uczen: number;
    godzina_lekcyjna: number;
    status: number | null | { id?: number; Wartosc?: string };
}

export interface LessonHour {
    id: number;
    Numer: number;
    CzasOd: string; // "HH:MM:SS"
    CzasDo: string;
    CzasTrwania: number; // minutes
}

export interface DayOfWeek {
    id: number;
    Nazwa: string;
    Numer: number; // 1=Monday ... 7=Sunday
}

export interface TimetableEntry {
    id: number;
    dzien_tygodnia: number;
    godzina_lekcyjna: number;
    zajecia: number;
}

export interface TimetablePlan {
    id: number;
    klasa: number;
    ObowiazujeOdDnia: string; // ISO date
    wpisy: number[];
}

export interface Zajecia {
    id: number;
    przedmiot: number;
    nauczyciel: number | null;
}

export interface Message {
    id: number;
    nadawca: number; // user.id (not uczen/nauczyciel id)
    odbiorca: number;
    temat: string;
    tresc: string;
    data_wyslania: string; // ISO datetime
    przeczytana: boolean;
}

export interface Teacher {
    id: number;
    user: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    telefon: string;
}

export interface Student {
    id: number;
    user: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    klasa: number | null;
    telefon: string | null;
    data_urodzenia: string;
}

export interface ClassInfo {
    id: number;
    nazwa: string | null;
    numer: number | null;
    wychowawca: number | null;
}

export interface Homework {
    id: number;
    klasa: number;
    przedmiot: number;
    nauczyciel: number;
    opis: string;
    data_wystawienia: string; // ISO datetime
    termin: string; // ISO date (due date)
}

export interface Event {
    id: number;
    tytul: string;
    opis: string;
    data: string; // ISO datetime
    klasa: number | null;
    przedmiot: number | null;
    nauczyciel: number | null;
}

export interface UserProfile {
    id: number;
    user: number;
    theme_preference: "light" | "dark" | "system";
}

export interface LuckyNumber {
    date: string;
    lucky_number: number;
    klasa_id: number | null;
}
```

---

## Part 5 – Authentication Service

File: `src/services/auth.ts`

```typescript
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL, TOKEN_KEY, REFRESH_KEY, USER_KEY } from "../constants";
import type { TokenPayload, CurrentUser, Role } from "../types/auth";

export const login = async (
    username: string,
    password: string,
): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        if (res.status === 401) throw new Error("Nieprawidłowe dane logowania");
        throw new Error(`Błąd logowania: ${res.statusText}`);
    }

    const data = await res.json();
    const decoded: TokenPayload = jwtDecode(data.access);

    localStorage.setItem(TOKEN_KEY, data.access);
    localStorage.setItem(REFRESH_KEY, data.refresh);
    localStorage.setItem(
        USER_KEY,
        JSON.stringify({
            id: decoded.user_id,
            username: decoded.username,
            firstName: decoded.first_name,
            lastName: decoded.last_name,
            email: decoded.email,
            role: decoded.role,
            studentId: decoded.uczen_id,
            classId: decoded.klasa_id,
            teacherId: decoded.nauczyciel_id,
            parentId: decoded.rodzic_id,
            childrenIds: decoded.dzieci_ids,
        } satisfies CurrentUser),
    );
};

export const logout = (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
};

export const getCurrentUser = (): CurrentUser | null => {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as CurrentUser;
    } catch {
        return null;
    }
};

export const getAuthToken = (): string | null =>
    localStorage.getItem(TOKEN_KEY);

export const refreshAccessToken = async (): Promise<string | null> => {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) return null;
    const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
        logout();
        return null;
    }
    const data = await res.json();
    if (!data.access) {
        logout();
        return null;
    }
    localStorage.setItem(TOKEN_KEY, data.access);
    return data.access;
};
```

---

## Part 6 – API Service

File: `src/services/api.ts`

### Base fetcher

```typescript
import { getAuthToken, refreshAccessToken, logout } from "./auth";
import { API_BASE_URL } from "../constants";

const makeHeaders = (
    token: string | null,
    extra?: HeadersInit,
): HeadersInit => ({
    "Content-Type": "application/json",
    ...(token
        ? {
              Authorization: `Bearer ${token}`,
              "X-Authorization": `Bearer ${token}`,
          }
        : {}),
    ...extra,
});

export async function fetchWithAuth<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
): Promise<T> {
    let token = getAuthToken();
    let res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: makeHeaders(token, options.headers as HeadersInit),
    });

    if (res.status === 401) {
        const newToken = await refreshAccessToken();
        if (!newToken) {
            logout();
            window.location.href = "/";
            throw new Error("Session expired");
        }
        res = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: makeHeaders(newToken, options.headers as HeadersInit),
        });
    }

    if (!res.ok) throw new Error(`API Error ${res.status}: ${res.statusText}`);
    if (res.status === 204) return undefined as T;
    return res.json() as Promise<T>;
}
```

### Grade endpoints

```typescript
// GET /api/oceny/?uczen=<id>
export const getGrades = (studentId: number) =>
    fetchWithAuth<Grade[]>(`/oceny/?uczen=${studentId}`);

// GET /api/oceny-okresowe/?uczen=<id>
export const getPeriodGrades = (studentId: number) =>
    fetchWithAuth<PeriodGrade[]>(`/oceny-okresowe/?uczen=${studentId}`);

// GET /api/oceny-koncowe/?uczen=<id>
export const getFinalGrades = (studentId: number) =>
    fetchWithAuth<FinalGrade[]>(`/oceny-koncowe/?uczen=${studentId}`);

// GET /api/zachowanie-punkty/?uczen=<id>
export const getBehaviorPoints = (studentId: number) =>
    fetchWithAuth<BehaviorPoint[]>(`/zachowanie-punkty/?uczen=${studentId}`);

// POST /api/oceny/ (teacher only)
export const createGrade = (data: Omit<Grade, "id" | "data_wystawienia">) =>
    fetchWithAuth<Grade>("/oceny/", {
        method: "POST",
        body: JSON.stringify(data),
    });

// PATCH /api/oceny/<id>/
export const updateGrade = (id: number, data: Partial<Grade>) =>
    fetchWithAuth<Grade>(`/oceny/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });

// DELETE /api/oceny/<id>/
export const deleteGrade = (id: number) =>
    fetchWithAuth<void>(`/oceny/${id}/`, { method: "DELETE" });

// POST /api/oceny-okresowe/ (teacher only)
export const createPeriodGrade = (data: Omit<PeriodGrade, "id">) =>
    fetchWithAuth<PeriodGrade>("/oceny-okresowe/", {
        method: "POST",
        body: JSON.stringify(data),
    });

// POST /api/zachowanie-punkty/
export const createBehaviorPoint = (
    data: Omit<BehaviorPoint, "id" | "data_wpisu">,
) =>
    fetchWithAuth<BehaviorPoint>("/zachowanie-punkty/", {
        method: "POST",
        body: JSON.stringify(data),
    });
```

### Attendance endpoints

```typescript
// GET /api/frekwencja/?uczen_id=<id>&date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
export const getAttendance = (
    studentId: number,
    dateFrom?: string,
    dateTo?: string,
) => {
    const params = new URLSearchParams({ uczen_id: String(studentId) });
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    return fetchWithAuth<Attendance[]>(`/frekwencja/?${params}`);
};

// GET /api/statusy/
export const getAttendanceStatuses = () =>
    fetchWithAuth<AttendanceStatus[]>("/statusy/");

// POST /api/frekwencja/ (teacher only)
export const createAttendance = (data: Omit<Attendance, "id">) =>
    fetchWithAuth<Attendance>("/frekwencja/", {
        method: "POST",
        body: JSON.stringify(data),
    });

// PATCH /api/frekwencja/<id>/
export const updateAttendance = (id: number, data: Partial<Attendance>) =>
    fetchWithAuth<Attendance>(`/frekwencja/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
```

### Timetable endpoints

```typescript
// GET /api/plany-zajec/?klasa_id=<id>
export const getTimetablePlan = (classId: number) =>
    fetchWithAuth<TimetablePlan[]>(`/plany-zajec/?klasa_id=${classId}`);

// GET /api/plan-wpisy/?plan_id=<id>
export const getTimetableEntries = (planId: number) =>
    fetchWithAuth<TimetableEntry[]>(`/plan-wpisy/?plan_id=${planId}`);

// GET /api/godziny-lekcyjne/
export const getLessonHours = () =>
    fetchWithAuth<LessonHour[]>("/godziny-lekcyjne/");

// GET /api/dni-tygodnia/
export const getDaysOfWeek = () => fetchWithAuth<DayOfWeek[]>("/dni-tygodnia/");

// GET /api/zajecia/
export const getZajecia = () => fetchWithAuth<Zajecia[]>("/zajecia/");
```

### Messages endpoints

```typescript
// GET /api/wiadomosci/?odbiorca=<user.id>
export const getInboxMessages = (userId: number) =>
    fetchWithAuth<Message[]>(`/wiadomosci/?odbiorca=${userId}`);

// GET /api/wiadomosci/?nadawca=<user.id>
export const getSentMessages = (userId: number) =>
    fetchWithAuth<Message[]>(`/wiadomosci/?nadawca=${userId}`);

// PATCH /api/wiadomosci/<id>/
export const markMessageRead = (id: number) =>
    fetchWithAuth<Message>(`/wiadomosci/${id}/`, {
        method: "PATCH",
        body: JSON.stringify({ przeczytana: true }),
    });

// POST /api/wiadomosci/
export const sendMessage = (data: {
    nadawca: number;
    odbiorca: number;
    temat: string;
    tresc: string;
}) =>
    fetchWithAuth<Message>("/wiadomosci/", {
        method: "POST",
        body: JSON.stringify(data),
    });
```

### Users endpoints

```typescript
// GET /api/uczniowie/
export const getStudents = () => fetchWithAuth<Student[]>("/uczniowie/");

// GET /api/uczniowie/<id>/
export const getStudent = (id: number) =>
    fetchWithAuth<Student>(`/uczniowie/${id}/`);

// GET /api/nauczyciele/
export const getTeachers = () => fetchWithAuth<Teacher[]>("/nauczyciele/");

// GET /api/users/<id>/
export const getUserProfile = (userId: number) =>
    fetchWithAuth<{
        id: number;
        username: string;
        first_name: string;
        last_name: string;
    }>(`/users/${userId}/`);

// GET /api/klasy/<id>/
export const getClass = (classId: number) =>
    fetchWithAuth<ClassInfo>(`/klasy/${classId}/`);

// GET /api/klasy/
export const getClasses = () => fetchWithAuth<ClassInfo[]>("/klasy/");

// GET /api/profile/?user=<id> – returns list, take first element
export const getUserSettings = (userId: number) =>
    fetchWithAuth<UserProfile[]>(`/profile/?user=${userId}`);

// PATCH /api/profile/<id>/
export const updateUserSettings = (
    profileId: number,
    data: Partial<UserProfile>,
) =>
    fetchWithAuth<UserProfile>(`/profile/${profileId}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });
```

### Subjects / Utils endpoints

```typescript
// GET /api/przedmioty/
export const getSubjects = () => fetchWithAuth<Subject[]>("/przedmioty/");

// GET /api/prace-domowe/?klasa=<id>
export const getHomework = (classId: number, subjectId?: number) => {
    const p = new URLSearchParams({ klasa: String(classId) });
    if (subjectId) p.set("przedmiot", String(subjectId));
    return fetchWithAuth<Homework[]>(`/prace-domowe/?${p}`);
};

// POST /api/prace-domowe/ (teacher only)
export const createHomework = (
    data: Omit<Homework, "id" | "data_wystawienia">,
) =>
    fetchWithAuth<Homework>("/prace-domowe/", {
        method: "POST",
        body: JSON.stringify(data),
    });

// PATCH /api/prace-domowe/<id>/
export const updateHomework = (id: number, data: Partial<Homework>) =>
    fetchWithAuth<Homework>(`/prace-domowe/${id}/`, {
        method: "PATCH",
        body: JSON.stringify(data),
    });

// DELETE /api/prace-domowe/<id>/
export const deleteHomework = (id: number) =>
    fetchWithAuth<void>(`/prace-domowe/${id}/`, { method: "DELETE" });
```

### Events endpoints

```typescript
// GET /api/wydarzenia/?klasa=<id>
export const getEvents = (classId: number) =>
    fetchWithAuth<Event[]>(`/wydarzenia/?klasa=${classId}`);

// POST /api/wydarzenia/ (teacher only)
export const createEvent = (data: Omit<Event, "id">) =>
    fetchWithAuth<Event>("/wydarzenia/", {
        method: "POST",
        body: JSON.stringify(data),
    });
```

### Lucky Number

```typescript
// GET /api/lucky-number/?klasa=<id>
export const getLuckyNumber = (classId: number) =>
    fetchWithAuth<LuckyNumber>(`/lucky-number/?klasa=${classId}`);
```

---

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

## Part 8 – Routing and Role Guards

File: `src/App.tsx`

```tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { getCurrentUser } from "./services/auth";
import Login from "./components/Login";
import Layout from "./components/Layout";
// Student pages
import DashboardHome from "./components/DashboardHome";
import GradesPage from "./components/grades/GradesPage";
import AttendancePage from "./components/attendance/AttendancePage";
import TimetablePage from "./components/timetable/TimetablePage";
import MessagesPage from "./components/messages/MessagesPage";
import HomeworkPage from "./components/homework/HomeworkPage";
import EventsPage from "./components/events/EventsPage";
import ProfilePage from "./components/profile/ProfilePage";
// Teacher pages
import TeacherGradesPage from "./components/teacher/TeacherGradesPage";
import TeacherAttendancePage from "./components/teacher/TeacherAttendancePage";
import TeacherHomeworkPage from "./components/teacher/TeacherHomeworkPage";

type Role = "uczen" | "nauczyciel" | "rodzic" | "admin";

const RoleGuard = ({
    allow,
    children,
}: {
    allow: Role[];
    children: React.ReactNode;
}) => {
    const user = getCurrentUser();
    if (!user) return <Navigate to="/" replace />;
    if (!allow.includes(user.role as Role))
        return <Navigate to="/dashboard" replace />;
    return <>{children}</>;
};

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Layout />}>
                    <Route index element={<DashboardHome />} />
                    {/* Student & Parent */}
                    <Route path="grades" element={<GradesPage />} />
                    <Route path="attendance" element={<AttendancePage />} />
                    <Route path="timetable" element={<TimetablePage />} />
                    <Route path="messages" element={<MessagesPage />} />
                    <Route path="homework" element={<HomeworkPage />} />
                    <Route path="events" element={<EventsPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    {/* Teacher only */}
                    <Route
                        path="teacher/grades"
                        element={
                            <RoleGuard allow={["nauczyciel", "admin"]}>
                                <TeacherGradesPage />
                            </RoleGuard>
                        }
                    />
                    <Route
                        path="teacher/attendance"
                        element={
                            <RoleGuard allow={["nauczyciel", "admin"]}>
                                <TeacherAttendancePage />
                            </RoleGuard>
                        }
                    />
                    <Route
                        path="teacher/homework"
                        element={
                            <RoleGuard allow={["nauczyciel", "admin"]}>
                                <TeacherHomeworkPage />
                            </RoleGuard>
                        }
                    />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
```

---

## Part 9 – Shared UI Components

### `Card.tsx`

```tsx
export const Card = ({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <div
        className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 ${className}`}
    >
        {children}
    </div>
);
```

### `Badge.tsx`

```tsx
type Variant =
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral";
const variants: Record<Variant, string> = {
    default: "bg-zinc-800 text-zinc-300 border-zinc-700",
    success: "bg-emerald-900/20 text-emerald-400 border-emerald-900/30",
    warning: "bg-yellow-900/20 text-yellow-400 border-yellow-900/30",
    danger: "bg-red-900/20 text-red-400 border-red-900/30",
    info: "bg-blue-900/20 text-blue-400 border-blue-900/30",
    neutral: "bg-zinc-900 text-zinc-400 border-zinc-800",
};
export const Badge = ({
    children,
    variant = "default",
}: {
    children: React.ReactNode;
    variant?: Variant;
}) => (
    <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}
    >
        {children}
    </span>
);
```

### `Modal.tsx`

```tsx
export const Modal = ({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) => {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-zinc-800">
                    <h3 className="text-lg font-bold text-zinc-100">{title}</h3>
                </div>
                <div className="p-6 overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    );
};
```

### `Spinner.tsx`

```tsx
export const Spinner = ({ label = "Ładowanie..." }: { label?: string }) => (
    <div className="flex items-center justify-center h-48 text-zinc-500">
        {label}
    </div>
);
```

### `EmptyState.tsx`

```tsx
export const EmptyState = ({ message }: { message: string }) => (
    <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 p-12 text-center text-zinc-500">
        {message}
    </div>
);
```

---

## Part 10 – Utility Functions

File: `src/utils/gradeUtils.ts`

```typescript
/** Convert decimal to Polish grade string: 4.00→"4", 4.50→"4+", 4.75→"5-" */
export function formatGradeValue(value: string | number): string {
    const val = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(val)) return String(value);
    if (val % 1 === 0.5) return `${Math.floor(val)}+`;
    if (val % 1 === 0.75) return `${Math.ceil(val)}-`;
    return String(Math.round(val));
}

/** Returns Tailwind classes for grade badge background/text */
export function getGradeColor(value: string | number): string {
    const val = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(val)) return "bg-zinc-900 border-zinc-800 text-zinc-100";
    if (val >= 5)
        return "bg-emerald-900/20 text-emerald-400 border-emerald-900/30";
    if (val >= 4) return "bg-green-900/20 text-green-400 border-green-900/30";
    if (val >= 3)
        return "bg-yellow-900/20 text-yellow-400 border-yellow-900/30";
    if (val >= 2)
        return "bg-orange-900/20 text-orange-400 border-orange-900/30";
    return "bg-red-900/20 text-red-400 border-red-900/30";
}

/** Weighted average, only includes grades with czy_do_sredniej=true */
export function computeWeightedAverage(
    grades: { wartosc: string; waga: number; czy_do_sredniej: boolean }[],
): number {
    const valid = grades.filter(
        (g) => g.czy_do_sredniej && !isNaN(parseFloat(g.wartosc)),
    );
    if (valid.length === 0) return 0;
    const sumW = valid.reduce((s, g) => s + g.waga, 0);
    return valid.reduce((s, g) => s + parseFloat(g.wartosc) * g.waga, 0) / sumW;
}

/**
 * Grade Simulator: given current grades and a desired target average,
 * returns the minimum grade needed (with given weight) to reach the target.
 * Returns null if mathematically impossible.
 */
export function simulateGradeNeeded(
    grades: { wartosc: string; waga: number; czy_do_sredniej: boolean }[],
    targetAvg: number,
    newGradeWeight: number,
): number | null {
    const valid = grades.filter(
        (g) => g.czy_do_sredniej && !isNaN(parseFloat(g.wartosc)),
    );
    const currentSumW = valid.reduce((s, g) => s + g.waga, 0);
    const currentSumWV = valid.reduce(
        (s, g) => s + g.waga * parseFloat(g.wartosc),
        0,
    );
    // (currentSumWV + x * newGradeWeight) / (currentSumW + newGradeWeight) = target
    const needed =
        (targetAvg * (currentSumW + newGradeWeight) - currentSumWV) /
        newGradeWeight;
    if (needed < 1 || needed > 6) return null;
    return Math.round(needed * 100) / 100;
}
```

File: `src/utils/dateUtils.ts`

```typescript
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

export const formatDate = (iso: string): string =>
    format(parseISO(iso), "dd.MM.yyyy", { locale: pl });

export const formatDateTime = (iso: string): string =>
    format(parseISO(iso), "dd.MM.yyyy HH:mm", { locale: pl });

export const formatRelative = (iso: string): string =>
    formatDistanceToNow(parseISO(iso), { locale: pl, addSuffix: true });
```

---

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

## Part 12 – Login Page

File: `src/components/Login.tsx`

**Behavior:**

- Centered card on `bg-[#09090b]` full-screen
- Username + password inputs
- On submit: calls `login()` from auth service
- On success: navigate to `/dashboard`
- On failure: show inline error message
- Redirect to `/dashboard` if already logged in (check `getCurrentUser()` in useEffect)
- The login accepts all roles (uczen, nauczyciel, rodzic, admin); do NOT restrict to only students like the PoC does

**Form fields:**

- `username` – text input, required, placeholder `nazwa_uzytkownika`
- `password` – password input, required, placeholder `••••••••`
- Submit button with spinner when loading

---

## Part 13 – Dashboard Home

File: `src/components/DashboardHome.tsx`

**Role-aware content.** Fetch all data in parallel with `Promise.all`.

### Student dashboard widgets

1. **Lucky Number card** – calls `getLuckyNumber(classId)`. Shows a large number with "Szczęśliwy numer dnia". Refresh daily.
2. **Attendance summary** – percentage bar + counts. Links to `/dashboard/attendance`.
3. **Today's timetable** – shows today's lessons from timetable. "Brak lekcji" if none.
4. **Next upcoming lesson** – countdown/time of next lesson today.
5. **Recent grades** (last 5) – clickable, opens grade modal.
6. **Overall GPA** – weighted average across all subjects.
7. **Unread messages** (last 3) – clickable, opens messages.
8. **Upcoming homework** – next 3 due dates.
9. **Upcoming events/tests** – next 3 events from calendar.

### Teacher dashboard widgets

1. Today's class schedule (zajecia for this teacher).
2. Quick links: Enter grades, Mark attendance, Add homework.
3. Recent unread messages.

### Parent dashboard widgets

1. Child selector (dropdown if `childrenIds.length > 1`).
2. Child's attendance summary.
3. Child's recent grades.
4. Unread messages.

---

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

## Part 16 – Timetable Page (Student)

File: `src/components/timetable/TimetablePage.tsx`

### Data fetched (parallel)

```typescript
const [plans, days, hours, subjects, zajecia, klasa] = await Promise.all([
    getTimetablePlan(classId),
    getDaysOfWeek(),
    getLessonHours(),
    getSubjects(),
    getZajecia(),
    getClass(classId),
]);
// Then: const entries = await getTimetableEntries(latestPlan.id)
```

### Grid layout

- Use the most recent plan (sort by `id` desc, take first)
- Days sorted by `Numer` (1=Monday … 5=Friday; only show Mon–Fri)
- Hours sorted by `Numer`
- Current day highlighted with `bg-blue-900/20` column
- Current lesson (matching today's time) highlighted with a pulsing ring
- Responsive: `overflow-x-auto` with `min-w-[700px]` table
- Each cell: subject name; empty cell shows `–`

### Today's schedule panel

Below the grid, a vertical list "Dzisiaj" showing only today's lessons in time order.

---

## Part 17 – Homework Page

File: `src/components/homework/HomeworkPage.tsx`

### Data fetched

```typescript
const { data: homework } = useQuery({
    queryKey: keys.homework(classId),
    queryFn: () => getHomework(classId),
});
const { data: subjects } = useQuery({
    queryKey: keys.subjects(),
    queryFn: getSubjects,
});
```

### Layout

1. **Filter**: subject dropdown + "Show overdue" toggle
2. **Upcoming homework section** (due date ≥ today), sorted by `termin` ascending
3. **Past homework section** (due date < today), collapsed by default (expand button)

### HomeworkCard

```
[Subject badge]   [Due: 15.03.2026]   [OVERDUE badge if past due]
───────────────────────────────────────────────────────────────────
[opis text]
[Posted by: teacher name]   [Posted on: date]
```

Color of due badge: danger if past, warning if within 2 days, neutral otherwise.

---

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

## Part 19 – Messages Page

File: `src/components/messages/MessagesPage.tsx`

### Tab structure

Two tabs: **Odebrane** (inbox) | **Wysłane** (sent)

### Data fetched

```typescript
// Inbox
const { data: inbox, refetch: refetchInbox } = useQuery({
    queryKey: keys.inbox(userId),
    queryFn: () => getInboxMessages(userId),
    refetchInterval: POLL_INTERVAL_MS,
});

// Sent
const { data: sent } = useQuery({
    queryKey: keys.sent(userId),
    queryFn: () => getSentMessages(userId),
});
```

### Message list item

```
[blue dot if unread | grey dot if read]
[Subject in bold]
[From: sender name]              [relative time]
[Preview of first 120 chars of tresc]
```

Clicking opens `MessageDetail` modal with full content and marks as read via `PATCH /wiadomosci/<id>/`.

### Compose button

Floating action button (bottom-right corner) with `+` (Pencil icon). Opens `ComposeMessage` modal.

### ComposeMessage modal

Fields (use `react-hook-form` + `zod`):

- **Odbiorca** – searchable dropdown of teachers (fetched from `/nauczyciele/`). Display: `Jan Kowalski`. Value: `teacher.user.id`.
- **Temat** – text input, max 255 chars, required
- **Treść** – textarea, required

On submit: calls `sendMessage({ nadawca: currentUser.id, odbiorca, temat, tresc })`.
On success: `toast.success('Wiadomość wysłana')`, invalidate `keys.sent(userId)`, close modal.
On error: `toast.error('Nie udało się wysłać wiadomości')`.

```typescript
const schema = z.object({
    odbiorca: z.number({ required_error: "Wybierz odbiorcę" }),
    temat: z.string().min(1, "Temat jest wymagany").max(255),
    tresc: z.string().min(1, "Treść jest wymagana"),
});
```

---

## Part 20 – Profile Page

File: `src/components/profile/ProfilePage.tsx`

### Data fetched

```typescript
const { data: profiles } = useQuery({
    queryKey: keys.userProfile(userId),
    queryFn: () => getUserSettings(userId),
});
const profile = profiles?.[0];
```

### Layout

**Card 1 – Personal info (read-only)**

- Full name
- Username
- Email
- Role badge

**Card 2 – Preferences**

- Theme selector: three buttons `Jasny | Ciemny | Systemowy`
- Current selection highlighted
- On click: `PATCH /profile/<profileId>/` with `{ theme_preference: 'light' | 'dark' | 'system' }`
- Show success toast on update

> Note: actual theme switching in the UI is implemented by toggling class on `<html>` element. Listen to `matchMedia('(prefers-color-scheme: dark)')` for system mode.

**Card 3 – Security (informational)**

- "Zmiana hasła jest możliwa poprzez administratora systemu."

---

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

## Part 24 – Styling System

### Color palette (Tailwind config additions)

The app uses a dark zinc palette. No changes to `tailwind.config.js` needed beyond what already exists. All components use `bg-[#09090b]` as page background.

### Custom utility classes to define in `index.css`

```css
@layer utilities {
    .page-title {
        @apply text-3xl font-bold tracking-tight text-zinc-100;
    }
    .section-title {
        @apply text-xl font-semibold text-zinc-200;
    }
    .stat-value {
        @apply text-3xl font-bold;
    }
    .stat-label {
        @apply text-xs font-medium uppercase tracking-wider text-zinc-500;
    }
    .input-base {
        @apply w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-zinc-200 
           placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 
           focus:border-blue-500/50 disabled:opacity-50;
    }
    .btn-primary {
        @apply bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 
           transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium;
    }
    .btn-ghost {
        @apply bg-zinc-800 text-zinc-300 py-2 px-4 rounded-lg hover:bg-zinc-700 
           transition-colors font-medium;
    }
    .btn-danger {
        @apply bg-red-900/20 text-red-400 border border-red-900/30 py-2 px-4 rounded-lg 
           hover:bg-red-900/30 transition-colors font-medium;
    }
    .tab-active {
        @apply border-b-2 border-blue-500 text-blue-400 pb-2;
    }
    .tab-inactive {
        @apply text-zinc-500 pb-2 hover:text-zinc-300 transition-colors;
    }
}
```

---

## Part 25 – State Management Rules

1. **Server state**: managed entirely by `@tanstack/react-query`. Never use `useState` for fetched data.
2. **UI state** (modals open/closed, selected tab, form inputs): `useState`.
3. **Auth state**: stored in `localStorage`, read via `getCurrentUser()`. No context needed.
4. **Theme**: stored in `UserProfile.theme_preference` (persisted to backend). Apply by toggling `dark` class on `document.documentElement`.

### Theme application (in `main.tsx` or `App.tsx`):

```typescript
const user = getCurrentUser();
if (user) {
    getUserSettings(user.id).then((profiles) => {
        const pref = profiles?.[0]?.theme_preference ?? "system";
        if (pref === "dark") document.documentElement.classList.add("dark");
        else if (pref === "light")
            document.documentElement.classList.remove("dark");
        else {
            const isDark = window.matchMedia(
                "(prefers-color-scheme: dark)",
            ).matches;
            document.documentElement.classList.toggle("dark", isDark);
        }
    });
}
```

---

## Part 26 – Error Handling

### Global API errors

The `fetchWithAuth` function throws `Error` on non-OK responses. All useQuery calls expose `isError` / `error`. Render `<ErrorState message={error.message} />` when `isError` is true.

### Error State component

```tsx
export const ErrorState = ({ message }: { message: string }) => (
    <div className="bg-red-900/10 border border-red-900/20 rounded-xl p-6 text-center">
        <p className="text-red-400 font-medium">{message}</p>
        <button
            onClick={() => window.location.reload()}
            className="mt-3 text-sm text-zinc-400 hover:text-zinc-200"
        >
            Odśwież stronę
        </button>
    </div>
);
```

### Mutation error handling

All mutations use `toast.error(...)` from `sonner` on failure. Never show inline errors from mutations; use toasts.

---

## Part 27 – Accessibility

- All clickable `div`/`span` elements must have `role="button"` and `tabIndex={0}` with an `onKeyDown` handler for `Enter`/`Space`.
- All form inputs must have associated `<label>` (using `htmlFor` or wrapping).
- Color is never the only indicator of meaning; pair colors with text labels or icons.
- Modal focus trap: when a modal opens, focus first interactive element inside it. Close on `Escape`.

---

## Part 28 – Environment and Build

File: `frontend/.env.example` (create this file):

```
VITE_API_BASE_URL=https://dziennik.polandcentral.cloudapp.azure.com/api
```

Update `src/constants.ts` to read from env:

```typescript
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ??
    "https://dziennik.polandcentral.cloudapp.azure.com/api";
```

---

## Part 29 – API Reference Summary Table

| Method | Endpoint              | Auth   | Query params                       | Used by                        |
| ------ | --------------------- | ------ | ---------------------------------- | ------------------------------ |
| POST   | `/auth/login/`        | None   | —                                  | Login                          |
| POST   | `/auth/refresh/`      | None   | —                                  | Token refresh                  |
| GET    | `/oceny/`             | Bearer | `uczen`                            | Grades                         |
| POST   | `/oceny/`             | Bearer | —                                  | Teacher grade entry            |
| PATCH  | `/oceny/<id>/`        | Bearer | —                                  | Teacher grade edit             |
| DELETE | `/oceny/<id>/`        | Bearer | —                                  | Teacher grade delete           |
| GET    | `/oceny-okresowe/`    | Bearer | `uczen`                            | Period grades                  |
| POST   | `/oceny-okresowe/`    | Bearer | —                                  | Teacher period grade           |
| GET    | `/oceny-koncowe/`     | Bearer | `uczen`                            | Final grades                   |
| GET    | `/zachowanie-punkty/` | Bearer | `uczen`                            | Behavior points                |
| POST   | `/zachowanie-punkty/` | Bearer | —                                  | Teacher behavior note          |
| GET    | `/frekwencja/`        | Bearer | `uczen_id`, `date_from`, `date_to` | Attendance                     |
| POST   | `/frekwencja/`        | Bearer | —                                  | Teacher attendance entry       |
| PATCH  | `/frekwencja/<id>/`   | Bearer | —                                  | Teacher attendance edit        |
| GET    | `/statusy/`           | Bearer | —                                  | Attendance statuses            |
| GET    | `/przedmioty/`        | Bearer | —                                  | Subjects                       |
| GET    | `/plany-zajec/`       | Bearer | `klasa_id`                         | Timetable                      |
| GET    | `/plan-wpisy/`        | Bearer | `plan_id`                          | Timetable entries              |
| GET    | `/godziny-lekcyjne/`  | Bearer | —                                  | Lesson hours                   |
| GET    | `/dni-tygodnia/`      | Bearer | —                                  | Days of week                   |
| GET    | `/zajecia/`           | Bearer | —                                  | Zajecia (subject+teacher link) |
| GET    | `/wiadomosci/`        | Bearer | `odbiorca`, `nadawca`              | Messages                       |
| POST   | `/wiadomosci/`        | Bearer | —                                  | Compose message                |
| PATCH  | `/wiadomosci/<id>/`   | Bearer | —                                  | Mark read                      |
| GET    | `/uczniowie/`         | Bearer | —                                  | Teacher: student list          |
| GET    | `/nauczyciele/`       | Bearer | —                                  | Message compose: teacher list  |
| GET    | `/users/<id>/`        | Bearer | —                                  | Resolve sender name            |
| GET    | `/klasy/`             | Bearer | —                                  | Class list                     |
| GET    | `/klasy/<id>/`        | Bearer | —                                  | Class info                     |
| GET    | `/profile/`           | Bearer | `user`                             | User settings                  |
| PATCH  | `/profile/<id>/`      | Bearer | —                                  | Save theme                     |
| GET    | `/prace-domowe/`      | Bearer | `klasa`, `przedmiot`               | Homework                       |
| POST   | `/prace-domowe/`      | Bearer | —                                  | Teacher add homework           |
| PATCH  | `/prace-domowe/<id>/` | Bearer | —                                  | Teacher edit homework          |
| DELETE | `/prace-domowe/<id>/` | Bearer | —                                  | Teacher delete homework        |
| GET    | `/wydarzenia/`        | Bearer | `klasa`                            | Events/test calendar           |
| POST   | `/wydarzenia/`        | Bearer | —                                  | Teacher add event              |
| GET    | `/lucky-number/`      | Bearer | `klasa`                            | Lucky number widget            |

---

## Part 30 – Known API Quirks / Field Name Notes

These inconsistencies exist in the current API and must be handled defensively in the frontend:

1. **Subject `nazwa` field**: `Przedmiot` model uses `nazwa` (lowercase). The API may return it as `nazwa` or `Nazwa` depending on serializer. Access as `s.nazwa ?? s.Nazwa`.

2. **Attendance status**: The `status` field in `Frekwencja` API response may be an object `{ id, Wartosc }` or just an integer ID. Normalize:

    ```typescript
    function resolveStatusName(
        status: Attendance["status"],
        statusMap: Map<number, string>,
    ): string {
        if (status == null) return "";
        if (typeof status === "object")
            return status.Wartosc ?? statusMap.get(status.id ?? 0) ?? "";
        return statusMap.get(Number(status)) ?? "";
    }
    ```

3. **TimetableEntry fields**: use both `entry.dzien_tygodnia` and fallback `entry.DzienTygodnia`.

4. **ClassInfo**: `klasa.numer` may be null; `klasa.nazwa` may be null. Display as `${numer} ${nazwa}` or just `nazwa` or `#${id}`.

5. **Grade `wartosc`**: stored as `DecimalField` string. Polish grade scale: `1.00`=1, `3.50`=3+, `4.75`=5-, `5.00`=5, `6.00`=6.

6. **Message `nadawca` / `odbiorca`**: these are `user.id` values (from `User` model), NOT `uczen.id` or `nauczyciel.id`. Use `/users/<id>/` to resolve names.

7. **`PlanyZajec.wpisy`**: an array of PlanWpis IDs, but `GET /plan-wpisy/?plan_id=<id>` fetches the actual entries. Use the second form.

---

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
