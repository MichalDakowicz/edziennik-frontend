import { useMemo, useState } from "react";
import type { Grade } from "../../types/api";
import {
  computeWeightedAverage,
  findGradeSolutions,
  formatGradeValue,
  getGradeColor,
  suggestGradeImprovements,
} from "../../utils/gradeUtils";
import { formatDate } from "../../utils/dateUtils";

interface GradeSimulatorProps {
  grades: Grade[];
  onApplyOverride?: (gradeId: number, value: string) => void;
}

export default function GradeSimulator({ grades, onApplyOverride }: GradeSimulatorProps) {
  const [targetAvg, setTargetAvg] = useState("");
  const [showSolutions, setShowSolutions] = useState(false);

  const currentAvg = useMemo(() => computeWeightedAverage(grades), [grades]);
  const parsedTarget = useMemo(() => parseFloat(targetAvg), [targetAvg]);
  const normalizedTarget = useMemo(
    () => (isNaN(parsedTarget) ? null : Math.round(parsedTarget * 100) / 100),
    [parsedTarget],
  );
  const targetAlreadyReached = normalizedTarget !== null && currentAvg > 0 && currentAvg >= normalizedTarget;

  const solutions = useMemo(() => {
    const target = normalizedTarget;
    if (target === null || target < 1 || target > 6) return [];
    return findGradeSolutions(grades, target, 2);
  }, [grades, normalizedTarget]);

  const improvements = useMemo(() => suggestGradeImprovements(grades), [grades]);

  const handleCalculate = () => {
    setShowSolutions(true);
  };

  return (
    <section className="bg-surface-container-high rounded-3xl p-8 relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="text-2xl font-black text-on-surface font-headline mb-2">Symulator Ocen</h3>
        <p className="text-sm text-on-surface-variant mb-8 font-body">Podaj docelową średnią, a powiemy Ci jakie oceny musisz uzyskać, aby ją osiągnąć lub przekroczyć.</p>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest font-bold text-outline font-body">Docelowa Średnia (1.00 – 6.00)</label>
            <input
              className="w-full bg-surface-container-lowest border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all font-body text-on-surface"
              placeholder="np. 4.50"
              type="number"
              min={1}
              max={6}
              step={0.01}
              value={targetAvg}
              onChange={(e) => {
                setTargetAvg(e.target.value);
                setShowSolutions(false);
              }}
            />
          </div>

          <button
            className="w-full py-4 bg-on-surface text-background rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-opacity-90 active:scale-[0.98] transition-all font-headline"
            onClick={handleCalculate}
            disabled={!targetAvg || normalizedTarget === null}
          >
            <span className="material-symbols-outlined">auto_graph</span>
            Oblicz Wymagane Oceny
          </button>
        </div>

        {currentAvg > 0 && (
          <div className="mt-6 pt-6 border-t border-outline/10">
            <p className="text-xs text-outline font-medium font-body mb-1">Aktualna Średnia</p>
            <span className="text-3xl font-black text-primary font-headline">{currentAvg.toFixed(2)}</span>
          </div>
        )}

        {showSolutions && targetAlreadyReached && normalizedTarget !== null && (
          <div className="mt-6 pt-6 border-t border-outline/10">
            <p className="text-sm text-primary font-medium font-body">
              Aktualna średnia {currentAvg.toFixed(2)} już osiąga lub przekracza cel {normalizedTarget.toFixed(2)}.
            </p>
          </div>
        )}

        {showSolutions && !targetAlreadyReached && solutions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-outline/10">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-body mb-4">
              Potrzebujesz {solutions.length > 1 ? "jednej z kombinacji" : "tej oceny"}:
            </p>
            <div className="space-y-3">
              {solutions.slice(0, 6).map((solution, idx) => (
                <div key={idx} className="bg-surface-container-lowest rounded-xl p-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {solution.grades.map((g, i) => (
                      <div key={i} className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold ${getGradeColor(g.value)}`}>
                        <span className="text-lg font-black font-headline leading-none">{formatGradeValue(g.value)}</span>
                        <span className="text-[9px] font-bold opacity-60 mt-0.5">WAGA {g.weight}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-on-surface-variant font-body">
                    {solution.label} → średnia: {solution.resultingAvg.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {showSolutions && !targetAlreadyReached && solutions.length === 0 && normalizedTarget !== null && normalizedTarget > 0 && (
          <div className="mt-6 pt-6 border-t border-outline/10">
            <p className="text-sm text-error font-medium font-body">
              Nie można osiągnąć średniej {normalizedTarget.toFixed(2)} przy obecnych ocenach.
            </p>
          </div>
        )}

        {improvements.length > 0 && (
          <div className="mt-6 pt-6 border-t border-outline/10">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-body mb-4">
              Co warto poprawić?
            </p>
            <div className="space-y-3">
              {improvements.map((s) => (
                <div
                  key={s.gradeId}
                  className="bg-surface-container-lowest rounded-xl p-4 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 ${getGradeColor(s.originalValue)}`}>
                      <span className="text-lg font-black font-headline leading-none">{formatGradeValue(s.originalValue)}</span>
                      <span className="text-[9px] font-bold opacity-60 mt-0.5">WAGA {s.weight}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-on-surface font-body truncate">
                        {s.opis || "Ocena cząstkowa"}
                      </p>
                      <p className="text-[10px] text-outline font-body">
                        {formatDate(s.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full font-body">
                      +{s.deltaAvg.toFixed(2)}
                    </span>
                    {onApplyOverride && (
                      <button
                        onClick={() => onApplyOverride(s.gradeId, s.targetValue)}
                        className="w-7 h-7 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors"
                        title="Zastosuj w symulatorze"
                      >
                        <span className="material-symbols-outlined text-primary" style={{ fontSize: "14px" }}>science</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
    </section>
  );
}
