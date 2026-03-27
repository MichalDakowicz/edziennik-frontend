import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  mockGetAuthToken,
  mockRefreshAccessToken,
  mockLogout,
} = vi.hoisted(() => ({
  mockGetAuthToken: vi.fn(),
  mockRefreshAccessToken: vi.fn(),
  mockLogout: vi.fn(),
}));

vi.mock("./auth", () => ({
  getAuthToken: mockGetAuthToken,
  refreshAccessToken: mockRefreshAccessToken,
  logout: mockLogout,
}));

import { fetchWithAuth, getHomework } from "./api";

describe("fetchWithAuth", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthToken.mockReturnValue("token-1");
    mockRefreshAccessToken.mockResolvedValue("token-2");
    vi.stubGlobal("fetch", fetchMock);
  });

  it("wysyła request z tokenem i zwraca dane", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ ok: true }),
    });

    const result = await fetchWithAuth<{ ok: boolean }>("/status/");

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/status/"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-1",
          "X-Authorization": "Bearer token-1",
        }),
      }),
    );
  });

  it("odświeża token i ponawia request po 401", async () => {
    fetchMock
      .mockResolvedValueOnce({ ok: false, status: 401, statusText: "Unauthorized" })
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ retried: true }),
      });

    const result = await fetchWithAuth<{ retried: boolean }>("/secure/");

    expect(mockRefreshAccessToken).toHaveBeenCalledOnce();
    expect(result).toEqual({ retried: true });
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.stringContaining("/secure/"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer token-2",
          "X-Authorization": "Bearer token-2",
        }),
      }),
    );
  });

  it("zwraca undefined dla 204", async () => {
    fetchMock.mockResolvedValueOnce({ ok: true, status: 204 });

    const result = await fetchWithAuth("/empty/");

    expect(result).toBeUndefined();
  });

  it("rzuca błąd dla odpowiedzi nieok", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Server Error",
    });

    await expect(fetchWithAuth("/boom/")).rejects.toThrow("API Error 500: Server Error");
  });
});

describe("api helpers", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthToken.mockReturnValue("token-1");
    vi.stubGlobal("fetch", fetchMock);
  });

  it("buduje query params dla getHomework", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => [],
    });

    await getHomework(7, 5);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("/prace-domowe/?klasa=7&przedmiot=5"),
      expect.any(Object),
    );
  });
});
