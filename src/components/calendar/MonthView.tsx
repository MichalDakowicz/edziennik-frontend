import { useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { pl } from "date-fns/locale";
import type { Event, Homework } from "../../types/api";
import { cn } from "../../utils/cn";
import { cap, getAllItemsForDate, getEventsForDate, getHomeworkForDate, getLessonsForDate } from "./helpers";
import { ItemCard, ItemChip } from "./ItemCard";
import { Modal } from "../ui/Modal";
import type { EventItem, HomeworkItem, LessonItem, TimetableData } from "./types";

interface MonthViewProps {
  date: Date;
  timetable: TimetableData;
  events: Event[];
  homework: Homework[];
}

const WEEK_DAYS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Niedz"];

export function MonthView({ date, timetable, events, homework }: MonthViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const selectedItems = useMemo(
    () => (selectedDate ? getAllItemsForDate(selectedDate, timetable, events, homework) : []),
    [selectedDate, timetable, events, homework],
  );

  const selectedEvents = selectedItems.filter((i): i is EventItem => i.kind === "event");
  const selectedHomework = selectedItems.filter((i): i is HomeworkItem => i.kind === "homework");
  const selectedLessons = selectedItems.filter((i): i is LessonItem => i.kind === "lesson");

  return (
    <>
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {WEEK_DAYS.map((d) => (
              <div
                key={d}
                className="text-center py-2 text-xs font-medium text-muted-foreground bg-muted/50 rounded-md"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const inMonth = isSameMonth(day, date);
              const isToday = isSameDay(day, new Date());
              // Only events + homework in cells (no lessons)
              const dayEvents = getEventsForDate(day, events, timetable.subjects);
              const dayHw = getHomeworkForDate(day, homework, timetable.subjects);
              const visibleItems = [...dayEvents, ...dayHw];
              // Subtle dot when the day has lessons but nothing else
              const hasLessons = inMonth && getLessonsForDate(day, timetable).length > 0;

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => inMonth && setSelectedDate(day)}
                  className={cn(
                    "min-h-[80px] sm:min-h-[90px] p-1 rounded-lg border transition-all",
                    inMonth
                      ? "bg-card/30 border-border/50 cursor-pointer hover:bg-muted/30"
                      : "bg-background border-border/20 opacity-40 cursor-default",
                    isToday && "ring-2 ring-primary",
                  )}
                >
                  <div
                    className={cn(
                      "text-xs mb-1 w-6 h-6 flex items-center justify-center mx-auto rounded-full",
                      isToday
                        ? "bg-primary text-primary-foreground font-bold"
                        : inMonth
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </div>
                  <div className="space-y-0.5">
                    {visibleItems.slice(0, 2).map((item) => (
                      <ItemChip key={item.id} item={item as EventItem | HomeworkItem} />
                    ))}
                    {visibleItems.length > 2 && (
                      <div className="text-[10px] text-muted-foreground pl-0.5">
                        +{visibleItems.length - 2}
                      </div>
                    )}
                    {hasLessons && visibleItems.length === 0 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mx-auto mt-2" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Day detail modal */}
      <Modal
        open={selectedDate !== null}
        onClose={() => setSelectedDate(null)}
        title={
          selectedDate
            ? cap(format(selectedDate, "EEEE, d MMMM yyyy", { locale: pl }))
            : ""
        }
        className="max-w-lg"
      >
        <div className="space-y-4">
          {selectedItems.length === 0 && (
            <p className="text-muted-foreground text-sm text-center py-4">
              Brak zajęć w tym dniu
            </p>
          )}

          {selectedEvents.length > 0 && (
            <section className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Wydarzenia
              </div>
              {selectedEvents.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </section>
          )}

          {selectedHomework.length > 0 && (
            <section className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Prace domowe
              </div>
              {selectedHomework.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </section>
          )}

          {selectedLessons.length > 0 && (
            <section className="space-y-2">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Plan lekcji
              </div>
              {selectedLessons.map((item) => (
                <ItemCard key={item.id} item={item} />
              ))}
            </section>
          )}
        </div>
      </Modal>
    </>
  );
}
