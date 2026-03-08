import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { keys } from "../../services/queryKeys";
import { getStudents, getSubjects } from "../../services/api";
import AddGradeModal from "./AddGradeModal";
import AddPeriodGradeModal from "./AddPeriodGradeModal";

export default function TeacherGradesPage() {
  const [isAddGradeModalOpen, setIsAddGradeModalOpen] = useState(false);
  const [isAddPeriodGradeModalOpen, setIsAddPeriodGradeModalOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const { data: students, isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: keys.students?.() ?? ["students"],
    queryFn: getStudents,
  });

  const { data: subjects, isLoading: subjectsLoading, error: subjectsError } = useQuery({
    queryKey: keys.subjects?.() ?? ["subjects"],
    queryFn: getSubjects,
  });

  if (studentsLoading || subjectsLoading) return <Spinner label="Ładowanie danych nauczyciela..." />;
  if (studentsError) return <ErrorState message={`Błąd: ${(studentsError as Error).message}`} />;
  if (subjectsError) return <ErrorState message={`Błąd: ${(subjectsError as Error).message}`} />;

  return (
    <div className="space-y-6 p-6">
      <h1 className="page-title">Wystawianie Ocen</h1>

      <Card>
        <h2 className="section-title mb-4">Filtry</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <h2 className="section-title">Uczniowie</h2>
          <div className="space-x-2">
            <Button onClick={() => setIsAddGradeModalOpen(true)}>+ Dodaj ocenę</Button>
            <Button onClick={() => setIsAddPeriodGradeModalOpen(true)} className="btn-ghost">+ Ocena okresowa</Button>
          </div>
        </div>

        {students && students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4">Imię i Nazwisko</th>
                  <th className="text-left py-3 px-4">Klasa</th>
                  <th className="text-left py-3 px-4">Ostatnie oceny</th>
                  <th className="text-right py-3 px-4">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                    <td className="py-3 px-4">{student.user?.first_name} {student.user?.last_name}</td>
                    <td className="py-3 px-4">Klasa</td>
                    <td className="py-3 px-4">Brak ocen</td>
                    <td className="text-right py-3 px-4">
                      <Button 
                        onClick={() => {
                          setSelectedStudentId(student.id);
                          setIsAddGradeModalOpen(true);
                        }} 
                        className="text-xs"
                      >
                        Dodaj ocenę
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState message="Brak uczniów" />
        )}
      </Card>

      <AddGradeModal
        open={isAddGradeModalOpen}
        onClose={() => {
          setIsAddGradeModalOpen(false);
          setSelectedStudentId(null);
        }}
        studentId={selectedStudentId ?? undefined}
        students={students || []}
        subjects={subjects || []}
      />

      <AddPeriodGradeModal
        open={isAddPeriodGradeModalOpen}
        onClose={() => {
          setIsAddPeriodGradeModalOpen(false);
          setSelectedStudentId(null);
        }}
        studentId={selectedStudentId ?? undefined}
        students={students || []}
        subjects={subjects || []}
      />
    </div>
  );
}
