import { useMemo } from "react";
import type { Attendance, LessonHour } from "../../types/api";
import { Badge } from "../ui/Badge";

export default function AttendanceAbsencesView({
  records,
  resolveStatusName,
  getStatusVariant,
  hours,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
}: {
  records: Attendance[];
  resolveStatusName: (status: Attendance["status"]) => string;
  getStatusVariant: (statusName: string) => "danger" | "success" | "warning" | "info" | "neutral";
  hours: LessonHour[];
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
}) {
  const hourMap = new Map(hours.map((hour) => [hour.id, hour]));

  const absencesOnly = useMemo(() => {
    return records
      .filter((record) => {
        const statusName = resolveStatusName(record.status).toLowerCase();
        // Show only absences, lates, and excuses (exclude pure "present" records)
        return (
          statusName.includes("nieobecn") ||
          statusName.includes("spóźn") ||
          statusName.includes("spozn") ||
          statusName.includes("uspraw") ||
          statusName.includes("zwoln")
        );
      })
      .filter((record) => {
        const recordDate = new Date(record.Data).toISOString().split("T")[0];
        const fromDate = dateFrom ? new Date(dateFrom).toISOString().split("T")[0] : null;
        const toDate = dateTo ? new Date(dateTo).toISOString().split("T")[0] : null;

        if (fromDate && recordDate < fromDate) return false;
        if (toDate && recordDate > toDate) return false;
        return true;
      })
      .sort((a, b) => new Date(b.Data).getTime() - new Date(a.Data).getTime());
  }, [records, dateFrom, dateTo, resolveStatusName]);

  // Group by date
  const groupedByDate = useMemo(() => {
    const map = new Map<string, Attendance[]>();
    absencesOnly.forEach((record) => {
      const date = new Date(record.Data).toLocaleDateString("pl-PL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const existing = map.get(date) ?? [];
      map.set(date, [...existing, record]);
    });
    return map;
  }, [absencesOnly]);

  const getStatusColor = (variant: "danger" | "success" | "warning" | "info" | "neutral") => {
    switch (variant) {
      case "danger":
        return "text-destructive";
      case "success":
        return "text-emerald-600 dark:text-emerald-500";
      case "warning":
        return "text-amber-600 dark:text-amber-500";
      case "info":
        return "text-primary dark:text-primary/80";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-[var(--radius)] p-4 space-y-3">
        <h2 className="font-semibold text-foreground">Filtr daty</h2>
        <div className="grid md:grid-cols-2 gap-3">
          <label className="text-sm text-muted-foreground">
            Od
            <input
              className="input-base mt-1"
              type="date"
              value={dateFrom}
              onChange={(event) => onDateFromChange(event.target.value)}
            />
          </label>
          <label className="text-sm text-muted-foreground">
            Do
            <input
              className="input-base mt-1"
              type="date"
              value={dateTo}
              onChange={(event) => onDateToChange(event.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        {absencesOnly.length === 0 ? (
          <div className="bg-card border border-border rounded-[var(--radius)] p-8 text-center text-muted-foreground">
            Brak absencji w wybranym okresie
          </div>
        ) : (
          Array.from(groupedByDate.entries()).map(([date, dateRecords], index) => (
            <div key={date}>
              <div className="flex items-center gap-4 py-4">
                <h3 className="font-semibold text-foreground capitalize">{date}</h3>
                <div className="flex-1 h-px bg-border" />
              </div>
              <div className="space-y-2 mb-6">
                {dateRecords.map((record) => {
                  const statusName = resolveStatusName(record.status);
                  const variant = getStatusVariant(statusName);
                  const hour = hourMap.get(record.godzina_lekcyjna);

                  return (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="text-sm font-medium text-muted-foreground min-w-16">
                          Lekcja {hour?.Numer ?? record.godzina_lekcyjna}
                        </div>
                        {hour && (
                          <div className="text-sm text-muted-foreground">
                            {hour.CzasOd} - {hour.CzasDo}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className={getStatusColor(variant)}>
                        {statusName || "-"}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
