import { useMemo, useRef, useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { Modal } from "../ui/Modal";
import { createGrade } from "../../services/api";
import { getCurrentUser } from "../../services/auth";
import type { Student, Subject } from "../../types/api";

type Modifier = "+" | "-" | "";

const getGradeValue = (num: number, mod: Modifier): number => {
  if (mod === "+") return num + 0.5;
  if (mod === "-") return num - 0.25;
  return num;
};

const getGradeStyles = (num: number | null, mod: Modifier) => {
  if (num === null) return "bg-surface-container-highest text-on-surface-variant font-body border-border";

  const value = getGradeValue(num, mod);

  if (value >= 5.0) return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50";
  if (value >= 4.0) return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50";
  if (value >= 3.0) return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/50";
  if (value >= 2.0) return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50";
  return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50";
};

const gradeSchema = z.object({
  uczen: z.number({ required_error: "Wybierz ucznia" }),
  przedmiot: z.number({ required_error: "Wybierz przedmiot" }),
  wartosc: z.string().regex(/^\d(\.\d{1,2})?$/, "Nieprawidłowa ocena").refine((v) => {
    const n = parseFloat(v);
    return n >= 1 && n <= 6;
  }, "Ocena musi być od 1 do 6"),
  waga: z.number().int().min(1).max(5),
  opis: z.string(),
  czy_do_sredniej: z.boolean(),
  czy_punkty: z.boolean(),
  czy_opisowa: z.boolean(),
}).strict();

type GradeFormData = z.infer<typeof gradeSchema>;

interface AddGradeModalProps {
  open: boolean;
  onClose: () => void;
  studentId?: number;
  subjectId?: number;
  weight?: number;
  description?: string;
  doSredniej?: boolean;
  punkty?: boolean;
  opisowa?: boolean;
  students: Student[];
  subjects: Subject[];
}

export default function AddGradeModal({
  open,
  onClose,
  studentId,
  subjectId,
  weight,
  description,
  doSredniej,
  punkty,
  opisowa,
  students,
  subjects,
}: AddGradeModalProps) {
  const queryClient = useQueryClient();
  const user = getCurrentUser();
  const [isGradeMenuOpen, setIsGradeMenuOpen] = useState(false);
  const [baseGrade, setBaseGrade] = useState<number | null>(null);
  const [modifier, setModifier] = useState<Modifier>("");
  const gradeMenuRef = useRef<HTMLDivElement | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<GradeFormData>({
    resolver: zodResolver(gradeSchema),
    defaultValues: {
      uczen: studentId ?? 0,
      przedmiot: subjectId ?? 0,
      wartosc: "",
      waga: weight ?? 1,
      opis: description ?? "",
      czy_do_sredniej: doSredniej ?? true,
      czy_punkty: punkty ?? false,
      czy_opisowa: opisowa ?? false,
    },
  });

  const wartosc = watch("wartosc");

  // Close grade menu when clicking outside
  useEffect(() => {
    if (!isGradeMenuOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (gradeMenuRef.current && !gradeMenuRef.current.contains(event.target as Node)) {
        setIsGradeMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isGradeMenuOpen]);

  useEffect(() => {
    if (studentId && studentId > 0) {
      setValue("uczen", studentId);
    }
    if (subjectId && subjectId > 0) {
      setValue("przedmiot", subjectId);
    }
    if (weight && weight > 0) {
      setValue("waga", weight);
    }
    if (description !== undefined) {
      setValue("opis", description);
    }
    if (doSredniej !== undefined) {
      setValue("czy_do_sredniej", doSredniej);
    }
    if (punkty !== undefined) {
      setValue("czy_punkty", punkty);
    }
    if (opisowa !== undefined) {
      setValue("czy_opisowa", opisowa);
    }
  }, [studentId, subjectId, weight, description, doSredniej, punkty, opisowa, setValue]);

  // Keep visual selector in sync when user types manually
  useEffect(() => {
    const raw = (wartosc ?? "").trim();
    if (!raw) {
      setBaseGrade(null);
      setModifier("");
      return;
    }
    const n = Number(raw);
    if (Number.isNaN(n)) return;

    const rounded = Math.round(n * 100) / 100;
    const frac = Math.round((rounded - Math.floor(rounded)) * 100) / 100;

    // Supported fractional parts: .00 (plain), .50 (+), .75 (-)
    if (frac === 0) {
      const base = Math.floor(rounded);
      if (base >= 1 && base <= 6) {
        setBaseGrade(base);
        setModifier("");
      }
      return;
    }
    if (frac === 0.5) {
      const base = Math.floor(rounded);
      if (base >= 1 && base <= 6) {
        setBaseGrade(base);
        setModifier("+");
      }
      return;
    }
    if (frac === 0.75) {
      const base = Math.ceil(rounded);
      if (base >= 1 && base <= 6) {
        setBaseGrade(base);
        setModifier("-");
      }
    }
  }, [wartosc]);

  const createGradeMutation = useMutation({
    mutationFn: (data: GradeFormData) =>
      createGrade({
        uczen: data.uczen,
        przedmiot: data.przedmiot,
        wartosc: data.wartosc,
        waga: data.waga,
        opis: data.opis || null,
        czy_do_sredniej: data.czy_do_sredniej,
        czy_punkty: data.czy_punkty,
        czy_opisowa: data.czy_opisowa,
        nauczyciel: user?.teacherId ?? null,
      }),
    onSuccess: () => {
      toast.success("Ocena dodana");
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      reset();
      setBaseGrade(null);
      setModifier('');
      onClose();
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : "Błąd przy dodawaniu oceny");
    },
  });

  const setGradeValue = (num: number | null, mod: Modifier) => {
    if (num === null) {
      setValue("wartosc", "");
      return;
    }
    const val = getGradeValue(num, mod).toFixed(2);
    setValue("wartosc", val);
  };

  const handleNumberSelect = (num: number) => {
    if (baseGrade === num) {
      setBaseGrade(null);
      setModifier("");
      setGradeValue(null, "");
      return;
    }
    setBaseGrade(num);
    // Clear conflicting modifiers
    if (num === 1 && modifier === "-") setModifier("");
    if (num === 6 && modifier === "+") setModifier("");
    setGradeValue(num, modifier === "+" && num === 6 ? "" : modifier === "-" && num === 1 ? "" : modifier);
  };

  const handleModifierSelect = (mod: Modifier) => {
    if (!baseGrade) return;
    if (mod === "+" && baseGrade === 6) return;
    if (mod === "-" && baseGrade === 1) return;
    const next = modifier === mod ? "" : mod;
    setModifier(next);
    setGradeValue(baseGrade, next);
  };

  const selectedStudent = students.find((s: Student) => s.id === studentId);

  const onSubmit = (data: GradeFormData) => {
    createGradeMutation.mutate(data);
  };

  if (!open) return null;

  const activeStyles = useMemo(() => getGradeStyles(baseGrade, modifier), [baseGrade, modifier]);

  return (
    <Modal open={open} onClose={onClose} title="Dodaj ocenę">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Uczeń */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Uczeń *
          </label>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface font-body">
                {selectedStudent ? `${selectedStudent.user?.first_name} ${selectedStudent.user?.last_name}` : "Wybierz ucznia"}
              </p>
              <p className="text-xs text-on-surface-variant font-body">Wybierz ucznia, zanim dodasz ocenę</p>
            </div>
            <Controller
              name="uczen"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                  className="input-base max-w-xs"
                >
                  <option value="">Wybierz ucznia</option>
                  {students?.map((s: Student) => (
                    <option key={s.id} value={s.id}>
                      {s.user?.first_name} {s.user?.last_name}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          {errors.uczen && (
            <p className="text-red-400 text-sm mt-1">{errors.uczen.message}</p>
          )}
        </div>

        {/* Przedmiot */}
        {!subjectId && (
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Przedmiot *
            </label>
            <Controller
              name="przedmiot"
              control={control}
              render={({ field }) => (
                <select
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                  className="input-base max-w-xs"
                >
                  <option value="">Wybierz przedmiot</option>
                  {subjects?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nazwa}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.przedmiot && (
              <p className="text-red-400 text-sm mt-1">
                {errors.przedmiot.message}
              </p>
            )}
          </div>
        )}

        {/* Wartość oceny */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Wartość oceny *
          </label>
          <div className="flex items-start gap-4 mb-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsGradeMenuOpen((v) => !v)}
                className={`w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-3xl border-2 transition-all duration-200 shadow-sm select-none ${
                  isGradeMenuOpen ? `border-solid ${activeStyles}` : `border-dashed ${activeStyles}`
                } bg-background`}
              >
                {baseGrade === null && modifier === "" ? (
                  <Plus size={36} strokeWidth={1.5} className="text-on-surface-variant font-body" />
                ) : (
                  <div className="flex items-baseline text-4xl md:text-5xl font-bold tabular-nums">
                    {baseGrade}
                    {modifier && <span className="text-2xl md:text-3xl ml-1 opacity-80">{modifier}</span>}
                  </div>
                )}
              </button>

              <div
                ref={gradeMenuRef}
                className={`absolute bottom-full right-full mb-2 mr-2 p-2 rounded-3xl  shadow-lg z-50 w-72 bg-popover text-popover-foreground origin-bottom-right transition-all duration-150 ${
                  isGradeMenuOpen ? "opacity-100 scale-100 translate-x-0 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 translate-x-2 translate-y-2 pointer-events-none"
                }`}
              >
                <div className="grid grid-cols-4 gap-1.5">
                  <div className="col-span-3 grid grid-cols-3 gap-1.5">
                    {[1, 3, 5, 2, 4, 6].map((n) => {
                      const isActive = baseGrade === n;
                      const styles = getGradeStyles(n, modifier);
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => handleNumberSelect(n)}
                          className={`h-14 rounded-xl text-2xl font-bold transition-all border ${
                            isActive
                              ? `${styles} shadow-sm scale-[1.03] z-10 border-current`
                              : "bg-surface-container-highest text-on-surface-variant font-body hover:bg-surface-container-highest/80 border-border"
                          }`}
                        >
                          {n}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {(["+", "-"] as Modifier[]).map((mod) => {
                      const isActive = modifier === mod;
                      const isDisabled = !baseGrade || (mod === "+" && baseGrade === 6) || (mod === "-" && baseGrade === 1);
                      const styles = baseGrade !== null ? getGradeStyles(baseGrade, mod) : "bg-surface-container-highest text-on-surface-variant font-body border-border";
                      return (
                        <button
                          key={mod}
                          type="button"
                          disabled={isDisabled}
                          onClick={() => handleModifierSelect(mod)}
                          className={`flex-1 rounded-xl text-2xl font-bold transition-all border disabled:opacity-20 disabled:cursor-not-allowed ${
                            isActive
                              ? `${styles} shadow-sm scale-[1.03] z-10 border-current`
                              : "bg-surface-container-highest text-on-surface-variant font-body hover:bg-surface-container-highest/80 border-border"
                          }`}
                        >
                          {mod}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center w-24 h-24 rounded-xl  bg-surface-container-low">
              <span className="text-3xl font-bold tabular-nums text-on-surface font-body">
                {wartosc || "-"}
              </span>
            </div>
          </div>

          {/* Pole tekstowe na wartość */}
          <Controller
            name="wartosc"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="np. 4.50 lub wpisz wartość"
                className="input-base"
              />
            )}
          />
          {errors.wartosc && (
            <p className="text-red-400 text-sm mt-1">{errors.wartosc.message}</p>
          )}

        </div>

        {/* Waga - ukryta, ustawiana z filtrów */}
        {/* <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Waga (1-5)
          </label>
          <Controller
            name="waga"
            control={control}
            render={({ field }) => (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => field.onChange(w)}
                    className={`py-2 px-4 rounded-lg text-sm transition-all ${
                      field.value === w
                        ? "bg-green-600 text-white"
                        : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}
          />
        </div> */}

        {/* (Opis/kategoria + checkboxy przeniesione do filtru pod wagą) */}

        {/* Buttons */}
        <div className="flex gap-3 border-t border-zinc-700 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 btn-ghost"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={createGradeMutation.isPending}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {createGradeMutation.isPending ? (
              <>
                <span className="text-xs">Dodawanie...</span>
              </>
            ) : (
              "Dodaj ocenę"
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
}
