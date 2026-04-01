import { useMemo, useState } from "react";
import type { Grade } from "../../types/api";
import { computeWeightedAverage, findGradeSolutions, formatGradeValue, getGradeColor, getGradeBorderColor } from "../../utils/gradeUtils";

interface GradeSimulatorProps {
  grades: Grade[];
}

export default function GradeSimulator({ grades }: GradeSimulatorProps) {
  const [targetAvg, setTargetAvg] = useState("");
  const [showSolutions, setShowSolutions] = useState(false);

  const currentAvg = useMemo(() => computeWeightedAverage(grades), [grades]);

  const solutions = useMemo(() => {
    const target = parseFloat(targetAvg);
    if (isNaN(target) || target < 1 || target > 6) return [];
    return findGradeSolutions(grades, target, 2);
  }, [grades, targetAvg]);

  const handleCalculate = () => {
    setShowSolutions(true);
  };

  return (
    <section className="bg-surface-container-high rounded-3xl p-8 relative overflow-hidden">
      <div className="relative z-10">
        <h3 className="text-2xl font-black text-on-surface font-headline mb-2">Symulator Ocen</h3>
        <p className="text-sm text-on-surface-variant mb-8 font-body">Podaj docelową średnią, a powiemy Ci jakie oceny musisz uzyskać.</p>

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
            disabled={!targetAvg || isNaN(parseFloat(targetAvg))}
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

        {showSolutions && solutions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-outline/10">
            <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest font-body mb-4">
              Potrzebujesz {solutions.length > 1 ? "jednej z kombinacji" : "tej oceny"}:
            </p>
            <div className="space-y-3">
              {solutions.slice(0, 6).map((solution, idx) => (
                <div key={idx} className="bg-surface-container-lowest rounded-xl p-4">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {solution.grades.map((g, i) => (
                      <div key={i} className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold border-b-2 ${getGradeColor(g.value)} ${getGradeBorderColor(g.value)}`}>
                        {formatGradeValue(g.value)}
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

        {showSolutions && solutions.length === 0 && parseFloat(targetAvg) > 0 && (
          <div className="mt-6 pt-6 border-t border-outline/10">
            <p className="text-sm text-error font-medium font-body">
              Nie można osiągnąć średniej {parseFloat(targetAvg).toFixed(2)} przy obecnych ocenach.
            </p>
          </div>
        )}
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
    </section>
  );
}
