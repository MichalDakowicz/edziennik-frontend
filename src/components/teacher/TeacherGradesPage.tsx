import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { keys } from "../../services/queryKeys";
import { createGrade, getStudents, getSubjects } from "../../services/api";
import { getCurrentUser } from "../../services/auth";
import AddPeriodGradeModal from "./AddPeriodGradeModal";

export default function TeacherGradesPage() {
  const [activeGradeStudentId, setActiveGradeStudentId] = useState<number | null>(null);
  const [isAddPeriodGradeModalOpen, setIsAddPeriodGradeModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [gradeMode, setGradeMode] = useState<'regular' | 'period'>('regular');
  const [selectedWeight, setSelectedWeight] = useState<number>(1);
  const [gradeDescription, setGradeDescription] = useState<string>("");
  const [gradeDoSredniej, setGradeDoSredniej] = useState<boolean>(true);
  const [gradePunkty, setGradePunkty] = useState<boolean>(false);
  const [gradeOpisowa, setGradeOpisowa] = useState<boolean>(false);
  const [gradeValue, setGradeValue] = useState<string>("");
  const [gradeBase, setGradeBase] = useState<number | null>(null);
  const [gradeModifier, setGradeModifier] = useState<'+' | '-' | ''>('');
  const [pendingGrades, setPendingGrades] = useState<Record<number, { value: string; base: number; modifier: '+' | '-' | '' }>>({});
  const queryClient = useQueryClient();
  const currentUser = getCurrentUser();

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

  if (studentsLoading || subjectsLoading) return <Spinner label="Ładowanie danych nauczyciela..." />;
  if (studentsError) return <ErrorState message={`Błąd: ${(studentsError as Error).message}`} />;
  if (subjectsError) return <ErrorState message={`Błąd: ${(subjectsError as Error).message}`} />;

  return (
    <div className="space-y-6 p-6">
      <h1 className="page-title">Wystawianie Ocen</h1>

      <Card>
        <h2 className="section-title mb-4">Filtry</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Przedmiot</label>
            <select
              value={selectedSubjectId ?? ""}
              onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
              className="input-base max-w-xs"
            >
              <option value="">Wszystkie przedmioty</option>
              {subjects?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nazwa}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Waga (1-5)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setSelectedWeight(w)}
                  className={`py-2 px-4 rounded-lg text-sm transition-all ${
                    selectedWeight === w
                      ? "bg-green-600 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Opis / Kategoria</label>
            <input
              value={gradeDescription}
              onChange={(e) => setGradeDescription(e.target.value)}
              placeholder="np. Klasówka, odpowiedź ustna..."
              className="input-base max-w-xs"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="block text-sm font-medium text-zinc-300 mb-2">Dodatkowe opcje</label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={gradeDoSredniej}
                onChange={(e) => setGradeDoSredniej(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              Czy do średniej
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={gradePunkty}
                onChange={(e) => setGradePunkty(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              Czy punktowa
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={gradeOpisowa}
                onChange={(e) => setGradeOpisowa(e.target.checked)}
                className="w-4 h-4 cursor-pointer"
              />
              Czy opisowa
            </label>
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

        {students && students.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4">Imię i Nazwisko</th>
                  <th className="text-left py-3 px-4">Klasa</th>
                  <th className="text-left py-3 px-4">Ostatnie oceny</th>
                  <th className="text-right py-3 px-4">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                    <td className="py-3 px-4">{student.user?.first_name} {student.user?.last_name}</td>
                    <td className="py-3 px-4">Klasa</td>
                    <td className="py-3 px-4">Brak ocen</td>
                    <td className="text-right py-3 px-4 relative">
                      <Button
                        onClick={() => {
                          setSelectedStudentId(student.id);
                          setActiveGradeStudentId(student.id);

                          const pending = pendingGrades[student.id];
                          if (pending) {
                            setGradeBase(pending.base);
                            setGradeModifier(pending.modifier);
                            setGradeValue(pending.value);
                          } else {
                            setGradeBase(null);
                            setGradeModifier("");
                            setGradeValue("");
                          }

                          if (gradeMode === 'period') {
                            setIsAddPeriodGradeModalOpen(true);
                          }
                        }}
                        className="text-xs"
                      >
                        {gradeMode === 'regular' ? 'Dodaj ocenę' : 'Ocena okresowa'}
                      </Button>

                      {pendingGrades[student.id] && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] font-semibold text-emerald-200">
                          {pendingGrades[student.id].value}
                        </span>
                      )}

                      {gradeMode === 'regular' && activeGradeStudentId === student.id && (
                        <div className="absolute right-full top-1/2 z-20 -translate-y-1/2 mr-2 w-48 rounded-xl border border-zinc-700 bg-zinc-950/90 p-2 shadow-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <div className="text-[10px] text-muted-foreground">Wystaw ocenę dla</div>
                              <div className="text-xs font-semibold">
                                {student.user?.first_name} {student.user?.last_name}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setActiveGradeStudentId(null)}
                              className="text-xs text-muted-foreground hover:text-foreground"
                            >
                              ✕
                            </button>
                          </div>

                          <div className="grid grid-cols-4 gap-1 mb-2">
                            {[
                              1,
                              3,
                              5,
                              "+",
                              2,
                              4,
                              6,
                              "-",
                            ].map((item) => {
                              const isModifier = item === "+" || item === "-";
                              const isActiveModifier = gradeModifier === item;

                              return (
                                <button
                                  key={item}
                                  type="button"
                                  onClick={() => {
                                    if (item === "+") {
                                      if (!gradeBase || gradeBase === 6) return;
                                      setGradeModifier("+");
                                      setGradeValue((gradeBase + 0.5).toFixed(2));
                                      setPendingGrade(student.id, {
                                        value: (gradeBase + 0.5).toFixed(2),
                                        base: gradeBase,
                                        modifier: "+",
                                      });
                                      return;
                                    }

                                    if (item === "-") {
                                      if (!gradeBase || gradeBase === 1) return;
                                      setGradeModifier("-");
                                      setGradeValue((gradeBase - 0.25).toFixed(2));
                                      setPendingGrade(student.id, {
                                        value: (gradeBase - 0.25).toFixed(2),
                                        base: gradeBase,
                                        modifier: "-",
                                      });
                                      return;
                                    }

                                    setGradeBase(item as number);
                                    setGradeModifier("");
                                    setGradeValue(`${item}.00`);
                                    setPendingGrade(student.id, {
                                      value: `${item}.00`,
                                      base: item as number,
                                      modifier: "",
                                    });
                                  }}
                                  disabled={
                                    (item === "+" && (!gradeBase || gradeBase === 6)) ||
                                    (item === "-" && (!gradeBase || gradeBase === 1))
                                  }
                                  className={`h-8 rounded-md text-xs font-semibold transition-all ${
                                    isModifier
                                      ? isActiveModifier
                                        ? "bg-emerald-500 text-black"
                                        : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                      : gradeBase === item
                                      ? "bg-emerald-500 text-black"
                                      : "bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                                  }`}
                                >
                                  {item}
                                </button>
                              );
                            })}
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-emerald-400">{gradeValue || "-"}</div>
                            <button
                              type="button"
                              onClick={() => {
                                setPendingGrades((prev) => {
                                  const next = { ...prev };
                                  delete next[student.id];
                                  return next;
                                });
                                setGradeValue("");
                                setGradeBase(null);
                                setGradeModifier("");
                              }}
                              className="text-xs text-red-400 hover:text-red-300"
                            >
                              Usuń tymczasową ocenę
                            </button>
                          </div>
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
