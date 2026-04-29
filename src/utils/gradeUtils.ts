export function formatGradeValue(value: string | number): string {
  const val = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(val)) return String(value);
  if (val % 1 === 0.5) return `${Math.floor(val)}+`;
  if (val % 1 === 0.75) return `${Math.ceil(val)}-`;
  return String(Math.round(val));
}

/** Tailwind classes for grade blocks: use with flex items-center justify-center w-8 h-8 rounded-md font-medium tabular-nums text-sm */
export function getGradeColor(value: string | number): string {
  const val = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(val)) return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  if (val >= 5.0) return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400";
  if (val >= 4.0) return "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
  if (val >= 3.0) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
  if (val >= 2.0) return "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400";
  return "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";
}

/** Border-bottom color matching grade value */
export function getGradeBorderColor(value: string | number): string {
  const val = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(val)) return "border-b-zinc-300";
  if (val >= 5.0) return "border-b-emerald-500";
  if (val >= 4.0) return "border-b-green-500";
  if (val >= 3.0) return "border-b-yellow-500";
  if (val >= 2.0) return "border-b-orange-500";
  return "border-b-red-500";
}

/** Shadow value for inline style matching grade color */
export function getGradeShadow(value: string | number): string {
  const val = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(val)) return "0 4px 12px -2px rgba(0,0,0,0.06)";
  if (val >= 5.0) return "0 4px 12px -2px rgba(16,185,129,0.25)";
  if (val >= 4.0) return "0 4px 12px -2px rgba(34,197,94,0.25)";
  if (val >= 3.0) return "0 4px 12px -2px rgba(234,179,8,0.25)";
  if (val >= 2.0) return "0 4px 12px -2px rgba(249,115,22,0.25)";
  return "0 4px 12px -2px rgba(239,68,68,0.25)";
}

/** Tailwind classes for percentage text (attendance rates, test scores). Apply tabular-nums to parent. */
export function getPercentageColor(pct: number): string {
  if (pct >= 90) return "text-emerald-600 dark:text-emerald-400 font-semibold";
  if (pct >= 75) return "text-yellow-600 dark:text-yellow-400 font-medium";
  return "text-red-600 dark:text-red-400 font-medium";
}

export function computeWeightedAverage(
  grades: { wartosc: string; waga: number; czy_do_sredniej: boolean }[],
): number {
  const valid = grades.filter((g) => g.czy_do_sredniej && !Number.isNaN(parseFloat(g.wartosc)));
  if (!valid.length) return 0;
  const sumW = valid.reduce((sum, grade) => sum + grade.waga, 0);
  return valid.reduce((sum, grade) => sum + parseFloat(grade.wartosc) * grade.waga, 0) / sumW;
}

export function computeWeightedAverageWithOverrides(
  grades: { id: number; wartosc: string; waga: number; czy_do_sredniej: boolean }[],
  overrides: Map<number, string>,
): number {
  const withOverrides = grades.map((g) =>
    overrides.has(g.id) ? { ...g, wartosc: overrides.get(g.id)! } : g,
  );
  return computeWeightedAverage(withOverrides);
}

export interface GradeImprovementSuggestion {
  gradeId: number;
  opis: string | null;
  date: string;
  originalValue: string;
  targetValue: string;
  weight: number;
  resultingAvg: number;
  deltaAvg: number;
}

export function suggestGradeImprovements(
  grades: { id: number; wartosc: string; waga: number; czy_do_sredniej: boolean; opis: string | null; data_wystawienia: string }[],
): GradeImprovementSuggestion[] {
  const currentAvg = computeWeightedAverage(grades);
  if (currentAvg === 0) return [];

  const suggestions: GradeImprovementSuggestion[] = [];

  for (const g of grades) {
    if (!g.czy_do_sredniej) continue;
    const val = parseFloat(g.wartosc);
    // tylko oceny poniżej 4- (3.75) — od 4- wzwyż nie sugerujemy poprawy
    if (Number.isNaN(val) || val >= 3.75) continue;

    // szukamy targetu dającego maksymalny przyrost (zawsze najwyższy możliwy)
    let best: GradeImprovementSuggestion | null = null;
    for (const target of POLISH_GRADES) {
      if (target <= val) continue;

      const targetValue = String(target);
      const overrides = new Map([[g.id, targetValue]]);
      const resultingAvg = computeWeightedAverageWithOverrides(grades, overrides);
      const deltaAvg = resultingAvg - currentAvg;

      if (!best || deltaAvg > best.deltaAvg) {
        best = {
          gradeId: g.id,
          opis: g.opis,
          date: g.data_wystawienia,
          originalValue: g.wartosc,
          targetValue,
          weight: g.waga,
          resultingAvg,
          deltaAvg,
        };
      }
    }

    // pomijamy poprawy które praktycznie nic nie dają
    if (best && best.deltaAvg >= 0.04) {
      suggestions.push(best);
    }
  }

  return suggestions.sort((a, b) => b.deltaAvg - a.deltaAvg).slice(0, 5);
}

export function simulateGradeNeeded(
  grades: { wartosc: string; waga: number; czy_do_sredniej: boolean }[],
  targetAvg: number,
  newGradeWeight: number,
): number | null {
  const valid = grades.filter((g) => g.czy_do_sredniej && !Number.isNaN(parseFloat(g.wartosc)));
  const currentSumW = valid.reduce((sum, grade) => sum + grade.waga, 0);
  const currentSumWV = valid.reduce((sum, grade) => sum + grade.waga * parseFloat(grade.wartosc), 0);
  const needed = (targetAvg * (currentSumW + newGradeWeight) - currentSumWV) / newGradeWeight;
  if (needed < 1 || needed > 6) return null;
  return Math.round(needed * 100) / 100;
}

