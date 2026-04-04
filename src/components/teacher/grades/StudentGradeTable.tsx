import { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/Table';
import { formatGradeValue, getGradeColor } from '../../../utils/gradeUtils';
import type { Student, Grade, PeriodGrade } from '../../../types/api';

interface StudentGradeTableProps {
  students: Student[];
  gradesByStudent: Record<number, Grade[]>;
  periodGradesByStudent: Record<number, PeriodGrade[]>;
  selectedSubjectId: number | null;
  isLoading?: boolean;
  onAddPeriodGrade?: (studentId: number) => void;
  journalNumbers: Map<number, number>;
}

export default function StudentGradeTable({
  students,
  gradesByStudent,
  periodGradesByStudent,
  selectedSubjectId,
  isLoading = false,
  onAddPeriodGrade,
  journalNumbers,
}: StudentGradeTableProps) {
  const studentRows = useMemo(() => {
    return students.map((student) => {
      const grades = (gradesByStudent[student.id] || [])
        .filter((g) => g.przedmiot === selectedSubjectId)
        .sort((a, b) => new Date(b.data_wystawienia).getTime() - new Date(a.data_wystawienia).getTime());

      const periodGrades = periodGradesByStudent[student.id] || [];
      const period1 = periodGrades.find((g) => g.okres === 1);
      const period2 = periodGrades.find((g) => g.okres === 2);

      const validGrades = grades.filter((g) => g.czy_do_sredniej && !Number.isNaN(parseFloat(g.wartosc)));
      let average = 0;
      if (validGrades.length > 0) {
        const sumW = validGrades.reduce((sum, g) => sum + g.waga, 0);
        const sumWV = validGrades.reduce((sum, g) => sum + parseFloat(g.wartosc) * g.waga, 0);
        average = sumW > 0 ? sumWV / sumW : 0;
      }

      return {
        student,
        grades,
        period1,
        period2,
        average,
        journalNumber: journalNumbers.get(student.id),
      };
    });
  }, [students, gradesByStudent, periodGradesByStudent, selectedSubjectId, journalNumbers]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-on-surface-variant">Ładowanie ocen...</p>
      </div>
    );
  }

  if (studentRows.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-on-surface-variant">Brak uczniów w wybranej klasie.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-on-surface-variant font-body font-semibold">Nr</TableHead>
            <TableHead className="text-on-surface-variant font-body font-semibold">Uczeń</TableHead>
            <TableHead className="text-on-surface-variant font-body font-semibold">Oceny bieżące</TableHead>
            <TableHead className="text-on-surface-variant font-body font-semibold text-center">Średnia</TableHead>
            <TableHead className="text-on-surface-variant font-body font-semibold text-center">Okres I</TableHead>
            <TableHead className="text-on-surface-variant font-body font-semibold text-center">Okres II</TableHead>
            <TableHead className="text-on-surface-variant font-body font-semibold text-right">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {studentRows.map(({ student, grades, period1, period2, average, journalNumber }) => (
            <TableRow key={student.id} className="hover:bg-surface-container-low/50">
              <TableCell className="font-medium text-on-surface-variant font-body">
                {journalNumber ?? '-'}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                    {student.user?.first_name?.[0]}
                    {student.user?.last_name?.[0]}
                  </div>
                  <div>
                    <p className="font-headline font-bold text-on-surface text-sm">
                      {student.user?.first_name} {student.user?.last_name}
                    </p>
                    <p className="text-xs text-on-surface-variant">ID: #{student.id}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {selectedSubjectId ? (
                  grades.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {grades.slice(0, 8).map((g) => (
                        <span
                          key={g.id}
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-md font-medium tabular-nums text-xs ${getGradeColor(g.wartosc)}`}
                        >
                          {formatGradeValue(g.wartosc)}
                        </span>
                      ))}
                      {grades.length > 8 && (
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md font-medium tabular-nums text-xs bg-surface-container text-on-surface-variant">
                          +{grades.length - 8}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-on-surface-variant">Brak ocen</span>
                  )
                ) : (
                  <span className="text-xs text-on-surface-variant">Wybierz przedmiot</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {average > 0 ? (
                  <span className="font-headline font-extrabold text-lg text-primary">{average.toFixed(2)}</span>
                ) : (
                  <span className="text-on-surface-variant">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {period1 ? (
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm ${getGradeColor(period1.wartosc)}`}>
                    {formatGradeValue(period1.wartosc)}
                  </span>
                ) : (
                  <span className="text-on-surface-variant">-</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                {period2 ? (
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm ${getGradeColor(period2.wartosc)}`}>
                    {formatGradeValue(period2.wartosc)}
                  </span>
                ) : (
                  <span className="text-on-surface-variant">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <button
                  type="button"
                  onClick={() => onAddPeriodGrade?.(student.id)}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                >
                  Wystaw ocenę
                </button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
