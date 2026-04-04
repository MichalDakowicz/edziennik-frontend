import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import type { ReactNode } from "react";
import { getCurrentUser } from "./services/auth";
import type { Role } from "./types/auth";
import Login from "./components/Login";
import Layout from "./components/Layout";
import DashboardHome from "./components/DashboardHome";
import GradesPage from "./components/grades/GradesPage";
import SubjectDetailPage from "./components/grades/SubjectDetailPage";
import AttendancePage from "./components/attendance/AttendancePage";
import AttendanceHistoryPage from "./components/attendance/AttendanceHistoryPage";
import MessagesPage from "./components/messages/MessagesPage";
import HomeworkPage from "./components/homework/HomeworkPage";
import KalendarzPage from "./components/calendar/KalendarzPage";
import ProfilePage from "./components/profile/ProfilePage";
import TeacherGradesPage from "./components/teacher/TeacherGradesPage";
import TeacherAttendancePage from "./components/teacher/TeacherAttendancePage";
import TeacherHomeworkPage from "./components/teacher/TeacherHomeworkPage";
import HomeworkDetailPage from "./components/teacher/HomeworkDetailPage";
import HomeworkCreatePage from "./components/teacher/HomeworkCreatePage";
import NotificationsPage from "./components/notifications/NotificationsPage";

const RoleGuard = ({ allow, children }: { allow: Role[]; children: ReactNode }) => {
  const user = getCurrentUser();
  if (!user) return <Navigate to="/" replace />;
  if (!allow.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<DashboardHome />} />
          <Route path="grades" element={<RoleGuard allow={["uczen", "rodzic", "admin"]}><GradesPage /></RoleGuard>} />
          <Route path="grades/:subjectId" element={<RoleGuard allow={["uczen", "rodzic", "admin"]}><SubjectDetailPage /></RoleGuard>} />
          <Route path="attendance" element={<RoleGuard allow={["uczen", "rodzic", "admin"]}><AttendancePage /></RoleGuard>} />
          <Route path="attendance/history" element={<RoleGuard allow={["uczen", "rodzic", "admin"]}><AttendanceHistoryPage /></RoleGuard>} />
          <Route path="calendar" element={<RoleGuard allow={["uczen", "rodzic", "admin"]}><KalendarzPage /></RoleGuard>} />
          <Route path="timetable" element={<Navigate to="/dashboard/calendar" replace />} />
          <Route path="events" element={<Navigate to="/dashboard/calendar" replace />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="messages/:messageId" element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="homework" element={<RoleGuard allow={["uczen", "rodzic", "admin"]}><HomeworkPage /></RoleGuard>} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="teacher/grades" element={<RoleGuard allow={["nauczyciel", "admin"]}><TeacherGradesPage /></RoleGuard>} />
          <Route path="teacher/attendance" element={<RoleGuard allow={["nauczyciel", "admin"]}><TeacherAttendancePage /></RoleGuard>} />
          <Route path="teacher/homework" element={<RoleGuard allow={["nauczyciel", "admin"]}><TeacherHomeworkPage /></RoleGuard>} />
          <Route path="teacher/homework/:id" element={<RoleGuard allow={["nauczyciel", "admin"]}><HomeworkDetailPage /></RoleGuard>} />
          <Route path="teacher/homework/new" element={<RoleGuard allow={["nauczyciel", "admin"]}><HomeworkCreatePage /></RoleGuard>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
