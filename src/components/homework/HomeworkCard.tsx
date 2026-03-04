import type { Homework, Subject, Teacher } from "../../types/api";
import { Badge } from "../ui/Badge";
import { formatDate } from "../../utils/dateUtils";

export default function HomeworkCard({
  item,
  subject,
  teacher,
  onClick,
}: {
  item: Homework;
  subject?: Subject;
  teacher?: Teacher;
  onClick: () => void;
}) {
  const dueMs = Date.parse(item.termin);
  const now = Date.now();
  const diffDays = Math.floor((dueMs - now) / (24 * 60 * 60 * 1000));
  const isOverdue = dueMs < now;

  const dueVariant = isOverdue ? "danger" : diffDays <= 2 ? "warning" : "neutral";

  return (
    <button
      onClick={onClick}
      className="bg-card/50 border border-border/50 rounded-xl p-4 space-y-2 text-left hover:border-border/80 transition-colors w-full"
    >
      <div className="flex items-center gap-2 flex-wrap justify-between">
        <Badge variant="info">{subject?.nazwa ?? subject?.Nazwa ?? `#${item.przedmiot}`}</Badge>
        <div className="flex items-center gap-2">
          <Badge variant={dueVariant}>Termin: {formatDate(item.termin)}</Badge>
          {isOverdue ? <Badge variant="danger">ZALEGŁE</Badge> : null}
        </div>
      </div>
      <p className="text-foreground text-sm line-clamp-2">{item.opis}</p>
    </button>
  );
}