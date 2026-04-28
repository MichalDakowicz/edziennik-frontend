import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Modal } from "../ui/Modal";
import { Spinner } from "../ui/Spinner";
import { updateHomework } from "../../services/api";
import type { Homework, Subject } from "../../types/api";

const homeworkSchema = z.object({
  opis: z.string().min(1, "Opis jest wymagany"),
  termin: z.string().min(1, "Termin jest wymagany"),
});

type HomeworkFormData = z.infer<typeof homeworkSchema>;

interface EditHomeworkModalProps {
  open: boolean;
  onClose: () => void;
  homework?: Homework;
}

export default function EditHomeworkModal({ open, onClose, homework }: EditHomeworkModalProps) {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<HomeworkFormData>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      opis: homework?.opis ?? "",
      termin: homework?.termin ?? "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: HomeworkFormData) =>
      updateHomework(homework!.id, {
        opis: data.opis,
        termin: data.termin,
      }),
    onSuccess: () => {
      toast.success("Praca domowa zaktualizowana");
      reset();
      onClose();
      queryClient.invalidateQueries({ queryKey: ["homework"] });
    },
    onError: (error) => {
      toast.error(`Błąd: ${(error as Error).message}`);
    },
  });

  useEffect(() => {
    if (!open || !homework) return;
    reset({
      opis: homework.opis,
      termin: homework.termin,
    });
  }, [open, homework, reset]);

  const onSubmit = (data: HomeworkFormData) => {
    if (!homework) {
      toast.error("Brak pracy domowej do edycji");
      return;
    }
    mutation.mutate(data);
  };

  return (
    <Modal open={open} onClose={onClose} title="Edytuj pracę domową">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-1">
            Przedmiot
          </label>
          <div className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded text-zinc-400">
            {typeof homework?.przedmiot === "object" && homework?.przedmiot && "nazwa" in homework.przedmiot
              ? (homework.przedmiot as Subject).nazwa ?? "N/A"
              : "N/A"}
          </div>
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
            Zapisz
          </button>
        </div>
      </form>
    </Modal>
  );
}
