import type { FinalGrade, Grade, PeriodGrade, Subject } from "../../types/api";
import { computeWeightedAverage, formatGradeValue, getGradeColor } from "../../utils/gradeUtils";
import { EmptyState } from "../ui/EmptyState";

const SUBJECT_COLORS = [
  "bg-blue-600",
  "bg-teal-600",
  "bg-violet-600",
  "bg-rose-600",
  "bg-amber-600",
  "bg-cyan-600",
  "bg-indigo-600",
  "bg-emerald-600",
  "bg-pink-600",
  "bg-orange-600",
];

interface PeriodGradesProps {
  periodGrades: PeriodGrade[];
  finalGrades: FinalGrade[];
  subjects: Subject[];
  grades: Grade[];
}

interface SubjectValues {
  sem1?: string;
  sem2?: string;
  final?: string;
  avg?: number;
}

export default function PeriodGrades({ periodGrades, finalGrades, subjects, grades }: PeriodGradesProps) {
  const bySubject = new Map<number, SubjectValues>();

  periodGrades.forEach((grade) => {
    if (!grade.przedmiot) return;
    const current = bySubject.get(grade.przedmiot) ?? {};
    if (grade.okres === 1) current.sem1 = grade.wartosc;
    if (grade.okres === 2) current.sem2 = grade.wartosc;
    bySubject.set(grade.przedmiot, current);
  });

  finalGrades.forEach((grade) => {
    const current = bySubject.get(grade.przedmiot) ?? {};
    current.final = grade.wartosc;
    bySubject.set(grade.przedmiot, current);
  });

  // Compute per-subject weighted averages from partial grades
  const gradesBySubject = new Map<number, Grade[]>();
  grades.forEach((g) => {
    const arr = gradesBySubject.get(g.przedmiot) ?? [];
    arr.push(g);
    gradesBySubject.set(g.przedmiot, arr);
  });
  bySubject.forEach((values, subjectId) => {
    const subjectGrades = gradesBySubject.get(subjectId) ?? [];
    if (subjectGrades.length) values.avg = computeWeightedAverage(subjectGrades);
  });

  const entries = [...bySubject.entries()].sort(([aId], [bId]) => {
    const aName = (subjects.find((s) => s.id === aId)?.nazwa ?? subjects.find((s) => s.id === aId)?.Nazwa ?? "").toLowerCase();
    const bName = (subjects.find((s) => s.id === bId)?.nazwa ?? subjects.find((s) => s.id === bId)?.Nazwa ?? "").toLowerCase();
    return aName.localeCompare(bName, "pl");
  });

  if (!entries.length) return <EmptyState message="Brak ocen okresowych" />;

  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {entries.map(([subjectId, values], idx) => {
        const subject = subjects.find((s) => s.id === subjectId);
        const subjectName = subject?.nazwa ?? subject?.Nazwa ?? `#${subjectId}`;
        const colorClass = SUBJECT_COLORS[idx % SUBJECT_COLORS.length];

        const rows: { label: string; value: string | number | undefined; isGrade?: boolean }[] = [];
        if (values.sem1 !== undefined) rows.push({ label: "Ocena I półrocze", value: values.sem1, isGrade: true });
        if (values.sem2 !== undefined) rows.push({ label: "Ocena II półrocze", value: values.sem2, isGrade: true });
        if (values.final !== undefined) rows.push({ label: "Ocena roczna", value: values.final, isGrade: true });
        if (values.avg !== undefined && values.avg > 0) rows.push({ label: "Średnia ważona", value: values.avg.toFixed(2) });

        return (
          <div key={subjectId} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="flex-1 divide-y divide-border">
              {rows.length === 0 ? (
                <div className="px-4 py-3 text-sm text-muted-foreground">Brak danych</div>
              ) : (
                rows.map((row) => (
                  <div key={row.label} className="flex items-center justify-between px-4 py-3 gap-4">
                    <span className="text-sm text-muted-foreground">{row.label}</span>
                    {row.isGrade && row.value !== undefined ? (
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md font-bold text-sm ${getGradeColor(row.value as string)}`}>
                        {formatGradeValue(row.value as string)}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold tabular-nums text-foreground">{row.value ?? "—"}</span>
                    )}
                  </div>
                ))
              )}
            </div>
            <div className={`${colorClass} px-4 py-2`}>
              <span className="text-sm font-semibold text-white">{subjectName}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
