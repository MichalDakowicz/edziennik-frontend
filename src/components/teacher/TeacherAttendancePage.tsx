import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { keys } from "../../services/queryKeys";
import {
  createAttendance,
  getAttendance,
  getAttendanceStatuses,
  getClasses,
  getLessonHours,
  getStudents,
  updateAttendance,
} from "../../services/api";
import type { Attendance } from "../../types/api";

const normalizeDate = (value: string) => value.split("T")[0];

const getStatusId = (status: Attendance["status"]) => {
  if (status == null) return null;
  if (typeof status === "object") return status.id ?? null;
  return Number(status);
};

export default function TeacherAttendancePage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedHourId, setSelectedHourId] = useState<number | null>(null);
  const [statusByStudent, setStatusByStudent] = useState<Record<number, number | null>>({});

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

  const { data: students, isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: keys.students?.() ?? ["students"],
    queryFn: getStudents,
  });

  const classStudents = useMemo(() => {
    if (!students || !selectedClassId) return [];
    return students
      .filter((student) => student.klasa === selectedClassId)
      .sort((left, right) => {
        const lastNameComparison = left.user.last_name.localeCompare(right.user.last_name, "pl", {
          sensitivity: "base",
        });
        if (lastNameComparison !== 0) return lastNameComparison;
        return left.user.first_name.localeCompare(right.user.first_name, "pl", {
          sensitivity: "base",
        });
      });
  }, [students, selectedClassId]);

  const existingAttendanceQuery = useQuery({
    queryKey: [
      "teacher-attendance",
      selectedDate,
      selectedHourId,
      selectedClassId,
      classStudents.map((student) => student.id).join(","),
    ],
    enabled: Boolean(selectedClassId && selectedHourId && classStudents.length > 0),
    queryFn: async () => {
      const attendanceByStudent = await Promise.all(
        classStudents.map((student) => getAttendance(student.id, selectedDate, selectedDate)),
      );

      return attendanceByStudent
        .flat()
        .filter(
          (entry) =>
            entry.godzina_lekcyjna === selectedHourId && normalizeDate(entry.Data) === selectedDate,
        );
    },
  });

  useEffect(() => {
    if (!classStudents.length) {
      setStatusByStudent({});
      return;
    }

    const nextStatusByStudent: Record<number, number | null> = {};
    const existingByStudent = new Map(
      (existingAttendanceQuery.data ?? []).map((entry) => [entry.uczen, getStatusId(entry.status)]),
    );

    classStudents.forEach((student) => {
      nextStatusByStudent[student.id] = existingByStudent.get(student.id) ?? null;
    });

    setStatusByStudent(nextStatusByStudent);
  }, [classStudents, existingAttendanceQuery.data, selectedClassId, selectedDate, selectedHourId]);

  const saveAttendanceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedHourId) {
        throw new Error("Wybierz godzinę lekcyjną");
      }

      const existingByStudent = new Map(
        (existingAttendanceQuery.data ?? []).map((entry) => [entry.uczen, entry]),
      );

      const operations = classStudents.map(async (student) => {
        const statusId = statusByStudent[student.id] ?? null;
        if (statusId == null) return null;

        const existing = existingByStudent.get(student.id);
        if (existing) {
          const currentStatusId = getStatusId(existing.status);
          if (currentStatusId === statusId) return null;
          return updateAttendance(existing.id, { status: statusId });
        }

        return createAttendance({
          Data: selectedDate,
          uczen: student.id,
          godzina_lekcyjna: selectedHourId,
          status: statusId,
        });
      });

      await Promise.all(operations);
    },
    onSuccess: () => {
      toast.success("Obecność zapisana");
      queryClient.invalidateQueries({ queryKey: ["teacher-attendance"] });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: (error) => {
      toast.error((error as Error).message || "Błąd zapisu obecności");
    },
  });

  const handleStatusChange = (studentId: number, value: string) => {
    setStatusByStudent((prev) => ({
      ...prev,
      [studentId]: value ? Number(value) : null,
    }));
  };

  if (classesLoading || statusesLoading || hoursLoading || studentsLoading) {
    return <Spinner label="Ładowanie danych..." />;
  }
  if (classesError) return <ErrorState message={`Błąd: ${(classesError as Error).message}`} />;
  if (statusesError) return <ErrorState message={`Błąd: ${(statusesError as Error).message}`} />;
  if (hoursError) return <ErrorState message={`Błąd: ${(hoursError as Error).message}`} />;
  if (studentsError) return <ErrorState message={`Błąd: ${(studentsError as Error).message}`} />;
  if (existingAttendanceQuery.isError) {
    return <ErrorState message={`Błąd: ${(existingAttendanceQuery.error as Error).message}`} />;
  }

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
          classStudents.length ? (
          <div className="overflow-x-auto space-y-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-3 px-4">Imię i Nazwisko</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student) => (
                  <tr key={student.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                    <td className="py-3 px-4">
                      {student.user.first_name} {student.user.last_name}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        className="input-base text-xs min-w-48"
                        value={statusByStudent[student.id] ?? ""}
                        onChange={(event) => handleStatusChange(student.id, event.target.value)}
                      >
                        <option value="">Brak</option>
                        {statuses?.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.Wartosc}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Data: {selectedDate} • Lekcja: {selectedHourId ?? "-"}
              </span>
              <Button
                className="btn-primary"
                onClick={() => saveAttendanceMutation.mutate()}
                disabled={!selectedHourId || saveAttendanceMutation.isPending || existingAttendanceQuery.isFetching}
              >
                {saveAttendanceMutation.isPending ? "Zapisywanie..." : "Zapisz wszystkie"}
              </Button>
            </div>
          </div>
          ) : (
            <EmptyState message="Brak uczniów w wybranej klasie" />
          )
        ) : (
          <EmptyState message="Wybierz klasę aby zobaczyć uczniów" />
        )}
      </Card>
    </div>
  );
}
