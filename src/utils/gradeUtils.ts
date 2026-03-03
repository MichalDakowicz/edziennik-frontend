export function formatGradeValue(value: string | number): string {
  const val = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(val)) return String(value);
  if (val % 1 === 0.5) return `${Math.floor(val)}+`;
  if (val % 1 === 0.75) return `${Math.ceil(val)}-`;
  return String(Math.round(val));
}

export function getGradeColor(value: string | number): string {
  const val = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(val)) return "bg-zinc-900 border-zinc-800 text-zinc-100";
  if (val >= 5) return "bg-emerald-900/20 text-emerald-400 border-emerald-900/30";
  if (val >= 4) return "bg-green-900/20 text-green-400 border-green-900/30";
  if (val >= 3) return "bg-yellow-900/20 text-yellow-400 border-yellow-900/30";
  if (val >= 2) return "bg-orange-900/20 text-orange-400 border-orange-900/30";
  return "bg-red-900/20 text-red-400 border-red-900/30";
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