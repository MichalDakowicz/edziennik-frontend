import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Teacher } from "../../types/api";
import { Modal } from "../ui/Modal";

const schema = z.object({
  odbiorca: z.number({ required_error: "Wybierz odbiorcę" }),
  temat: z.string().min(1, "Temat jest wymagany").max(255),
  tresc: z.string().min(1, "Treść jest wymagana"),
});

type FormValues = z.infer<typeof schema>;

export default function ComposeMessage({
  open,
  onClose,
  teachers,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  teachers: Teacher[];
  onSubmit: (values: FormValues) => Promise<void>;
  loading: boolean;
}) {
  const [search, setSearch] = useState("");
  const [errors, setErrors] = useState<Partial<Record<keyof FormValues, string>>>({});

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      odbiorca: teachers[0]?.user.id ?? 0,
      temat: "",
      tresc: "",
    },
  });

  const odbiorcaField = register("odbiorca", { valueAsNumber: true });

  const filteredTeachers = teachers.filter((teacher) =>
    `${teacher.user.first_name} ${teacher.user.last_name}`.toLowerCase().includes(search.toLowerCase()),
  );

  const submit = handleSubmit(async (values) => {
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const firstErrors: Partial<Record<keyof FormValues, string>> = {};
      parsed.error.errors.forEach((error) => {
        const key = error.path[0] as keyof FormValues;
        firstErrors[key] = error.message;
      });
      setErrors(firstErrors);
      return;
    }
    setErrors({});
    await onSubmit(parsed.data);
    reset();
    onClose();
  });

  return (
    <Modal open={open} onClose={onClose} title="Nowa wiadomość" className="max-w-lg">
      <form className="space-y-4" onSubmit={submit}>
        <div>
          <label htmlFor="teacher-search" className="block text-sm font-semibold text-on-surface font-body mb-1.5">Wyszukaj nauczyciela</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-sm">search</span>
            <input
              id="teacher-search"
              className="w-full bg-surface-container-high border-none rounded-xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container transition-all"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Np. Jan Kowalski"
            />
          </div>
        </div>

        <div>
          <label htmlFor="odbiorca" className="block text-sm font-semibold text-on-surface font-body mb-1.5">Odbiorca</label>
          <select
            id="odbiorca"
            className="w-full bg-surface-container-high border-none rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container transition-all"
            value={watch("odbiorca")}
            onChange={(event) => {
              setValue("odbiorca", Number(event.target.value));
              odbiorcaField.onChange(event);
            }}
            name={odbiorcaField.name}
            ref={odbiorcaField.ref}
            onBlur={odbiorcaField.onBlur}
          >
            {filteredTeachers.map((teacher) => (
              <option key={teacher.id} value={teacher.user.id}>
                {teacher.user.first_name} {teacher.user.last_name}
              </option>
            ))}
          </select>
          {errors.odbiorca && <p className="text-error text-xs mt-1">{errors.odbiorca}</p>}
        </div>

        <div>
          <label htmlFor="temat" className="block text-sm font-semibold text-on-surface font-body mb-1.5">Temat</label>
          <input
            id="temat"
            className="w-full bg-surface-container-high border-none rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container transition-all"
            {...register("temat")}
          />
          {errors.temat && <p className="text-error text-xs mt-1">{errors.temat}</p>}
        </div>

        <div>
          <label htmlFor="tresc" className="block text-sm font-semibold text-on-surface font-body mb-1.5">Treść</label>
          <textarea
            id="tresc"
            className="w-full bg-surface-container-high border-none rounded-xl py-2.5 px-3 text-sm focus:ring-2 focus:ring-primary focus:bg-surface-container transition-all min-h-[120px]"
            {...register("tresc")}
          />
          {errors.tresc && <p className="text-error text-xs mt-1">{errors.tresc}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-primary to-primary-container text-white py-3 px-4 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          disabled={loading}
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
          {loading ? "Wysyłanie..." : "Wyślij"}
        </button>
      </form>
    </Modal>
  );
}
