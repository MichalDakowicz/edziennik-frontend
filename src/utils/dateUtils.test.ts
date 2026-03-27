import { formatDate, formatDateTime } from "./dateUtils";

describe("dateUtils", () => {
  it("formatuje datę do formatu dzien/miesiac/rok", () => {
    expect(formatDate("2026-03-27")).toBe("27/03/2026");
  });

  it("formatuje datę z czasem", () => {
    expect(formatDateTime("2026-03-27T14:05:00")).toBe("27/03/2026 14:05");
  });
});
