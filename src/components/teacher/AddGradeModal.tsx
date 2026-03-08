import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { createGrade } from "../../services/api";
import { getCurrentUser } from "../../services/auth";
import { Badge } from "../ui/Badge";

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

const gradeValues = [
  { label: "1", value: "1.00" },
  { label: "1+", value: "1.50" },
  { label: "2", value: "2.00" },
  { label: "2+", value: "2.50" },
  { label: "3", value: "3.00" },
  { label: "3+", value: "3.50" },
  { label: "4", value: "4.00" },
  { label: "4+", value: "4.50" },
  { label: "5", value: "5.00" },
  { label: "5-", value: "4.75" },
  { label: "6", value: "6.00" },
];

interface AddGradeModalProps {
  open: boolean;
  onClose: () => void;
  studentId?: number;
  students: any[];
  subjects: any[];
}

export default function AddGradeModal({
  open,
  onClose,
  studentId,
  students,
  subjects,
}: AddGradeModalProps) {
  const queryClient = useQueryClient();
  const user = getCurrentUser();
  const [selectedGradeButton, setSelectedGradeButton] = useState<string | null>(null);

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
      przedmiot: 0,
      wartosc: "",
      waga: 1,
      opis: "",
      czy_do_sredniej: true,
      czy_punkty: false,
      czy_opisowa: false,
    },
  });

  const wartosc = watch("wartosc");

  useEffect(() => {
    if (studentId && studentId > 0) {
      setValue("uczen", studentId);
    }
  }, [studentId, setValue]);

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
      setSelectedGradeButton(null);
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || "Błąd przy dodawaniu oceny");
    },
  });

  const handleGradeButtonClick = (value: string) => {
    setSelectedGradeButton(value);
    setValue("wartosc", value);
  };

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
                className="input-base"
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

        {/* Wartość oceny */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Wartość oceny *
          </label>
          <div className="grid grid-cols-5 gap-2 mb-3">
            {gradeValues.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => handleGradeButtonClick(g.value)}
                className={`py-2 px-3 rounded-lg font-semibold text-sm transition-all ${
                  selectedGradeButton === g.value
                    ? "bg-blue-600 text-white border-2 border-blue-400"
                    : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                {g.label}
              </button>
            ))}
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

          {/* Preview */}
          {wartosc && !errors.wartosc && (
            <div className="mt-3 p-3 bg-zinc-900/50 rounded-lg flex items-center gap-2">
              <span className="text-zinc-400 text-sm">Podgląd:</span>
              <Badge variant="default">Ocena: {wartosc}</Badge>
            </div>
          )}
        </div>

        {/* Waga */}
        <div>
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
        </div>

        {/* Opis */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Opis / Kategoria
          </label>
          <Controller
            name="opis"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="np. Klasówka, odpowiedź ustna..."
                maxLength={200}
                className="input-base"
              />
            )}
          />
        </div>

        {/* Checkboxy */}
        <div className="space-y-3 border-t border-zinc-700 pt-4">
          <div className="flex items-center gap-3">
            <Controller
              name="czy_do_sredniej"
              control={control}
              render={({ field: { value, onChange } }) => (
                <input
                  type="checkbox"
                  checked={value}
                  onChange={onChange}
                  className="w-4 h-4 cursor-pointer"
                  id="czy_do_sredniej"
                />
              )}
            />
            <label htmlFor="czy_do_sredniej" className="text-zinc-300 cursor-pointer">
              Czy do średniej
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Controller
              name="czy_punkty"
              control={control}
              render={({ field: { value, onChange } }) => (
                <input
                  type="checkbox"
                  checked={value}
                  onChange={onChange}
                  className="w-4 h-4 cursor-pointer"
                  id="czy_punkty"
                />
              )}
            />
            <label htmlFor="czy_punkty" className="text-zinc-300 cursor-pointer">
              Czy punktowa
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Controller
              name="czy_opisowa"
              control={control}
              render={({ field: { value, onChange } }) => (
                <input
                  type="checkbox"
                  checked={value}
                  onChange={onChange}
                  className="w-4 h-4 cursor-pointer"
                  id="czy_opisowa"
                />
              )}
            />
            <label htmlFor="czy_opisowa" className="text-zinc-300 cursor-pointer">
              Czy opisowa
            </label>
          </div>
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
