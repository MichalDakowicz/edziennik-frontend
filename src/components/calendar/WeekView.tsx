import { useEffect, useState } from "react";
import { addDays, format, isSameDay, startOfWeek } from "date-fns";
import { pl } from "date-fns/locale";
import type { Event, Homework } from "../../types/api";
import { cn } from "../../utils/cn";
import { cap, getEventsForDate, getHomeworkForDate, getLessonsForDate, timeToMinutes } from "./helpers";
import { ItemCard } from "./ItemCard";
import type { TimetableData, DisplayItem } from "./types";

interface WeekViewProps {
  date: Date;
  timetable: TimetableData;
  events: Event[];
  homework: Homework[];
  onItemClick?: (item: DisplayItem) => void;
}

const START_HOUR = 7;
const END_HOUR = 18;
const MIN_PER_HOUR = 50;

const SUBJECT_COLOR_MAP: Record<string, { bg: string; border: string; text: string }> = {
  matematyka: { bg: "bg-primary/10", border: "border-l-primary", text: "text-primary" },
  fizyka: { bg: "bg-primary/10", border: "border-l-primary", text: "text-primary" },
  biologia: { bg: "bg-primary/10", border: "border-l-primary", text: "text-primary" },
  informatyka: { bg: "bg-primary/10", border: "border-l-primary", text: "text-primary" },
  chemia: { bg: "bg-primary/10", border: "border-l-primary", text: "text-primary" },
  "język polski": { bg: "bg-secondary/10", border: "border-l-secondary", text: "text-secondary" },
  polski: { bg: "bg-secondary/10", border: "border-l-secondary", text: "text-secondary" },
  historia: { bg: "bg-secondary/10", border: "border-l-secondary", text: "text-secondary" },
  angielski: { bg: "bg-secondary/10", border: "border-l-secondary", text: "text-secondary" },
  niemiecki: { bg: "bg-secondary/10", border: "border-l-secondary", text: "text-secondary" },
  rosyjski: { bg: "bg-secondary/10", border: "border-l-secondary", text: "text-secondary" },
  hiszpański: { bg: "bg-secondary/10", border: "border-l-secondary", text: "text-secondary" },
  łacina: { bg: "bg-secondary/10", border: "border-l-secondary", text: "text-secondary" },
  muzyka: { bg: "bg-tertiary/10", border: "border-l-tertiary", text: "text-tertiary" },
  plastyka: { bg: "bg-tertiary/10", border: "border-l-tertiary", text: "text-tertiary" },
  wf: { bg: "bg-emerald-500/10", border: "border-l-emerald-500", text: "text-emerald-700 dark:text-emerald-300" },
  religia: { bg: "bg-amber-500/10", border: "border-l-amber-500", text: "text-amber-700 dark:text-amber-300" },
  etyka: { bg: "bg-amber-500/10", border: "border-l-amber-500", text: "text-amber-700 dark:text-amber-300" },
  godzi: { bg: "bg-surface-container-highest/50", border: "border-l-outline", text: "text-on-surface-variant" },
};

function getSubjectColor(subject: string) {
  const lower = subject.toLowerCase();
  for (const [key, colors] of Object.entries(SUBJECT_COLOR_MAP)) {
    if (lower.includes(key)) return colors;
  }
  return null;
}

