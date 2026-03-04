import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHomework, getSubjects, getTeachers } from "../../services/api";
import { keys } from "../../services/queryKeys";
import { getCurrentUser } from "../../services/auth";
import { ErrorState } from "../ui/ErrorState";
import { Spinner } from "../ui/Spinner";
import HomeworkCard from "./HomeworkCard";
import HomeworkModal from "./HomeworkModal";
import type { Homework } from "../../types/api";
import { ChevronDown } from "lucide-react";

export default function HomeworkPage() {
  const user = getCurrentUser();
  const classId = user?.classId;
  const [subjectId, setSubjectId] = useState<number | "all">("all");
  const [showPast, setShowPast] = useState(false);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);

  const homeworkQuery = useQuery({
    queryKey: classId ? ["homework-page", classId, subjectId] : ["homework-page", "na"],
    queryFn: () => getHomework(classId as number, subjectId === "all" ? undefined : subjectId),
    enabled: Boolean(classId),
  });
  const subjectsQuery = useQuery({ queryKey: keys.subjects(), queryFn: getSubjects });
  const teachersQuery = useQuery({ queryKey: keys.teachers(), queryFn: getTeachers });

  const homework = homeworkQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const teachers = teachersQuery.data ?? [];

  const upcoming = useMemo(
    () => [...homework].filter((item) => Date.parse(item.termin) >= Date.now()).sort((a, b) => Date.parse(a.termin) - Date.parse(b.termin)),
    [homework],
  );
  const past = useMemo(
    () => [...homework].filter((item) => Date.parse(item.termin) < Date.now()).sort((a, b) => Date.parse(b.termin) - Date.parse(a.termin)),
    [homework],
  );

  const displayUpcoming = upcoming.filter((item) => subjectId === "all" || item.przedmiot === subjectId);
  const displayPast = showPast ? past.filter((item) => subjectId === "all" || item.przedmiot === subjectId) : [];

  if (!classId) return <ErrorState message="Brak przypisanej klasy" />;
  if ([homeworkQuery, subjectsQuery, teachersQuery].some((q) => q.isPending)) return <Spinner />;
  const firstError = [homeworkQuery, subjectsQuery, teachersQuery].find((q) => q.isError);
  if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

  return (
    <div className="space-y-4">
      <h1 className="page-title">Prace domowe</h1>
      <div className="bg-card/50 border border-border/50 rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <label className="text-sm text-muted-foreground">
          Przedmiot
          <select className="input-base mt-1" value={subjectId} onChange={(event) => setSubjectId(event.target.value === "all" ? "all" : Number(event.target.value))}>
            <option value="all">Wszystkie</option>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.nazwa ?? subject.Nazwa ?? `#${subject.id}`}</option>)}
          </select>
        </label>
      </div>

      <section className="space-y-3">
        <h2 className="section-title">Nadchodzące</h2>
        {displayUpcoming.length ? displayUpcoming.map((item) => <HomeworkCard key={item.id} item={item} subject={subjects.find((s) => s.id === item.przedmiot)} teacher={teachers.find((t) => t.id === item.nauczyciel)} onClick={() => setSelectedHomework(item)} />) : <p className="text-muted-foreground">Brak nadchodzących prac</p>}
      </section>

      <section className="space-y-3">
        <button
          onClick={() => setShowPast((v) => !v)}
          className="flex items-center gap-2 font-medium text-foreground hover:text-primary transition-colors"
        >
          <ChevronDown size={20} className={`transition-transform ${showPast ? "rotate-180" : ""}`} />
          {showPast ? "Ukryj" : "Pokaż"} zaległe ({past.filter((item) => subjectId === "all" || item.przedmiot === subjectId).length})
        </button>
        {showPast ? displayPast.map((item) => <HomeworkCard key={item.id} item={item} subject={subjects.find((s) => s.id === item.przedmiot)} teacher={teachers.find((t) => t.id === item.nauczyciel)} onClick={() => setSelectedHomework(item)} />) : null}
        {showPast && displayPast.length === 0 ? <p className="text-muted-foreground">Brak zaległych prac</p> : null}
      </section>

      <HomeworkModal
        open={Boolean(selectedHomework)}
        onClose={() => setSelectedHomework(null)}
        item={selectedHomework}
        subject={subjects.find((s) => s.id === selectedHomework?.przedmiot)}
        teacher={teachers.find((t) => t.id === selectedHomework?.nauczyciel)}
      />
    </div>
  );
}