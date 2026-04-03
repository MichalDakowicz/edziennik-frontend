import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import { formatDate } from "../../utils/dateUtils";

const ITEMS_PER_PAGE = 15;

export default function AttendanceHistoryPage() {
    const user = getCurrentUser();
    const studentId = user?.studentId;
    const classId = user?.classId;
    const [selectedStatus, setSelectedStatus] = useState("Wszystkie");
    const [selectedSubject, setSelectedSubject] = useState("Wszystkie");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

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

    // Build map: attendance record id -> subject name
    const recordToSubjectMap = useMemo(() => {
        const zajeciaMap = new Map(zajecia.map((z) => [z.id, z]));
        const subjectMap = new Map(subjects.map((s) => [s.id, s.nazwa || s.Nazwa || ""]));
        const dayIdToNum = new Map(days.map((d) => [d.id, d.Numer]));
        
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
        
        const map = new Map<number, string>();
        attendance.forEach((record) => {
            const date = new Date(record.Data);
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

    // Available subjects
    const availableSubjects = useMemo(() => {
        const subjectsSet = new Set<string>();
        attendance.forEach((record) => {
            const subjectName = recordToSubjectMap.get(record.id);
            if (subjectName) subjectsSet.add(subjectName);
        });
        return [...subjectsSet].sort();
    }, [attendance, recordToSubjectMap]);

    // Filtered records
    const filteredRecords = useMemo(() => {
        return attendance
            .filter((record) => {
                const statusName = resolveStatusName(record.status).toLowerCase();
                
                if (selectedStatus === "Wszystkie") {
                    return (
                        statusName.includes("nieobecn") ||
                        statusName.includes("spóźn") ||
                        statusName.includes("spozn") ||
                        statusName.includes("uspraw") ||
                        statusName.includes("zwoln")
                    );
                }
                
                if (selectedStatus === "Obecność") return !statusName.includes("nieobecn") && !statusName.includes("spóźn") && !statusName.includes("spozn") && !statusName.includes("uspraw") && !statusName.includes("zwoln");
                if (selectedStatus === "Nieobecność") return statusName.includes("nieobecn");
                if (selectedStatus === "Spóźnienie") return statusName.includes("spóźn") || statusName.includes("spozn");
                if (selectedStatus === "Usprawiedliwienie") return statusName.includes("uspraw");
                if (selectedStatus === "Zwolnienie") return statusName.includes("zwoln");

                return true;
            })
            .filter((record) => {
                if (selectedSubject === "Wszystkie") return true;
                const subjectName = recordToSubjectMap.get(record.id);
                return subjectName === selectedSubject;
            })
            .sort((a, b) => new Date(b.Data).getTime() - new Date(a.Data).getTime());
    }, [attendance, selectedStatus, selectedSubject, resolveStatusName, recordToSubjectMap]);

    // Pagination
    const totalPages = Math.ceil(filteredRecords.length / ITEMS_PER_PAGE);
    const paginatedRecords = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredRecords.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredRecords, currentPage]);

    const hourMap = new Map(hours.map((hour) => [hour.id, hour]));

    const getStatusBadge = (statusName: string) => {
        const s = statusName.toLowerCase();
        let style = "bg-surface-container text-on-surface-variant";
        if (s.includes("nieobecn")) style = "bg-error-container text-on-error-container";
        else if (s.includes("usprawiedliw")) style = "bg-green-50 text-green-700 border border-green-100";
        else if (s.includes("spóźn") || s.includes("spozn")) style = "bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary-fixed-dim";
        else if (s.includes("zwoln")) style = "bg-primary/10 text-primary";
        
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${style}`}>
                {statusName || "-"}
            </span>
        );
    };

    const getSubjectIcon = (subject: string) => {
        const iconMap: Record<string, string> = {
            "Matematyka": "functions",
            "Język Polski": "history_edu",
            "Język Angielski": "translate",
            "Biologia": "science",
            "Geografia": "public",
            "Filozofia": "psychology",
            "Fizyka": "bolt",
            "Chemia": "science",
            "Historia": "menu_book",
            "Informatyka": "computer",
        };
        return iconMap[subject] || "school";
    };

    const getSubjectIconColor = (subject: string) => {
        const colorMap: Record<string, string> = {
            "Matematyka": "text-blue-600 bg-blue-50",
            "Język Polski": "text-orange-600 bg-orange-50",
            "Język Angielski": "text-indigo-600 bg-indigo-50",
            "Biologia": "text-emerald-600 bg-emerald-50",
            "Geografia": "text-red-600 bg-red-50",
            "Filozofia": "text-purple-600 bg-purple-50",
        };
        return colorMap[subject] || "text-primary bg-primary/10";
    };

    const isLoading = [attendanceQuery, statusesQuery, hoursQuery, subjectsQuery, timetablePlanQuery, zajeciaQuery, daysQuery].some((q) => q.isPending);
    const firstError = [attendanceQuery, statusesQuery, hoursQuery, subjectsQuery, timetablePlanQuery, zajeciaQuery, daysQuery].find((q) => q.isError);

    if (!studentId) return <ErrorState message="Brak przypisanego ucznia" />;
    if (isLoading) return <Spinner />;
    if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

    return (
        <div className="space-y-6">
            {/* Breadcrumb Nav */}
            <nav className="flex items-center gap-2 text-sm text-on-surface-variant font-body">
                <Link to="/dashboard" className="hover:text-primary transition-colors">Pulpit</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <Link to="/dashboard/attendance" className="hover:text-primary transition-colors">Frekwencja</Link>
                <span className="material-symbols-outlined text-xs">chevron_right</span>
                <span className="text-on-surface font-semibold">Pełna historia</span>
            </nav>

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">Pełna historia frekwencji</h1>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-4">
                <div className="flex flex-wrap gap-2">
                    {["Wszystkie", "Obecność", "Nieobecność", "Spóźnienie", "Usprawiedliwienie", "Zwolnienie"].map((status) => (
                        <button
                            key={status}
                            onClick={() => { setSelectedStatus(status); setCurrentPage(1); }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                                selectedStatus === status
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container"
                            }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    {availableSubjects.length > 0 && (
                        <div className="relative flex-1 min-w-48 max-w-64">
                            <select
                                className="w-full bg-white border border-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 pr-10"
                                value={selectedSubject}
                                onChange={(e) => { setSelectedSubject(e.target.value); setCurrentPage(1); }}
                            >
                                <option value="Wszystkie">Wszystkie przedmioty</option>
                                {availableSubjects.map((subject) => (
                                    <option key={subject} value={subject}>{subject}</option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">expand_more</span>
                        </div>
                    )}

                    <div className="flex items-center bg-white border border-surface-container rounded-xl overflow-hidden flex-1 min-w-64">
                        <div className="flex items-center flex-1 px-3 py-2.5">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg mr-2">calendar_today</span>
                            <input
                                className="flex-1 text-sm text-on-surface outline-none bg-transparent min-w-0"
                                type="date"
                                value={dateFrom}
                                onChange={(event) => { setDateFrom(event.target.value); setCurrentPage(1); }}
                            />
                        </div>
                        <div className="w-px h-6 bg-surface-container" />
                        <div className="flex items-center flex-1 px-3 py-2.5">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg mr-2">calendar_today</span>
                            <input
                                className="flex-1 text-sm text-on-surface outline-none bg-transparent min-w-0"
                                type="date"
                                value={dateTo}
                                onChange={(event) => { setDateTo(event.target.value); setCurrentPage(1); }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-on-surface-variant">
                Wyświetlanie {paginatedRecords.length} z {filteredRecords.length} wpisów
            </p>

            {/* Table */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-surface-container">
                                <th className="pb-4 px-4">Data</th>
                                <th className="pb-4 px-4">Przedmiot</th>
                                <th className="pb-4 px-4">Godzina</th>
                                <th className="pb-4 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container">
                            {paginatedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="py-12 text-center text-on-surface-variant">
                                        <span className="material-symbols-outlined text-4xl mb-2 block">event_available</span>
                                        Brak wpisów dla wybranych filtrów
                                    </td>
                                </tr>
                            ) : (
                                paginatedRecords.map((record) => {
                                    const statusName = resolveStatusName(record.status);
                                    const hour = hourMap.get(record.godzina_lekcyjna);
                                    const subjectName = recordToSubjectMap.get(record.id) || "Przedmiot";
                                    
                                    return (
                                        <tr key={record.id} className="hover:bg-surface-container-low/50 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="text-sm font-bold text-on-surface">
                                                    {formatDate(record.Data)}
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getSubjectIconColor(subjectName)}`}>
                                                        <span className="material-symbols-outlined text-sm">{getSubjectIcon(subjectName)}</span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-on-surface">{subjectName}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className="text-sm text-on-surface-variant">
                                                    {hour ? `${hour.CzasOd.slice(0, 5)} - ${hour.CzasDo.slice(0, 5)}` : "Brak danych"}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4">
                                                {getStatusBadge(statusName)}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-surface-container">
                        <button
                            className="px-4 py-2 text-sm font-medium text-on-surface-variant rounded-lg hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                        >
                            ← Poprzednia
                        </button>
                        
                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    if (totalPages <= 7) return true;
                                    if (page === 1 || page === totalPages) return true;
                                    if (Math.abs(page - currentPage) <= 1) return true;
                                    return false;
                                })
                                .map((page, idx, arr) => (
                                    <div key={page} className="flex items-center">
                                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                                            <span className="px-2 text-on-surface-variant">…</span>
                                        )}
                                        <button
                                            className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                                                currentPage === page
                                                    ? "bg-primary text-white"
                                                    : "text-on-surface-variant hover:bg-surface-container"
                                            }`}
                                            onClick={() => setCurrentPage(page)}
                                        >
                                            {page}
                                        </button>
                                    </div>
                                ))}
                        </div>
                        
                        <button
                            className="px-4 py-2 text-sm font-medium text-on-surface-variant rounded-lg hover:bg-surface-container disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                        >
                            Następna →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}