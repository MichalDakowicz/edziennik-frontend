import { useMemo, useState } from "react";
import type { Event } from "../../types/api";

export default function EventCalendar({ events }: { events: Event[] }) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const current = new Date();
  const targetMonth = new Date(current.getFullYear(), current.getMonth() + monthOffset, 1);
  const start = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
  const end = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0);

  const daysInMonth = Array.from({ length: end.getDate() }, (_, i) => new Date(targetMonth.getFullYear(), targetMonth.getMonth(), i + 1));

  const eventsByDate = useMemo(() => {
    const map = new Map<string, Event[]>();
    events.forEach((event) => {
      const key = new Date(event.data).toISOString().slice(0, 10);
      const currentItems = map.get(key) ?? [];
      currentItems.push(event);
      map.set(key, currentItems);
    });
    return map;
  }, [events]);

  const selectedEvents = selectedDate ? eventsByDate.get(selectedDate) ?? [] : [];

  return (
    <div className="grid lg:grid-cols-[2fr,1fr] gap-4">
      <div className="bg-card/50 /50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <button className="btn-ghost" onClick={() => setMonthOffset((v) => v - 1)}>Poprzedni</button>
          <h3 className="font-semibold">{targetMonth.toLocaleDateString("pl-PL", { month: "long", year: "numeric" })}</h3>
          <button className="btn-ghost" onClick={() => setMonthOffset((v) => v + 1)}>Następny</button>
        </div>
        <div className="grid grid-cols-7 gap-2 text-xs text-on-surface-variant font-body mb-2">
          {["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map((d) => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: ((start.getDay() + 6) % 7) }, (_, index) => <div key={`e-${index}`} />)}
          {daysInMonth.map((day) => {
            const key = day.toISOString().slice(0, 10);
            const hasEvent = (eventsByDate.get(key)?.length ?? 0) > 0;
            return (
              <button key={key} className={`h-12 rounded-lg border text-sm ${selectedDate === key ? "border-blue-500 bg-blue-900/20" : "border-border/50 bg-zinc-950"}`} onClick={() => setSelectedDate(key)}>
                <div>{day.getDate()}</div>
                {hasEvent ? <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mx-auto mt-1" /> : null}
              </button>
            );
          })}
        </div>
      </div>
      <div className="bg-card/50 /50 rounded-xl p-4">
        <h3 className="section-title mb-3">Wydarzenia dnia</h3>
        {selectedDate ? (
          selectedEvents.length ? (
            <ul className="space-y-2">
              {selectedEvents.map((event) => <li key={event.id} className="text-sm text-on-surface font-body">{event.tytul}</li>)}
            </ul>
          ) : (
            <p className="text-on-surface-variant font-body">Brak wydarzeń</p>
          )
        ) : (
          <p className="text-on-surface-variant font-body">Wybierz dzień</p>
        )}
      </div>
    </div>
  );
}