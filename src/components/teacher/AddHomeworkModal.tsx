import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { Spinner } from "../ui/Spinner";
import { createHomework } from "../../services/api";
import { formatClassDisplay } from "../../utils/classUtils";
import { getCurrentUser } from "../../services/auth";

const homeworkSchema = z.object({
  klasa: z.number().min(1, "Klasa jest wymagana"),
  przedmiot: z.number().min(1, "Przedmiot jest wymagany"),
  opis: z.string().min(1, "Opis jest wymagany"),
  termin: z.string().min(1, "Termin jest wymagany"),
});

type HomeworkFormData = z.infer<typeof homeworkSchema>;

interface AddHomeworkModalProps {
  open: boolean;
  onClose: () => void;
  classId?: number;
  subjectId?: number;
  classes: Array<{ id: number; nazwa?: string; numer?: string }>;
  subjects: Array<{ id: number; nazwa: string }>;
}

export default function AddHomeworkModal({
  open,
  onClose,
  classId,
  subjectId,
  classes,
  subjects,
}: AddHomeworkModalProps) {
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HomeworkFormData>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      klasa: classId ?? 0,
      przedmiot: subjectId ?? 0,
      opis: "",
      termin: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      klasa: classId ?? 0,
      przedmiot: subjectId ?? 0,
      opis: "",
      termin: "",
    });
  }, [open, classId, subjectId, reset]);

  const mutation = useMutation({
    mutationFn: createHomework,
    onSuccess: () => {
      toast.success("Praca domowa dodana");
      reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["homework"] });
    },
    onError: (error) => {
      toast.error(`Błąd: ${(error as Error).message}`);
    },
  });

  const onSubmit = (data: HomeworkFormData) => {
    if (!currentUser?.teacherId) {
      toast.error("Brak przypisanego nauczyciela");
      return;
    }

    mutation.mutate({
      klasa: data.klasa,
      przedmiot: data.przedmiot,
      opis: data.opis,
      termin: data.termin,
      nauczyciel: currentUser.teacherId,
      data_wystawienia: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <Modal open={open} onClose={onClose} title="Dodaj pracę domową">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Klasa <span className="text-red-400">*</span>
          </label>
          <Controller
            name="klasa"
            control={control}
            render={({ field }) => (
              <select
                value={field.value || ""}
                onChange={(event) =>
                  field.onChange(event.target.value ? Number(event.target.value) : 0)
                }
                className="input-base w-full"
              >
                <option value="">Wybierz klasę</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {formatClassDisplay(c)}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.klasa && <p className="text-red-400 text-xs mt-1">{errors.klasa.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Przedmiot <span className="text-red-400">*</span>
          </label>
          <Controller
            name="przedmiot"
            control={control}
            render={({ field }) => (
              <select
                value={field.value || ""}
                onChange={(event) =>
                  field.onChange(event.target.value ? Number(event.target.value) : 0)
                }
                className="input-base w-full"
              >
                <option value="">Wybierz przedmiot</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nazwa}
                  </option>
                ))}
              </select>
            )}
          />
          {errors.przedmiot && (
            <p className="text-red-400 text-xs mt-1">{errors.przedmiot.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Opis <span className="text-red-400">*</span>
          </label>
          <Controller
            name="opis"
            control={control}
            render={({ field }) => (
              <textarea
                {...field}
                placeholder="Opisz pracę domową..."
                rows={4}
                className="input-base w-full resize-none"
              />
            )}
          />
          {errors.opis && <p className="text-red-400 text-xs mt-1">{errors.opis.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Termin <span className="text-red-400">*</span>
          </label>
          <Controller
            name="termin"
            control={control}
            render={({ field }) => <input {...field} type="date" className="input-base w-full" />}
          />
          {errors.termin && <p className="text-red-400 text-xs mt-1">{errors.termin.message}</p>}
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="btn-ghost"
            disabled={mutation.isPending}
          >
            Anuluj
          </button>
          <button type="submit" className="btn-primary flex items-center gap-2" disabled={mutation.isPending}>
            {mutation.isPending && <Spinner />}
            Dodaj
          </button>
        </div>
      </form>
    </Modal>
  );
}
