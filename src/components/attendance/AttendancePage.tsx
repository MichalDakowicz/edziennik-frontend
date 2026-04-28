import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    getAttendance,
    getAttendanceStatuses,
    getLessonHours,
    getSubjects,
    getZajecia,
    getTimetablePlan,
    getTimetableEntries,
    getDaysOfWeek,
} from "../../services/api";
import { keys } from "../../services/queryKeys";
import { getCurrentUser } from "../../services/auth";
import { Spinner } from "../ui/Spinner";
import { ErrorState } from "../ui/ErrorState";
import { Card } from "../ui/Card";
import SubjectAttendanceCard from "./SubjectAttendanceCard";
import RecentAttendanceTable from "./RecentAttendanceTable";
import ExcuseModal from "./ExcuseModal";
import { AutoBreadcrumbs, useAutoBreadcrumbs } from "../ui/Breadcrumbs";

export default function AttendancePage() {
    const breadcrumbs = useAutoBreadcrumbs({ attendance: "Frekwencja" });
    const user = getCurrentUser();
    const studentId = user?.studentId;
    const classId = user?.classId;
    const [selectedStatus, setSelectedStatus] = useState("Wszystkie");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [excuseOpen, setExcuseOpen] = useState(false);
    const [showAllSubjects, setShowAllSubjects] = useState(false);

    const attendanceQuery = useQuery({
        queryKey: studentId
            ? [...keys.attendance(studentId), dateFrom, dateTo]
            : ["attendance", "na"],
        queryFn: () =>
            getAttendance(
                studentId as number,
                dateFrom || undefined,
                dateTo || undefined,
            ),
        enabled: Boolean(studentId),
    });
    const statusesQuery = useQuery({
        queryKey: ["statuses"],
        queryFn: getAttendanceStatuses,
    });
    const hoursQuery = useQuery({
        queryKey: ["lesson-hours"],
        queryFn: getLessonHours,
    });
    const subjectsQuery = useQuery({
        queryKey: ["subjects"],
        queryFn: getSubjects,
    });
    const zajeciaQuery = useQuery({
        queryKey: ["zajecia"],
        queryFn: getZajecia,
    });
    const daysQuery = useQuery({
        queryKey: ["days-of-week"],
        queryFn: getDaysOfWeek,
    });
    const timetablePlanQuery = useQuery({
        queryKey: classId ? keys.timetable(classId) : ["timetable", "na"],
        queryFn: async () => {
            const plans = await getTimetablePlan(classId as number);
            const latestPlan = [...plans].sort((a, b) => b.id - a.id)[0];
            const entries = latestPlan ? await getTimetableEntries(latestPlan.id) : [];
            return entries;
        },
        enabled: Boolean(classId),
    });

    const attendance = attendanceQuery.data ?? [];
    const statuses = statusesQuery.data ?? [];
    const hours = hoursQuery.data ?? [];
    const subjects = subjectsQuery.data ?? [];
    const zajecia = zajeciaQuery.data ?? [];
    const days = daysQuery.data ?? [];
    const timetableEntries = Array.isArray(timetablePlanQuery.data) ? timetablePlanQuery.data : [];

    const statusMap = new Map(
        statuses.map((status) => [status.id, status.Wartosc]),
    );

    const resolveStatusName = (
        status: (typeof attendance)[number]["status"],
    ): string => {
        if (status == null) return "";
        if (typeof status === "object")
            return status.Wartosc ?? statusMap.get(status.id ?? 0) ?? "";
        return statusMap.get(Number(status)) ?? "";
    };

    const getStatusVariant = (
        statusName: string,
    ): "danger" | "success" | "warning" | "info" | "neutral" => {
        const s = statusName.toLowerCase();
        if (s.includes("nieobecn")) return "danger";
        if (s.includes("usprawiedliw")) return "success";
        if (s.includes("spóźn") || s.includes("spozn")) return "warning";
        if (s.includes("zwoln")) return "info";
        return "neutral";
    };

    // Build map: attendance record id -> subject name
    // Uses date (day of week) + hour number to match against timetable
    const recordToSubjectMap = useMemo(() => {
        const zajeciaMap = new Map(zajecia.map((z) => [z.id, z]));
        const subjectMap = new Map(subjects.map((s) => [s.id, s.nazwa || s.Nazwa || ""]));
        const dayIdToNum = new Map(days.map((d) => [d.id, d.Numer]));
        
        // Timetable lookup: "dayNumber|hourId" -> subject name
        const timetableLookup = new Map<string, string>();
        timetableEntries.forEach((entry) => {
            const dayId = entry.dzien_tygodnia ?? entry.DzienTygodnia;
            if (dayId != null) {
                const dayNum = dayIdToNum.get(dayId);
                if (dayNum) {
                    const zaj = zajeciaMap.get(entry.zajecia);
                    if (zaj) {
                        const subjectName = subjectMap.get(zaj.przedmiot) || "";
                        if (subjectName) {
                            timetableLookup.set(`${dayNum}|${entry.godzina_lekcyjna}`, subjectName);
                        }
                    }
                }
            }
        });
        
        // For each attendance record, resolve subject by date + hour
        const map = new Map<number, string>();
        attendance.forEach((record) => {
            const date = new Date(record.Data);
            // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat. Convert to 1=Mon, ..., 7=Sun
            const jsDay = date.getDay();
            const dayNum = jsDay === 0 ? 7 : jsDay;
            const key = `${dayNum}|${record.godzina_lekcyjna}`;
            const subjectName = timetableLookup.get(key);
            if (subjectName) {
                map.set(record.id, subjectName);
            }
        });
        
        return map;
    }, [timetableEntries, zajecia, subjects, attendance, days]);

    // Calculate per-subject attendance
    const subjectAttendance = useMemo(() => {
        const subjectMap = new Map<string, { total: number; absences: number; lates: number }>();
        
        attendance.forEach((record) => {
            const statusName = resolveStatusName(record.status).toLowerCase();
            const subjectName = recordToSubjectMap.get(record.id);
            
            if (!subjectName) return;
            
            const entry = subjectMap.get(subjectName) ?? { total: 0, absences: 0, lates: 0 };
            entry.total += 1;
            
            if (statusName.includes("nieobecn")) entry.absences += 1;
            else if (statusName.includes("spóźn") || statusName.includes("spozn")) entry.lates += 1;
            
            subjectMap.set(subjectName, entry);
        });
        
        return [...subjectMap.entries()]
            .map(([name, data]) => {
                const percentage = data.total > 0 ? ((data.total - data.absences) / data.total) * 100 : 100;
                let status: "safe" | "warning" | "danger" | "perfect" = "safe";
                if (percentage >= 70) status = "safe";
                else status = "warning";
                if (percentage === 100) status = "perfect";
                
                return {
                    name,
                    percentage: Math.round(percentage),
                    absences: data.absences,
                    lates: data.lates,
                    status,
                };
            })
            .sort((a, b) => a.percentage - b.percentage);
    }, [attendance, recordToSubjectMap, resolveStatusName]);

    // Subjects with attendance < 50%
    const criticalSubjects = useMemo(() => {
        return subjectAttendance.filter((s) => s.percentage < 50);
    }, [subjectAttendance]);

    // Calculate statistics
    const absences = attendance.filter((record) => {
        const name = resolveStatusName(record.status).toLowerCase();
        return name.includes("nieobecn") || name.includes("uspraw");
    }).length;
    const lates = attendance.filter((record) => {
        const name = resolveStatusName(record.status).toLowerCase();
        return name.includes("spóźn") || name.includes("spozn");
    }).length;
    const percentage = attendance.length
        ? ((attendance.length - absences) / attendance.length) * 100
        : 100;

    const isLoading = [attendanceQuery, statusesQuery, hoursQuery, subjectsQuery, timetablePlanQuery, zajeciaQuery, daysQuery].some((q) => q.isPending);
    const firstError = [attendanceQuery, statusesQuery, hoursQuery, subjectsQuery, timetablePlanQuery, zajeciaQuery, daysQuery].find((q) => q.isError);

    if (!studentId) return <ErrorState message="Brak przypisanego ucznia" />;
    if (isLoading) return <Spinner />;
    if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

    return (
        <div className="space-y-6">
            <AutoBreadcrumbs items={breadcrumbs} />
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">Frekwencja</h1>
                    <p className="text-on-surface-variant font-body text-sm mt-1">Moje Postępy</p>
                </div>
                <button 
                    className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                    onClick={() => setExcuseOpen(true)}
                >
                    <span className="material-symbols-outlined">edit_note</span>
                    <span>Usprawiedliw nieobecność</span>
                </button>
            </div>

            {/* Top Summary Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="flex items-center justify-between">
                    <div>
                        <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Wskaźnik obecności</p>
                        <h4 className="text-3xl font-black text-on-surface">{Math.round(percentage)}%</h4>
                    </div>
                    <div className="w-12 h-12 bg-green-400/20 text-green-400 rounded-xl flex items-center justify-center ">
                        <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                </Card>
                
                <Card className="flex items-center justify-between">
                    <div>
                        <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Nieobecności</p>
                        <h4 className="text-3xl font-black text-on-surface">{absences}</h4>
                    </div>
                    <div className="w-12 h-12 bg-red-500/30 text-red-500 rounded-xl flex items-center justify-center text-error">
                        <span className="material-symbols-outlined text-2xl">block</span>
                    </div>
                </Card>
                
                <Card className="flex items-center justify-between">
                    <div>
                        <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-1">Spóźnienia</p>
                        <h4 className="text-3xl font-black text-on-surface">{lates}</h4>
                    </div>
                    <div className="w-12 h-12 bg-yellow-500/25 text-yellow-500 rounded-xl flex items-center justify-center text-tertiary">
                        <span className="material-symbols-outlined text-2xl">schedule</span>
                    </div>
                </Card>
                
                <Card className="relative overflow-hidden">
                    <p className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-3">Frekwencja krytyczna</p>
                    {criticalSubjects.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                            {criticalSubjects.map((subject) => (
                                <div key={subject.name} className="flex-shrink-0 bg-red-50 dark:bg-red-400/10 p-3 rounded-lg min-w-32">
                                    <p className="text-xs font-bold text-on-surface truncate">{subject.name}</p>
                                    <p className="text-lg font-black text-red-600 dark:text-red-400">{subject.percentage}%</p>
                                    <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-1">
                                        <div className="bg-red-500 dark:bg-red-400 h-full rounded-full" style={{ width: `${subject.percentage}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-green-400 dark:text-green-400">verified</span>
                            <p className="text-sm font-bold text-green-400 dark:text-green-400">Brak zagrożeń</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Attendance by Subject */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-on-surface font-headline">Frekwencja według przedmiotów</h3>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-surface-container-low text-[10px] font-bold text-on-surface-variant rounded-lg">Semestr 1</span>
                        <span className="px-3 py-1 bg-primary/10 text-[10px] font-bold text-primary rounded-lg border border-primary/10">Cały rok</span>
                    </div>
                </div>
                {subjectAttendance.length === 0 ? (
                    <div className="bg-surface-container-lowest rounded-2xl p-12 text-center">
                        <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-4">event_available</span>
                        <p className="text-on-surface-variant font-body">Brak danych frekwencji dla przedmiotów</p>
                        <p className="text-sm text-on-surface-variant/70 mt-1">Upewnij się, że plan lekcji jest skonfigurowany</p>
                    </div>
                ) : (
                    <>
                        <div 
                            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${!showAllSubjects ? 'max-h-[calc(2*12rem)] overflow-hidden' : ''}`}
                        >
                            {subjectAttendance.map((subject) => (
                                <SubjectAttendanceCard key={subject.name} {...subject} />
                            ))}
                        </div>
                        {!showAllSubjects && (
                            <div className="relative -mt-8">
                                <div className="h-8 bg-gradient-to-t from-background to-transparent" />
                            </div>
                        )}
                        <div className="flex justify-center mt-2">
                            <button 
                                className="flex items-center gap-2 text-primary text-sm font-bold transition-colors"
                                onClick={() => setShowAllSubjects(!showAllSubjects)}
                            >
                                <span className="material-symbols-outlined text-lg">
                                    {showAllSubjects ? 'expand_less' : 'expand_more'}
                                </span>
                                <span>{showAllSubjects ? 'Zwiń listę' : 'Pokaż wszystkie przedmioty'}</span>
                            </button>
                        </div>
                    </>
                )}
            </section>

            {/* Recent Entries */}
            <RecentAttendanceTable 
                records={attendance}
                resolveStatusName={resolveStatusName}
                getStatusVariant={getStatusVariant}
                hours={hours}
                hourToSubjectMap={recordToSubjectMap}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
            />

            {/* Excuse Modal */}
            <ExcuseModal
                open={excuseOpen}
                onClose={() => setExcuseOpen(false)}
            />
        </div>
    );
}