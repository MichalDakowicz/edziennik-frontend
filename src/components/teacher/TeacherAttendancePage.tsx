import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { AutoBreadcrumbs, useAutoBreadcrumbs } from "../ui/Breadcrumbs";
import { keys } from "../../services/queryKeys";
import {
  createAttendance,
  getAttendance,
  getAttendanceStatuses,
  getClasses,
  getLessonHours,
  getStudents,
  getSubjects,
  getTimetableEntries,
  getTimetablePlan,
  getDaysOfWeek,
  getZajecia,
  updateAttendance,
} from "../../services/api";
import type { AttendanceStatus, Attendance, LessonHour } from "../../types/api";
import { formatClassDisplay, sortStudentsAlphabetically } from "../../utils/classUtils";
import { useTeacherClassSelector } from "../../hooks/useTeacherClassSelector";

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

const getStatusLabel = (status: AttendanceStatus) => {
  const value = status.Wartosc.toLowerCase();
  if (value.includes("nieobecn")) return "Nieobecny";
  if (value.includes("usprawiedliw")) return "Usprawiedliwiony";
  if (value.includes("spóźn") || value.includes("spozn")) return "Spóźniony";
  if (value.includes("zwoln")) return "Zwolniony";
  return "Obecny";
};

const getStatusActiveStyle = (status: AttendanceStatus) => {
  const value = status.Wartosc.toLowerCase();
  if (value.includes("nieobecn") || value.includes("nieob") || value.includes("absen")) return "bg-destructive text-white";
  if (value.includes("usprawiedliw") || value.includes("uspraw")) return "bg-emerald-500 text-white";
  if (value.includes("spóźn") || value.includes("spozn") || value.includes("late")) return "bg-amber-500 text-white";
  if (value.includes("zwoln") || value.includes("zwol")) return "bg-secondary text-white";
  return "bg-primary text-white";
};

const getStatusChipColor = (status: AttendanceStatus) => {
  const value = status.Wartosc.toLowerCase();
  if (value.includes("nieobecn") || value.includes("nieob") || value.includes("absen")) return "text-destructive";
  if (value.includes("usprawiedliw") || value.includes("uspraw")) return "text-emerald-600 dark:text-emerald-400";
  if (value.includes("spóźn") || value.includes("spozn") || value.includes("late")) return "text-amber-600 dark:text-amber-400";
  if (value.includes("zwoln") || value.includes("zwol")) return "text-secondary";
  return "text-primary";
};

type DropdownType = "date" | "hour" | "class" | null;

function DropdownButton({
  label,
  value,
  onClick,
  hasError,
  buttonRef,
}: {
  label: string;
  value: string;
  onClick: () => void;
  hasError?: boolean;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <button
      ref={buttonRef as React.Ref<HTMLButtonElement>}
      onClick={onClick}
      className={`flex flex-col px-4 py-2 bg-surface-container-lowest rounded-2xl shadow-sm min-w-[120px] transition-all text-left ${
        hasError ? "ring-2 ring-error/30" : "hover:bg-surface-container-high"
      }`}
    >
      <span className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-tighter">{label}</span>
      <span className={`font-bold text-sm ${hasError ? "text-destructive" : "text-on-surface"}`}>{value}</span>
    </button>
  );
}

