import type { FinalGrade, PeriodGrade, Subject } from "../../types/api";
import { formatGradeValue, getGradeColor } from "../../utils/gradeUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";

interface PeriodGradesProps {
  periodGrades: PeriodGrade[];
  finalGrades: FinalGrade[];
  subjects: Subject[];
}

export default function PeriodGrades({ periodGrades, finalGrades, subjects }: PeriodGradesProps) {
  const bySubject = new Map<number, { sem1?: string; sem2?: string; final?: string }>();

  periodGrades.forEach((grade) => {
    // Make sure we have a number
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
    <div className="rounded-xl border border-border overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-muted-foreground font-semibold">Przedmiot</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Ocena I półrocze</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Ocena II półrocze</TableHead>
            <TableHead className="text-muted-foreground font-semibold">Ocena końcowa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...bySubject.entries()].map(([subjectId, values]) => {
            const subject = subjects.find((s) => s.id === subjectId);
            const subjectName = subject?.nazwa ?? subject?.Nazwa ?? `#${subjectId}`;
            return (
              <TableRow key={subjectId} className="hover:bg-muted/50">
                <TableCell className="font-medium">{subjectName}</TableCell>
                <TableCell className="tabular-nums">
                  {values.sem1 ? (
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md font-medium text-sm ${getGradeColor(values.sem1)}`}>{formatGradeValue(values.sem1)}</span>
                  ) : (
                    <span className="text-muted-foreground/50">-</span>
                  )}
                </TableCell>
                <TableCell className="tabular-nums">
                  {values.sem2 ? (
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md font-medium text-sm ${getGradeColor(values.sem2)}`}>{formatGradeValue(values.sem2)}</span>
                  ) : (
                    <span className="text-muted-foreground/50">-</span>
                  )}
                </TableCell>
                <TableCell className="tabular-nums">
                  {values.final ? (
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md font-medium text-sm ${getGradeColor(values.final)}`}>{formatGradeValue(values.final)}</span>
                  ) : (
                    <span className="text-muted-foreground/50">-</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
