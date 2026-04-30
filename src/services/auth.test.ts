import { vi, describe, it, expect, beforeEach } from "vitest";
import { TOKEN_KEY, REFRESH_KEY, USER_KEY } from "../constants";

vi.mock("./firebase", () => ({
  firebaseLogout: vi.fn().mockResolvedValue(undefined),
  firebaseSignIn: vi.fn(),
  firebaseGetIdToken: vi.fn(),
  isFirebaseEnabled: vi.fn().mockReturnValue(false),
}));

import { logout } from "./auth";

describe("logout", () => {
  beforeEach(() => {
    localStorage.setItem(TOKEN_KEY, "access-token");
    localStorage.setItem(REFRESH_KEY, "refresh-token");
    localStorage.setItem(USER_KEY, JSON.stringify({ id: 1, role: "uczen" }));
    sessionStorage.setItem("teacher:selected-class-id", "42");
    sessionStorage.setItem("some-other-key", "value");
  });

  it("removes auth tokens from localStorage", () => {
    logout();
    expect(localStorage.getItem(TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem(REFRESH_KEY)).toBeNull();
    expect(localStorage.getItem(USER_KEY)).toBeNull();
  });

  it("clears sessionStorage", () => {
    logout();
    expect(sessionStorage.getItem("teacher:selected-class-id")).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });
});
