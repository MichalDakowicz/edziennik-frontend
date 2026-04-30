import {
  computeWeightedAverage,
  computeWeightedAverageWithOverrides,
  findGradeSolutions,
  formatGradeValue,
  getGradeColor,
  getPercentageColor,
  getSuggestedGrade,
  simulateGradeNeeded,
  suggestGradeImprovements,
} from "./gradeUtils";

describe("gradeUtils", () => {
  it("formatuje wartości ocen specjalnych", () => {
    expect(formatGradeValue(5.5)).toBe("5+");
    expect(formatGradeValue(4.75)).toBe("5-");
    expect(formatGradeValue(3.2)).toBe("3");
    expect(formatGradeValue("abc")).toBe("abc");
  });

  it("zwraca odpowiedni kolor oceny", () => {
    expect(getGradeColor(5.0)).toContain("emerald");
    expect(getGradeColor(4.0)).toContain("green");
    expect(getGradeColor(3.0)).toContain("yellow");
    expect(getGradeColor(2.0)).toContain("orange");
    expect(getGradeColor(1.0)).toContain("red");
  });

  it("zwraca odpowiedni kolor procentów", () => {
    expect(getPercentageColor(95)).toContain("emerald");
    expect(getPercentageColor(80)).toContain("yellow");
    expect(getPercentageColor(60)).toContain("red");
  });

  it("liczy średnią ważoną tylko z ocen do średniej", () => {
    const grades = [
      { wartosc: "5", waga: 2, czy_do_sredniej: true },
      { wartosc: "3", waga: 1, czy_do_sredniej: true },
      { wartosc: "6", waga: 5, czy_do_sredniej: false },
    ];

    expect(computeWeightedAverage(grades)).toBeCloseTo(4.33, 2);
  });

  it("zwraca 0 przy braku poprawnych ocen", () => {
    expect(
      computeWeightedAverage([{ wartosc: "brak", waga: 1, czy_do_sredniej: true }]),
    ).toBe(0);
  });

  it("symuluje potrzebną ocenę i zwraca null poza zakresem", () => {
    const grades = [
      { wartosc: "4", waga: 1, czy_do_sredniej: true },
      { wartosc: "5", waga: 2, czy_do_sredniej: true },
    ];

    expect(simulateGradeNeeded(grades, 5, 1)).toBe(6);
    expect(simulateGradeNeeded(grades, 6, 3)).toBeNull();
  });

  it("proponuje ocenę końcową według progów", () => {
    expect(getSuggestedGrade(5.4)).toBe(6);
    expect(getSuggestedGrade(4.8)).toBe(5);
    expect(getSuggestedGrade(4.0)).toBe(4);
    expect(getSuggestedGrade(3.0)).toBe(3);
    expect(getSuggestedGrade(2.0)).toBe(2);
    expect(getSuggestedGrade(1.0)).toBe(1);
  });

  it("zwraca rozwiązania osiągające target lub wyższe, nawet gdy brak idealnego trafienia", () => {
    const grades = [{ wartosc: "4", waga: 1, czy_do_sredniej: true }];

    const solutions = findGradeSolutions(grades, 4.23, 1);

    expect(solutions.length).toBeGreaterThan(0);
    expect(solutions.every((solution) => solution.resultingAvg >= 4.23)).toBe(true);
    expect(solutions[0]).toMatchObject({
      grades: [{ value: 4.5, weight: 1 }],
    });
    expect(solutions[0].resultingAvg).toBeCloseTo(4.25, 2);
  });

  it("nie zwraca rozwiązań niższych po zaokrągleniu do dwóch miejsc", () => {
    const grades = [{ wartosc: "4", waga: 2, czy_do_sredniej: true }];

    const solutions = findGradeSolutions(grades, 4.34, 1);

    expect(solutions.every((solution) => solution.resultingAvg >= 4.34)).toBe(true);
  });

  it("nie dopuszcza rozwiązań z nadwyżką większą niż 0.03", () => {
    const grades = [{ wartosc: "4", waga: 1, czy_do_sredniej: true }];

    const solutions = findGradeSolutions(grades, 4.2, 1);

    expect(solutions.every((solution) => solution.resultingAvg - 4.2 <= 0.03)).toBe(true);
  });

  it("nie zwraca dodatkowych ocen, gdy target jest już osiągnięty", () => {
    const grades = [
      { wartosc: "5", waga: 1, czy_do_sredniej: true },
      { wartosc: "4", waga: 1, czy_do_sredniej: true },
    ];

    expect(findGradeSolutions(grades, 4.5, 2)).toEqual([]);
  });

  it("podmienia oceny przez overrides przy obliczaniu średniej", () => {
    const grades = [
      { id: 1, wartosc: "3", waga: 1, czy_do_sredniej: true },
      { id: 2, wartosc: "4", waga: 1, czy_do_sredniej: true },
    ];
    const overrides = new Map([[1, "5"]]);
    // bez override: (3+4)/2 = 3.5, z override: (5+4)/2 = 4.5
    expect(computeWeightedAverageWithOverrides(grades, overrides)).toBeCloseTo(4.5, 2);
  });

  it("pusta mapa overrides daje tę samą średnią co computeWeightedAverage", () => {
    const grades = [
      { id: 1, wartosc: "5", waga: 2, czy_do_sredniej: true },
      { id: 2, wartosc: "3", waga: 1, czy_do_sredniej: true },
    ];
    expect(computeWeightedAverageWithOverrides(grades, new Map())).toBeCloseTo(
      computeWeightedAverage(grades),
      5,
    );
  });

  it("override nie wlicza oceny nie do średniej mimo podmiany", () => {
    const grades = [
      { id: 1, wartosc: "2", waga: 1, czy_do_sredniej: false },
      { id: 2, wartosc: "4", waga: 1, czy_do_sredniej: true },
    ];
    const overrides = new Map([[1, "6"]]);
    // ocena id=1 nie jest do średniej — override też nie powinien jej wliczyć
    expect(computeWeightedAverageWithOverrides(grades, overrides)).toBeCloseTo(4, 2);
  });

  it("normalizuje target do dwóch miejsc po przecinku", () => {
    const grades = [{ wartosc: "4", waga: 1, czy_do_sredniej: true }];

    const solutions = findGradeSolutions(grades, 4.231, 1);

    expect(solutions.length).toBeGreaterThan(0);
    expect(solutions.every((solution) => solution.resultingAvg >= 4.23)).toBe(true);
  });

  it("sugeruje poprawy posortowane malejąco po delcie", () => {
    const grades = [
      { id: 1, wartosc: "2", waga: 3, czy_do_sredniej: true, opis: "Sprawdzian", data_wystawienia: "2024-01-01" },
      { id: 2, wartosc: "3", waga: 1, czy_do_sredniej: true, opis: "Kartkówka", data_wystawienia: "2024-01-02" },
    ];
    const suggestions = suggestGradeImprovements(grades);
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].deltaAvg).toBeGreaterThanOrEqual(suggestions[suggestions.length - 1].deltaAvg);
    // ocena 2 z wagą 3 powinna dać większy przyrost niż 3 z wagą 1
    expect(suggestions[0].gradeId).toBe(1);
  });

  it("nie sugeruje ocen >= 3.75 (4- i wyżej)", () => {
    const grades = [
      { id: 1, wartosc: "3.75", waga: 2, czy_do_sredniej: true, opis: null, data_wystawienia: "2024-01-01" },
      { id: 2, wartosc: "4", waga: 2, czy_do_sredniej: true, opis: null, data_wystawienia: "2024-01-02" },
      { id: 3, wartosc: "5", waga: 2, czy_do_sredniej: true, opis: null, data_wystawienia: "2024-01-03" },
      { id: 4, wartosc: "2", waga: 2, czy_do_sredniej: true, opis: null, data_wystawienia: "2024-01-04" },
    ];
    const suggestions = suggestGradeImprovements(grades);
    // tylko id=4 (wartość 2) powinna być sugerowana
    expect(suggestions.every((s) => s.gradeId === 4)).toBe(true);
  });

  it("nie uwzględnia ocen nie do średniej w sugestiach", () => {
    const grades = [
      { id: 1, wartosc: "1", waga: 3, czy_do_sredniej: false, opis: null, data_wystawienia: "2024-01-01" },
      { id: 2, wartosc: "2", waga: 1, czy_do_sredniej: true, opis: null, data_wystawienia: "2024-01-02" },
    ];
    const suggestions = suggestGradeImprovements(grades);
    expect(suggestions.every((s) => s.gradeId !== 1)).toBe(true);
  });

  it("pomija sugestie z deltaAvg < 0.04", () => {
    // jedna ocena 3 waga 1, reszta to 5 waga 20 — poprawa 3→5 da minimalny przyrost
    const grades = [
      { id: 1, wartosc: "3", waga: 1, czy_do_sredniej: true, opis: null, data_wystawienia: "2024-01-01" },
      ...Array.from({ length: 20 }, (_, i) => ({
        id: i + 10,
        wartosc: "5",
        waga: 1,
        czy_do_sredniej: true,
        opis: null,
        data_wystawienia: "2024-01-02",
      })),
    ];
    const suggestions = suggestGradeImprovements(grades);
    expect(suggestions.every((s) => s.deltaAvg >= 0.04)).toBe(true);
  });

  it("zwraca dokładnie jedną pozycję per ocena z maksymalnym targetem", () => {
    const grades = [
      { id: 1, wartosc: "2", waga: 3, czy_do_sredniej: true, opis: null, data_wystawienia: "2024-01-01" },
      { id: 2, wartosc: "3", waga: 2, czy_do_sredniej: true, opis: null, data_wystawienia: "2024-01-02" },
    ];
    const suggestions = suggestGradeImprovements(grades);
    const ids = suggestions.map((s) => s.gradeId);
    // brak duplikatów gradeId
    expect(new Set(ids).size).toBe(ids.length);
    // target to zawsze 6 (najwyższy możliwy = maks zysk)
    expect(suggestions.every((s) => s.targetValue === "6")).toBe(true);
  });
});
