import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { pl } from "date-fns/locale";
import type { Event, Homework } from "../../types/api";
import { cn } from "../../utils/cn";
import { cap, getEventsForDate, getHomeworkForDate } from "./helpers";
import { ItemCard } from "./ItemCard";
import type { TimetableData } from "./types";

interface WeekViewProps {
  date: Date;
  timetable: TimetableData;
  events: Event[];
  homework: Homework[];
}

export function WeekView({ date, timetable, events, homework }: WeekViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const days = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));
  const hours = [...timetable.hours].sort((a, b) => a.Numer - b.Numer);
  const now = new Date();
  const currentTimeStr = format(now, "HH:mm");

  const hasAllDay = days.some(
    (d) =>
      getEventsForDate(d, events, timetable.subjects).length > 0 ||
      getHomeworkForDate(d, homework, timetable.subjects).length > 0,
  );

  return (
    <div className="space-y-4">
      {/* All-day events / homework strip */}
      {hasAllDay && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {days.map((day) => {
            const dayEvents = getEventsForDate(day, events, timetable.subjects);
            const dayHw = getHomeworkForDate(day, homework, timetable.subjects);
            if (dayEvents.length === 0 && dayHw.length === 0) return null;
            return (
              <div
                key={day.toISOString()}
                className="bg-card/50 border border-border/50 rounded-lg p-2 space-y-1"
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {cap(format(day, "EEE, d MMM", { locale: pl }))}
                </div>
                {dayEvents.map((item) => (
                  <ItemCard key={item.id} item={item} compact />
                ))}
                {dayHw.map((item) => (
                  <ItemCard key={item.id} item={item} compact />
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Week grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Day headers */}
          <div className="grid grid-cols-[76px_repeat(5,1fr)] gap-2 mb-2">
            <div />
            {days.map((day) => {
              const isToday = isSameDay(day, now);
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "p-2 rounded-lg text-center",
                    isToday
                      ? "bg-primary/20 border border-primary/30"
                      : "bg-card/50 border border-border/50",
                  )}
                >
                  <div className="text-xs text-muted-foreground">
                    {cap(format(day, "EEE", { locale: pl }))}
                  </div>
                  <div className="text-sm font-medium">{format(day, "d MMM", { locale: pl })}</div>
                </div>
              );
            })}
          </div>

          {/* Period rows */}
          {hours.map((hour) => (
            <div key={hour.id} className="grid grid-cols-[76px_repeat(5,1fr)] gap-2 mb-1.5">
              <div className="text-xs text-muted-foreground pt-2 leading-tight text-right pr-2">
                <div className="font-medium">{hour.Numer}.</div>
                <div className="opacity-70">{hour.CzasOd.slice(0, 5)}</div>
                <div className="opacity-70">{hour.CzasDo.slice(0, 5)}</div>
              </div>
              {days.map((day) => {
                const dayNum = day.getDay() === 0 ? 7 : day.getDay();
                const dayRecord = timetable.days.find((d) => d.Numer === dayNum);
                const entry = dayRecord
                  ? timetable.entries.find(
                      (e) =>
                        (e.dzien_tygodnia ?? e.DzienTygodnia) === dayRecord.id &&
                        e.godzina_lekcyjna === hour.id,
                    )
                  : undefined;
                const zajecia = entry
                  ? timetable.zajecia.find((z) => z.id === entry.zajecia)
                  : undefined;
                const subject = zajecia
                  ? timetable.subjects.find((s) => s.id === zajecia.przedmiot)
                  : undefined;
                const isToday = isSameDay(day, now);
                const isCurrentLesson =
                  isToday &&
                  hour.CzasOd.slice(0, 5) <= currentTimeStr &&
                  hour.CzasDo.slice(0, 5) >= currentTimeStr;

                return (
                  <div
                    key={`${day.toISOString()}-${hour.id}`}
                    className={cn(
                      "px-2 py-2 rounded-lg border text-xs min-h-[52px] flex items-center",
                      subject
                        ? "bg-muted/60 border-border text-foreground font-medium"
                        : "border-border/30 text-muted-foreground/30",
                      isToday && !isCurrentLesson && "border-primary/30",
                      isCurrentLesson && "ring-2 ring-primary ring-inset border-transparent",
                    )}
                  >
                    {subject ? (subject.nazwa ?? subject.Nazwa ?? "–") : "–"}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
