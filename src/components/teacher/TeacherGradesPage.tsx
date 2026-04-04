import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "motion/react";
import { Plus } from "lucide-react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { keys } from "../../services/queryKeys";
import { createBehaviorPoint, createGrade, getBehaviorPoints, getClasses, getGrades, getStudents, getSubjects } from "../../services/api";
import { formatGradeValue, getGradeColor, getSuggestedGrade } from "../../utils/gradeUtils";
import { formatDateTime } from "../../utils/dateUtils";
import { getCurrentUser } from "../../services/auth";
import { toast } from "sonner";
import AddPeriodGradeModal from "./AddPeriodGradeModal";
import { formatClassDisplay, getClassJournalNumberMap, sortStudentsAlphabetically } from "../../utils/classUtils";
import { useTeacherClassSelector } from "../../hooks/useTeacherClassSelector";
import { AutoBreadcrumbs, useAutoBreadcrumbs } from "../ui/Breadcrumbs";
import { getPeriodGrades } from "../../services/api";
import type { PeriodGrade } from "../../types/api";

function RecentGradesCell({ studentId, selectedSubjectId }: { studentId: number; selectedSubjectId: number | null }) {
  const { data: grades, isLoading } = useQuery({
    queryKey: selectedSubjectId ? keys.grades(studentId) : ["grades-disabled", studentId],
    queryFn: () => getGrades(studentId),
    enabled: !!selectedSubjectId,
  });

  if (!selectedSubjectId) return <span className="text-xs text-on-surface-variant font-body">Wybierz filtr</span>;
  if (isLoading) return <span className="text-xs text-on-surface-variant font-body">Ładowanie...</span>;
  if (!grades || grades.length === 0) return <span className="text-xs text-on-surface-variant font-body">Brak ocen</span>;

  const filtered = grades
    .filter((g) => g.przedmiot === selectedSubjectId)
    .sort((a, b) => new Date(b.data_wystawienia).getTime() - new Date(a.data_wystawienia).getTime());

  if (filtered.length === 0) return <span className="text-xs text-on-surface-variant font-body">Brak ocen</span>;

  return (
    <div className="flex gap-1">
      {filtered.map((g) => (
        <div key={g.id} className="relative group">
          <span
            className={`inline-flex items-center justify-center w-8 h-8 rounded-md font-medium tabular-nums text-sm ${getGradeColor(
              g.wartosc,
            )}`}
          >
            {formatGradeValue(g.wartosc)}
          </span>
          <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 w-max -translate-x-1/2 rounded-md  bg-popover px-2 py-1 text-[10px] leading-tight text-popover-foreground opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
            <div><span className="font-semibold">Wartość:</span> {g.wartosc}</div>
            <div><span className="font-semibold">Waga:</span> {g.waga}</div>
            {g.opis && <div><span className="font-semibold">Opis:</span> {g.opis}</div>}
            <div><span className="font-semibold">Data:</span> {formatDateTime(g.data_wystawienia)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function BehaviorTotalCell({ studentId }: { studentId: number }) {
  const { data: behavior, isLoading } = useQuery({
    queryKey: keys.behavior(studentId),
    queryFn: () => getBehaviorPoints(studentId),
  });

  if (isLoading) return <span className="text-xs text-on-surface-variant font-body">Ładowanie...</span>;

  const total = (behavior ?? []).reduce((sum, item) => sum + item.punkty, 0);
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${total >= 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"}`}>
      {total >= 0 ? `+${total}` : total}
    </span>
  );
}

export default function TeacherGradesPage() {
  const { selectedClassId: hookClassId, setSelectedClassId: setHookClassId } = useTeacherClassSelector();
  const [activeGradeStudentId, setActiveGradeStudentId] = useState<number | null>(null);
  const [isAddPeriodGradeModalOpen, setIsAddPeriodGradeModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(hookClassId);

  useEffect(() => {
    if (hookClassId !== null && hookClassId !== selectedClassId) {
      setSelectedClassId(hookClassId);
    }
  }, [hookClassId]);

  const handleClassChange = (id: number | null) => {
    setSelectedClassId(id);
    setHookClassId(id);
  };
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [gradeMode, setGradeMode] = useState<'regular' | 'period' | 'behavior'>('regular');
  const [selectedWeight, setSelectedWeight] = useState<number>(1);
  const [gradeDescription, setGradeDescription] = useState<string>("");
  const [gradeDoSredniej, setGradeDoSredniej] = useState<boolean>(true);
  const [gradePunkty, setGradePunkty] = useState<boolean>(false);
  const [gradeOpisowa, setGradeOpisowa] = useState<boolean>(false);
  const [gradeBase, setGradeBase] = useState<number | null>(null);
  const [gradeModifier, setGradeModifier] = useState<'+' | '-' | ''>('');
  const [pendingGrades, setPendingGrades] = useState<Record<number, { value: string; base: number; modifier: '+' | '-' | '' }>>({});
  const [pendingBehaviorPoints, setPendingBehaviorPoints] = useState<Record<number, number>>({});
  const [gradeMenuAnchor, setGradeMenuAnchor] = useState<{ top: number; left: number } | null>(null);
  const [gradeMenuPosition, setGradeMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [proposedGrades, setProposedGrades] = useState<Record<number, string>>({});
  const [finalGrades, setFinalGrades] = useState<Record<number, string>>({});
  const [periodGradesMap, setPeriodGradesMap] = useState<Record<number, PeriodGrade[]>>({});
  const [periodGradesLoading, setPeriodGradesLoading] = useState(false);
  const [gradesByStudent, setGradesByStudent] = useState<Record<number, any[]>>({});
  const [gradesByStudentLoading, setGradesByStudentLoading] = useState(false);
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();
  const gradeMenuRef = useRef<HTMLDivElement | null>(null);
  const gradeButtonRef = useRef<HTMLButtonElement | null>(null);

  const createGradeMutation = useMutation({
    mutationFn: (payload: any) =>
      createGrade({
        ...payload,
        nauczyciel: currentUser?.teacherId ?? null,
      } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grades"] });
    },
  });

  const createBehaviorPointMutation = useMutation({
    mutationFn: (payload: { uczen: number; punkty: number; opis: string | null }) =>
      createBehaviorPoint({
        ...payload,
        nauczyciel_wpisujacy: currentUser?.teacherId ?? null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["behavior"] });
    },
  });

  const setPendingGrade = (studentId: number, grade: { value: string; base: number; modifier: '+' | '-' | '' }) => {
    setPendingGrades((prev) => ({ ...prev, [studentId]: grade }));
  };

  const setPendingBehaviorPoint = (studentId: number, points: number | null) => {
    setPendingBehaviorPoints((prev) => {
      const next = { ...prev };
      if (points === null) {
        delete next[studentId];
        return next;
      }
      next[studentId] = points;
      return next;
    });
  };

  const switchMode = (mode: 'regular' | 'period' | 'behavior') => {
    setGradeMode(mode);
    setActiveGradeStudentId(null);
    setPendingGrades({});
    setPendingBehaviorPoints({});
  };

  const { data: students, isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: keys.students?.() ?? ["students"],
    queryFn: getStudents,
  });

  const { data: subjects, isLoading: subjectsLoading, error: subjectsError } = useQuery({
    queryKey: keys.subjects?.() ?? ["subjects"],
    queryFn: getSubjects,
  });

  const { data: classes, isLoading: classesLoading, error: classesError } = useQuery({
    queryKey: keys.classes?.() ?? ["classes"],
    queryFn: getClasses,
  });

  const filteredStudents = useMemo(() => {
    if (!students) return [];
    if (!selectedClassId) return [];
    return sortStudentsAlphabetically(students.filter((s: any) => s.klasa === selectedClassId));
  }, [students, selectedClassId]);

  const classJournalNumbers = useMemo(
    () => getClassJournalNumberMap(students ?? [], selectedClassId),
    [students, selectedClassId],
  );

  // Load period grades and regular grades when switching to period mode
  useEffect(() => {
    if (gradeMode !== 'period' || !selectedClassId || !selectedSubjectId) return;
    setPeriodGradesLoading(true);
    setGradesByStudentLoading(true);
    const studentIds = filteredStudents.map((s: any) => s.id);
    Promise.all([
      Promise.all(
        studentIds.map(async (id: number) => {
          const grades = await getPeriodGrades(id);
          return { studentId: id, grades: grades.filter((g: PeriodGrade) => g.przedmiot === selectedSubjectId) };
        }),
      ),
      Promise.all(
        studentIds.map(async (id: number) => {
          const grades = await getGrades(id);
          return { studentId: id, grades: grades.filter((g: any) => g.przedmiot === selectedSubjectId) };
        }),
      ),
    ]).then(([periodResults, gradeResults]) => {
      const periodMap: Record<number, PeriodGrade[]> = {};
      periodResults.forEach((r) => { periodMap[r.studentId] = r.grades; });
      setPeriodGradesMap(periodMap);
      setPeriodGradesLoading(false);

      const gradeMap: Record<number, any[]> = {};
      gradeResults.forEach((r) => { gradeMap[r.studentId] = r.grades; });
      setGradesByStudent(gradeMap);
      setGradesByStudentLoading(false);
    });
  }, [gradeMode, selectedClassId, selectedSubjectId, filteredStudents]);

  const canShowStudents = Boolean(selectedClassId && (gradeMode === "behavior" || selectedSubjectId));

  // Close grade picker when clicking outside
  useEffect(() => {
    if (!activeGradeStudentId) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      const clickedMenu = !!gradeMenuRef.current && gradeMenuRef.current.contains(target);
      const clickedButton = !!gradeButtonRef.current && gradeButtonRef.current.contains(target);
      if (!clickedMenu && !clickedButton) {
        setActiveGradeStudentId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeGradeStudentId]);

  // Keep portal menu anchored to the active button
  useEffect(() => {
    if (!activeGradeStudentId) {
      setGradeMenuAnchor(null);
      setGradeMenuPosition(null);
      return;
    }

    const update = () => {
      const el = gradeButtonRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setGradeMenuAnchor({ top: rect.top, left: rect.left });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [activeGradeStudentId]);

  // When we know anchor + menu size, place it above-left and clamp to viewport.
  useEffect(() => {
    if (!activeGradeStudentId || !gradeMenuAnchor) return;
    const menuEl = gradeMenuRef.current;
    if (!menuEl) return;

    const { width, height } = menuEl.getBoundingClientRect();
    const margin = 0;
    const offset = -8;

    // Desired: menu is above-left of button.
    let left = gradeMenuAnchor.left - width + offset;
    let top = gradeMenuAnchor.top - height + offset;

    // Clamp so it doesn't escape the viewport.
    left = Math.min(Math.max(margin, left), window.innerWidth - width - margin);
    top = Math.min(Math.max(margin, top), window.innerHeight - height - margin);

    setGradeMenuPosition({ top, left });
  }, [activeGradeStudentId, gradeMenuAnchor]);

  const getGradeValue = (num: number, mod: '+' | '-' | '') => {
    if (mod === '+') return num + 0.5;
    if (mod === '-') return num - 0.25;
    return num;
  };

  const getGradeStyles = (num: number | null, mod: '+' | '-' | '') => {
    if (num === null) return "bg-surface-container-highest text-on-surface-variant font-body border-border";

    const value = getGradeValue(num, mod);

    if (value >= 5.0) return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50";
    if (value >= 4.0) return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50";
    if (value >= 3.0) return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/50";
    if (value >= 2.0) return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50";
    return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50";
  };

  if (studentsLoading || subjectsLoading || classesLoading) return <Spinner label="Ładowanie danych nauczyciela..." />;
  if (studentsError) return <ErrorState message={`Błąd: ${(studentsError as Error).message}`} />;
  if (subjectsError) return <ErrorState message={`Błąd: ${(subjectsError as Error).message}`} />;
  if (classesError) return <ErrorState message={`Błąd: ${(classesError as Error).message}`} />;

  const breadcrumbs = useAutoBreadcrumbs({ grades: "Wystawianie ocen" });

  return (
    <div className="space-y-6">
      <AutoBreadcrumbs items={breadcrumbs} />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight">Wystawianie Ocen</h1>
          <p className="text-on-surface-variant font-body text-sm">
            {gradeMode === 'period' && selectedClassId && selectedSubjectId
              ? `${formatClassDisplay(classes?.find((c) => c.id === selectedClassId) ?? { id: selectedClassId })} • ${subjects?.find((s) => s.id === selectedSubjectId)?.nazwa ?? ''}`
              : 'Wybierz przedmiot i klasę, aby wystawić oceny.'}
          </p>
        </div>
        <div className="bg-surface-container-low p-1 rounded-full flex items-center">
          {[
            { key: 'regular' as const, label: 'Dodaj ocenę' },
            { key: 'period' as const, label: 'Ocena okresowa' },
            { key: 'behavior' as const, label: 'Zachowanie' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => switchMode(tab.key)}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                gradeMode === tab.key
                  ? 'bg-surface-container-lowest text-primary shadow-sm'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {gradeMode !== 'period' && (
        <Card>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-2">
            <div>
              <h2 className="section-title">Filtry</h2>
              <p className="text-xs text-on-surface-variant font-body mt-1">
                Wybierz przedmiot i klasę, aby wystawić oceny.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {selectedSubjectId && gradeMode !== "behavior" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Przedmiot:
                  <span className="font-semibold">
                    {subjects?.find((s) => s.id === selectedSubjectId)?.nazwa ?? `#${selectedSubjectId}`}
                  </span>
                </span>
              )}
              {selectedClassId && (
                <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Klasa:
                  <span className="font-semibold">
                    {formatClassDisplay(classes?.find((c) => c.id === selectedClassId) ?? { id: selectedClassId })}
                  </span>
                </span>
              )}
              {gradeMode !== "behavior" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-highest px-2.5 py-1 text-on-surface-variant font-body">
                  Waga: <span className="font-semibold text-on-surface font-body">{selectedWeight}</span>
                </span>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.2fr)]">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Przedmiot</label>
                <select
                  value={selectedSubjectId ?? ""}
                  onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
                  className="input-base"
                  disabled={gradeMode === "behavior"}
                >
                  <option value="">Wybierz przedmiot</option>
                  {subjects?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nazwa}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Klasa</label>
                <select
                  value={selectedClassId ?? ""}
                  onChange={(e) => handleClassChange(e.target.value ? Number(e.target.value) : null)}
                  className="input-base"
                >
                  <option value="">Wybierz klasę</option>
                  {classes?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {formatClassDisplay(c)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Waga (1-5)</label>
                <div
                  className={`inline-flex rounded-lg p-1 border ${
                    gradeMode === "behavior"
                      ? "bg-surface-container-highest/40 border-border/60 opacity-60"
                      : "bg-zinc-900/40 border-zinc-800"
                  }`}
                >
                  {[1, 2, 3, 4, 5].map((w) => (
                    <button
                      key={w}
                      type="button"
                      onClick={() => {
                        if (gradeMode === "behavior") return;
                        setSelectedWeight(w);
                      }}
                      disabled={gradeMode === "behavior"}
                      className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                        gradeMode === "behavior"
                          ? "text-on-surface-variant font-body cursor-not-allowed bg-transparent hover:bg-transparent"
                          : selectedWeight === w
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-zinc-300 hover:bg-zinc-800"
                      }`}
                    >
                      {w}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Opis / Kategoria</label>
                <input
                  value={gradeDescription}
                  onChange={(e) => setGradeDescription(e.target.value)}
                  placeholder="np. Klasówka, odpowiedź ustna..."
                  className="input-base"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Dodatkowe opcje</label>
              <div className="space-y-1.5 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
                <label className="flex items-center justify-between gap-2 text-xs">
                  <span>Czy do średniej</span>
                  <input
                    type="checkbox"
                    checked={gradeDoSredniej}
                    onChange={(e) => setGradeDoSredniej(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between gap-2 text-xs">
                  <span>Czy punktowa</span>
                  <input
                    type="checkbox"
                    checked={gradePunkty}
                    onChange={(e) => setGradePunkty(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                    disabled={gradeMode === "behavior"}
                  />
                </label>
                <label className="flex items-center justify-between gap-2 text-xs">
                  <span>Czy opisowa</span>
                  <input
                    type="checkbox"
                    checked={gradeOpisowa}
                    onChange={(e) => setGradeOpisowa(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                    disabled={gradeMode === "behavior"}
                  />
                </label>
              </div>
            </div>
          </div>
        </Card>
      )}

      {gradeMode === 'period' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Klasa</label>
            <select
              value={selectedClassId ?? ""}
              onChange={(e) => handleClassChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface"
            >
              <option value="">Wybierz klasę...</option>
              {classes?.map((c) => (
                <option key={c.id} value={c.id}>
                  {formatClassDisplay(c)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">Przedmiot</label>
            <select
              value={selectedSubjectId ?? ""}
              onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
              className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface"
            >
              <option value="">Wybierz przedmiot...</option>
              {subjects?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nazwa}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {gradeMode === 'period' && canShowStudents && filteredStudents.length > 0 && (
        <>
          <div className="bg-surface-container-lowest rounded-[2rem] shadow-[0_8px_40px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/50">
                    <th className="px-8 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Uczeń</th>
                    <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Oceny bieżące</th>
                    <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">Średnia</th>
                    <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider text-center">Sugerowana</th>
                    <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Proponowana</th>
                    <th className="px-6 py-5 text-xs font-bold text-on-surface-variant uppercase tracking-wider">Końcowa</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0">
                  {filteredStudents.map((student: any, index: number) => {
                    const studentGrades = (gradesByStudent[student.id] || [])
                      .sort((a: any, b: any) => new Date(b.data_wystawienia).getTime() - new Date(a.data_wystawienia).getTime());
                    const validGrades = studentGrades.filter((g: any) => g.czy_do_sredniej && !Number.isNaN(parseFloat(g.wartosc)));
                    let average = 0;
                    if (validGrades.length > 0) {
                      const sumW = validGrades.reduce((sum: number, g: any) => sum + g.waga, 0);
                      const sumWV = validGrades.reduce((sum: number, g: any) => sum + parseFloat(g.wartosc) * g.waga, 0);
                      average = sumW > 0 ? sumWV / sumW : 0;
                    }
                    const suggested = average > 0 ? getSuggestedGrade(average) : null;
                    const period1 = periodGradesMap[student.id]?.find((g) => g.okres === 1);
                    return (
                      <tr
                        key={student.id}
                        className={`hover:bg-blue-50/30 dark:hover:bg-primary/5 transition-colors group ${index % 2 === 1 ? 'bg-surface-container-low/20' : ''}`}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-bold text-on-surface-variant mb-1">{classJournalNumbers.get(student.id) ?? '-'}</span>
                              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-primary/20 flex items-center justify-center text-primary font-bold overflow-hidden">
                                {student.user?.first_name?.[0]}{student.user?.last_name?.[0]}
                              </div>
                            </div>
                            <div>
                              <p className="font-headline font-bold text-on-surface">{student.user?.first_name} {student.user?.last_name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6">
                          {selectedSubjectId ? (
                            studentGrades.length > 0 ? (
                              <div className="flex flex-wrap gap-1.5">
                                {studentGrades.slice(0, 8).map((g: any) => (
                                  <span key={g.id} className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold ${getGradeColor(g.wartosc)}`}>
                                    {formatGradeValue(g.wartosc)}
                                  </span>
                                ))}
                                {studentGrades.length > 8 && (
                                  <span className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold bg-surface-container text-on-surface-variant">
                                    +{studentGrades.length - 8}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-on-surface-variant">Brak ocen</span>
                            )
                          ) : (
                            <span className="text-xs text-on-surface-variant">Wybierz przedmiot</span>
                          )}
                        </td>
                        <td className="px-6 py-6 text-center">
                          {average > 0 ? (
                            <span className="font-headline font-extrabold text-lg text-primary">{average.toFixed(2)}</span>
                          ) : (
                            <span className="text-on-surface-variant">-</span>
                          )}
                        </td>
                        <td className="px-6 py-6 text-center">
                          {suggested !== null ? (
                            <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg font-bold text-sm ${getGradeColor(suggested)}`}>
                              {formatGradeValue(suggested)}
                            </span>
                          ) : (
                            <span className="text-on-surface-variant">-</span>
                          )}
                        </td>
                        <td className="px-6 py-6">
                          <input
                            className="w-16 bg-surface-container border-none focus:ring-2 focus:ring-primary rounded-xl px-3 py-2 text-center font-bold text-on-surface transition-all"
                            type="text"
                            value={proposedGrades[student.id] ?? ''}
                            onChange={(e) => setProposedGrades((prev) => ({ ...prev, [student.id]: e.target.value }))}
                            placeholder="-"
                          />
                        </td>
                        <td className="px-6 py-6">
                          <input
                            className="w-16 bg-primary-fixed/30 dark:bg-primary/20 border-2 border-transparent focus:border-primary focus:ring-0 rounded-xl px-3 py-2 text-center font-extrabold text-primary transition-all"
                            type="text"
                            value={finalGrades[student.id] ?? (period1 ? formatGradeValue(period1.wartosc) : '')}
                            onChange={(e) => setFinalGrades((prev) => ({ ...prev, [student.id]: e.target.value }))}
                            placeholder="-"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {(periodGradesLoading || gradesByStudentLoading) && (
                <div className="text-center py-8 text-on-surface-variant">Ładowanie ocen...</div>
              )}
            </div>
            <div className="bg-surface-container-low/40 px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4 text-xs font-medium text-on-surface-variant">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-primary"></span>
                  Zmodyfikowano: {Object.keys(finalGrades).length > 0 ? 'Dzisiaj' : '-'}
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  Auto-zapis aktywny
                </span>
              </div>
              <div className="text-sm font-bold text-primary">{filteredStudents.length} uczniów</div>
            </div>
          </div>

          {selectedClassId && selectedSubjectId && filteredStudents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 mb-20">
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 flex flex-col justify-between group hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-primary/10 text-primary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="font-headline font-bold text-on-surface">Średnia klasy</h4>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-primary tracking-tighter">
                    {(() => {
                      const avgs = filteredStudents.map((s: any) => {
                        const g = (gradesByStudent[s.id] || []).filter((x: any) => x.czy_do_sredniej && !Number.isNaN(parseFloat(x.wartosc)));
                        if (g.length === 0) return 0;
                        const sw = g.reduce((sum: number, x: any) => sum + x.waga, 0);
                        const swv = g.reduce((sum: number, x: any) => sum + parseFloat(x.wartosc) * x.waga, 0);
                        return sw > 0 ? swv / sw : 0;
                      }).filter((a: number) => a > 0);
                      return avgs.length > 0 ? (avgs.reduce((a: number, b: number) => a + b, 0) / avgs.length).toFixed(2) : '-';
                    })()}
                  </span>
                </div>
              </div>
              <div className="bg-surface-container-lowest p-6 rounded-3xl border border-outline-variant/30 flex flex-col justify-between group hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-secondary/10 text-secondary">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h4 className="font-headline font-bold text-on-surface">Wystawiono ocen</h4>
                </div>
                <div className="mt-4">
                  <span className="text-4xl font-extrabold text-on-surface tracking-tighter">{Object.keys(finalGrades).length}/{filteredStudents.length}</span>
                  <div className="w-full bg-surface-container h-1.5 rounded-full mt-2">
                    <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${filteredStudents.length > 0 ? (Object.keys(finalGrades).length / filteredStudents.length) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
              <div className="bg-gradient-to-br from-primary to-primary-container p-6 rounded-3xl text-white flex flex-col justify-between group hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-white/10 text-white">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-headline font-bold">Termin wystawiania</h4>
                </div>
                <div className="mt-4">
                  <p className="text-sm font-medium text-white/80">Oceny okresowe dla wybranego przedmiotu</p>
                  <p className="text-xl font-bold mt-1">{subjects?.find((s) => s.id === selectedSubjectId)?.nazwa ?? 'Wybierz przedmiot'}</p>
                </div>
              </div>
            </div>
          )}

          {Object.keys(finalGrades).length > 0 && (
            <div className="mt-4 flex justify-end gap-3">
              <Button onClick={() => { setProposedGrades({}); setFinalGrades({}); }} className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700">Wyczyść</Button>
              <Button onClick={() => toast.success('Oceny okresowe zapisane (demo)')} className="btn-primary">Zapisz oceny okresowe</Button>
            </div>
          )}
        </>
      )}

      {gradeMode !== 'period' && canShowStudents && filteredStudents.length > 0 && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4 w-28">Nr w dzienniku</th>
                  <th className="text-left py-3 px-4">Imię i Nazwisko</th>
                  <th className="text-left py-3 px-4">{gradeMode === 'behavior' ? 'Suma punktów' : 'Ostatnie oceny'}</th>
                  <th className="text-right py-3 px-4">{gradeMode === 'behavior' ? 'Punkty' : 'Akcje'}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student: any) => (
                  <tr key={student.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                    <td className="py-3 px-4 font-medium text-on-surface-variant font-body">{classJournalNumbers.get(student.id) ?? "-"}</td>
                    <td className="py-3 px-4">{student.user?.first_name} {student.user?.last_name}</td>
                    <td className="py-3 px-4">
                      {gradeMode === 'behavior' ? (
                        <BehaviorTotalCell studentId={student.id} />
                      ) : (
                        <RecentGradesCell studentId={student.id} selectedSubjectId={selectedSubjectId} />
                      )}
                    </td>
                    <td className="text-right py-3 px-4 relative">
                      {gradeMode === 'behavior' ? (
                        <div className="inline-flex items-center justify-end gap-2">
                          <button type="button" onClick={() => setPendingBehaviorPoint(student.id, (pendingBehaviorPoints[student.id] ?? 0) - 1)} className="h-9 w-9 rounded-md bg-card text-sm font-semibold hover:bg-surface-container-highest">-</button>
                          <input type="number" value={pendingBehaviorPoints[student.id] ?? ""} onChange={(event) => { if (event.target.value === "") { setPendingBehaviorPoint(student.id, null); return; } const value = Number(event.target.value); if (Number.isNaN(value)) return; setPendingBehaviorPoint(student.id, Math.trunc(value)); }} className="input-base h-9 w-24 text-center" placeholder="np. 5" />
                          <button type="button" onClick={() => setPendingBehaviorPoint(student.id, (pendingBehaviorPoints[student.id] ?? 0) + 1)} className="h-9 w-9 rounded-md bg-card text-sm font-semibold hover:bg-surface-container-highest">+</button>
                        </div>
                      ) : (
                        <div className="relative inline-block">
                          {(() => {
                            const pending = pendingGrades[student.id];
                            const isActiveRow = activeGradeStudentId === student.id;
                            const previewBase = isActiveRow ? gradeBase : (pending?.base ?? null);
                            const previewMod = isActiveRow ? gradeModifier : (pending?.modifier ?? "");
                            const hasPreview = previewBase !== null || previewMod !== "";
                            return (
                              <>
                                <motion.button layout whileTap={{ scale: 0.95 }} onClick={(e) => { if (activeGradeStudentId === student.id) { setActiveGradeStudentId(null); return; } setSelectedStudentId(student.id); setActiveGradeStudentId(student.id); gradeButtonRef.current = e.currentTarget; const rect = e.currentTarget.getBoundingClientRect(); setGradeMenuAnchor({ top: rect.top, left: rect.left }); const pending = pendingGrades[student.id]; if (pending) { setGradeBase(pending.base); setGradeModifier(pending.modifier); } else { setGradeBase(null); setGradeModifier(""); } }} className={`w-12 h-12 flex items-center justify-center rounded-2xl border-2 transition-all duration-200 shadow-sm bg-background ${isActiveRow ? `border-solid ${getGradeStyles(previewBase, previewMod)}` : `border-dashed ${getGradeStyles(previewBase, previewMod)}`}`}>
                                  {!hasPreview ? (<Plus size={22} strokeWidth={1.5} className="text-on-surface-variant font-body" />) : (<div className="flex items-baseline text-xl font-bold tabular-nums">{previewBase}{previewMod && (<span className="text-base ml-0.5 opacity-80">{previewMod}</span>)}</div>)}
                                </motion.button>
                                {gradeMenuAnchor && createPortal(<AnimatePresence>{activeGradeStudentId === student.id && (<motion.div ref={gradeMenuRef} key={`grade-menu-${student.id}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ top: (gradeMenuPosition?.top ?? gradeMenuAnchor.top), left: (gradeMenuPosition?.left ?? gradeMenuAnchor.left) }} className="fixed p-2 bg-popover text-popover-foreground rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[9999] w-60 origin-bottom-right"><div className="grid grid-cols-4 gap-1.5"><div className="col-span-3 grid grid-cols-3 gap-1.5">{[1, 3, 5, 2, 4, 6].map((n) => { const isActive = gradeBase === n; const styles = getGradeStyles(n, gradeModifier); return (<button key={n} onClick={() => { if (gradeBase === n) { setGradeBase(null); setGradeModifier(''); setPendingGrades((prev) => { const next = { ...prev }; delete next[student.id]; return next; }); } else { setGradeBase(n); const nextModifier = (n === 1 && gradeModifier === "-") || (n === 6 && gradeModifier === "+") ? "" : gradeModifier; if (nextModifier !== gradeModifier) setGradeModifier(nextModifier); setPendingGrade(student.id, { value: getGradeValue(n, nextModifier).toFixed(2), base: n, modifier: nextModifier }); } }} className={`h-12 rounded-xl text-xl font-bold transition-all border ${isActive ? `${styles} shadow-sm scale-[1.03] z-10 border-2 border-current` : 'bg-surface-container-highest text-on-surface-variant font-body hover:bg-surface-container-highest/80 border-border'}`}>{n}</button>); })}</div><div className="flex flex-col gap-1.5">{(['+', '-'] as const).map((mod) => { const isActive = gradeModifier === mod; const isDisabled = (mod === '+' && gradeBase === 6) || (mod === '-' && gradeBase === 1) || !gradeBase; const styles = gradeBase !== null ? getGradeStyles(gradeBase, mod) : 'bg-surface-container-highest text-on-surface-variant font-body border-border'; return (<button key={mod} disabled={isDisabled} onClick={() => { const nextMod = isActive ? '' : mod; setGradeModifier(nextMod); if (!gradeBase) return; setPendingGrade(student.id, { value: getGradeValue(gradeBase, nextMod).toFixed(2), base: gradeBase, modifier: nextMod }); }} className={`flex-1 rounded-xl text-xl font-bold transition-all disabled:opacity-20 border disabled:cursor-not-allowed ${isActive ? `${styles} shadow-sm scale-[1.03] z-10 border-2 border-current` : 'bg-surface-container-highest text-on-surface-variant font-body hover:bg-surface-container-highest/80 border-border'}`}>{mod}</button>); })}</div></div></motion.div>)}</AnimatePresence>, document.body)}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {gradeMode !== 'behavior' && Object.keys(pendingGrades).length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button onClick={async () => { const entries = Object.entries(pendingGrades); await Promise.all(entries.map(([studentId, grade]) => createGradeMutation.mutateAsync({ uczen: Number(studentId), przedmiot: selectedSubjectId ?? 0, wartosc: grade.value, waga: selectedWeight, opis: gradeDescription || null, czy_do_sredniej: gradeDoSredniej, czy_punkty: gradePunkty, czy_opisowa: gradeOpisowa }))); setPendingGrades({}); setActiveGradeStudentId(null); setSelectedStudentId(null); }} className="btn-primary">Zapisz wszystkie oceny</Button>
            </div>
          )}

          {gradeMode === 'behavior' && Object.keys(pendingBehaviorPoints).length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button onClick={async () => { const entries = Object.entries(pendingBehaviorPoints).filter(([, points]) => points !== 0); await Promise.all(entries.map(([studentId, points]) => createBehaviorPointMutation.mutateAsync({ uczen: Number(studentId), punkty: points, opis: gradeDescription || null }))); setPendingBehaviorPoints({}); }} className="btn-primary">Zapisz punkty zachowania</Button>
            </div>
          )}
        </Card>
      )}

      {canShowStudents && filteredStudents.length === 0 && (
        <EmptyState message={gradeMode === 'behavior' ? 'Wybierz klasę, aby wystawić punkty zachowania' : 'Wybierz przedmiot i klasę, aby wystawić oceny'} />
      )}

      {!canShowStudents && (
        <EmptyState message={gradeMode === 'behavior' ? 'Wybierz klasę, aby wystawić punkty zachowania' : 'Wybierz przedmiot i klasę, aby wystawić oceny'} />
      )}

      <AddPeriodGradeModal
        open={isAddPeriodGradeModalOpen}
        onClose={() => { setIsAddPeriodGradeModalOpen(false); setSelectedStudentId(null); }}
        studentId={selectedStudentId ?? undefined}
        subjectId={selectedSubjectId ?? undefined}
        students={students || []}
        subjects={subjects || []}
      />
    </div>
  );
}
