import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockLogin = vi.hoisted(() => vi.fn());

vi.mock("../services/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  login: mockLogin,
}));

import Login from "./Login";

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );

describe("Login", () => {
  beforeEach(() => {
    mockGetCurrentUser.mockReset();
    mockLogin.mockReset();
    mockGetCurrentUser.mockReturnValue(null);
  });

  it("renderuje formularz logowania", () => {
    renderLogin();

    expect(screen.getByLabelText("Nazwa użytkownika")).toBeInTheDocument();
    expect(screen.getByLabelText("Hasło")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Zaloguj" })).toBeInTheDocument();
  });

  it("loguje użytkownika i przechodzi do dashboardu", async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce(undefined);

    renderLogin();

    await user.type(screen.getByLabelText("Nazwa użytkownika"), "jan");
    await user.type(screen.getByLabelText("Hasło"), "secret");
    await user.click(screen.getByRole("button", { name: "Zaloguj" }));

    expect(mockLogin).toHaveBeenCalledWith("jan", "secret");
    expect(await screen.findByText("Dashboard")).toBeInTheDocument();
  });

  it("pokazuje błąd po nieudanym logowaniu", async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error("Nieprawidłowe dane logowania"));

    renderLogin();

    await user.type(screen.getByLabelText("Nazwa użytkownika"), "jan");
    await user.type(screen.getByLabelText("Hasło"), "zlehaslo");
    await user.click(screen.getByRole("button", { name: "Zaloguj" }));

    expect(await screen.findByText("Nieprawidłowe dane logowania")).toBeInTheDocument();
  });
});
