import { formatClassDisplay, getClassJournalNumberMap, sortStudentsAlphabetically } from "./classUtils";

describe("classUtils", () => {
  it("formatuje klasę w czytelny sposób", () => {
    expect(formatClassDisplay({ id: 1, numer: 1, nazwa: "1A" })).toBe("1A");
    expect(formatClassDisplay({ id: 2, numer: 2, nazwa: "B" })).toBe("2B");
    expect(formatClassDisplay({ id: 3, numer: null, nazwa: "3C" })).toBe("3C");
    expect(formatClassDisplay({ id: 4 })).toBe("#4");
    expect(formatClassDisplay(null)).toBe("-");
  });

  it("sortuje uczniów alfabetycznie", () => {
    const students = [
      { id: 3, klasa: 1, user: { first_name: "Jan", last_name: "Nowak" } },
      { id: 1, klasa: 1, user: { first_name: "Anna", last_name: "Kowalska" } },
      { id: 2, klasa: 1, user: { first_name: "Adam", last_name: "Kowalska" } },
    ];

    expect(sortStudentsAlphabetically(students).map((s) => s.id)).toEqual([2, 1, 3]);
  });

  it("buduje mapę numerów w dzienniku dla klasy", () => {
    const students = [
      { id: 3, klasa: 1, user: { first_name: "Jan", last_name: "Nowak" } },
      { id: 1, klasa: 1, user: { first_name: "Anna", last_name: "Kowalska" } },
      { id: 2, klasa: 1, user: { first_name: "Adam", last_name: "Kowalska" } },
      { id: 4, klasa: 2, user: { first_name: "Ola", last_name: "Zielińska" } },
    ];

    expect(Array.from(getClassJournalNumberMap(students, 1).entries())).toEqual([
      [2, 1],
      [1, 2],
      [3, 3],
    ]);
  });
});
