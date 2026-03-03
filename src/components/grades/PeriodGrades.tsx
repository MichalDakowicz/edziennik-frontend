import type { FinalGrade, PeriodGrade, Subject } from "../../types/api";
import { formatGradeValue } from "../../utils/gradeUtils";

interface PeriodGradesProps {
  periodGrades: PeriodGrade[];
  finalGrades: FinalGrade[];
  subjects: Subject[];
}

export default function PeriodGrades({ periodGrades, finalGrades, subjects }: PeriodGradesProps) {
  const bySubject = new Map<number, { sem1?: string; sem2?: string; final?: string }>();

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

  return (
    <div className="overflow-x-auto border border-border/50 rounded-xl">
      <table className="min-w-full text-sm">
        <thead className="bg-card">
          <tr>
            <th className="text-left p-3">Przedmiot</th>
            <th className="text-left p-3">Ocena I półrocze</th>
            <th className="text-left p-3">Ocena II półrocze</th>
            <th className="text-left p-3">Ocena końcowa</th>
          </tr>
        </thead>
        <tbody>
          {[...bySubject.entries()].map(([subjectId, values]) => {
            const subject = subjects.find((s) => s.id === subjectId);
            const subjectName = subject?.nazwa ?? subject?.Nazwa ?? `#${subjectId}`;
            return (
              <tr key={subjectId} className="border-t border-border/50">
                <td className="p-3">{subjectName}</td>
                <td className="p-3">{values.sem1 ? formatGradeValue(values.sem1) : "-"}</td>
                <td className="p-3">{values.sem2 ? formatGradeValue(values.sem2) : "-"}</td>
                <td className="p-3">{values.final ? formatGradeValue(values.final) : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}