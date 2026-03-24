import type { Homework, Subject, Teacher } from "../../types/api";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { formatDate, formatDateTime } from "../../utils/dateUtils";

export default function HomeworkModal({
  open,
  onClose,
  item,
  subject,
  teacher,
}: {
  open: boolean;
  onClose: () => void;
  item: Homework | null;
  subject?: Subject;
  teacher?: Teacher;
}) {
  if (!item) return null;

  const dueMs = Date.parse(item.termin);
  const now = Date.now();
  const diffDays = Math.floor((dueMs - now) / (24 * 60 * 60 * 1000));
  const isOverdue = dueMs < now;

  const dueVariant = isOverdue ? "danger" : diffDays <= 2 ? "warning" : "neutral";

  return (
    <Modal open={open} onClose={onClose} title={subject?.nazwa ?? subject?.Nazwa ?? `#${item.przedmiot}`} className="max-w-2xl">
      <div className="p-6 flex-1 overflow-y-auto space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={dueVariant}>Termin: {formatDate(item.termin)}</Badge>
          {isOverdue ? <Badge variant="danger">ZALEGŁE</Badge> : null}
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-on-surface-variant font-body">Polecenie:</h4>
          <p className="text-on-surface font-body whitespace-pre-wrap leading-relaxed">{item.opis}</p>
        </div>

        <div className="pt-4 border-t border-border/50">
          <p className="text-xs text-on-surface-variant font-body">
            Dodane przez: {teacher ? `${teacher.user.first_name} ${teacher.user.last_name}` : `#${item.nauczyciel}`}
          </p>
          <p className="text-xs text-on-surface-variant font-body">
            Dodano: {formatDateTime(item.data_wystawienia)}
          </p>
        </div>
      </div>
    </Modal>
  );
}
