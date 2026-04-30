import { vi } from "vitest";

const mockGetCurrentUser = vi.hoisted(() => vi.fn());

vi.mock("../services/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
}));

import { useCurrentUser } from "./useCurrentUser";

describe("useCurrentUser", () => {
  it("zwraca aktualnego użytkownika z auth service", () => {
    const user = { id: 1, username: "jan" };
    mockGetCurrentUser.mockReturnValue(user);

    expect(useCurrentUser()).toBe(user);
  });

  it("zwraca null gdy brak użytkownika", () => {
    mockGetCurrentUser.mockReturnValue(null);

    expect(useCurrentUser()).toBeNull();
  });
});
