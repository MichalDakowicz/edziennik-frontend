import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockLogout = vi.hoisted(() => vi.fn());
const mockUseQuery = vi.hoisted(() => vi.fn());

vi.mock("../services/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  logout: mockLogout,
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: mockUseQuery,
}));

vi.mock("../services/api", () => ({
  getClasses: vi.fn(),
  getInboxMessages: vi.fn(),
  getLuckyNumber: vi.fn(),
}));

import Layout from "./Layout";

const renderLayout = (path = "/dashboard") => {
  window.history.pushState({}, "", path);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/dashboard/*" element={<Layout />}>
          <Route index element={<div>Child</div>} />
        </Route>
        <Route path="/" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

describe("Layout", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset();
    mockLogout.mockReset();
    mockUseQuery.mockReset();
    mockUseQuery.mockImplementation(({ queryKey }) => {
      const key = Array.isArray(queryKey) ? queryKey[0] : queryKey;
      if (key === "inbox") {
        return { data: [{ id: 1, przeczytana: false }] };
      }
      if (key === "lucky-number") {
        return { data: { lucky_number: 7 } };
      }
      if (key === "classes") {
        return { data: [{ id: 10, numer: 1, nazwa: "1A" }] };
      }
      return { data: [] };
    });
  });

  it("pokazuje nawigację dla ucznia", () => {
    mockGetCurrentUser.mockReturnValue({
      id: 1,
      username: "jan",
      firstName: "Jan",
      lastName: "Kowalski",
      email: "jan@example.com",
      role: "uczen",
      studentId: 11,
      classId: 22,
    });

    renderLayout();

    expect(screen.getAllByText("Pulpit").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Oceny").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Frekwencja").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Kalendarz").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Zadania domowe").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Wiadomości").length).toBeGreaterThan(0);
    expect(screen.queryByText("Wystawianie ocen")).not.toBeInTheDocument();
    expect(screen.getByText("Child")).toBeInTheDocument();
  });

  it("pokazuje menu nauczyciela i wylogowuje", async () => {
    const user = userEvent.setup();
    mockGetCurrentUser.mockReturnValue({
      id: 2,
      username: "anna",
      firstName: "Anna",
      lastName: "Nowak",
      email: "anna@example.com",
      role: "nauczyciel",
      teacherId: 44,
    });

    renderLayout();

    expect(screen.getAllByText("Wystawianie ocen").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Sprawdzanie obecności").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Zadania domowe").length).toBeGreaterThan(0);

    await user.click(screen.getByTitle("Profil"));
    await user.click(screen.getByRole("button", { name: /Wyloguj/ }));

    expect(mockLogout).toHaveBeenCalledOnce();
  });
});
