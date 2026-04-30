import { keys } from "./queryKeys";

describe("queryKeys", () => {
  it("tworzy stabilne klucze cache", () => {
    expect(keys.grades(1)).toEqual(["grades", 1]);
    expect(keys.inbox(2)).toEqual(["inbox", 2]);
    expect(keys.classes()).toEqual(["classes"]);
    expect(keys.luckyNumber(7)).toEqual(["lucky-number", 7]);
  });
});