export function WeekView({ date, timetable, events, homework, onItemClick }: WeekViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const days = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i));
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const currentTimeStr = format(now, "HH:mm");

  const totalMinutes = (END_HOUR - START_HOUR) * MIN_PER_HOUR;
  
  const getTopOffset = (timeStr: string) => {
    const mins = timeToMinutes(timeStr) - (START_HOUR * 60);
    return Math.max(0, mins * (MIN_PER_HOUR / 60)); 
  };
  
  const getHeight = (startStr: string, endStr: string) => {
    const durationMins = timeToMinutes(endStr) - timeToMinutes(startStr);
    return Math.max(15, durationMins * (MIN_PER_HOUR / 60));
  };
  
  const currentMinutesOffset = getTopOffset(currentTimeStr);
  const isCurrentTimeVisible = currentMinutesOffset >= 0 && currentMinutesOffset <= totalMinutes;

  return (
    <div className="-mx-4 md:-mx-8">
      {/* Timetable Grid */}
      <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-outline-variant/10">
        {/* Day Headers */}
        <div className="grid grid-cols-[50px_repeat(5,minmax(0,1fr))] bg-surface-container">
          <div className="py-3 text-center text-xs font-label text-outline uppercase tracking-wider">Godz</div>
          {days.map((day) => {
            const isToday = isSameDay(day, now);
            const dayEvents = getEventsForDate(day, events, timetable.subjects).filter(e => e.isAllDay);
            const dayHw = getHomeworkForDate(day, homework, timetable.subjects);
            const hasItems = dayEvents.length > 0 || dayHw.length > 0;

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  "py-2 px-1 text-center font-headline text-sm border-l border-outline-variant/10 flex flex-col items-center",
                  isToday ? "text-primary font-bold" : "text-on-surface font-medium"
                )}
              >
                <span>{cap(format(day, "EEE", { locale: pl }))}</span>
                <span className="text-xs font-normal text-on-surface-variant mt-0.5">
                  {format(day, "d MMM", { locale: pl })}
                </span>
                {hasItems && (
                  <div className="flex flex-col gap-0.5 mt-1 w-full px-1">
                    {dayEvents.map((item) => (
                      <ItemCard key={item.id} item={item} compact onClick={onItemClick} />
                    ))}
                    {dayHw.map((item) => (
                      <ItemCard key={item.id} item={item} compact onClick={onItemClick} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Main Grid */}
        <div className="relative grid grid-cols-[50px_repeat(5,minmax(0,1fr))] bg-surface-container-lowest dark:bg-surface" style={{ minHeight: `${totalMinutes}px` }}>
          {/* Current Time Indicator */}
          {isCurrentTimeVisible && days.some(d => isSameDay(d, now)) && (
            <div 
              className="absolute w-full border-t-2 border-error z-30 flex items-center pointer-events-none"
              style={{ top: `${currentMinutesOffset}px` }}
            >
              <span className="bg-error text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-[50px] -translate-y-1/2">
                {currentTimeStr}
              </span>
            </div>
          )}

          {/* Hours Column */}
          <div className="flex flex-col border-r border-outline-variant/10">
            {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
              <div
                key={`hour-${i}`}
                className="flex items-start justify-center text-xs text-outline font-label border-b border-outline-variant/5 pt-1"
                style={{ height: `${MIN_PER_HOUR}px` }}
              >
                {String(START_HOUR + i).padStart(2, '0')}:00
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {days.map((day) => {
            const lessons = getLessonsForDate(day, timetable);
            const dayEvents = getEventsForDate(day, events, timetable.subjects).filter(e => !e.isAllDay);
            const isToday = isSameDay(day, now);

            return (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "relative p-1.5 border-l border-outline-variant/10 space-y-1.5",
                  isToday && "bg-primary/[0.02]"
                )}
              >
                {/* Lessons */}
                {lessons.map(lesson => {
                  const top = getTopOffset(lesson.startTime);
                  const height = getHeight(lesson.startTime, lesson.endTime);
                  const colors = getSubjectColor(lesson.subject);

                  const overlappingEvents = dayEvents.filter(ev => {
                    if (!ev.startTime || !ev.endTime) return false;
                    return (ev.startTime < lesson.endTime && ev.endTime > lesson.startTime);
                  });

                  const widthClass = overlappingEvents.length > 0 ? "w-[calc(50%-2px)]" : "w-[calc(100%-3px)]";

                  return (
                    <div
                      key={lesson.id}
                      onClick={() => onItemClick?.(lesson)}
                      className={cn(
                        "absolute left-0 rounded-xl p-1.5 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all group",
                        colors ? colors.bg : "bg-primary/10",
                        colors ? colors.border : "border-l-primary",
                        widthClass
                      )}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <div className="min-w-0">
                        <h4 className={cn(
                          "font-headline font-bold text-xs leading-tight truncate",
                          colors ? colors.text : "text-primary"
                        )}>
                          {lesson.subject}
                        </h4>
                        <p className="text-[9px] font-medium text-on-surface-variant/80 mt-0.5 truncate">
                          {lesson.startTime} - {lesson.endTime}
                        </p>
                      </div>
                      <span className={cn(
                        "material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all self-end shrink-0",
                        colors ? colors.text : "text-primary"
                      )}>
                        east
                      </span>
                    </div>
                  );
                })}

                {/* Timed Events */}
                {dayEvents.map(ev => {
                  if (!ev.startTime || !ev.endTime) return null;
                  const top = getTopOffset(ev.startTime);
                  const height = getHeight(ev.startTime, ev.endTime);

                  const overlappingLessons = lessons.filter(lesson => {
                    return (ev.startTime! < lesson.endTime && ev.endTime! > lesson.startTime);
                  });

                  const leftClass = overlappingLessons.length > 0 ? "left-[calc(50%+2px)]" : "left-0";
                  const widthClass = overlappingLessons.length > 0 ? "w-[calc(50%-2px)]" : "w-[calc(100%-3px)]";

                  return (
                    <div
                      key={ev.id}
                      onClick={() => onItemClick?.(ev)}
                      className={cn(
                        "absolute rounded-xl p-1.5 border-l-4 border-error bg-error-container/30 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all z-10",
                        leftClass,
                        widthClass
                      )}
                      style={{ top: `${top}px`, height: `${height}px` }}
                    >
                      <div className="min-w-0">
                        <h4 className="font-headline font-bold text-xs text-error leading-tight truncate">{ev.title}</h4>
                        <p className="text-[9px] font-medium text-on-surface-variant/80 mt-0.5 truncate">Wydarzenie</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
