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
import { createGrade, getClasses, getGrades, getStudents, getSubjects } from "../../services/api";
import { formatGradeValue, getGradeColor } from "../../utils/gradeUtils";
import { formatDateTime } from "../../utils/dateUtils";
import { getCurrentUser } from "../../services/auth";
import AddPeriodGradeModal from "./AddPeriodGradeModal";

function RecentGradesCell({ studentId, selectedSubjectId }: { studentId: number; selectedSubjectId: number | null }) {
  const { data: grades, isLoading } = useQuery({
    queryKey: selectedSubjectId ? keys.grades(studentId) : ["grades-disabled", studentId],
    queryFn: () => getGrades(studentId),
    enabled: !!selectedSubjectId,
  });

  if (!selectedSubjectId) return <span className="text-xs text-muted-foreground">Wybierz filtr</span>;
  if (isLoading) return <span className="text-xs text-muted-foreground">Ładowanie...</span>;
  if (!grades || grades.length === 0) return <span className="text-xs text-muted-foreground">Brak ocen</span>;

  const filtered = grades
    .filter((g) => g.przedmiot === selectedSubjectId)
    .sort((a, b) => new Date(b.data_wystawienia).getTime() - new Date(a.data_wystawienia).getTime());

  if (filtered.length === 0) return <span className="text-xs text-muted-foreground">Brak ocen</span>;

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
          <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 w-max -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1 text-[10px] leading-tight text-popover-foreground opacity-0 shadow-sm transition-opacity duration-150 group-hover:opacity-100">
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

export default function TeacherGradesPage() {
  const [activeGradeStudentId, setActiveGradeStudentId] = useState<number | null>(null);
  const [isAddPeriodGradeModalOpen, setIsAddPeriodGradeModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [gradeMode, setGradeMode] = useState<'regular' | 'period'>('regular');
  const [selectedWeight, setSelectedWeight] = useState<number>(1);
  const [gradeDescription, setGradeDescription] = useState<string>("");
  const [gradeDoSredniej, setGradeDoSredniej] = useState<boolean>(true);
  const [gradePunkty, setGradePunkty] = useState<boolean>(false);
  const [gradeOpisowa, setGradeOpisowa] = useState<boolean>(false);
  const [gradeBase, setGradeBase] = useState<number | null>(null);
  const [gradeModifier, setGradeModifier] = useState<'+' | '-' | ''>('');
  const [pendingGrades, setPendingGrades] = useState<Record<number, { value: string; base: number; modifier: '+' | '-' | '' }>>({});
  const [gradeMenuAnchor, setGradeMenuAnchor] = useState<{ top: number; left: number } | null>(null);
  const [gradeMenuPosition, setGradeMenuPosition] = useState<{ top: number; left: number } | null>(null);
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

  const setPendingGrade = (studentId: number, grade: { value: string; base: number; modifier: '+' | '-' | '' }) => {
    setPendingGrades((prev) => ({ ...prev, [studentId]: grade }));
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
    return students
      .filter((s: any) => s.klasa === selectedClassId)
      .sort((left: any, right: any) => {
        const lastNameComparison = (left.user?.last_name ?? "").localeCompare(right.user?.last_name ?? "", "pl", {
          sensitivity: "base",
        });
        if (lastNameComparison !== 0) return lastNameComparison;
        return (left.user?.first_name ?? "").localeCompare(right.user?.first_name ?? "", "pl", {
          sensitivity: "base",
        });
      });
  }, [students, selectedClassId]);

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
    if (num === null) return "bg-muted text-muted-foreground border-border";

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

  return (
    <div className="space-y-6 p-6">
      <h1 className="page-title">Wystawianie Ocen</h1>

      <Card>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-2">
          <div>
            <h2 className="section-title">Filtry</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Wybierz przedmiot i klasę, aby wystawić oceny.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {selectedSubjectId && (
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
                  {classes?.find((c) => c.id === selectedClassId)?.nazwa ?? `Klasa ${selectedClassId}`}
                </span>
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-muted-foreground">
              Waga: <span className="font-semibold text-foreground">{selectedWeight}</span>
            </span>
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
                onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : null)}
                className="input-base"
              >
                <option value="">Wybierz klasę</option>
                {classes?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nazwa ?? `Klasa ${c.id}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Waga (1-5)</label>
              <div className="inline-flex rounded-lg bg-zinc-900/40 p-1 border border-zinc-800">
                {[1, 2, 3, 4, 5].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setSelectedWeight(w)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      selectedWeight === w
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
                />
              </label>
              <label className="flex items-center justify-between gap-2 text-xs">
                <span>Czy opisowa</span>
                <input
                  type="checkbox"
                  checked={gradeOpisowa}
                  onChange={(e) => setGradeOpisowa(e.target.checked)}
                  className="w-4 h-4 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-title">Uczniowie</h2>
          <div className="space-x-2">
            <Button onClick={() => setGradeMode('regular')} className={gradeMode === 'regular' ? 'btn-primary' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}>Dodaj ocenę</Button>
            <Button onClick={() => setGradeMode('period')} className={gradeMode === 'period' ? 'btn-primary' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}>Ocena okresowa</Button>
          </div>
        </div>

        {selectedSubjectId && selectedClassId && filteredStudents.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4">Imię i Nazwisko</th>
                  <th className="text-left py-3 px-4">Ostatnie oceny</th>
                  <th className="text-right py-3 px-4">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student: any) => (
                  <tr key={student.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                    <td className="py-3 px-4">{student.user?.first_name} {student.user?.last_name}</td>
                    <td className="py-3 px-4">
                      <RecentGradesCell studentId={student.id} selectedSubjectId={selectedSubjectId} />
                    </td>
                    <td className="text-right py-3 px-4 relative">
                      {gradeMode === 'period' ? (
                        <Button
                          onClick={() => {
                            setSelectedStudentId(student.id);
                            setIsAddPeriodGradeModalOpen(true);
                          }}
                          className="text-xs"
                        >
                          Ocena okresowa
                        </Button>
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
                                <motion.button
                            layout
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              if (activeGradeStudentId === student.id) {
                                setActiveGradeStudentId(null);
                                return;
                              }
                              setSelectedStudentId(student.id);
                              setActiveGradeStudentId(student.id);
                              gradeButtonRef.current = e.currentTarget;
                              const rect = e.currentTarget.getBoundingClientRect();
                              setGradeMenuAnchor({ top: rect.top, left: rect.left });
                              const pending = pendingGrades[student.id];
                              if (pending) {
                                setGradeBase(pending.base);
                                setGradeModifier(pending.modifier);
                              } else {
                                setGradeBase(null);
                                setGradeModifier("");
                              }
                            }}
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl border-2 transition-all duration-200 shadow-sm bg-background ${
                              isActiveRow
                                ? `border-solid ${getGradeStyles(previewBase, previewMod)}`
                                : `border-dashed ${getGradeStyles(previewBase, previewMod)}`
                            }`}
                          >
                            {!hasPreview ? (
                              <Plus size={22} strokeWidth={1.5} className="text-muted-foreground" />
                            ) : (
                              <div className="flex items-baseline text-xl font-bold tabular-nums">
                                {previewBase}
                                {previewMod && (
                                  <span className="text-base ml-0.5 opacity-80">
                                    {previewMod}
                                  </span>
                                )}
                              </div>
                            )}
                                </motion.button>

                                {gradeMenuAnchor &&
                                  createPortal(
                                    <AnimatePresence>
                                      {activeGradeStudentId === student.id && (
                                        <motion.div
                                          ref={gradeMenuRef}
                                          key={`grade-menu-${student.id}`}
                                          initial={{ opacity: 0, scale: 0.9 }}
                                          animate={{ opacity: 1, scale: 1 }}
                                          exit={{ opacity: 0, scale: 0.9 }}
                                          style={{
                                            top: (gradeMenuPosition?.top ?? gradeMenuAnchor.top),
                                            left: (gradeMenuPosition?.left ?? gradeMenuAnchor.left),
                                          }}
                                          className="fixed p-2 bg-popover text-popover-foreground border border-border rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-[9999] w-60 origin-bottom-right"
                                        >
                                          <div className="grid grid-cols-4 gap-1.5">
                                            <div className="col-span-3 grid grid-cols-3 gap-1.5">
                                              {[1, 3, 5, 2, 4, 6].map((n) => {
                                                const isActive = gradeBase === n;
                                                const styles = getGradeStyles(n, gradeModifier);
                                                return (
                                                  <button
                                                    key={n}
                                                    onClick={() => {
                                                      if (gradeBase === n) {
                                                        setGradeBase(null);
                                                        setGradeModifier('');
                                                        setPendingGrades((prev) => {
                                                          const next = { ...prev };
                                                          delete next[student.id];
                                                          return next;
                                                        });
                                                      } else {
                                                        setGradeBase(n);
                                                        const nextModifier =
                                                          (n === 1 && gradeModifier === "-") || (n === 6 && gradeModifier === "+")
                                                            ? ""
                                                            : gradeModifier;
                                                        if (nextModifier !== gradeModifier) setGradeModifier(nextModifier);

                                                        setPendingGrade(student.id, {
                                                          value: getGradeValue(n, nextModifier).toFixed(2),
                                                          base: n,
                                                          modifier: nextModifier,
                                                        });
                                                      }
                                                    }}
                                                    className={`h-12 rounded-xl text-xl font-bold transition-all border ${
                                                      isActive
                                                        ? `${styles} shadow-sm scale-[1.03] z-10 border-2 border-current`
                                                        : 'bg-muted text-muted-foreground hover:bg-muted/80 border-border'
                                                    }`}
                                                  >
                                                    {n}
                                                  </button>
                                                );
                                              })}
                                            </div>

                                            <div className="flex flex-col gap-1.5">
                                              {(['+', '-'] as const).map((mod) => {
                                                const isActive = gradeModifier === mod;
                                                const isDisabled =
                                                  (mod === '+' && gradeBase === 6) ||
                                                  (mod === '-' && gradeBase === 1) ||
                                                  !gradeBase;
                                                const styles =
                                                  gradeBase !== null
                                                    ? getGradeStyles(gradeBase, mod)
                                                    : 'bg-muted text-muted-foreground border-border';

                                                return (
                                                  <button
                                                    key={mod}
                                                    disabled={isDisabled}
                                                    onClick={() => {
                                                      const nextMod = isActive ? '' : mod;
                                                      setGradeModifier(nextMod);
                                                      if (!gradeBase) return;
                                                      setPendingGrade(student.id, {
                                                        value: getGradeValue(gradeBase, nextMod).toFixed(2),
                                                        base: gradeBase,
                                                        modifier: nextMod,
                                                      });
                                                    }}
                                                    className={`flex-1 rounded-xl text-xl font-bold transition-all disabled:opacity-20 border disabled:cursor-not-allowed ${
                                                      isActive
                                                        ? `${styles} shadow-sm scale-[1.03] z-10 border-2 border-current`
                                                        : 'bg-muted text-muted-foreground hover:bg-muted/80 border-border'
                                                    }`}
                                                  >
                                                    {mod}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>,
                                    document.body,
                                  )}
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

          {Object.keys(pendingGrades).length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={async () => {
                  const entries = Object.entries(pendingGrades);
                  await Promise.all(
                    entries.map(([studentId, grade]) =>
                      createGradeMutation.mutateAsync({
                        uczen: Number(studentId),
                        przedmiot: selectedSubjectId ?? 0,
                        wartosc: grade.value,
                        waga: selectedWeight,
                        opis: gradeDescription || null,
                        czy_do_sredniej: gradeDoSredniej,
                        czy_punkty: gradePunkty,
                        czy_opisowa: gradeOpisowa,
                      })
                    )
                  );
                  setPendingGrades({});
                  setActiveGradeStudentId(null);
                  setSelectedStudentId(null);
                }}
                className="btn-primary"
              >
                Zapisz wszystkie oceny
              </Button>
            </div>
          )}
          </>
        ) : (
          <EmptyState message="Brak uczniów" />
        )}
      </Card>

      <AddPeriodGradeModal
        open={isAddPeriodGradeModalOpen}
        onClose={() => {
          setIsAddPeriodGradeModalOpen(false);
          setSelectedStudentId(null);
        }}
        studentId={selectedStudentId ?? undefined}
        subjectId={selectedSubjectId ?? undefined}
        students={students || []}
        subjects={subjects || []}
      />
    </div>
  );
}
