import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getGrades, getSubjects } from "../../services/api";
import { keys } from "../../services/queryKeys";
import { getCurrentUser } from "../../services/auth";
import { Spinner } from "../ui/Spinner";
import { ErrorState } from "../ui/ErrorState";
import { EmptyState } from "../ui/EmptyState";
import GradeModal from "./GradeModal";
import type { Grade } from "../../types/api";
import { computeWeightedAverage, formatGradeValue, getGradeColor, getSuggestedGrade } from "../../utils/gradeUtils";
import { formatDate } from "../../utils/dateUtils";

export default function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const user = getCurrentUser();
  const studentId = user?.studentId;
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

  const gradesQuery = useQuery({
    queryKey: studentId ? keys.grades(studentId) : ["grades", "na"],
    queryFn: () => getGrades(studentId as number),
    enabled: Boolean(studentId),
  });
  const subjectsQuery = useQuery({ queryKey: keys.subjects(), queryFn: getSubjects });

  const allGrades = gradesQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];

  const grades = allGrades.filter((g) => String(g.przedmiot) === subjectId);
  const subject = subjects.find((s) => String(s.id) === subjectId);
  const subjectName = subject?.nazwa ?? subject?.Nazwa ?? `#${subjectId}`;

  const avg = computeWeightedAverage(grades);
  const suggested = getSuggestedGrade(avg);

  if ([gradesQuery, subjectsQuery].some((q) => q.isPending)) return <Spinner />;
  const firstError = [gradesQuery, subjectsQuery].find((q) => q.isError);
  if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

  const sorted = [...grades].sort(
    (a, b) => Date.parse(b.data_wystawienia) - Date.parse(a.data_wystawienia)
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/dashboard/grades"
          className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground text-lg leading-none"
          aria-label="Wróć do ocen"
        >
          ←
        </Link>
        <div className="flex-1">
          <h1 className="page-title">{subjectName}</h1>
        </div>
      </div>

      {/* Stats */}
      {grades.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="stat-label">Średnia ważona</p>
            <p className="stat-value mt-1 tabular-nums">{avg.toFixed(2)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <p className="stat-label">Propozycja oceny</p>
            <p className={`stat-value mt-1 tabular-nums ${getGradeColor(suggested)}`}>{suggested}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-4 col-span-2 sm:col-span-1">
            <p className="stat-label">Liczba ocen</p>
            <p className="stat-value mt-1 tabular-nums">{grades.length}</p>
          </div>
        </div>
      )}

      {/* Grade cards */}
      {!grades.length ? (
        <EmptyState message="Brak ocen dla tego przedmiotu" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {sorted.map((grade) => (
            <button
              key={grade.id}
              onClick={() => setSelectedGrade(grade)}
              className="bg-card border border-border rounded-xl p-4 text-left hover:border-primary/50 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={`inline-flex items-center justify-center w-12 h-12 rounded-lg font-bold text-xl ${getGradeColor(grade.wartosc)}`}
                >
                  {formatGradeValue(grade.wartosc)}
                </span>
                <span className="text-xs text-muted-foreground tabular-nums mt-1">
                  {formatDate(grade.data_wystawienia)}
                </span>
              </div>
              <p className="mt-2 text-sm font-medium text-foreground line-clamp-2">
                {grade.opis || "Ocena cząstkowa"}
              </p>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-muted-foreground">Waga: {grade.waga}</span>
                {!grade.czy_do_sredniej && (
                  <span className="text-xs text-muted-foreground italic">(nie do średniej)</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <GradeModal
        open={Boolean(selectedGrade)}
        onClose={() => setSelectedGrade(null)}
        grade={selectedGrade}
        subjects={subjects}
      />
    </div>
  );
}
