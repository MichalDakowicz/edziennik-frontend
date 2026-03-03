import type { Homework, Subject, Teacher } from "../../types/api";
import { Badge } from "../ui/Badge";
import { formatDate, formatDateTime } from "../../utils/dateUtils";

export default function HomeworkCard({ item, subject, teacher }: { item: Homework; subject?: Subject; teacher?: Teacher }) {
  const dueMs = Date.parse(item.termin);
  const now = Date.now();
  const diffDays = Math.floor((dueMs - now) / (24 * 60 * 60 * 1000));
  const isOverdue = dueMs < now;

  const dueVariant = isOverdue ? "danger" : diffDays <= 2 ? "warning" : "neutral";

  return (
    <div className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="info">{subject?.nazwa ?? subject?.Nazwa ?? `#${item.przedmiot}`}</Badge>
        <Badge variant={dueVariant}>Termin: {formatDate(item.termin)}</Badge>
        {isOverdue ? <Badge variant="danger">ZALEGŁE</Badge> : null}
      </div>
      <p className="text-foreground whitespace-pre-wrap">{item.opis}</p>
      <p className="text-xs text-muted-foreground">
        Dodane przez: {teacher ? `${teacher.user.first_name} ${teacher.user.last_name}` : `#${item.nauczyciel}`} · Dodano: {formatDateTime(item.data_wystawienia)}
      </p>
    </div>
  );
}