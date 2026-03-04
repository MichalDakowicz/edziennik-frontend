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