export function getSuggestedGrade(average: number): number {
  if (average >= 5.4) return 6;
  if (average >= 4.7) return 5;
  if (average >= 3.75) return 4;
  if (average >= 2.8) return 3;
  if (average >= 1.85) return 2;
  return 1;
}

const POLISH_GRADES = [1, 2, 2.5, 3, 3.5, 3.75, 4, 4.5, 4.75, 5, 5.5, 5.75, 6];
const COMMON_WEIGHTS = [1, 2, 3];
const RARE_WEIGHTS = [4, 5];
const POSSIBLE_WEIGHTS = [...COMMON_WEIGHTS, ...RARE_WEIGHTS];

export interface GradeSolution {
  grades: { value: number; weight: number }[];
  resultingAvg: number;
  label: string;
}

const MAX_TARGET_OVERSHOOT = 0.03;

function roundAverage(value: number): number {
  return Math.round(value * 100) / 100;
}

function weightPenalty(weight: number): number {
  return weight <= 3 ? 0 : (weight - 3) * 10;
}

function solutionPenalty(solution: GradeSolution): number {
  return solution.grades.reduce((sum, g) => sum + weightPenalty(g.weight), 0);
}

export function findGradeSolutions(
  currentGrades: { wartosc: string; waga: number; czy_do_sredniej: boolean }[],
  targetAvg: number,
  maxGrades: number = 3,
): GradeSolution[] {
  const normalizedTargetAvg = roundAverage(targetAvg);
  const valid = currentGrades.filter((g) => g.czy_do_sredniej && !Number.isNaN(parseFloat(g.wartosc)));
  const currentSumW = valid.reduce((sum, g) => sum + g.waga, 0);
  const currentSumWV = valid.reduce((sum, g) => sum + g.waga * parseFloat(g.wartosc), 0);

  if (currentSumW === 0) return [];

  const currentAvg = roundAverage(currentSumWV / currentSumW);
  if (currentAvg >= normalizedTargetAvg) return [];

  const solutions: GradeSolution[] = [];
  const seen = new Set<string>();

  function addSolution(grades: { value: number; weight: number }[]) {
    const totalNewWeight = grades.reduce((s, g) => s + g.weight, 0);
    const newSumWV = grades.reduce((s, g) => s + g.value * g.weight, 0);
    const resultingAvg = (currentSumWV + newSumWV) / (currentSumW + totalNewWeight);
    const roundedResultingAvg = roundAverage(resultingAvg);
    const overshoot = roundedResultingAvg - normalizedTargetAvg;
    if (overshoot < 0) return;
    if (overshoot > MAX_TARGET_OVERSHOOT) return;
    const key = grades.map((g) => `${g.value}_${g.weight}`).sort().join(",");
    if (seen.has(key)) return;
    seen.add(key);
    const label = grades.map((g) => `${formatGradeValue(g.value)} (waga ${g.weight})`).join(" + ");
    solutions.push({ grades, resultingAvg: roundedResultingAvg, label });
  }

  if (maxGrades >= 1) {
    for (const weight of POSSIBLE_WEIGHTS) {
      for (const grade of POLISH_GRADES) {
        addSolution([{ value: grade, weight }]);
      }
    }
  }

  if (maxGrades >= 2) {
    for (let i = 0; i < POSSIBLE_WEIGHTS.length; i++) {
      for (let j = i; j < POSSIBLE_WEIGHTS.length; j++) {
        const w1 = POSSIBLE_WEIGHTS[i];
        const w2 = POSSIBLE_WEIGHTS[j];
        for (const g1 of POLISH_GRADES) {
          for (const g2 of POLISH_GRADES) {
            addSolution([
              { value: g1, weight: w1 },
              { value: g2, weight: w2 },
            ]);
          }
        }
      }
    }
  }

  if (maxGrades >= 3) {
    for (let i = 0; i < POSSIBLE_WEIGHTS.length; i++) {
      for (let j = i; j < POSSIBLE_WEIGHTS.length; j++) {
        for (let k = j; k < POSSIBLE_WEIGHTS.length; k++) {
          const w1 = POSSIBLE_WEIGHTS[i];
          const w2 = POSSIBLE_WEIGHTS[j];
          const w3 = POSSIBLE_WEIGHTS[k];
          for (const g1 of POLISH_GRADES) {
            for (const g2 of POLISH_GRADES) {
              for (const g3 of POLISH_GRADES) {
                addSolution([
                  { value: g1, weight: w1 },
                  { value: g2, weight: w2 },
                  { value: g3, weight: w3 },
                ]);
              }
            }
          }
        }
      }
    }
  }

  solutions.sort((a, b) => {
    const aCount = a.grades.length;
    const bCount = b.grades.length;
    if (aCount !== bCount) return aCount - bCount;
    const aOvershoot = roundAverage(a.resultingAvg - normalizedTargetAvg);
    const bOvershoot = roundAverage(b.resultingAvg - normalizedTargetAvg);
    if (aOvershoot !== bOvershoot) return aOvershoot - bOvershoot;
    const aPenalty = solutionPenalty(a);
    const bPenalty = solutionPenalty(b);
    if (aPenalty !== bPenalty) return aPenalty - bPenalty;
    const aMaxGrade = Math.max(...a.grades.map((g) => g.value));
    const bMaxGrade = Math.max(...b.grades.map((g) => g.value));
    if (aMaxGrade !== bMaxGrade) return aMaxGrade - bMaxGrade;
    return a.grades.reduce((s, g) => s + g.weight, 0) - b.grades.reduce((s, g) => s + g.weight, 0);
  });

  return solutions.slice(0, 12);
}
