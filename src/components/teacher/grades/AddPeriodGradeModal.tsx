import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Modal } from '../../ui/Modal';
import { createPeriodGrade } from '../../../services/api';
import { getCurrentUser } from '../../../services/auth';
import GradePicker from './GradePicker';

const periodGradeSchema = z.object({
  uczen: z.number({ required_error: 'Wybierz ucznia' }),
  przedmiot: z.number({ required_error: 'Wybierz przedmiot' }),
  okres: z.enum(['1', '2'], { required_error: 'Wybierz okres' }),
  wartosc: z.string().regex(/^\d(\.\d{1,2})?$/, 'Nieprawidłowa ocena').refine((v) => {
    const n = parseFloat(v);
    return n >= 1 && n <= 6;
  }, 'Ocena musi być od 1 do 6'),
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
  const [gradeValue, setGradeValue] = useState('');

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
      okres: '1',
      wartosc: '',
    },
  });

  useEffect(() => {
    if (studentId && studentId > 0) {
      setValue('uczen', studentId);
    }
    if (subjectId && subjectId > 0) {
      setValue('przedmiot', subjectId);
    }
  }, [studentId, subjectId, setValue]);

  useEffect(() => {
    if (!open) {
      setGradeValue('');
      reset();
    }
  }, [open, reset]);

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
      toast.success('Ocena okresowa dodana');
      queryClient.invalidateQueries({ queryKey: ['period-grades'] });
      reset();
      setGradeValue('');
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Błąd przy dodawaniu oceny okresowej');
    },
  });

  const onSubmit = (data: PeriodGradeFormData) => {
    createPeriodGradeMutation.mutate(data);
  };

  return (
    <Modal open={open} onClose={onClose} title="Dodaj ocenę okresową">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-2">Uczeń *</label>
          <Controller
            name="uczen"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
          {errors.uczen && <p className="text-red-400 text-sm mt-1">{errors.uczen.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-2">Przedmiot *</label>
          <Controller
            name="przedmiot"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                className="w-full max-w-xs rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
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
          {errors.przedmiot && <p className="text-red-400 text-sm mt-1">{errors.przedmiot.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-2">Okres *</label>
          <Controller
            name="okres"
            control={control}
            render={({ field }) => (
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => field.onChange('1')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    field.value === '1'
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  I półrocze
                </button>
                <button
                  type="button"
                  onClick={() => field.onChange('2')}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    field.value === '2'
                      ? 'bg-primary text-white'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                >
                  II półrocze
                </button>
              </div>
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-on-surface-variant mb-3">Wartość oceny (1-6) *</label>
          <GradePicker
            value={gradeValue}
            onChange={(val) => {
              setGradeValue(val);
              setValue('wartosc', val);
            }}
          />
          <Controller
            name="wartosc"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="text"
                placeholder="np. 4.50 lub wpisz wartość"
                className="w-full mt-3 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            )}
          />
          {errors.wartosc && <p className="text-red-400 text-sm mt-1">{errors.wartosc.message}</p>}
        </div>

        <div className="flex gap-3 border-t border-outline-variant/30 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-on-surface-variant bg-surface-container hover:bg-surface-container-high transition-colors"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={createPeriodGradeMutation.isPending}
            className="flex-1 py-2.5 px-4 rounded-lg font-medium text-white bg-primary hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {createPeriodGradeMutation.isPending ? 'Dodawanie...' : 'Dodaj ocenę'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
