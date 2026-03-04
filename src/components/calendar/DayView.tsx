import { format } from "date-fns";
import { pl } from "date-fns/locale";
import type { Event, Homework } from "../../types/api";
import { cap, getEventsForDate, getHomeworkForDate, getLessonsForDate } from "./helpers";
import { ItemCard } from "./ItemCard";
import type { TimetableData } from "./types";

interface DayViewProps {
  date: Date;
  timetable: TimetableData;
  events: Event[];
  homework: Homework[];
}

export function DayView({ date, timetable, events, homework }: DayViewProps) {
  const lessons = getLessonsForDate(date, timetable);
  const dayEvents = getEventsForDate(date, events, timetable.subjects);
  const dayHomework = getHomeworkForDate(date, homework, timetable.subjects);

  return (
    <div className="space-y-4">
      <div className="bg-card/50 border border-border/50 rounded-xl p-4">
        <div className="text-base font-medium">
          {cap(format(date, "EEEE, d MMMM yyyy", { locale: pl }))}
        </div>
      </div>

      {(dayEvents.length > 0 || dayHomework.length > 0) && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Całodniowe
          </h2>
          <div className="space-y-2">
            {dayEvents.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
            {dayHomework.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Plan lekcji
        </h2>
        {lessons.length > 0 ? (
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <ItemCard key={lesson.id} item={lesson} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">Brak lekcji w tym dniu</p>
        )}
      </div>
    </div>
  );
}
