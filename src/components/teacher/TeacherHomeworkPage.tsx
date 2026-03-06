import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { keys } from "../../services/queryKeys";
import { getHomework, getClasses, getSubjects } from "../../services/api";

export default function TeacherHomeworkPage() {
  const queryClient = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [_selectedHomework, _setSelectedHomework] = useState<any | null>(null);

  const { data: classes, isLoading: classesLoading, error: classesError } = useQuery({
    queryKey: keys.classes?.() ?? ["classes"],
    queryFn: getClasses,
  });

  const { data: subjects, isLoading: subjectsLoading, error: subjectsError } = useQuery({
    queryKey: keys.subjects?.() ?? ["subjects"],
    queryFn: getSubjects,
  });

  const { data: homework, isLoading: homeworkLoading, error: homeworkError } = useQuery({
    queryKey: selectedClassId ? [keys.homework?.(selectedClassId)] : ["homework"],
    queryFn: () => (selectedClassId ? getHomework(selectedClassId, selectedSubjectId ?? undefined) : Promise.resolve([])),
    enabled: !!selectedClassId,
  });

  const deleteHomeworkMutation = useMutation({
    mutationFn: (_id: number) => {
      // deleteHomework is optional in the API service - for now we'll just show error
      return Promise.reject(new Error("Delete not implemented"));
    },
    onSuccess: () => {
      toast.success("Praca domowa usunięta");
      queryClient.invalidateQueries({ queryKey: ["homework"] });
    },
    onError: () => toast.error("Błąd przy usuwaniu pracy domowej"),
  });

  if (classesLoading || subjectsLoading) return <Spinner label="Ładowanie danych..." />;
  if (classesError) return <ErrorState message={`Błąd: ${(classesError as Error).message}`} />;
  if (subjectsError) return <ErrorState message={`Błąd: ${(subjectsError as Error).message}`} />;

  return (
    <div className="space-y-6 p-6">
      <h1 className="page-title">Zarządzanie Pracami Domowymi</h1>

      <Card>
        <h2 className="section-title mb-4">Filtry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Klasa</label>
            <select
              value={selectedClassId ?? ""}
              onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : null)}
              className="input-base"
            >
              <option value="">Wybierz klasę</option>
              {classes?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nazwa || `Klasa ${c.numer}`}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Przedmiot</label>
            <select
              value={selectedSubjectId ?? ""}
              onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
              className="input-base"
            >
              <option value="">Wszystkie przedmioty</option>
              {subjects?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nazwa}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="section-title">Prace Domowe</h2>
          <Button onClick={() => setAddModalOpen(true)} className="btn-primary">
            + Dodaj pracę
          </Button>
        </div>

        {homeworkLoading ? (
          <Spinner label="Ładowanie prac..." />
        ) : homeworkError ? (
          <ErrorState message={`Błąd: ${(homeworkError as Error).message}`} />
        ) : homework && homework.length > 0 ? (
          <div className="space-y-3">
            {homework.map((hw) => (
              <div key={hw.id} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-zinc-100">Termin: {hw.termin}</h3>
                    <p className="text-sm text-zinc-400 mt-1">{hw.opis}</p>
                  </div>
                  <div className="space-x-2">
                    <Button
                      onClick={() => {
                        _setSelectedHomework(hw);
                        setEditModalOpen(true);
                      }}
                      className="btn-ghost text-xs"
                    >
                      Edytuj
                    </Button>
                    <Button
                      onClick={() => deleteHomeworkMutation.mutate(hw.id)}
                      className="btn-danger text-xs"
                    >
                      Usuń
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState message="Brak prac domowych dla wybranej klasy" />
        )}
      </Card>

      <Modal open={addModalOpen} onClose={() => setAddModalOpen(false)} title="Dodaj pracę domową">
        <div className="space-y-4">
          <p className="text-zinc-400">Modal do dodawania pracy domowej zostanie zaimplementowany...</p>
        </div>
      </Modal>

      <Modal open={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edytuj pracę domową">
        <div className="space-y-4">
          <p className="text-zinc-400">Modal do edycji pracy domowej zostanie zaimplementowany...</p>
        </div>
      </Modal>
    </div>
  );
}
