import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { keys } from "../../services/queryKeys";
import { getClasses, getAttendanceStatuses, getLessonHours } from "../../services/api";

export default function TeacherAttendancePage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedHourId, setSelectedHourId] = useState<number | null>(null);

  const { data: classes, isLoading: classesLoading, error: classesError } = useQuery({
    queryKey: keys.classes?.() ?? ["classes"],
    queryFn: getClasses,
  });

  const { data: statuses, isLoading: statusesLoading, error: statusesError } = useQuery({
    queryKey: ["statuses"],
    queryFn: getAttendanceStatuses,
  });

  const { data: hours, isLoading: hoursLoading, error: hoursError } = useQuery({
    queryKey: ["lesson-hours"],
    queryFn: getLessonHours,
  });

  if (classesLoading || statusesLoading || hoursLoading) return <Spinner label="Ładowanie danych..." />;
  if (classesError) return <ErrorState message={`Błąd: ${(classesError as Error).message}`} />;
  if (statusesError) return <ErrorState message={`Błąd: ${(statusesError as Error).message}`} />;
  if (hoursError) return <ErrorState message={`Błąd: ${(hoursError as Error).message}`} />;

  return (
    <div className="space-y-6 p-6">
      <h1 className="page-title">Sprawdzanie Obecności</h1>

      <Card>
        <h2 className="section-title mb-4">Ustawienia</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Data</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Godzina lekcji</label>
            <select
              value={selectedHourId ?? ""}
              onChange={(e) => setSelectedHourId(e.target.value ? Number(e.target.value) : null)}
              className="input-base"
            >
              <option value="">Wybierz godzinę</option>
              {hours?.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.Numer}. ({h.CzasOd} - {h.CzasDo})
                </option>
              ))}
            </select>
          </div>
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
        </div>
      </Card>

      <Card>
        <h2 className="section-title mb-4">Uczniowie</h2>
        {selectedClassId ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4">Imię i Nazwisko</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-zinc-800 hover:bg-zinc-900/50">
                  <td className="py-3 px-4">Przykładowy uczeń</td>
                  <td className="py-3 px-4">
                    <select className="input-base text-xs">
                      <option>Brak</option>
                      {statuses?.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.Wartosc}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              </tbody>
            </table>
            <div className="mt-6">
              <Button className="btn-primary">Zapisz wszystkie</Button>
            </div>
          </div>
        ) : (
          <EmptyState message="Wybierz klasę aby zobaczyć uczniów" />
        )}
      </Card>
    </div>
  );
}
