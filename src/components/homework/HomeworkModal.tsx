import type { Homework, Subject, Teacher } from "../../types/api";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { formatDate, formatDateTime } from "../../utils/dateUtils";
import { CalendarDays, User, Clock, FileText } from "lucide-react";

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
  const subjectName = subject?.nazwa ?? subject?.Nazwa ?? `#${item.przedmiot}`;

  return (
    <Modal open={open} onClose={onClose} title={subjectName} className="max-w-2xl">
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {/* Status badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={dueVariant}>
            <CalendarDays size={14} className="inline mr-1" />
            Termin: {formatDate(item.termin)}
          </Badge>
          {isOverdue && <Badge variant="danger">ZALEGŁE</Badge>}
          {diffDays >= 0 && diffDays <= 2 && !isOverdue && (
            <Badge variant="warning">
              <Clock size={14} className="inline mr-1" />
              {diffDays === 0 ? "Dzisiaj" : diffDays === 1 ? "Jutro" : `Za ${diffDays} dni`}
            </Badge>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText size={16} className="text-on-surface-variant" />
            <h4 className="text-sm font-semibold text-on-surface-variant font-body">Polecenie:</h4>
          </div>
          <div className="bg-surface-container-low/50 rounded-xl p-4">
            <p className="text-on-surface font-body whitespace-pre-wrap leading-relaxed">{item.opis}</p>
          </div>
        </div>

        {/* Teacher & date info */}
        <div className="pt-4 border-t border-outline-variant/15 space-y-3">
          <div className="flex items-center gap-2 text-on-surface-variant font-body">
            <User size={16} />
            <p className="text-sm">
              Dodane przez: {teacher ? `${teacher.user.first_name} ${teacher.user.last_name}` : `#${item.nauczyciel}`}
            </p>
          </div>
          <div className="flex items-center gap-2 text-on-surface-variant font-body">
            <Clock size={16} />
            <p className="text-sm">Dodano: {formatDateTime(item.data_wystawienia)}</p>
          </div>
        </div>
      </div>
    </Modal>
  );
}
