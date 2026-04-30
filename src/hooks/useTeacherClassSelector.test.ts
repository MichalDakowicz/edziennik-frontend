import { renderHook, act } from "@testing-library/react";
import { vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());
const mockUseQuery = vi.hoisted(() => vi.fn());

vi.mock("../services/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: mockUseQuery,
}));

vi.mock("../services/api", () => ({
  getClasses: vi.fn(),
}));
vi.mock("../services/queryKeys", () => ({ keys: { classes: () => ["classes"] } }));

import { useTeacherClassSelector } from "./useTeacherClassSelector";

describe("useTeacherClassSelector", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockGetCurrentUser.mockReset();
    mockUseQuery.mockReset();
  });

  it("nie aktywuje się dla innych ról", () => {
    mockGetCurrentUser.mockReturnValue({ role: "uczen" });
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });

    const { result } = renderHook(() => useTeacherClassSelector());

    expect(result.current.selectedClassId).toBeNull();
    expect(result.current.classes).toEqual([]);
  });

  it("czyta i zapisuje wybraną klasę", () => {
    mockGetCurrentUser.mockReturnValue({ role: "nauczyciel" });
    mockUseQuery.mockReturnValue({
      data: [
        { id: 10, numer: 1, nazwa: "1A" },
        { id: 11, numer: 2, nazwa: "2B" },
      ],
      isLoading: false,
      error: null,
    });
    sessionStorage.setItem("teacher:selected-class-id", "10");

    const { result } = renderHook(() => useTeacherClassSelector());

    expect(result.current.selectedClassId).toBe(10);
    expect(result.current.selectedClass?.id).toBe(10);

    act(() => {
      result.current.setSelectedClassId(11);
    });

    expect(sessionStorage.getItem("teacher:selected-class-id")).toBe("11");
  });
});
