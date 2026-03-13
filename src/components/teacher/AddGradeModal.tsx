import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { createGrade } from "../../services/api";
import { getCurrentUser } from "../../services/auth";

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
  students: any[];
  subjects: any[];
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
  const [baseGrade, setBaseGrade] = useState<number | null>(null);
  const [modifier, setModifier] = useState<string>('');

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
      } as any),
    onSuccess: () => {
      toast.success("Ocena dodana");
      queryClient.invalidateQueries({ queryKey: ["grades"] });
      reset();
      setBaseGrade(null);
      setModifier('');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Błąd przy dodawaniu oceny");
    },
  });

  const handleBaseClick = (num: number) => {
    setBaseGrade(num);
    setModifier('');
    const val = num + '.00';
    setValue("wartosc", val);
  };

  const handleModifierClick = (mod: '+' | '-') => {
    if (!baseGrade) return;
    if (mod === '-' && baseGrade === 1) return;
    if (mod === '+' && baseGrade === 6) return;
    setModifier(mod);
    let val: string;
    if (mod === '+') {
      val = (baseGrade + 0.5).toFixed(2);
    } else {
      val = (baseGrade - 0.25).toFixed(2);
    }
    setValue("wartosc", val);
  };

  const selectedStudent = students.find((s) => s.id === studentId);

  const onSubmit = (data: GradeFormData) => {
    createGradeMutation.mutate(data);
  };

  if (!open) return null;

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
              <p className="text-sm font-semibold text-foreground">
                {selectedStudent ? `${selectedStudent.user?.first_name} ${selectedStudent.user?.last_name}` : "Wybierz ucznia"}
              </p>
              <p className="text-xs text-muted-foreground">Wybierz ucznia, zanim dodasz ocenę</p>
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
                  {students?.map((s) => (
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
            <div className="grid grid-cols-6 gap-2">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleBaseClick(num)}
                  className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                    baseGrade === num
                      ? "bg-blue-600 text-white border-2 border-blue-400"
                      : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleModifierClick('+')}
                disabled={!baseGrade || baseGrade === 6}
                className={`py-1 px-2 rounded text-sm font-semibold transition-all ${
                  modifier === '+' && baseGrade
                    ? "bg-blue-600 text-white border-2 border-blue-400"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleModifierClick('-')}
                disabled={!baseGrade || baseGrade === 1}
                className={`py-1 px-2 rounded text-sm font-semibold transition-all ${
                  modifier === '-' && baseGrade
                    ? "bg-blue-600 text-white border-2 border-blue-400"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
                }`}
              >
                -
              </button>
            </div>
            <div className="flex flex-col items-center justify-center w-24 h-24 rounded-xl bg-zinc-900/50">
              <span className="text-3xl font-bold text-emerald-400">
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
