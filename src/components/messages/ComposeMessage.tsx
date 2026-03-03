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
    <Modal open={open} onClose={onClose} title="Nowa wiadomość">
      <form className="space-y-3" onSubmit={submit}>
        <label htmlFor="teacher-search" className="block text-sm text-muted-foreground">Wyszukaj nauczyciela</label>
        <input id="teacher-search" className="input-base" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Np. Jan Kowalski" />

        <label htmlFor="odbiorca" className="block text-sm text-muted-foreground">Odbiorca</label>
        <select
          id="odbiorca"
          className="input-base"
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
        {errors.odbiorca ? <p className="text-red-400 text-xs">{errors.odbiorca}</p> : null}

        <label htmlFor="temat" className="block text-sm text-muted-foreground">Temat</label>
        <input id="temat" className="input-base" {...register("temat")} />
        {errors.temat ? <p className="text-red-400 text-xs">{errors.temat}</p> : null}

        <label htmlFor="tresc" className="block text-sm text-muted-foreground">Treść</label>
        <textarea id="tresc" className="input-base min-h-36" {...register("tresc")} />
        {errors.tresc ? <p className="text-red-400 text-xs">{errors.tresc}</p> : null}

        <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? "Wysyłanie..." : "Wyślij"}</button>
      </form>
    </Modal>
  );
}