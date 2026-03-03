import type { BehaviorPoint } from "../../types/api";
import { formatDateTime } from "../../utils/dateUtils";

export default function BehaviorPoints({ behavior }: { behavior: BehaviorPoint[] }) {
  const sorted = [...behavior].sort((a, b) => Date.parse(b.data_wpisu) - Date.parse(a.data_wpisu));
  const total = sorted.reduce((sum, item) => sum + item.punkty, 0);

  return (
    <div className="space-y-4">
      <div className={`rounded-xl border p-4 ${total >= 0 ? "border-emerald-900/30 bg-emerald-900/10" : "border-red-900/30 bg-red-900/10"}`}>
        <p className="text-sm text-muted-foreground">Suma punktów</p>
        <p className={`text-2xl font-bold ${total >= 0 ? "text-emerald-400" : "text-red-400"}`}>{total >= 0 ? `+${total}` : total}</p>
      </div>
      <div className="space-y-2">
        {sorted.map((item) => (
          <div key={item.id} className="bg-card border border-border/50 rounded-xl p-3 flex justify-between gap-3">
            <div>
              <p className="text-foreground">{item.opis ?? "Brak opisu"}</p>
              <p className="text-xs text-muted-foreground">{formatDateTime(item.data_wpisu)}</p>
            </div>
            <div className={`text-sm font-semibold ${item.punkty >= 0 ? "text-emerald-400" : "text-red-400"}`}>{item.punkty >= 0 ? `+${item.punkty}` : item.punkty}</div>
          </div>
        ))}
      </div>
    </div>
  );
}