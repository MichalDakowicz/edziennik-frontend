import { useEffect, useState } from "react";
import { format, isSameDay } from "date-fns";
import { pl } from "date-fns/locale";
import type { Event, Homework } from "../../types/api";
import { cn } from "../../utils/cn";
import { cap, getEventsForDate, getHomeworkForDate, getLessonsForDate, timeToMinutes } from "./helpers";
import { ItemCard } from "./ItemCard";
import type { TimetableData, DisplayItem } from "./types";

interface DayViewProps {
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

export function DayView({ date, timetable, events, homework, onItemClick }: DayViewProps) {
  const lessons = getLessonsForDate(date, timetable);
  const allEvents = getEventsForDate(date, events, timetable.subjects);
  const dayHomework = getHomeworkForDate(date, homework, timetable.subjects);

  const dayEvents = allEvents.filter((e) => e.isAllDay);
  const timedEvents = allEvents.filter((e) => !e.isAllDay);

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(interval);
  }, []);

  const currentTimeStr = format(now, "HH:mm");
  const isToday = isSameDay(date, now);

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
    <div className="space-y-6">
      {/* Day Header */}
      <div className="bg-surface-container-lowest rounded-3xl p-4">
        <h2 className="text-2xl font-extrabold text-on-surface font-headline tracking-tight">
          {cap(format(date, "EEEE, d MMMM yyyy", { locale: pl }))}
        </h2>
        
        {(dayEvents.length > 0 || dayHomework.length > 0) && (
          <div className="space-y-2 mt-3">
            {dayEvents.map((item) => (
              <ItemCard key={item.id} item={item} onClick={onItemClick} />
            ))}
            {dayHomework.map((item) => (
              <ItemCard key={item.id} item={item} onClick={onItemClick} />
            ))}
          </div>
        )}
      </div>

      {/* Timeline Grid */}
      <div className="bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm border border-outline-variant/10">
        <div className="relative" style={{ height: `${totalMinutes}px` }}>
          {/* Background Hour Lines */}
          {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
            <div 
              key={`hour-line-${i}`} 
              className="absolute left-0 right-0 border-t border-outline-variant/10"
              style={{ top: `${i * MIN_PER_HOUR}px` }}
            />
          ))}

          {/* Hour Labels */}
          {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
            <div 
              key={`hour-label-${i}`} 
              className="absolute left-2 text-xs text-outline font-label"
              style={{ top: `${i * MIN_PER_HOUR - 8}px` }}
            >
              {String(START_HOUR + i).padStart(2, '0')}:00
            </div>
          ))}

          {/* Current Time Indicator */}
          {isToday && isCurrentTimeVisible && (
            <div 
              className="absolute left-8 right-0 z-30 pointer-events-none flex items-center"
              style={{ top: `${currentMinutesOffset}px` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-error -ml-1.25 ring-2 ring-error/30" />
              <div className="flex-1 h-[2px] bg-error opacity-60" />
            </div>
          )}

          {/* Content Area */}
          <div className="absolute left-10 right-3 top-0 bottom-0">
            {/* Lessons */}
            {lessons.map(lesson => {
              const top = getTopOffset(lesson.startTime);
              const height = getHeight(lesson.startTime, lesson.endTime);
              const colors = getSubjectColor(lesson.subject);

              const overlappingEvents = timedEvents.filter(ev => {
                if (!ev.startTime || !ev.endTime) return false;
                return (ev.startTime < lesson.endTime && ev.endTime > lesson.startTime);
              });

              const widthClass = overlappingEvents.length > 0 ? "w-[calc(50%-4px)]" : "w-full";

              return (
                <div
                  key={lesson.id}
                  onClick={() => onItemClick?.(lesson)}
                  className={cn(
                    "absolute left-0 rounded-xl p-3 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all group",
                    colors ? colors.bg : "bg-primary/10",
                    colors ? colors.border : "border-l-primary",
                    widthClass
                  )}
                  style={{ top: `${top}px`, height: `${height}px` }}
                >
                  <div>
                    <h4 className={cn(
                      "font-headline font-bold text-sm",
                      colors ? colors.text : "text-primary"
                    )}>
                      {lesson.subject}
                    </h4>
                    <p className="text-[10px] font-medium text-on-surface-variant mt-0.5">
                      {lesson.startTime} - {lesson.endTime}
                    </p>
                  </div>
                  <span className={cn(
                    "material-symbols-outlined text-xs opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all self-end",
                    colors ? colors.text : "text-primary"
                  )}>
                    east
                  </span>
                </div>
              );
            })}

            {/* Timed Events */}
            {timedEvents.map(ev => {
              if (!ev.startTime || !ev.endTime) return null;
              const top = getTopOffset(ev.startTime);
              const height = getHeight(ev.startTime, ev.endTime);

              const overlappingLessons = lessons.filter(lesson => {
                return (ev.startTime! < lesson.endTime && ev.endTime! > lesson.startTime);
              });

              const leftClass = overlappingLessons.length > 0 ? "left-[calc(50%+4px)]" : "left-0";
              const widthClass = overlappingLessons.length > 0 ? "w-[calc(50%-4px)]" : "w-full";

              return (
                <div
                  key={ev.id}
                  onClick={() => onItemClick?.(ev)}
                  className={cn(
                    "absolute rounded-xl p-3 border-l-4 border-error bg-error-container/30 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-all z-10",
                    leftClass,
                    widthClass
                  )}
                  style={{ top: `${top}px`, height: `${height}px` }}
                >
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                      <h4 className="font-headline font-bold text-sm text-error">{ev.title}</h4>
                    </div>
                    <p className="text-[10px] font-medium text-on-surface-variant mt-0.5">
                      {ev.startTime} - {ev.endTime} • {ev.subject || "Wydarzenie"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
