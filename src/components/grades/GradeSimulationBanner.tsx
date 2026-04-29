interface GradeSimulationBannerProps {
  realAvg: number;
  simulatedAvg: number;
  deltaAvg: number;
  overrideCount: number;
  onReset: () => void;
}

export default function GradeSimulationBanner({
  realAvg,
  simulatedAvg,
  deltaAvg,
  overrideCount,
  onReset,
}: GradeSimulationBannerProps) {
  const deltaPositive = deltaAvg > 0;
  const deltaZero = Math.abs(deltaAvg) < 0.005;

  return (
    <div className="bg-surface-container-high border border-primary/20 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
      <div className="flex items-center gap-2 shrink-0">
        <span className="material-symbols-outlined text-primary text-lg">science</span>
        <span className="text-xs font-bold uppercase tracking-widest text-primary font-body">
          Tryb symulacji
        </span>
      </div>

      <div className="flex items-center gap-3 flex-1 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm text-on-surface-variant font-body">Rzeczywista:</span>
          <span className="text-lg font-black font-headline text-on-surface">
            {realAvg.toFixed(2)}
          </span>
        </div>

        <span className="material-symbols-outlined text-outline text-base">arrow_forward</span>

        <div className="flex items-center gap-2">
          <span className="text-sm text-on-surface-variant font-body">Symulowana:</span>
          <span className="text-lg font-black font-headline text-primary">
            {simulatedAvg.toFixed(2)}
          </span>
        </div>

        {!deltaZero && (
          <span
            className={`text-sm font-bold px-2 py-0.5 rounded-full font-body ${
              deltaPositive
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
            }`}
          >
            {deltaPositive ? "+" : ""}
            {deltaAvg.toFixed(2)}
          </span>
        )}
      </div>

      {overrideCount > 0 && (
        <button
          onClick={onReset}
          className="text-xs font-bold text-outline hover:text-error transition-colors font-body whitespace-nowrap"
        >
          Zresetuj ({overrideCount})
        </button>
      )}
    </div>
  );
}
