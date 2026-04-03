import { cn } from "./cn";

describe("cn", () => {
  it("scala i nadpisuje klasy tailwindowe", () => {
    expect(cn("p-2", "p-4", "text-sm", false && "hidden", "text-lg")).toBe("p-4 text-lg");
  });
});
