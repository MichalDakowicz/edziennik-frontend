import type { Grade, Subject } from "../../types/api";
import { formatDateTime } from "../../utils/dateUtils";
import { formatGradeValue, getGradeColor } from "../../utils/gradeUtils";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";

interface GradeModalProps {
  open: boolean;
  onClose: () => void;
  grade: Grade | null;
  subjects: Subject[];
}

export default function GradeModal({ open, onClose, grade, subjects }: GradeModalProps) {
  if (!grade) return null;
  const subject = subjects.find((s) => s.id === grade.przedmiot);
  const subjectName = subject?.nazwa ?? subject?.Nazwa ?? `#${grade.przedmiot}`;

  return (
    <Modal open={open} onClose={onClose} title="Szczegóły oceny">
      <div className="space-y-3 text-sm text-muted-foreground">
        <div><span className="text-muted-foreground">Przedmiot:</span> {subjectName}</div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Ocena:</span>
          <span className={`flex items-center justify-center w-8 h-8 rounded-md font-medium tabular-nums text-sm ${getGradeColor(grade.wartosc)}`}>{formatGradeValue(grade.wartosc)}</span>
        </div>
        <div><span className="text-muted-foreground">Waga:</span> {grade.waga}</div>
        <div><span className="text-muted-foreground">Kategoria / Opis:</span> {grade.opis ?? "-"}</div>
        <div><span className="text-muted-foreground">Data wystawienia:</span> {formatDateTime(grade.data_wystawienia)}</div>
        <div className="flex flex-wrap gap-2">
          <Badge variant={grade.czy_do_sredniej ? "success" : "neutral"}>Czy do średniej: {grade.czy_do_sredniej ? "Tak" : "Nie"}</Badge>
          <Badge variant={grade.czy_punkty ? "info" : "neutral"}>Czy punktowa: {grade.czy_punkty ? "Tak" : "Nie"}</Badge>
        </div>
      </div>
    </Modal>
  );
}