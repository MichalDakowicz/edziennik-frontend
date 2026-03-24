import type { BehaviorPoint } from "../../types/api";
import { formatDateTime } from "../../utils/dateUtils";

export default function BehaviorPoints({ behavior }: { behavior: BehaviorPoint[] }) {
  const sorted = [...behavior].sort((a, b) => Date.parse(b.data_wpisu) - Date.parse(a.data_wpisu));
  const total = sorted.reduce((sum, item) => sum + item.punkty, 0);

  return (
    <div className="space-y-4">
      <div className={`rounded-[var(--radius)]  p-4 ${total >= 0 ? "bg-emerald-100 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/50" : "bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800/50"}`}>
        <p className="text-sm text-on-surface-variant font-body">Suma punktów</p>
        <p className={`text-2xl font-bold tabular-nums ${total >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{total >= 0 ? `+${total}` : total}</p>
      </div>
      <div className="space-y-2">
        {sorted.map((item) => (
          <div key={item.id} className="bg-surface-container-lowest shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] rounded-[var(--radius)] p-3 flex justify-between gap-3">
            <div>
              <p className="text-on-surface font-body">{item.opis ?? "Brak opisu"}</p>
              <p className="text-xs text-on-surface-variant font-body tabular-nums">{formatDateTime(item.data_wpisu)}</p>
            </div>
            <div className={`text-sm font-semibold tabular-nums ${item.punkty >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>{item.punkty >= 0 ? `+${item.punkty}` : item.punkty}</div>
          </div>
        ))}
      </div>
    </div>
  );
}