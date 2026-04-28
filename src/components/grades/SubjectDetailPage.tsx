import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getGrades, getSubjects } from "../../services/api";
import { keys } from "../../services/queryKeys";
import { getCurrentUser } from "../../services/auth";
import { Spinner } from "../ui/Spinner";
import { ErrorState } from "../ui/ErrorState";
import { EmptyState } from "../ui/EmptyState";
import GradeModal from "./GradeModal";
import GradeSimulator from "./GradeSimulator";
import type { Grade } from "../../types/api";
import { computeWeightedAverage, formatGradeValue, getGradeColor, getGradeBorderColor, getSuggestedGrade } from "../../utils/gradeUtils";
import { formatDate } from "../../utils/dateUtils";
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

function getSubjectIcon(subjectName: string): string {
  const lower = subjectName.toLowerCase();
  for (const [key, icon] of Object.entries(SUBJECT_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "school";
}


export default function SubjectDetailPage() {
  const { subjectId } = useParams<{ subjectId: string }>();
  const user = getCurrentUser();
  const studentId = user?.studentId;
  const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);
  const [showOnlyAverage, setShowOnlyAverage] = useState(false);

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

  const distribution = useMemo(() => {
    const counts: Record<number, number> = { 6: 0, 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    grades.forEach((g) => {
      const val = parseFloat(g.wartosc);
      const rounded = Math.round(val);
      if (rounded >= 1 && rounded <= 6) counts[rounded]++;
    });
    const total = grades.length || 1;
    return Object.entries(counts).map(([grade, count]) => ({
      grade: Number(grade),
      count,
      percentage: Math.round((count / total) * 100),
    })).reverse();
  }, [grades]);

  const trendInfo = useMemo(() => {
    if (grades.length < 2) return null;
    const sorted = [...grades].sort((a, b) => Date.parse(a.data_wystawienia) - Date.parse(b.data_wystawienia));
    const mid = Math.floor(sorted.length / 2);
    const firstHalf = computeWeightedAverage(sorted.slice(0, mid));
    const secondHalf = computeWeightedAverage(sorted.slice(mid));
    if (firstHalf === 0 || secondHalf === 0) return null;
    const diff = secondHalf - firstHalf;
    return { diff, rising: diff > 0 };
  }, [grades]);

  const recentMonthlyAvg = useMemo(() => {
    const now = new Date();
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const recent = grades.filter((g) => new Date(g.data_wystawienia) >= monthAgo);
    return recent.length > 0 ? computeWeightedAverage(recent) : null;
  }, [grades]);

  const breadcrumbs = useMemo(() => {
    const autoBreadcrumbs = useAutoBreadcrumbs({ grades: "Oceny" });
    if (!autoBreadcrumbs.length) return autoBreadcrumbs;

    return autoBreadcrumbs.map((item, index) =>
      index === autoBreadcrumbs.length - 1
        ? { ...item, label: subjectName }
        : item,
    );
  }, [subjectName]);

  if ([gradesQuery, subjectsQuery].some((q) => q.isPending)) return <Spinner />;
  const firstError = [gradesQuery, subjectsQuery].find((q) => q.isError);
  if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

  const sorted = [...grades]
    .filter((g) => !showOnlyAverage || g.czy_do_sredniej)
    .sort((a, b) => Date.parse(b.data_wystawienia) - Date.parse(a.data_wystawienia));

  const icon = getSubjectIcon(subjectName);

  return (
    <div className="space-y-8">
      <AutoBreadcrumbs items={breadcrumbs} />

      <section className="relative overflow-hidden rounded-3xl bg-primary p-8 md:p-12 text-on-primary shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 w-1/3 h-full opacity-10">
          <span className="material-symbols-outlined text-[200px] rotate-12">{icon}</span>
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold font-headline mb-2">{subjectName}</h1>
          </div>
          {grades.length > 0 && (
            <div className="grid grid-cols-3 gap-4 md:gap-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Średnia</p>
                <p className="text-3xl font-black font-headline">{avg.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Propozycja</p>
                <p className="text-3xl font-black font-headline">{suggested}</p>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Oceny</p>
                <p className="text-3xl font-black font-headline">{grades.length}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {!grades.length ? (
        <EmptyState message="Brak ocen dla tego przedmiotu" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold font-headline">Historia ocen</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowOnlyAverage(false)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    !showOnlyAverage
                      ? "bg-surface-container text-on-surface-variant"
                      : "bg-transparent text-slate-400 hover:bg-surface-container"
                  }`}
                >
                  Wszystkie
                </button>
                <button
                  onClick={() => setShowOnlyAverage(true)}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                    showOnlyAverage
                      ? "bg-surface-container text-on-surface-variant"
                      : "bg-transparent text-slate-400 hover:bg-surface-container"
                  }`}
                >
                  Do średniej
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {sorted.map((grade) => (
                <button
                  key={grade.id}
                  onClick={() => setSelectedGrade(grade)}
                  className="group bg-surface-container-lowest p-5 rounded-xl flex items-center justify-between hover:shadow-lg transition-all duration-300 text-left w-full"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center ${getGradeColor(grade.wartosc)} ${getGradeBorderColor(grade.wartosc)}`}>
                      <span className="text-2xl font-black font-headline">{formatGradeValue(grade.wartosc)}</span>
                      <span className="text-[10px] font-bold opacity-60">WAGA {grade.waga}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg font-headline group-hover:text-primary transition-colors">
                        {grade.opis || "Ocena cząstkowa"}
                      </h4>
                      <p className="text-sm text-slate-500 font-label">{formatDate(grade.data_wystawienia)}{!grade.czy_do_sredniej && " • (nie do średniej)"}</p>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-slate-300 group-hover:text-primary transition-colors">more_vert</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <GradeSimulator grades={grades} />

            <div className="bg-surface-container-low rounded-3xl p-6">
              <h3 className="text-lg font-bold font-headline mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                Rozkład ocen
              </h3>
              <div className="space-y-4">
                {distribution.map(({ grade, percentage }) => {
                  const labels: Record<number, string> = {
                    6: "CELUJĄCY (6)",
                    5: "BARDZO DOBRY (5)",
                    4: "DOBRY (4)",
                    3: "DOSTATECZNY (3)",
                    2: "NIEDOSTATECZNY (2)",
                    1: "NIEDOSTATECZNY (1)",
                  };
                  const barColors: Record<number, string> = {
                    6: "bg-primary",
                    5: "bg-primary",
                    4: "bg-primary-container",
                    3: "bg-secondary",
                    2: "bg-orange-400",
                    1: "bg-error",
                  };
                  return (
                    <div key={grade} className="space-y-1">
                      <div className="flex justify-between text-xs font-bold text-slate-500 px-1">
                        <span>{labels[grade]}</span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                        <div className={`h-full ${barColors[grade]} rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {trendInfo && (
              <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-xl shadow-blue-900/5">
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${trendInfo.rising ? "bg-tertiary-fixed" : "bg-error-container"}`}>
                    <span className={`material-symbols-outlined ${trendInfo.rising ? "text-tertiary" : "text-error"}`}>
                      {trendInfo.rising ? "trending_up" : "trending_down"}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Trend ocen</h3>
                    <p className="text-xl font-bold font-headline text-on-surface">
                      {trendInfo.rising ? "Wzrostowy" : "Spadkowy"} ({trendInfo.diff > 0 ? "+" : ""}{trendInfo.diff.toFixed(1)})
                    </p>
                  </div>
                </div>
                <p className="text-sm text-on-surface-variant font-body leading-relaxed mb-4">
                  {trendInfo.rising
                    ? `Twoja średnia wzrosła dzięki dobrym wynikom. Utrzymaj ten poziom!`
                    : `Twoja średnia nieco spadła. Warto poświęcić więcej uwagi temu przedmiotowi.`}
                  {recentMonthlyAvg !== null && <span className="block mt-1">Średnia z ostatniego miesiąca: {recentMonthlyAvg.toFixed(2)}</span>}
                </p>
                <div className="aspect-video w-full bg-slate-50 rounded-xl flex items-end justify-between p-4 relative overflow-hidden">
                  {sorted.slice(0, 8).reverse().map((grade) => {
                    const val = parseFloat(grade.wartosc);
                    const height = Math.max(15, (val / 6) * 100);
                    const barColor = val >= 5 ? "bg-primary" : val >= 4 ? "bg-primary-container" : val >= 3 ? "bg-secondary" : "bg-error";
                    return (
                      <div
                        key={grade.id}
                        className={`w-[15%] ${barColor} rounded-t-lg transition-all`}
                        style={{ height: `${height}%` }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
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
