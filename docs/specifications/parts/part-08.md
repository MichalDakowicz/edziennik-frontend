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

