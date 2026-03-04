import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBehaviorPoints, getFinalGrades, getGrades, getPeriodGrades, getSubjects } from "../../services/api";
import { keys } from "../../services/queryKeys";
import { getCurrentUser } from "../../services/auth";
import { Spinner } from "../ui/Spinner";
import { ErrorState } from "../ui/ErrorState";
import { EmptyState } from "../ui/EmptyState";
import type { Grade } from "../../types/api";
import GradeCard from "./GradeCard";
import GradeModal from "./GradeModal";
import GradeSimulator from "./GradeSimulator";
import PeriodGrades from "./PeriodGrades";
import BehaviorPoints from "./BehaviorPoints";

type Tab = "partial" | "period" | "behavior";

export default function GradesPage() {
  const user = getCurrentUser();
  const studentId = user?.studentId;
  const [tab, setTab] = useState<Tab>("partial");
  const [search, setSearch] = useState("");
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [showLastWeekOnly, setShowLastWeekOnly] = useState(false);

  const enabled = Boolean(studentId);

  const gradesQuery = useQuery({ queryKey: studentId ? keys.grades(studentId) : ["grades", "na"], queryFn: () => getGrades(studentId as number), enabled });
  const periodQuery = useQuery({ queryKey: studentId ? keys.periodGrades(studentId) : ["period", "na"], queryFn: () => getPeriodGrades(studentId as number), enabled });
  const finalQuery = useQuery({ queryKey: studentId ? keys.finalGrades(studentId) : ["final", "na"], queryFn: () => getFinalGrades(studentId as number), enabled });
  const behaviorQuery = useQuery({ queryKey: studentId ? keys.behavior(studentId) : ["behavior", "na"], queryFn: () => getBehaviorPoints(studentId as number), enabled });
  const subjectsQuery = useQuery({ queryKey: keys.subjects(), queryFn: getSubjects });

  const grades = gradesQuery.data ?? [];
  const periodGrades = periodQuery.data ?? [];
  const finalGrades = finalQuery.data ?? [];
  const behavior = behaviorQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];

  const grouped = useMemo(() => {
    const map = new Map<number, Grade[]>();
    let filteredGrades = grades;

    // Filtruj oceny z ostatniego tygodnia jeśli jest włączone
    if (showLastWeekOnly) {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 *24 * 60 * 60 * 1000);
      filteredGrades = grades.filter((grade) => {
        const gradeDate = new Date(grade.data_wystawienia);
        return gradeDate >= sevenDaysAgo && gradeDate <= now;
      });
    }

    filteredGrades.forEach((grade) => {
      const current = map.get(grade.przedmiot) ?? [];
      current.push(grade);
      map.set(grade.przedmiot, current);
    });
    return map;
  }, [grades, showLastWeekOnly]);

  if (!studentId) return <ErrorState message="Brak przypisanego ucznia" />;
  if ([gradesQuery, periodQuery, finalQuery, behaviorQuery, subjectsQuery].some((q) => q.isPending)) return <Spinner />;

  const firstError = [gradesQuery, periodQuery, finalQuery, behaviorQuery, subjectsQuery].find((q) => q.isError);
  if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

  return (
    <div className="space-y-4">
      <h1 className="page-title">Oceny</h1>
      <div className="flex gap-4 border-b border-border/50">
        <button className={tab === "partial" ? "tab-active" : "tab-inactive"} onClick={() => setTab("partial")}>Oceny cząstkowe</button>
        <button className={tab === "period" ? "tab-active" : "tab-inactive"} onClick={() => setTab("period")}>Oceny okresowe</button>
        <button className={tab === "behavior" ? "tab-active" : "tab-inactive"} onClick={() => setTab("behavior")}>Zachowanie</button>
      </div>

      {tab === "partial" ? (
        <>
          <div className="flex gap-2">
            <input className="input-base flex-1" placeholder="Filtruj przedmiot..." value={search} onChange={(event) => setSearch(event.target.value)} />
            <button
              onClick={() => setShowLastWeekOnly(!showLastWeekOnly)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                showLastWeekOnly
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              Ostatni tydzień
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {[...grouped.entries()]
              .filter(([subjectId]) => {
                const subject = subjects.find((item) => item.id === subjectId);
                const name = (subject?.nazwa ?? subject?.Nazwa ?? "").toLowerCase();
                return name.includes(search.toLowerCase());
              })
              .map(([subjectId, subjectGrades]) => {
                const subject = subjects.find((item) => item.id === subjectId);
                return (
                  <GradeCard
                    key={subjectId}
                    subjectName={subject?.nazwa ?? subject?.Nazwa ?? `#${subjectId}`}
                    grades={subjectGrades}
                    onSelect={setSelectedGrade}
                  />
                );
              })}
          </div>
          {!grouped.size ? <EmptyState message="Brak ocen" /> : null}
          <GradeSimulator grades={grades} subjects={subjects} />
          <GradeModal open={Boolean(selectedGrade)} onClose={() => setSelectedGrade(null)} grade={selectedGrade} subjects={subjects} />
        </>
      ) : null}

      {tab === "period" ? <PeriodGrades periodGrades={periodGrades} finalGrades={finalGrades} subjects={subjects} /> : null}
      {tab === "behavior" ? <BehaviorPoints behavior={behavior} /> : null}
    </div>
  );
}