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

