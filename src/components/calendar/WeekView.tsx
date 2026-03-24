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

export function WeekView({ date, timetable, events, homework, onItemClick }: WeekViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const days = Array.from({ length: 5 }, (_, i) => addDays(weekStart, i)); // 5 days (mon-fri)
  const now = new Date();
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
    <div className="space-y-4 h-fit">
      {/* Week Timeline grid */}
      <div className="relative border-border pt-4 pb-4">
        <div className="w-full">
          
          {/* Day headers sticky */}
          <div className="grid grid-cols-[48px_repeat(5,minmax(0,1fr))] gap-1 md:gap-2 mb-2 sticky top-0 bg-background/95 backdrop-blur z-30 pb-2 pb-2">
            <div />
            {days.map((day) => {
              const isToday = isSameDay(day, now);
              const dayEvents = getEventsForDate(day, events, timetable.subjects).filter(e => e.isAllDay);
              const dayHw = getHomeworkForDate(day, homework, timetable.subjects);
              const hasItems = dayEvents.length > 0 || dayHw.length > 0;
              
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "p-1 md:p-2 rounded-lg flex flex-col min-w-0",
                    isToday
                      ? "bg-primary/20 border border-primary/30"
                      : "bg-card/50 /50",
                  )}
                >
                  <div className="text-[10px] md:text-xs text-on-surface-variant font-body text-center">
                    {cap(format(day, "EEE", { locale: pl }))}
                  </div>
                  <div className="text-xs md:text-sm font-medium text-center mb-1">{format(day, "d MMM", { locale: pl })}</div>
                  
                  {hasItems && (
                    <div className="flex flex-col gap-1 mt-auto min-w-0">
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

          {/* Main Grid Area */}
          <div className="relative grid grid-cols-[48px_minmax(0,1fr)] mt-2">
            
             {/* Left Time Axis */}
             <div className="relative border-r border-border/40" style={{ height: `${totalMinutes}px` }}>
                {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                  <div 
                    key={`hour-label-${i}`} 
                    className="absolute right-1 md:right-2 text-[10px] text-on-surface-variant font-body"
                    style={{ top: `${i * MIN_PER_HOUR - 8}px` }}
                  >
                     {String(START_HOUR + i).padStart(2, '0')}:00
                  </div>
                ))}
             </div>

             {/* Days Columns */}
             <div className="relative grid grid-cols-5 gap-1 md:gap-2 min-w-0" style={{ height: `${totalMinutes}px` }}>
                
                {/* Background Grid Lines scale across all days */}
                <div className="absolute inset-0 pointer-events-none">
                   {Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => (
                      <div 
                        key={`hour-grid-${i}`} 
                        className="absolute left-0 right-0 border-t border-border/20"
                        style={{ top: `${i * MIN_PER_HOUR}px` }}
                      />
                   ))}

                   {/* Current Time Line spanning all days */}
                   {isCurrentTimeVisible && days.some(d => isSameDay(d, now)) && (
                      <div 
                        className="absolute left-0 right-0 z-20 flex items-center"
                        style={{ top: `${currentMinutesOffset}px` }}
                      >
                         <div className="w-full h-[2px] bg-red-500 opacity-60" />
                      </div>
                   )}
                </div>

                {days.map((day) => {
                   const lessons = getLessonsForDate(day, timetable);
                   const dayEvents = getEventsForDate(day, events, timetable.subjects).filter(e => !e.isAllDay);
                   
                   return (
                     <div key={day.toISOString()} className="relative h-full border-r border-border/10 last:border-r-0 mx-px min-w-0">
                        
                        {/* Day's Lessons */}
                        {lessons.map(lesson => {
                           const top = getTopOffset(lesson.startTime);
                           const height = getHeight(lesson.startTime, lesson.endTime);
                           
                           const overlappingEvents = dayEvents.filter(ev => {
                               if (!ev.startTime || !ev.endTime) return false;
                               return (ev.startTime < lesson.endTime && ev.endTime > lesson.startTime);
                           });
                           
                           const widthClass = overlappingEvents.length > 0 ? "w-[calc(50%-2px)]" : "w-[calc(100%-4px)]";
                           
                           return (
                             <div
                               key={lesson.id}
                               onClick={() => onItemClick?.(lesson)}
                               className={cn(
                                 "absolute left-0 rounded-md p-0.5 md:p-1 text-[9px] md:text-xs overflow-hidden flex flex-col shadow-sm text-white cursor-pointer hover:brightness-110",
                                 widthClass
                               )}
                               style={{ 
                                 top: `${top}px`, 
                                 height: `${height}px`,
                                 backgroundColor: `hsl(${(lesson.subject.length * 40) % 360}, 60%, 40%)` 
                               }}
                               title={`${lesson.startTime}-${lesson.endTime} ${lesson.subject}`}
                             >
                               <div className="font-semibold leading-tight line-clamp-2 md:line-clamp-3">{lesson.subject}</div>
                             </div>
                           );
                        })}
                        
                        {/* Day's Events */}
                        {dayEvents.map(ev => {
                           if (!ev.startTime || !ev.endTime) return null;
                           const top = getTopOffset(ev.startTime);
                           const height = getHeight(ev.startTime, ev.endTime);
                           
                           const overlappingLessons = lessons.filter(lesson => {
                               return (ev.startTime! < lesson.endTime && ev.endTime! > lesson.startTime);
                           });
                           
                           const leftClass = overlappingLessons.length > 0 ? "left-[calc(50%+2px)]" : "left-0";
                           const widthClass = overlappingLessons.length > 0 ? "w-[calc(50%-2px)]" : "w-[calc(100%-4px)]";
                           
                           return (
                             <div
                               key={ev.id}
                               onClick={() => onItemClick?.(ev)}
                               className={cn(
                                 "absolute rounded-md p-0.5 md:p-1 border text-[9px] md:text-[10px] overflow-hidden flex flex-col shadow-sm z-10 bg-gray-600 border-gray-500 text-white cursor-pointer hover:brightness-110",
                                 leftClass,
                                 widthClass
                               )}
                               style={{ 
                                 top: `${top}px`, 
                                 height: `${height}px`,
                               }}
                               title={`${ev.startTime}-${ev.endTime} ${ev.title}`}
                             >
                               <div className="font-semibold line-clamp-1 md:line-clamp-2 leading-tight">{ev.title}</div>
                             </div>
                           );
                        })}
                     </div>
                   );
                })}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
