import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());

vi.mock("./services/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

vi.mock("./components/Layout", async () => {
  const { Outlet } = await import("react-router-dom");
  return {
    default: function LayoutMock() {
      return (
        <div>
          <div>Layout shell</div>
          <Outlet />
        </div>
      );
    },
  };
});

vi.mock("./components/Login", () => ({ default: () => <div>Login page</div> }));
vi.mock("./components/DashboardHome", () => ({ default: () => <div>Dashboard home</div> }));
vi.mock("./components/grades/GradesPage", () => ({ default: () => <div>Grades page</div> }));
vi.mock("./components/grades/SubjectDetailPage", () => ({ default: () => <div>Subject detail page</div> }));
vi.mock("./components/attendance/AttendancePage", () => ({ default: () => <div>Attendance page</div> }));
vi.mock("./components/attendance/AttendanceHistoryPage", () => ({ default: () => <div>Attendance history page</div> }));
vi.mock("./components/messages/MessagesPage", () => ({ default: () => <div>Messages page</div> }));
vi.mock("./components/homework/HomeworkPage", () => ({ default: () => <div>Homework page</div> }));
vi.mock("./components/calendar/KalendarzPage", () => ({ default: () => <div>Calendar page</div> }));
vi.mock("./components/profile/ProfilePage", () => ({ default: () => <div>Profile page</div> }));
vi.mock("./components/teacher/TeacherGradesPage", () => ({ default: () => <div>Teacher grades page</div> }));
vi.mock("./components/teacher/TeacherAttendancePage", () => ({ default: () => <div>Teacher attendance page</div> }));
vi.mock("./components/teacher/TeacherHomeworkPage", () => ({ default: () => <div>Teacher homework page</div> }));
vi.mock("./components/teacher/HomeworkDetailPage", () => ({ default: () => <div>Teacher homework detail page</div> }));
vi.mock("./components/teacher/HomeworkCreatePage", () => ({ default: () => <div>Teacher homework create page</div> }));
vi.mock("./components/notifications/NotificationsPage", () => ({ default: () => <div>Notifications page</div> }));

import App from "./App";

const renderAtPath = async (path: string) => {
  window.history.pushState({}, "", path);
  render(<App />);
};

describe("App routes", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset();
  });

  it("renderuje stronę logowania na root", async () => {
    mockGetCurrentUser.mockReturnValue(null);

    await renderAtPath("/");

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it.each([
    ["/dashboard", "Dashboard home"],
    ["/dashboard/grades", "Grades page"],
    ["/dashboard/grades/12", "Subject detail page"],
    ["/dashboard/attendance", "Attendance page"],
    ["/dashboard/attendance/history", "Attendance history page"],
    ["/dashboard/messages", "Messages page"],
    ["/dashboard/messages/7", "Messages page"],
    ["/dashboard/homework", "Homework page"],
    ["/dashboard/calendar", "Calendar page"],
    ["/dashboard/profile", "Profile page"],
    ["/dashboard/teacher/grades", "Teacher grades page"],
    ["/dashboard/teacher/attendance", "Teacher attendance page"],
    ["/dashboard/teacher/homework", "Teacher homework page"],
    ["/dashboard/teacher/homework/1", "Teacher homework detail page"],
    ["/dashboard/teacher/homework/new", "Teacher homework create page"],
    ["/dashboard/notifications", "Notifications page"],
  ])("renderuje widok %s", async (path, expectedText) => {
    mockGetCurrentUser.mockReturnValue({
      id: 1,
      username: "jan",
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@example.com",
      role: "admin",
    });

    await renderAtPath(path as string);

    expect(screen.getByText("Layout shell")).toBeInTheDocument();
    expect(await screen.findByText(expectedText as string)).toBeInTheDocument();
  });

  it("przekierowuje niezalogowanego użytkownika z chronionej trasy", async () => {
    mockGetCurrentUser.mockReturnValue(null);

    await renderAtPath("/dashboard/grades");

    expect(screen.getByText("Login page")).toBeInTheDocument();
  });

  it("przekierowuje użytkownika bez dostępu do dashboardu", async () => {
    mockGetCurrentUser.mockReturnValue({
      id: 1,
      username: "jan",
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@example.com",
      role: "uczen",
    });

    await renderAtPath("/dashboard/teacher/grades");

    expect(screen.getByText("Dashboard home")).toBeInTheDocument();
  });
});