function DropdownPanel({
  open,
  anchorRef,
  onClose,
  children,
  wide,
}: {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  const rect = anchorRef.current?.getBoundingClientRect();
  if (!rect) return null;

  const viewportWidth = window.innerWidth;
  const panelWidth = wide ? 320 : 220;
  let left = rect.left;
  if (left + panelWidth > viewportWidth - 16) {
    left = viewportWidth - panelWidth - 16;
  }
  if (left < 16) left = 16;

  return (
    <div
      ref={panelRef}
      className="fixed z-50 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant/20 p-2 max-h-[80vh] overflow-y-auto"
      style={{
        top: rect.bottom - 22,
        left,
        width: panelWidth,
      }}
    >
      {children}
    </div>
  );
}

function InlineCalendar({
  selectedDate,
  onChange,
}: {
  selectedDate: string;
  onChange: (date: string) => void;
}) {
  const currentDate = new Date(selectedDate);
  const [viewDate, setViewDate] = useState(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1));

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
  const daysInMonth = lastDay.getDate();

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const monthNames = [
    "Styczeń", "Luty", "Marzec", "Kwiecień", "Maj", "Czerwiec",
    "Lipiec", "Sierpień", "Wrzesień", "Październik", "Listopad", "Grudzień",
  ];
  const dayLabels = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const selectedStr = selectedDate;

  const cells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">chevron_left</span>
        </button>
        <h3 className="font-headline font-bold text-lg text-on-surface">
          {monthNames[month]} {year}
        </h3>
        <button onClick={nextMonth} className="w-10 h-10 rounded-full hover:bg-surface-container flex items-center justify-center transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayLabels.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-on-surface-variant/50 uppercase py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const isSelected = dateStr === selectedStr;

          return (
            <button
              key={dateStr}
              onClick={() => onChange(dateStr)}
              className={`w-10 h-10 rounded-full text-sm font-medium transition-all flex items-center justify-center ${
                isSelected
                  ? "bg-primary text-white font-bold shadow-sm"
                  : isToday
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-on-surface hover:bg-surface-container"
              }`}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function TeacherAttendancePage() {
  const queryClient = useQueryClient();
  const { selectedClassId: hookClassId, setSelectedClassId: setHookClassId } = useTeacherClassSelector();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(hookClassId);
  const [selectedHourId, setSelectedHourId] = useState<number | null>(null);
  const [hourManuallyChanged, setHourManuallyChanged] = useState(false);
  const [statusByStudent, setStatusByStudent] = useState<Record<number, number | null>>({});
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);

  const dateBtnRef = useRef<HTMLButtonElement>(null);
  const hourBtnRef = useRef<HTMLButtonElement>(null);
  const classBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (hookClassId !== null && hookClassId !== selectedClassId) {
      setSelectedClassId(hookClassId);
    }
  }, [hookClassId]);

  const handleClassChange = (id: number | null) => {
    setSelectedClassId(id);
    setHookClassId(id);
  };

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

  const { data: subjects } = useQuery({
    queryKey: keys.subjects?.() ?? ["subjects"],
    queryFn: getSubjects,
  });

  const { data: daysOfWeek } = useQuery({
    queryKey: ["days-of-week"],
    queryFn: getDaysOfWeek,
  });

  const { data: zajecia } = useQuery({
    queryKey: ["zajecia"],
    queryFn: getZajecia,
  });

  const { data: timetablePlans } = useQuery({
    queryKey: selectedClassId ? ["timetable-plan", selectedClassId] : ["timetable-plan", "na"],
    queryFn: () => getTimetablePlan(selectedClassId!),
    enabled: Boolean(selectedClassId),
  });

  const activePlan = useMemo(() => {
    if (!timetablePlans?.length) return null;
    return [...timetablePlans].sort(
      (a, b) => new Date(b.ObowiazujeOdDnia).getTime() - new Date(a.ObowiazujeOdDnia).getTime(),
    )[0];
  }, [timetablePlans]);

  const { data: timetableEntries } = useQuery({
    queryKey: activePlan ? ["timetable-entries", activePlan.id] : ["timetable-entries", "na"],
    queryFn: () => getTimetableEntries(activePlan!.id),
    enabled: Boolean(activePlan),
  });

  const resolvedSubject = useMemo(() => {
    if (!selectedHourId || !timetableEntries || !zajecia || !subjects) return null;
    const entry = timetableEntries.find((e) => e.godzina_lekcyjna === selectedHourId);
    if (!entry) return null;
    const zajeciaItem = zajecia.find((z) => z.id === entry.zajecia);
    if (!zajeciaItem) return null;
    return subjects.find((s) => s.id === zajeciaItem.przedmiot) ?? null;
  }, [selectedHourId, timetableEntries, zajecia, subjects]);

  const hasLessonOnSelectedHour = useMemo(() => {
    if (!selectedHourId || !timetableEntries || !selectedDate || !daysOfWeek) return false;

    const date = new Date(selectedDate + "T12:00:00");
    const jsDay = date.getDay();
    const plDayNum = jsDay === 0 ? 7 : jsDay;

    const matchingDay = daysOfWeek.find((d) => d.Numer === plDayNum);
    if (!matchingDay) return false;

    const matchingEntries = timetableEntries.filter((e) => e.godzina_lekcyjna === selectedHourId);
    if (matchingEntries.length === 0) return false;

    return matchingEntries.some((e) => {
      const entryDayId = e.dzien_tygodnia ?? e.DzienTygodnia;
      return entryDayId === matchingDay.id;
    });
  }, [selectedHourId, timetableEntries, selectedDate, daysOfWeek]);

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

  const classStudents = useMemo(() => {
    if (!students || !selectedClassId) return [];
    return sortStudentsAlphabetically(students.filter((student) => student.klasa === selectedClassId));
  }, [students, selectedClassId]);

  const classJournalNumbers = useMemo(() => {
    const map = new Map<number, number>();
    classStudents.forEach((s, i) => {
      map.set(s.id, s.numer_w_dzienniku ?? s.nr_w_dzienniku ?? s.NumerWDzienniku ?? s.numerWDzienniku ?? i + 1);
    });
    return map;
  }, [classStudents]);

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
      if (!selectedHourId) throw new Error("Wybierz godzinę lekcyjną");

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

  const stats = useMemo(() => {
    if (!statuses) return {};
    const counts: Record<string, number> = {};
    Object.values(statusByStudent).forEach((sid) => {
      if (sid == null) return;
      const status = statuses.find((s) => s.id === sid);
      if (!status) return;
      const label = getStatusLabel(status);
      counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
  }, [statusByStudent, statuses]);

  const breadcrumbs = useAutoBreadcrumbs({ attendance: "Sprawdzanie obecności" });

  const selectedClass = classes?.find((c) => c.id === selectedClassId) ?? null;
  const selectedHour = hours?.find((h) => h.id === selectedHourId) ?? null;

  const noLessonWarning = selectedClassId && selectedHourId && !hasLessonOnSelectedHour;

  const warningMessage = useMemo(() => {
    if (!selectedClassId) return null;
    if (!selectedHourId) return "Wybierz godzinę lekcyjną.";
    if (!hasLessonOnSelectedHour) {
      const date = new Date(selectedDate);
      const dayNames = ["niedzielę", "poniedziałek", "wtorek", "środę", "czwartek", "piątek", "sobotę"];
      const dayName = dayNames[date.getDay()] ?? "ten dzień";
      return `Brak lekcji o godzinie ${selectedHour?.Numer ?? "?"} w ${dayName} (${selectedDate}) dla wybranej klasy.`;
    }
    return null;
  }, [selectedClassId, selectedHourId, hasLessonOnSelectedHour, selectedDate, selectedHour]);

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

  const dateFormatted = selectedDate
    ? new Date(selectedDate).toLocaleDateString("pl-PL", { day: "2-digit", month: "short", year: "numeric" })
    : "—";
  const hourFormatted = selectedHour ? `${selectedHour.Numer}. (${selectedHour.CzasOd} - ${selectedHour.CzasDo})` : "—";
  const classFormatted = selectedClass ? formatClassDisplay(selectedClass) : "—";
  const subjectFormatted = resolvedSubject?.nazwa ?? "—";

  return (
    <div className="space-y-8">
      <AutoBreadcrumbs items={breadcrumbs} />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <span className="text-primary font-semibold tracking-wider text-xs uppercase">Ewidencja Zajęć</span>
          <h1 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight">Lista Obecności</h1>
        </div>

        {/* Selection Controls as Clickable Buttons */}
        <div className="grid grid-cols-2 md:flex gap-3 bg-surface-container-low p-2 rounded-3xl">
          <DropdownButton
            label="Klasa"
            value={classFormatted}
            onClick={() => setOpenDropdown(openDropdown === "class" ? null : "class")}
            buttonRef={classBtnRef}
          />
          <DropdownButton
            label="Przedmiot"
            value={subjectFormatted}
            onClick={() => {}}
          />
          <DropdownButton
            label="Data"
            value={dateFormatted}
            onClick={() => setOpenDropdown(openDropdown === "date" ? null : "date")}
            buttonRef={dateBtnRef}
          />
          <DropdownButton
            label="Lekcja"
            value={hourFormatted}
            onClick={() => setOpenDropdown(openDropdown === "hour" ? null : "hour")}
            buttonRef={hourBtnRef}
            hasError={!!noLessonWarning}
          />
        </div>
      </div>

      {/* Dropdowns */}
      <DropdownPanel open={openDropdown === "date"} anchorRef={dateBtnRef} onClose={() => setOpenDropdown(null)} wide>
        <InlineCalendar selectedDate={selectedDate} onChange={(d) => { setSelectedDate(d); setOpenDropdown(null); }} />
      </DropdownPanel>

      <DropdownPanel open={openDropdown === "hour"} anchorRef={hourBtnRef} onClose={() => setOpenDropdown(null)}>
        <div className="space-y-1">
          {hours?.map((h) => (
            <button
              key={h.id}
              onClick={() => {
                setHourManuallyChanged(true);
                setSelectedHourId(h.id);
                setOpenDropdown(null);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedHourId === h.id
                  ? "bg-primary text-white"
                  : "hover:bg-surface-container-high text-on-surface"
              }`}
            >
              {h.Numer}. ({h.CzasOd} - {h.CzasDo})
            </button>
          ))}
        </div>
      </DropdownPanel>

      <DropdownPanel open={openDropdown === "class"} anchorRef={classBtnRef} onClose={() => setOpenDropdown(null)}>
        <div className="space-y-1">
          {classes?.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                handleClassChange(c.id);
                setOpenDropdown(null);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                selectedClassId === c.id
                  ? "bg-primary text-white"
                  : "hover:bg-surface-container-high text-on-surface"
              }`}
            >
              {formatClassDisplay(c)}
            </button>
          ))}
        </div>
      </DropdownPanel>

      {/* No lesson warning */}
      {warningMessage && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-4 flex items-center gap-3">
          <span className="material-symbols-outlined text-destructive">warning</span>
          <p className="text-sm text-destructive font-medium">
            {warningMessage}
          </p>
        </div>
      )}

      {/* Statistics */}
      {statuses && Object.keys(stats).length > 0 && (
        <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statuses.map((status) => {
            const label = getStatusLabel(status);
            const count = stats[label] ?? 0;
            const color = getStatusChipColor(status);
            return (
              <div key={status.id} className="bg-surface-container-lowest p-4 rounded-[2rem] flex flex-col items-center justify-center text-center">
                <span className={`text-2xl font-black ${color}`}>{count}</span>
                <span className="text-[10px] font-bold uppercase opacity-60 text-on-surface-variant">{label}</span>
              </div>
            );
          })}
        </section>
      )}

      {/* Students */}
      {noLessonWarning ? (
        <EmptyState message="Nie ma lekcji w wybranym terminie. Zmień datę lub godzinę." />
      ) : selectedClassId ? (
        classStudents.length ? (
          <div className="bg-surface-container-lowest rounded-[2.5rem] p-4 md:p-8 space-y-4">
            {/* List Header */}
            <div className="hidden md:flex px-6 py-2 text-[10px] font-bold text-on-surface-variant/50 uppercase tracking-widest">
              <div className="w-12">#</div>
              <div className="flex-1">Uczeń</div>
              <div className="w-[500px] text-center">Status Obecności</div>
            </div>

            <div className="space-y-3">
              {classStudents.map((student) => {
                const journalNum = classJournalNumbers.get(student.id) ?? "-";
                return (
                  <div
                    key={student.id}
                    className="flex flex-col md:flex-row items-center gap-4 p-4 md:px-6 md:py-5 bg-surface-container-low rounded-3xl hover:bg-surface-container-high transition-colors group"
                  >
                    <div className="hidden md:block w-12 font-headline font-bold text-on-surface-variant/50 group-hover:text-primary transition-colors">
                      {String(journalNum).padStart(2, "0")}
                    </div>
                    <div className="flex items-center gap-4 flex-1 w-full">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="font-bold text-primary text-sm">
                          {student.user.first_name?.[0]}{student.user.last_name?.[0]}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline font-bold text-lg text-on-surface">
                          {student.user.first_name} {student.user.last_name}
                        </span>
                        <span className="text-[11px] font-medium text-on-surface-variant/50 uppercase md:hidden">
                          Nr w dzienniku: {journalNum}
                        </span>
                      </div>
                    </div>

                    {/* Attendance Pill Selector */}
                    <div className="flex flex-wrap md:flex-nowrap gap-1 bg-surface-container-lowest p-1 rounded-full w-full md:w-[500px] justify-between">
                      {statuses?.map((status) => {
                        const isActive = statusByStudent[student.id] === status.id;
                        const activeStyle = getStatusActiveStyle(status);
                        return (
                          <button
                            key={status.id}
                            onClick={() => handleStatusChange(student.id, status.id)}
                            className={`flex-1 py-2 px-3 rounded-full text-[10px] font-bold transition-all ${
                              isActive ? activeStyle : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container"
                            }`}
                            title={status.Wartosc}
                          >
                            {getStatusLabel(status).toUpperCase()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-outline-variant/15">
              <span className="text-sm font-medium text-on-surface-variant/60 italic">
                Data: {dateFormatted} • Lekcja: {selectedHour?.Numer ?? "—"}
              </span>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    const defaultStatusId = statuses?.[0]?.id ?? null;
                    const reset: Record<number, number | null> = {};
                    classStudents.forEach((s) => { reset[s.id] = defaultStatusId; });
                    setStatusByStudent(reset);
                  }}
                  className="px-8 py-4 rounded-full font-bold text-primary hover:bg-primary/5 transition-colors"
                >
                  Anuluj zmiany
                </button>
                <button
                  onClick={() => saveAttendanceMutation.mutate()}
                  disabled={!selectedHourId || noLessonWarning || saveAttendanceMutation.isPending || existingAttendanceQuery.isFetching}
                  className="px-10 py-4 rounded-full font-bold bg-primary text-white shadow-xl shadow-primary/20 flex items-center gap-3 active:scale-95 transition-all disabled:opacity-50"
                >
                  <span className="material-symbols-outlined">save</span>
                  {saveAttendanceMutation.isPending ? "Zapisywanie..." : "Zapisz listę obecności"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <EmptyState message="Brak uczniów w wybranej klasie" />
        )
      ) : (
        <EmptyState message="Wybierz klasę aby zobaczyć uczniów" />
      )}
    </div>
  );
}
