import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBehaviorPoints, getFinalGrades, getGrades, getPeriodGrades, getSubjects } from "../../services/api";
import { keys } from "../../services/queryKeys";
import { getCurrentUser } from "../../services/auth";
import { Spinner } from "../ui/Spinner";
import { ErrorState } from "../ui/ErrorState";
import { EmptyState } from "../ui/EmptyState";
import PeriodGrades from "./PeriodGrades";
import BehaviorPoints from "./BehaviorPoints";
import type { Grade } from "../../types/api";
import { computeWeightedAverage, formatGradeValue, getGradeColor, getGradeBorderColor } from "../../utils/gradeUtils";
import { AutoBreadcrumbs, useAutoBreadcrumbs } from "../ui/Breadcrumbs";

const SUBJECT_ICONS: Record<string, string> = {
  "język polski": "menu_book",
  "polski": "menu_book",
  "matematyka": "calculate",
  "fizyka": "rocket_launch",
  "chemia": "science",
  "biologia": "biotech",
  "historia": "history_edu",
  "geografia": "public",
  "angielski": "translate",
  "język angielski": "translate",
  "informatyka": "computer",
  "wf": "sports_soccer",
  "w-f": "sports_soccer",
  "wychowanie fizyczne": "sports_soccer",
  "plastyka": "palette",
  "muzyka": "music_note",
  "religia": "church",
  "etyka": "balance",
  "wos": "gavel",
  "podstawy": "foundation",
};

const SUBJECT_TONAL_PAIRS: Record<string, { bg: string; text: string; border: string }> = {
  "język polski": { bg: "bg-primary-fixed", text: "text-primary", border: "border-primary" },
  "polski": { bg: "bg-primary-fixed", text: "text-primary", border: "border-primary" },
  "matematyka": { bg: "bg-tertiary-fixed", text: "text-tertiary", border: "border-tertiary" },
  "fizyka": { bg: "bg-secondary-fixed", text: "text-secondary", border: "border-secondary" },
  "chemia": { bg: "bg-primary-fixed", text: "text-primary", border: "border-primary" },
  "biologia": { bg: "bg-tertiary-fixed", text: "text-tertiary", border: "border-tertiary" },
  "historia": { bg: "bg-secondary-fixed", text: "text-secondary", border: "border-secondary" },
  "geografia": { bg: "bg-primary-fixed", text: "text-primary", border: "border-primary" },
  "angielski": { bg: "bg-tertiary-fixed", text: "text-tertiary", border: "border-tertiary" },
  "język angielski": { bg: "bg-tertiary-fixed", text: "text-tertiary", border: "border-tertiary" },
  "informatyka": { bg: "bg-secondary-fixed", text: "text-secondary", border: "border-secondary" },
  "wf": { bg: "bg-primary-fixed", text: "text-primary", border: "border-primary" },
  "w-f": { bg: "bg-primary-fixed", text: "text-primary", border: "border-primary" },
  "wychowanie fizyczne": { bg: "bg-primary-fixed", text: "text-primary", border: "border-primary" },
  "plastyka": { bg: "bg-tertiary-fixed", text: "text-tertiary", border: "border-tertiary" },
  "muzyka": { bg: "bg-secondary-fixed", text: "text-secondary", border: "border-secondary" },
  "religia": { bg: "bg-primary-fixed", text: "text-primary", border: "border-primary" },
  "etyka": { bg: "bg-secondary-fixed", text: "text-secondary", border: "border-secondary" },
  "wos": { bg: "bg-tertiary-fixed", text: "text-tertiary", border: "border-tertiary" },
  "podstawy": { bg: "bg-primary-fixed", text: "text-primary", border: "border-primary" },
};

