import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());

vi.mock("./services/auth", () => ({ getCurrentUser: mockGetCurrentUser }));

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
vi.mock("./components/grades/SubjectDetailPage", () => ({ default: () => <div>Subject detail</div> }));
vi.mock("./components/attendance/AttendancePage", () => ({ default: () => null }));
vi.mock("./components/attendance/AttendanceHistoryPage", () => ({ default: () => null }));
vi.mock("./components/messages/MessagesPage", () => ({ default: () => null }));
vi.mock("./components/homework/HomeworkPage", () => ({ default: () => null }));
vi.mock("./components/calendar/KalendarzPage", () => ({ default: () => null }));
vi.mock("./components/profile/ProfilePage", () => ({ default: () => null }));
vi.mock("./components/teacher/TeacherGradesPage", () => ({ default: () => <div>Teacher grades</div> }));
vi.mock("./components/teacher/TeacherAttendancePage", () => ({ default: () => null }));
vi.mock("./components/teacher/TeacherHomeworkPage", () => ({ default: () => null }));
vi.mock("./components/teacher/HomeworkDetailPage", () => ({ default: () => null }));
vi.mock("./components/teacher/HomeworkCreatePage", () => ({ default: () => null }));
vi.mock("./components/notifications/NotificationsPage", () => ({ default: () => null }));

import App from "./App";

const adminUser = {
  id: 1,
  username: "jan",
  firstName: "Jan",
  lastName: "Kowalski",
  email: "jan@example.com",
  role: "admin" as const,
};

describe("Lazy loading - grade routes", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset();
    mockGetCurrentUser.mockReturnValue(adminUser);
  });

  it("renders Suspense fallback (data-testid=page-loading) on grades route", () => {
    window.history.pushState({}, "", "/dashboard/grades");
    render(<App />);

    // Suspense fallback must appear synchronously before lazy module resolves
    expect(screen.getByTestId("page-loading")).toBeInTheDocument();
  });

  it("eventually renders GradesPage after lazy load", async () => {
    window.history.pushState({}, "", "/dashboard/grades");
    render(<App />);

    expect(await screen.findByText("Grades page")).toBeInTheDocument();
  });

  it("eventually renders TeacherGradesPage after lazy load", async () => {
    window.history.pushState({}, "", "/dashboard/teacher/grades");
    render(<App />);

    expect(await screen.findByText("Teacher grades")).toBeInTheDocument();
  });
});
