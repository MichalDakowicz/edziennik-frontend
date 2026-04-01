import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Attendance, LessonHour } from "../../types/api";
import { formatDate } from "../../utils/dateUtils";

interface RecentAttendanceTableProps {
    records: Attendance[];
    resolveStatusName: (status: Attendance["status"]) => string;
    getStatusVariant: (
        statusName: string,
    ) => "danger" | "success" | "warning" | "info" | "neutral";
    hours: LessonHour[];
    hourToSubjectMap: Map<number, string>;
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (date: string) => void;
    onDateToChange: (date: string) => void;
    selectedStatus: string;
    onStatusChange: (status: string) => void;
}

export default function RecentAttendanceTable({
    records,
    resolveStatusName,
    getStatusVariant,
    hours,
    hourToSubjectMap,
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    selectedStatus,
    onStatusChange,
}: RecentAttendanceTableProps) {
    const navigate = useNavigate();
    const hourMap = new Map(hours.map((hour) => [hour.id, hour]));
    const [selectedSubject, setSelectedSubject] = useState("Wszystkie");

    // Get unique subjects from attendance records
    const availableSubjects = useMemo(() => {
        const subjects = new Set<string>();
        records.forEach((record) => {
            const subjectName = hourToSubjectMap.get(record.id);
            if (subjectName) subjects.add(subjectName);
        });
        return [...subjects].sort();
    }, [records, hourToSubjectMap]);

    const filteredRecords = useMemo(() => {
        return records
            .filter((record) => {
                const statusName = resolveStatusName(
                    record.status,
                ).toLowerCase();

                if (selectedStatus === "Wszystkie") {
                    return (
                        statusName.includes("nieobecn") ||
                        statusName.includes("spóźn") ||
                        statusName.includes("spozn") ||
                        statusName.includes("uspraw") ||
                        statusName.includes("zwoln")
                    );
                }

                if (selectedStatus === "Obecność")
                    return (
                        !statusName.includes("nieobecn") &&
                        !statusName.includes("spóźn") &&
                        !statusName.includes("spozn") &&
                        !statusName.includes("uspraw") &&
                        !statusName.includes("zwoln")
                    );
                if (selectedStatus === "Nieobecność")
                    return statusName.includes("nieobecn");
                if (selectedStatus === "Spóźnienie")
                    return (
                        statusName.includes("spóźn") ||
                        statusName.includes("spozn")
                    );
                if (selectedStatus === "Usprawiedliwienie")
                    return statusName.includes("uspraw");
                if (selectedStatus === "Zwolnienie")
                    return statusName.includes("zwoln");

                return true;
            })
            .filter((record) => {
                const recordDate = new Date(record.Data)
                    .toISOString()
                    .split("T")[0];
                const fromDate = dateFrom
                    ? new Date(dateFrom).toISOString().split("T")[0]
                    : null;
                const toDate = dateTo
                    ? new Date(dateTo).toISOString().split("T")[0]
                    : null;

                if (fromDate && recordDate < fromDate) return false;
                if (toDate && recordDate > toDate) return false;
                return true;
            })
            .filter((record) => {
                if (selectedSubject === "Wszystkie") return true;
                const subjectName = hourToSubjectMap.get(record.id);
                return subjectName === selectedSubject;
            })
            .sort(
                (a, b) =>
                    new Date(b.Data).getTime() - new Date(a.Data).getTime(),
            )
            .slice(0, 10);
    }, [
        records,
        dateFrom,
        dateTo,
        resolveStatusName,
        selectedStatus,
        selectedSubject,
        hourToSubjectMap,
    ]);

    const getStatusBadge = (statusName: string) => {
        const variant = getStatusVariant(statusName);
        const getStatusStyle = () => {
            switch (variant) {
                case "danger":
                    return "bg-error-container text-on-error-container";
                case "success":
                    return "bg-green-50 text-green-700 border border-green-100";
                case "warning":
                    return "bg-tertiary-fixed text-on-tertiary-fixed border border-tertiary-fixed-dim";
                case "info":
                    return "bg-primary/10 text-primary";
                default:
                    return "bg-surface-container text-on-surface-variant";
            }
        };

        return (
            <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusStyle()}`}
            >
                {statusName || "-"}
            </span>
        );
    };

    const getSubjectIcon = (subject: string) => {
        const iconMap: Record<string, string> = {
            Matematyka: "functions",
            "Matematyka Rozszerzona": "functions",
            "Język Polski": "history_edu",
            "Język Angielski": "translate",
            Biologia: "science",
            Geografia: "public",
            Filozofia: "psychology",
            Fizyka: "bolt",
            Chemia: "science",
            Historia: "menu_book",
            Informatyka: "computer",
        };
        return iconMap[subject] || "school";
    };

    const getSubjectIconColor = (subject: string) => {
        const colorMap: Record<string, string> = {
            Matematyka: "text-blue-600 bg-blue-50",
            "Matematyka Rozszerzona": "text-blue-600 bg-blue-50",
            "Język Polski": "text-orange-600 bg-orange-50",
            "Język Angielski": "text-indigo-600 bg-indigo-50",
            Biologia: "text-emerald-600 bg-emerald-50",
            Geografia: "text-red-600 bg-red-50",
            Filozofia: "text-purple-600 bg-purple-50",
        };
        return colorMap[subject] || "text-primary bg-primary/10";
    };

    return (
        <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)]">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-on-surface font-headline">
                    Ostatnie wpisy
                </h3>
                <button 
                    className="text-primary text-sm font-bold hover:underline"
                    onClick={() => navigate("/dashboard/attendance/history")}
                >
                    Zobacz pełną historię
                </button>
            </div>

            {/* Filters */}
            <div className="mb-6 space-y-4 bg-surface-container-lowest rounded-xl p-4 shadow-sm">
                {/* Status Pills */}
                <div className="flex flex-wrap gap-2">
                    {[
                        "Wszystkie",
                        "Obecność",
                        "Nieobecność",
                        "Spóźnienie",
                        "Usprawiedliwienie",
                        "Zwolnienie",
                    ].map((status) => (
                        <button
                            key={status}
                            onClick={() => onStatusChange(status)}
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

                {/* Second Row: Subject, Date Range, Filter Button */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Subject Dropdown */}
                    {availableSubjects.length > 0 && (
                        <div className="relative flex-1 min-w-48 max-w-64">
                            <select
                                className="w-full bg-white border border-surface-container rounded-xl px-4 py-2.5 text-sm text-on-surface appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 pr-10"
                                value={selectedSubject}
                                onChange={(e) =>
                                    setSelectedSubject(e.target.value)
                                }
                            >
                                <option value="Wszystkie">
                                    Wszystkie przedmioty
                                </option>
                                {availableSubjects.map((subject) => (
                                    <option key={subject} value={subject}>
                                        {subject}
                                    </option>
                                ))}
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg pointer-events-none">
                                expand_more
                            </span>
                        </div>
                    )}

                    {/* Date Range Input */}
                    <div className="flex items-center bg-white border border-surface-container rounded-xl overflow-hidden flex-1 min-w-64">
                        <div className="flex items-center flex-1 px-3 py-2.5">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg mr-2">
                                calendar_today
                            </span>
                            <input
                                className="flex-1 text-sm text-on-surface outline-none bg-transparent min-w-0"
                                type="date"
                                value={dateFrom}
                                onChange={(event) =>
                                    onDateFromChange(event.target.value)
                                }
                                placeholder="Od daty"
                            />
                        </div>
                        <div className="w-px h-6 bg-surface-container" />
                        <div className="flex items-center flex-1 px-3 py-2.5">
                            <span className="material-symbols-outlined text-on-surface-variant text-lg mr-2">
                                calendar_today
                            </span>
                            <input
                                className="flex-1 text-sm text-on-surface outline-none bg-transparent min-w-0"
                                type="date"
                                value={dateTo}
                                onChange={(event) =>
                                    onDateToChange(event.target.value)
                                }
                                placeholder="Do daty"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest border-b border-surface-container">
                            <th className="pb-4 px-4">Data</th>
                            <th className="pb-4 px-4">Lekcja / Przedmiot</th>
                            <th className="pb-4 px-4">Godzina</th>
                            <th className="pb-4 px-4">Status</th>
                            <th className="pb-4 px-4 text-right">Akcja</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                        {filteredRecords.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={5}
                                    className="py-8 text-center text-on-surface-variant"
                                >
                                    Brak wpisów w wybranym okresie
                                </td>
                            </tr>
                        ) : (
                            filteredRecords.map((record) => {
                                const statusName = resolveStatusName(
                                    record.status,
                                );
                                const hour = hourMap.get(
                                    record.godzina_lekcyjna,
                                );
                                const subjectName =
                                    hourToSubjectMap.get(record.id) ||
                                    "Przedmiot";

                                return (
                                    <tr
                                        key={record.id}
                                        className="group hover:bg-surface-container-low/50 transition-colors"
                                    >
                                        <td className="py-5 px-4">
                                            <div className="text-sm font-bold text-on-surface">
                                                {formatDate(record.Data)}
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${getSubjectIconColor(subjectName)}`}
                                                >
                                                    <span className="material-symbols-outlined text-sm">
                                                        {getSubjectIcon(
                                                            subjectName,
                                                        )}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold text-on-surface">
                                                    {subjectName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-4">
                                            <span className="text-sm text-on-surface-variant">
                                                {hour
                                                    ? `${hour.CzasOd.slice(0, 5)} - ${hour.CzasDo.slice(0, 5)}`
                                                    : "Brak danych"}
                                            </span>
                                        </td>
                                        <td className="py-5 px-4">
                                            {getStatusBadge(statusName)}
                                        </td>
                                        <td className="py-5 px-4 text-right">
                                            {statusName
                                                .toLowerCase()
                                                .includes("nieobecn") ? (
                                                <button className="text-primary hover:bg-primary/5 px-4 py-1.5 rounded-full text-xs font-bold transition-all">
                                                    Usprawiedliw
                                                </button>
                                            ) : (
                                                <button className="text-on-surface-variant hover:text-primary transition-colors">
                                                    <span className="material-symbols-outlined">
                                                        more_vert
                                                    </span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
