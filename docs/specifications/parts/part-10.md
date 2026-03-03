## Part 10 – Utility Functions

File: `src/utils/gradeUtils.ts`

```typescript
/** Convert decimal to Polish grade string: 4.00→"4", 4.50→"4+", 4.75→"5-" */
export function formatGradeValue(value: string | number): string {
    const val = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(val)) return String(value);
    if (val % 1 === 0.5) return `${Math.floor(val)}+`;
    if (val % 1 === 0.75) return `${Math.ceil(val)}-`;
    return String(Math.round(val));
}

/** Returns Tailwind classes for grade badge background/text */
export function getGradeColor(value: string | number): string {
    const val = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(val)) return "bg-zinc-900 border-zinc-800 text-zinc-100";
    if (val >= 5)
        return "bg-emerald-900/20 text-emerald-400 border-emerald-900/30";
    if (val >= 4) return "bg-green-900/20 text-green-400 border-green-900/30";
    if (val >= 3)
        return "bg-yellow-900/20 text-yellow-400 border-yellow-900/30";
    if (val >= 2)
        return "bg-orange-900/20 text-orange-400 border-orange-900/30";
    return "bg-red-900/20 text-red-400 border-red-900/30";
}

/** Weighted average, only includes grades with czy_do_sredniej=true */
export function computeWeightedAverage(
    grades: { wartosc: string; waga: number; czy_do_sredniej: boolean }[],
): number {
    const valid = grades.filter(
        (g) => g.czy_do_sredniej && !isNaN(parseFloat(g.wartosc)),
    );
    if (valid.length === 0) return 0;
    const sumW = valid.reduce((s, g) => s + g.waga, 0);
    return valid.reduce((s, g) => s + parseFloat(g.wartosc) * g.waga, 0) / sumW;
}

/**
 * Grade Simulator: given current grades and a desired target average,
 * returns the minimum grade needed (with given weight) to reach the target.
 * Returns null if mathematically impossible.
 */
export function simulateGradeNeeded(
    grades: { wartosc: string; waga: number; czy_do_sredniej: boolean }[],
    targetAvg: number,
    newGradeWeight: number,
): number | null {
    const valid = grades.filter(
        (g) => g.czy_do_sredniej && !isNaN(parseFloat(g.wartosc)),
    );
    const currentSumW = valid.reduce((s, g) => s + g.waga, 0);
    const currentSumWV = valid.reduce(
        (s, g) => s + g.waga * parseFloat(g.wartosc),
        0,
    );
    // (currentSumWV + x * newGradeWeight) / (currentSumW + newGradeWeight) = target
    const needed =
        (targetAvg * (currentSumW + newGradeWeight) - currentSumWV) /
        newGradeWeight;
    if (needed < 1 || needed > 6) return null;
    return Math.round(needed * 100) / 100;
}
```

File: `src/utils/dateUtils.ts`

```typescript
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { pl } from "date-fns/locale";

export const formatDate = (iso: string): string =>
    format(parseISO(iso), "dd.MM.yyyy", { locale: pl });

export const formatDateTime = (iso: string): string =>
    format(parseISO(iso), "dd.MM.yyyy HH:mm", { locale: pl });

export const formatRelative = (iso: string): string =>
    formatDistanceToNow(parseISO(iso), { locale: pl, addSuffix: true });
```

---

