import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockUseQuery = vi.hoisted(() => vi.fn());
const mockUseMutation = vi.hoisted(() => vi.fn());
const mockUseQueryClient = vi.hoisted(() => vi.fn());
const mockUseDashboardHomeData = vi.hoisted(() => vi.fn());
const mockUseMessageUsersMap = vi.hoisted(() => vi.fn());
const mockUseStudentDashboardModel = vi.hoisted(() => vi.fn());

vi.mock("../services/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: mockUseQuery,
  useMutation: mockUseMutation,
  useQueryClient: mockUseQueryClient,
}));

vi.mock("./dashboard/useDashboardHomeData", () => ({
  useDashboardHomeData: mockUseDashboardHomeData,
}));
vi.mock("./dashboard/useMessageUsersMap", () => ({
  useMessageUsersMap: mockUseMessageUsersMap,
}));
vi.mock("./dashboard/useStudentDashboardModel", () => ({
  useStudentDashboardModel: mockUseStudentDashboardModel,
}));
vi.mock("./dashboard/StudentDashboard", () => ({ default: () => <div>Student dashboard</div> }));
vi.mock("./dashboard/TeacherDashboard", () => ({ default: () => <div>Teacher dashboard</div> }));
vi.mock("./messages/MessageDetail", () => ({ default: () => <div>Message detail</div> }));
vi.mock("./ui/Card", () => ({ Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("./ui/ErrorState", () => ({ ErrorState: ({ message }: { message: string }) => <div>{message}</div> }));
vi.mock("./ui/Spinner", () => ({ Spinner: () => <div>Spinner</div> }));
vi.mock("../services/api", () => ({ getTeachers: vi.fn(), markMessageRead: vi.fn() }));
vi.mock("../services/queryKeys", () => ({ keys: { inbox: (id: number) => ["inbox", id], teachers: () => ["teachers"] } }));
vi.mock("sonner", () => ({ toast: { error: vi.fn() } }));

import DashboardHome from "./DashboardHome";

const queryClient = { invalidateQueries: vi.fn() };

const defaultHomeQuery = {
  data: { inbox: [] },
  isPending: false,
  isError: false,
  error: null,
};

describe("DashboardHome", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset();
    mockUseQuery.mockReset();
    mockUseMutation.mockReset();
    mockUseQueryClient.mockReset();
    mockUseDashboardHomeData.mockReset();
    mockUseMessageUsersMap.mockReset();
    mockUseStudentDashboardModel.mockReset();
    mockUseQueryClient.mockReturnValue(queryClient);
    mockUseMutation.mockReturnValue({ mutate: vi.fn() });
    mockUseDashboardHomeData.mockReturnValue(defaultHomeQuery);
    mockUseMessageUsersMap.mockReturnValue({ data: new Map() });
    mockUseStudentDashboardModel.mockReturnValue({
      weighted: 4.25,
      unreadMessages: [1],
      lessonsWithState: [],
      recentGrades: [],
      upcomingHomework: [],
      liveItems: [],
      getSubjectName: vi.fn(),
      getGradeSubjectName: vi.fn(),
      getTeacherNameForLesson: vi.fn(),
      formatHour: vi.fn(),
      formatRelativeDay: vi.fn(),
    });
    mockUseQuery.mockReturnValue({ data: [{ id: 1 }], isPending: false, isError: false });
  });

  it("pokazuje błąd bez zalogowanego użytkownika", () => {
    mockGetCurrentUser.mockReturnValue(null);

    render(<DashboardHome />);

    expect(screen.getByText("Brak zalogowanego użytkownika")).toBeInTheDocument();
  });

  it("renderuje pulpit ucznia", () => {
    mockGetCurrentUser.mockReturnValue({
      id: 1,
      username: "jan",
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@example.com",
      role: "uczen",
    });

    render(<DashboardHome />);

    expect(screen.getByText("Student dashboard")).toBeInTheDocument();
  });

  it("renderuje pulpit nauczyciela", () => {
    mockGetCurrentUser.mockReturnValue({
      id: 2,
      username: "anna",
      firstName: "Anna",
      lastName: "Nowak",
      email: "anna@example.com",
      role: "nauczyciel",
    });

    render(<DashboardHome />);

    expect(screen.getByText("Teacher dashboard")).toBeInTheDocument();
  });
});
