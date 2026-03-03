import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHomework, getSubjects, getTeachers } from "../../services/api";
import { keys } from "../../services/queryKeys";
import { getCurrentUser } from "../../services/auth";
import { ErrorState } from "../ui/ErrorState";
import { Spinner } from "../ui/Spinner";
import HomeworkCard from "./HomeworkCard";

export default function HomeworkPage() {
  const user = getCurrentUser();
  const classId = user?.classId;
  const [subjectId, setSubjectId] = useState<number | "all">("all");
  const [showOverdue, setShowOverdue] = useState(false);
  const [pastOpen, setPastOpen] = useState(false);

  const homeworkQuery = useQuery({
    queryKey: classId ? ["homework-page", classId, subjectId] : ["homework-page", "na"],
    queryFn: () => getHomework(classId as number, subjectId === "all" ? undefined : subjectId),
    enabled: Boolean(classId),
  });
  const subjectsQuery = useQuery({ queryKey: keys.subjects(), queryFn: getSubjects });
  const teachersQuery = useQuery({ queryKey: keys.teachers(), queryFn: getTeachers });

  if (!classId) return <ErrorState message="Brak przypisanej klasy" />;
  if ([homeworkQuery, subjectsQuery, teachersQuery].some((q) => q.isPending)) return <Spinner />;
  const firstError = [homeworkQuery, subjectsQuery, teachersQuery].find((q) => q.isError);
  if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

  const homework = homeworkQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const teachers = teachersQuery.data ?? [];

  const filtered = showOverdue ? homework : homework.filter((item) => Date.parse(item.termin) >= Date.now());

  const upcoming = useMemo(
    () => [...filtered].filter((item) => Date.parse(item.termin) >= Date.now()).sort((a, b) => Date.parse(a.termin) - Date.parse(b.termin)),
    [filtered],
  );
  const past = useMemo(
    () => [...homework].filter((item) => Date.parse(item.termin) < Date.now()).sort((a, b) => Date.parse(b.termin) - Date.parse(a.termin)),
    [homework],
  );

  return (
    <div className="space-y-4">
      <h1 className="page-title">Prace domowe</h1>
      <div className="bg-secondary border border-border/50 rounded-xl p-4 flex flex-wrap gap-3">
        <label className="text-sm text-muted-foreground">
          Przedmiot
          <select className="input-base mt-1" value={subjectId} onChange={(event) => setSubjectId(event.target.value === "all" ? "all" : Number(event.target.value))}>
            <option value="all">Wszystkie</option>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.nazwa ?? subject.Nazwa ?? `#${subject.id}`}</option>)}
          </select>
        </label>
        <label className="text-sm text-muted-foreground flex items-end gap-2">
          <input type="checkbox" checked={showOverdue} onChange={(event) => setShowOverdue(event.target.checked)} />
          Pokaż zaległe
        </label>
      </div>

      <section className="space-y-3">
        <h2 className="section-title">Nadchodzące</h2>
        {upcoming.length ? upcoming.map((item) => <HomeworkCard key={item.id} item={item} subject={subjects.find((s) => s.id === item.przedmiot)} teacher={teachers.find((t) => t.id === item.nauczyciel)} />) : <p className="text-muted-foreground">Brak nadchodzących prac</p>}
      </section>

      <section className="space-y-3">
        <button className="btn-ghost" onClick={() => setPastOpen((v) => !v)}>{pastOpen ? "Ukryj minione" : "Pokaż minione"}</button>
        {pastOpen ? past.map((item) => <HomeworkCard key={item.id} item={item} subject={subjects.find((s) => s.id === item.przedmiot)} teacher={teachers.find((t) => t.id === item.nauczyciel)} />) : null}
      </section>
    </div>
  );
}