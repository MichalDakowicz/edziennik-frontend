import type { DayOfWeek, LessonHour, Subject, TimetableEntry, Zajecia } from "../../types/api";

interface TimetableGridProps {
  days: DayOfWeek[];
  hours: LessonHour[];
  entries: TimetableEntry[];
  zajecia: Zajecia[];
  subjects: Subject[];
}

export default function TimetableGrid({ days, hours, entries, zajecia, subjects }: TimetableGridProps) {
  const now = new Date();
  const currentDay = now.getDay() === 0 ? 7 : now.getDay();
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:00`;

  const dayColumns = [...days].filter((day) => day.Numer >= 1 && day.Numer <= 5).sort((a, b) => a.Numer - b.Numer);
  const hourRows = [...hours].sort((a, b) => a.Numer - b.Numer);

  const getCellText = (dayId: number, hourId: number): string => {
    const entry = entries.find(
      (item) => (item.dzien_tygodnia ?? item.DzienTygodnia) === dayId && item.godzina_lekcyjna === hourId,
    );
    if (!entry) return "–";
    const lesson = zajecia.find((item) => item.id === entry.zajecia);
    if (!lesson) return "–";
    const subject = subjects.find((item) => item.id === lesson.przedmiot);
    return subject?.nazwa ?? subject?.Nazwa ?? `#${lesson.przedmiot}`;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-[700px] w-full border border-border/50 rounded-xl overflow-hidden text-sm">
        <thead className="bg-secondary">
          <tr>
            <th className="p-3 text-left">Godzina</th>
            {dayColumns.map((day) => (
              <th key={day.id} className={`p-3 text-left ${day.Numer === currentDay ? "bg-primary/20" : ""}`}>{day.Nazwa}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {hourRows.map((hour) => (
            <tr key={hour.id} className="border-t border-border/50">
              <td className="p-3 text-muted-foreground">{hour.Numer}. {hour.CzasOd.slice(0, 5)}-{hour.CzasDo.slice(0, 5)}</td>
              {dayColumns.map((day) => {
                const inCurrentLesson = day.Numer === currentDay && hour.CzasOd <= currentTime && hour.CzasDo >= currentTime;
                return (
                  <td key={day.id} className={`p-3 ${day.Numer === currentDay ? "bg-primary/10" : ""} ${inCurrentLesson ? "ring-2 ring-primary animate-pulse rounded-sm" : ""}`}>
                    {getCellText(day.id, hour.id)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}