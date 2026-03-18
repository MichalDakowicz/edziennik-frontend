import type { Attendance, LessonHour } from "../../types/api";
import { Badge } from "../ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";
import { formatDate } from "../../utils/dateUtils";

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
    <div className="rounded-xl border border-border overflow-hidden bg-card">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent border-b border-border">
            <TableHead className="text-muted-foreground font-semibold">Data</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Godzina lekcyjna</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.length === 0 ? (
            <TableRow className="border-b border-border">
              <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                Brak danych o frekwencji
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => {
              const statusName = resolveStatusName(record.status);
              const variant = getStatusVariant(statusName);
              const hour = hourMap.get(record.godzina_lekcyjna);
              
              return (
                <TableRow key={record.id} className="hover:bg-muted/50 border-b border-border last:border-0">
                  <TableCell className="tabular-nums font-medium">
                    {formatDate(record.Data)}
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {hour?.Numer ?? record.godzina_lekcyjna}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(variant)}
                    >
                      {statusName || "-"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