function getSubjectIcon(subjectName: string): string {
  const lower = subjectName.toLowerCase();
  for (const [key, icon] of Object.entries(SUBJECT_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "school";
}

function getSubjectTonalPair(subjectName: string): { bg: string; text: string; border: string } {
  const lower = subjectName.toLowerCase();
  for (const [key, pair] of Object.entries(SUBJECT_TONAL_PAIRS)) {
    if (lower.includes(key)) return pair;
  }
  return { bg: "bg-primary-fixed", text: "text-primary", border: "border-primary" };
}

type Tab = "partial" | "period" | "behavior";

export default function GradesPage() {
  const breadcrumbs = useAutoBreadcrumbs({ grades: "Oceny" });
  const user = getCurrentUser();
  const studentId = user?.studentId;
  const [tab, setTab] = useState<Tab>("partial");
  const [search, setSearch] = useState("");
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

    if (showLastWeekOnly) {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
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

  const overallAvg = useMemo(() => {
    if (grades.length === 0) return 0;
    return computeWeightedAverage(grades);
  }, [grades]);

  const behaviorTotal = useMemo(() => {
    return behavior.reduce((sum, b) => sum + b.punkty, 0);
  }, [behavior]);

  if (!studentId) return <ErrorState message="Brak przypisanego ucznia" />;
  if ([gradesQuery, periodQuery, finalQuery, behaviorQuery, subjectsQuery].some((q) => q.isPending)) return <Spinner />;

  const firstError = [gradesQuery, periodQuery, finalQuery, behaviorQuery, subjectsQuery].find((q) => q.isError);
  if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

  return (
    <div className="space-y-6">
      <AutoBreadcrumbs items={breadcrumbs} />
      <header className="pb-4">
        <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">Oceny</h1>
        <p className="text-on-surface-variant font-body text-sm mt-1">Podsumowanie ocen z bierzącego półrocza</p>
      </header>

      <div className="flex gap-4 pb-6">
        <button className={tab === "partial" ? "tab-active" : "tab-inactive"} onClick={() => setTab("partial")}>Oceny cząstkowe</button>
        <button className={tab === "period" ? "tab-active" : "tab-inactive"} onClick={() => setTab("period")}>Oceny okresowe</button>
        <button className={tab === "behavior" ? "tab-active" : "tab-inactive"} onClick={() => setTab("behavior")}>Zachowanie</button>
      </div>

      {tab === "partial" && (
        <div className="grid grid-cols-12 gap-4">
          <section className="col-span-12 lg:col-span-8 space-y-4">
            <h3 className="text-xl font-bold text-on-surface-variant font-headline mb-2 px-2">Przedmioty</h3>

            <div className="flex gap-4 mb-4">
              <input
                className="input-base flex-1 bg-surface-container-highest border-0 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary transition-all"
                placeholder="Filtruj przedmiot..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <button
                onClick={() => setShowLastWeekOnly(!showLastWeekOnly)}
                className={`px-4 py-3 rounded-xl font-medium transition-colors ${
                  showLastWeekOnly
                    ? "bg-primary text-white hover:bg-primary/90"
                    : "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-highest/80"
                }`}
              >
                Ostatni tydzień
              </button>
            </div>

            <div className="space-y-4">
              {[...grouped.entries()]
                .filter(([subjectId]) => {
                  const subject = subjects.find((item) => item.id === subjectId);
                  const name = (subject?.nazwa ?? subject?.Nazwa ?? "").toLowerCase();
                  return name.includes(search.toLowerCase());
                })
                .sort(([, aGrades], [, bGrades]) => {
                  const aSubjectId = aGrades[0]?.przedmiot;
                  const bSubjectId = bGrades[0]?.przedmiot;
                  const aName = (subjects.find((s) => s.id === aSubjectId)?.nazwa ?? subjects.find((s) => s.id === aSubjectId)?.Nazwa ?? "").toLowerCase();
                  const bName = (subjects.find((s) => s.id === bSubjectId)?.nazwa ?? subjects.find((s) => s.id === bSubjectId)?.Nazwa ?? "").toLowerCase();
                  return aName.localeCompare(bName, "pl");
                })
                .map(([subjectId, subjectGrades]) => {
                  const subject = subjects.find((item) => item.id === subjectId);
                  const subjectName = subject?.nazwa ?? subject?.Nazwa ?? `#${subjectId}`;
                  const avg = computeWeightedAverage(subjectGrades);
                  const tonal = getSubjectTonalPair(subjectName);
                  const icon = getSubjectIcon(subjectName);
                  const gradesInOrder = [...subjectGrades].sort(
                    (a, b) => Date.parse(b.data_wystawienia) - Date.parse(a.data_wystawienia)
                  );
                  return (
                    <Link
                      key={subjectId}
                      to={`/dashboard/grades/${subjectId}`}
                      className="bg-surface-container-lowest rounded-xl p-6 transition-all hover:translate-y-[-2px] hover:shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] block"
                    >
                      <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl ${tonal.bg} ${tonal.text} flex items-center justify-center`}>
                            <span className="material-symbols-outlined">{icon}</span>
                          </div>
                          <div>
                            <h4 className="font-headline font-bold text-lg text-on-surface">{subjectName}</h4>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-black ${tonal.text}`}>
                            {avg > 0 ? avg.toFixed(2) : "—"}
                          </span>
                          <p className="text-[10px] uppercase font-bold text-outline">Średnia</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        {gradesInOrder.slice(0, 8).map((grade) => (
                          <div key={grade.id} className="group relative">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold border-b-2 ${getGradeColor(grade.wartosc)} ${getGradeBorderColor(grade.wartosc)} ${!grade.czy_do_sredniej ? "opacity-60 italic" : ""}`}>
                              {formatGradeValue(grade.wartosc)}
                            </div>
                            <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-inverse-surface text-inverse-on-surface text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                              Waga: {grade.waga} | {grade.opis || "Ocena cząstkowa"}
                            </span>
                          </div>
                        ))}
                        {gradesInOrder.length > 8 && (
                          <span className="inline-flex items-center justify-center h-10 px-3 rounded-lg bg-surface-container-highest/60 text-sm font-medium text-on-surface-variant">
                            +{gradesInOrder.length - 8}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
            </div>

            {!grouped.size ? <EmptyState message="Brak ocen" /> : null}
          </section>

          <aside className="col-span-12 lg:col-span-4 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 bg-surface-container-lowest p-6 rounded-xl flex flex-col items-center shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)]">
                <span className="text-primary font-headline text-3xl font-black">
                  {overallAvg > 0 ? overallAvg.toFixed(2) : "—"}
                </span>
                <span className="text-[10px] uppercase tracking-widest text-outline font-bold mt-1">Średnia</span>
              </div>
              <div className="flex-1 bg-surface-container-lowest p-6 rounded-xl flex flex-col items-center shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)]">
                <span className="text-tertiary-container font-headline text-3xl font-black">{behaviorTotal}</span>
                <span className="text-[10px] uppercase tracking-widest text-outline font-bold mt-1">Zachowanie</span>
              </div>
            </div>
            <section className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)]">
              <h4 className="font-headline font-bold mb-4 flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>insights</span>
                Analiza Trendu
              </h4>
              <div className="space-y-4">
                {(() => {
                  const subjectAvgs = [...grouped.entries()].map(([subjectId, subjectGrades]) => {
                    const subject = subjects.find((s) => s.id === subjectId);
                    const name = subject?.nazwa ?? subject?.Nazwa ?? `#${subjectId}`;
                    const avg = computeWeightedAverage(subjectGrades);
                    const count = subjectGrades.length;
                    const recentGrades = [...subjectGrades].sort((a, b) => Date.parse(b.data_wystawienia) - Date.parse(a.data_wystawienia)).slice(0, 3);
                    const recentAvg = recentGrades.length > 0 ? computeWeightedAverage(recentGrades) : avg;
                    return { name, avg, count, recentAvg };
                  });

                  const rising = subjectAvgs.filter((s) => s.recentAvg > s.avg + 0.1).slice(0, 2);
                  const falling = subjectAvgs.filter((s) => s.recentAvg < s.avg - 0.1).slice(0, 2);

                  if (rising.length === 0 && falling.length === 0) {
                    return <p className="text-sm text-outline font-medium">Brak wyraźnych trendów do wyświetlenia.</p>;
                  }

                  return (
                    <>
                      {rising.map((s) => (
                        <div key={s.name} className="flex gap-4 items-center">
                          <div className="w-2 h-10 bg-emerald-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">{s.name} rośnie</p>
                            <p className="text-xs text-outline">Ostatnie oceny: {s.recentAvg.toFixed(2)} (vs śr. {s.avg.toFixed(2)})</p>
                          </div>
                        </div>
                      ))}
                      {falling.map((s) => (
                        <div key={s.name} className="flex gap-4 items-center">
                          <div className="w-2 h-10 bg-amber-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-bold text-on-surface">Uwaga: {s.name}</p>
                            <p className="text-xs text-outline">Ostatnie oceny: {s.recentAvg.toFixed(2)} (vs śr. {s.avg.toFixed(2)})</p>
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            </section>
          </aside>
        </div>
      )}

      {tab === "period" && <PeriodGrades periodGrades={periodGrades} finalGrades={finalGrades} subjects={subjects} grades={grades} />}
      {tab === "behavior" && <BehaviorPoints behavior={behavior} />}
    </div>
  );
}
