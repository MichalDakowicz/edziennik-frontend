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

// 7:00 to 18:00 (11 hours)
const START_HOUR = 7;
const END_HOUR = 18;
const MIN_PER_HOUR = 50;

export function DayView({ date, timetable, events, homework, onItemClick }: DayViewProps) {
  const lessons = getLessonsForDate(date, timetable);
  const allEvents = getEventsForDate(date, events, timetable.subjects);
  const dayHomework = getHomeworkForDate(date, homework, timetable.subjects);

  const dayEvents = allEvents.filter((e) => e.isAllDay);
  const timedEvents = allEvents.filter((e) => !e.isAllDay);

  const now = new Date();
  const currentTimeStr = format(now, "HH:mm");
  const isToday = isSameDay(date, now);

  const totalMinutes = (END_HOUR - START_HOUR) * MIN_PER_HOUR;
  
  // Calculate vertical position (pixels) based on time (HH:mm)
  const getTopOffset = (timeStr: string) => {
    const mins = timeToMinutes(timeStr) - (START_HOUR * 60);
    return Math.max(0, mins * (MIN_PER_HOUR / 60)); 
  };
  
  // Calculate height (pixels) based on start and end time
  const getHeight = (startStr: string, endStr: string) => {
    const durationMins = timeToMinutes(endStr) - timeToMinutes(startStr);
    return Math.max(15, durationMins * (MIN_PER_HOUR / 60));
  };
  
  const currentMinutesOffset = getTopOffset(currentTimeStr);
  const isCurrentTimeVisible = currentMinutesOffset >= 0 && currentMinutesOffset <= totalMinutes;

  return (
    <div className="space-y-4">
      <div className="bg-card/50 /50 rounded-xl p-4 flex flex-col gap-3">
        <div className="text-base font-medium">
          {cap(format(date, "EEEE, d MMMM yyyy", { locale: pl }))}
        </div>
        
        {(dayEvents.length > 0 || dayHomework.length > 0) && (
          <div className="space-y-2">
            {dayEvents.map((item) => (
              <ItemCard key={item.id} item={item} onClick={onItemClick} />
            ))}
            {dayHomework.map((item) => (
              <ItemCard key={item.id} item={item} onClick={onItemClick} />
            ))}
          </div>
        )}
      </div>

      {/* Smooth Timeline Grid */}
      <div className="relative border-border pt-4 pb-4">
        <div className="w-full relative" style={{ height: `${totalMinutes}px` }}>
            
          {/* Background Hour Lines */}
          {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
            <div 
              key={`hour-line-${i}`} 
              className="absolute left-0 right-0 border-t border-border/40 flex items-start"
              style={{ top: `${i * MIN_PER_HOUR}px` }}
            >
               <span className="text-[10px] text-on-surface-variant font-body w-12 text-right pr-2 -mt-2.5 bg-background">
                  {String(START_HOUR + i).padStart(2, '0')}:00
               </span>
            </div>
          ))}

          {/* Current Time Indicator */}
          {isToday && isCurrentTimeVisible && (
            <div 
              className="absolute left-12 right-0 z-20 pointer-events-none flex items-center"
              style={{ top: `${currentMinutesOffset}px` }}
            >
              <div className="w-2 h-2 rounded-full bg-red-500 -ml-1" />
              <div className="flex-1 h-[2px] bg-red-500 opacity-70" />
            </div>
          )}

          <div className="absolute left-12 right-2 top-0 bottom-0 pointer-events-none">
            {/* Lessons */}
            {lessons.map(lesson => {
               const top = getTopOffset(lesson.startTime);
               const height = getHeight(lesson.startTime, lesson.endTime);
               
               // Check for overlapping events to adjust width
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
                     "absolute left-0 rounded-md border p-1 text-xs overflow-hidden flex flex-col shadow-sm bg-[#5c2a85] text-white border-[#5c2a85] pointer-events-auto cursor-pointer hover:brightness-110",
                     widthClass
                   )}
                   style={{ 
                     top: `${top}px`, 
                     height: `${height}px`,
                   }}
                   title={`${lesson.startTime}-${lesson.endTime} ${lesson.subject}`}
                 >
                   <div className="font-semibold truncate">{lesson.subject}</div>
                   <div className="opacity-80 text-[10px] truncate">{lesson.startTime} - {lesson.endTime}</div>
                 </div>
               );
            })}
            
            {/* Timed Events */}
            {timedEvents.map(ev => {
               if (!ev.startTime || !ev.endTime) return null;
               const top = getTopOffset(ev.startTime);
               const height = getHeight(ev.startTime, ev.endTime);
               
               // Check for overlapping lessons to adjust position
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
                     "absolute rounded-md border p-1 text-xs overflow-hidden flex flex-col shadow-sm bg-gray-600 border-gray-500 text-white z-10 pointer-events-auto cursor-pointer hover:brightness-110",
                     leftClass,
                     widthClass
                   )}
                   style={{ 
                     top: `${top}px`, 
                     height: `${height}px`,
                   }}
                   title={`${ev.startTime}-${ev.endTime} ${ev.title}`}
                 >
                   <div className="font-semibold truncate">{ev.title}</div>
                   <div className="opacity-80 text-[10px] truncate">{ev.subject || "Wydarzenie"}</div>
                 </div>
               );
            })}
          </div>

        </div>
      </div>
    </div>
  );
}
