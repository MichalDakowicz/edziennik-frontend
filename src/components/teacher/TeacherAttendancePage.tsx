import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Check, X, Clock, AlertCircle } from "lucide-react";
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
import type { AttendanceStatus, Attendance, LessonHour } from "../../types/api";
import { formatClassDisplay, getClassJournalNumberMap, sortStudentsAlphabetically } from "../../utils/classUtils";

const normalizeDate = (value: string) => value.split("T")[0];

const parseTimeToMinutes = (value: string) => {
  const [hours, minutes] = value.split(":").map((part) => Number(part));
  return hours * 60 + minutes;
};

const getAutoSelectedHourId = (lessonHours: LessonHour[]) => {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  const normalized = lessonHours
    .map((hour) => ({
      id: hour.id,
      start: parseTimeToMinutes(hour.CzasOd),
      end: parseTimeToMinutes(hour.CzasDo),
    }))
    .filter((hour) => Number.isFinite(hour.start) && Number.isFinite(hour.end))
    .sort((left, right) => left.start - right.start);

  const current = normalized.find((hour) => nowMinutes >= hour.start && nowMinutes <= hour.end);
  if (current) return current.id;

  const upcoming = normalized.find((hour) => nowMinutes < hour.start);
  if (upcoming) return upcoming.id;

  return normalized.length ? normalized[normalized.length - 1].id : null;
};

const getStatusId = (status: Attendance["status"]) => {
  if (status == null) return null;
  if (typeof status === "object") return status.id ?? null;
  return Number(status);
};

const getStatusConfig = (status: AttendanceStatus) => {
  const value = status.Wartosc.toLowerCase();
  
  // Match the logic from AttendancePage.tsx getStatusVariant
  if (value.includes("nieobecn")) {
    return {
      bgActive: "bg-destructive hover:bg-destructive/90",
      bgInactive: "bg-destructive/15 text-destructive hover:bg-destructive/25",
      icon: X,
    };
  }
  if (value.includes("usprawiedliw")) {
    return {
      bgActive: "bg-emerald-500 hover:bg-emerald-600",
      bgInactive: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/25",
      icon: Check,
    };
  }
  if (value.includes("spóźn") || value.includes("spozn")) {
    return {
      bgActive: "bg-amber-500 hover:bg-amber-600",
      bgInactive: "bg-amber-500/15 text-amber-600 dark:text-amber-500 hover:bg-amber-500/25",
      icon: Clock,
    };
  }
  if (value.includes("zwoln")) {
    return {
      bgActive: "bg-primary hover:bg-primary/90",
      bgInactive: "bg-primary/15 text-primary dark:text-primary/80 hover:bg-primary/25",
      icon: AlertCircle,
    };
  }
  // Obecny/Present
  return {
    bgActive: "bg-emerald-500 hover:bg-emerald-600",
    bgInactive: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/25",
    icon: Check,
  };
};

export default function TeacherAttendancePage() {
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [selectedHourId, setSelectedHourId] = useState<number | null>(null);
  const [hourManuallyChanged, setHourManuallyChanged] = useState(false);
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

  useEffect(() => {
    setHourManuallyChanged(false);
  }, [selectedDate]);

  useEffect(() => {
    if (!hours?.length) return;
    if (hourManuallyChanged) return;

    const today = new Date().toISOString().split("T")[0];
    if (selectedDate !== today) return;

    const autoHourId = getAutoSelectedHourId(hours);
    if (autoHourId != null) {
      setSelectedHourId(autoHourId);
    }
  }, [hours, hourManuallyChanged, selectedDate]);

  const { data: students, isLoading: studentsLoading, error: studentsError } = useQuery({
    queryKey: keys.students?.() ?? ["students"],
    queryFn: getStudents,
  });

  const classStudents = useMemo(() => {
    if (!students || !selectedClassId) return [];
    return sortStudentsAlphabetically(students.filter((student) => student.klasa === selectedClassId));
  }, [students, selectedClassId]);

  const classJournalNumbers = useMemo(
    () => getClassJournalNumberMap(students ?? [], selectedClassId),
    [students, selectedClassId],
  );

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

    const defaultStatusId = statuses?.[0]?.id ?? null;

    classStudents.forEach((student) => {
      nextStatusByStudent[student.id] = existingByStudent.get(student.id) ?? defaultStatusId;
    });

    setStatusByStudent(nextStatusByStudent);
  }, [classStudents, existingAttendanceQuery.data, selectedClassId, selectedDate, selectedHourId, statuses]);

  const saveAttendanceMutation = useMutation({
    mutationFn: async () => {
      if (!selectedHourId) {
        throw new Error("Wybierz godzinę lekcyjną");
      }

      const existingByStudent = new Map(
        (existingAttendanceQuery.data ?? []).map((entry) => [entry.uczen, entry]),
      );

      const operations = classStudents.map(async (student) => {
        const statusId = statusByStudent[student.id];
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

  const handleStatusChange = (studentId: number, statusId: number) => {
    setStatusByStudent((prev) => ({
      ...prev,
      [studentId]: statusId,
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">Sprawdzanie Obecności</h1>
        </div>
      </div>

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
              onChange={(e) => {
                setHourManuallyChanged(true);
                setSelectedHourId(e.target.value ? Number(e.target.value) : null);
              }}
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
                  {formatClassDisplay(c)}
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
                  <th className="text-left py-3 px-4 w-28">Nr w dzienniku</th>
                  <th className="text-left py-3 px-4">Imię i Nazwisko</th>
                  <th className="text-left py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {classStudents.map((student) => (
                  <tr key={student.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                    <td className="py-3 px-4 font-medium text-on-surface-variant font-body">
                      {classJournalNumbers.get(student.id) ?? "-"}
                    </td>
                    <td className="py-3 px-4">
                      {student.user.first_name} {student.user.last_name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2 flex-wrap">
                        {statuses?.map((status) => {
                          const config = getStatusConfig(status);
                          const IconComponent = config.icon;
                          const isActive = statusByStudent[student.id] === status.id;
                          
                          return (
                            <button
                              key={status.id}
                              onClick={() => handleStatusChange(student.id, status.id)}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                                isActive
                                  ? `${config.bgActive} text-white shadow-md`
                                  : config.bgInactive
                              }`}
                              title={status.Wartosc}
                            >
                              <IconComponent size={14} />
                              <span className="hidden sm:inline">{status.Wartosc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-on-surface-variant font-body">
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
