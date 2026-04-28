import {
  computeWeightedAverage,
  findGradeSolutions,
  formatGradeValue,
  getGradeColor,
  getPercentageColor,
  getSuggestedGrade,
  simulateGradeNeeded,
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

  it("normalizuje target do dwóch miejsc po przecinku", () => {
    const grades = [{ wartosc: "4", waga: 1, czy_do_sredniej: true }];

    const solutions = findGradeSolutions(grades, 4.231, 1);

    expect(solutions.length).toBeGreaterThan(0);
    expect(solutions.every((solution) => solution.resultingAvg >= 4.23)).toBe(true);
  });
});
