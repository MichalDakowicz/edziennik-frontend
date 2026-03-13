import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { createPeriodGrade } from "../../services/api";
import { getCurrentUser } from "../../services/auth";

const periodGradeSchema = z.object({
  uczen: z.number({ required_error: "Wybierz ucznia" }),
  przedmiot: z.number({ required_error: "Wybierz przedmiot" }),
  okres: z.enum(["1", "2"], { required_error: "Wybierz okres" }),
  wartosc: z.string().regex(/^\d(\.\d{1,2})?$/, "Nieprawidłowa ocena").refine((v) => {
    const n = parseFloat(v);
    return n >= 1 && n <= 6;
  }, "Ocena musi być od 1 do 6"),
});

type PeriodGradeFormData = z.infer<typeof periodGradeSchema>;

interface AddPeriodGradeModalProps {
  open: boolean;
  onClose: () => void;
  studentId?: number;
  subjectId?: number;
  students: any[];
  subjects: any[];
}

export default function AddPeriodGradeModal({
  open,
  onClose,
  studentId,
  subjectId,
  students,
  subjects,
}: AddPeriodGradeModalProps) {
  const queryClient = useQueryClient();
  const user = getCurrentUser();

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PeriodGradeFormData>({
    resolver: zodResolver(periodGradeSchema),
    defaultValues: {
      uczen: studentId ?? undefined,
      przedmiot: subjectId ?? undefined,
      okres: "1",
      wartosc: "",
    },
  });

  useEffect(() => {
    if (studentId && studentId > 0) {
      setValue("uczen", studentId);
    }
    if (subjectId && subjectId > 0) {
      setValue("przedmiot", subjectId);
    }
  }, [studentId, subjectId, setValue]);

  const createPeriodGradeMutation = useMutation({
    mutationFn: (data: PeriodGradeFormData) =>
      createPeriodGrade({
        uczen: data.uczen,
        przedmiot: data.przedmiot,
        okres: parseInt(data.okres),
        wartosc: data.wartosc,
        nauczyciel: user?.teacherId ?? null,
      } as any),
    onSuccess: () => {
      toast.success("Ocena okresowa dodana");
      queryClient.invalidateQueries({ queryKey: ["period-grades"] });
      reset();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Błąd przy dodawaniu oceny okresowej");
    },
  });

  const onSubmit = (data: PeriodGradeFormData) => {
    createPeriodGradeMutation.mutate(data);
  };

  if (!open) return null;

  return (
    <Modal open={open} onClose={onClose} title="Dodaj ocenę okresową">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Uczeń */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Uczeń *
          </label>
          <Controller
            name="uczen"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                className="input-base"
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
          {errors.uczen && (
            <p className="text-red-400 text-sm mt-1">{errors.uczen.message}</p>
          )}
        </div>

        {/* Przedmiot */}
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

        {/* Okres */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Okres *
          </label>
          <Controller
            name="okres"
            control={control}
            render={({ field }) => (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => field.onChange("1")}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    field.value === "1"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  I półrocze
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange("2")}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    field.value === "2"
                      ? "bg-blue-600 text-white"
                      : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                  }`}
                >
                  II półrocze
                </button>
              </div>
            )}
          />
        </div>

        {/* Wartość */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Wartość oceny (1-6) *
          </label>
          <Controller
            name="wartosc"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="np. 4.5 lub 5"
                className="input-base"
              />
            )}
          />
          {errors.wartosc && (
            <p className="text-red-400 text-sm mt-1">{errors.wartosc.message}</p>
          )}
        </div>

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
            disabled={createPeriodGradeMutation.isPending}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createPeriodGradeMutation.isPending
              ? "Dodawanie..."
              : "Dodaj ocenę"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
