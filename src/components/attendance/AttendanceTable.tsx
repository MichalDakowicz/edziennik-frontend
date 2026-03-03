import type { Attendance, LessonHour } from "../../types/api";
import { Badge } from "../ui/Badge";

export default function AttendanceTable({
  records,
  resolveStatusName,
  getStatusVariant,
  hours,
}: {
  records: Attendance[];
  resolveStatusName: (status: Attendance["status"]) => string;
  getStatusVariant: (statusName: string) => "danger" | "success" | "warning" | "info" | "neutral";
  hours: LessonHour[];
}) {
  const hourMap = new Map(hours.map((hour) => [hour.id, hour]));

  return (
    <div className="overflow-x-auto border border-border/50 rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-secondary">
          <tr>
            <th className="text-left p-3">Data</th>
            <th className="text-left p-3">Godzina lekcyjna</th>
            <th className="text-left p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => {
            const statusName = resolveStatusName(record.status);
            const hour = hourMap.get(record.godzina_lekcyjna);
            return (
              <tr key={record.id} className="border-t border-border/50">
                <td className="p-3">{new Date(record.Data).toLocaleDateString("pl-PL")}</td>
                <td className="p-3">{hour?.Numer ?? record.godzina_lekcyjna}</td>
                <td className="p-3"><Badge variant={getStatusVariant(statusName)}>{statusName || "-"}</Badge></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}