import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {
    getAttendance,
    getAttendanceStatuses,
    getLessonHours,
} from "../../services/api";
import { keys } from "../../services/queryKeys";
import { getCurrentUser } from "../../services/auth";
import { Spinner } from "../ui/Spinner";
import { ErrorState } from "../ui/ErrorState";
import AttendanceStats from "./AttendanceStats";
import AttendanceAbsencesView from "./AttendanceAbsencesView";
import ExcuseModal from "./ExcuseModal";

export default function AttendancePage() {
    const user = getCurrentUser();
    const studentId = user?.studentId;
    const [selectedStatus, setSelectedStatus] = useState("Wszystkie");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const [excuseOpen, setExcuseOpen] = useState(false);

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

    const attendance = attendanceQuery.data ?? [];
    const statuses = statusesQuery.data ?? [];
    const hours = hoursQuery.data ?? [];

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

    const monthlyData = useMemo(() => {
        const map = new Map<
            string,
            { month: string; nieobecność: number; spóźnienie: number }
        >();
        attendance.forEach((record) => {
            const date = new Date(record.Data);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
            const entry = map.get(key) ?? {
                month: key,
                nieobecność: 0,
                spóźnienie: 0,
            };
            const name = resolveStatusName(record.status).toLowerCase();
            if (name.includes("nieobecn")) entry.nieobecność += 1;
            else if (name.includes("spóźn") || name.includes("spozn"))
                entry.spóźnienie += 1;
            map.set(key, entry);
        });
        return [...map.values()].sort((a, b) => a.month.localeCompare(b.month));
    }, [attendance, statusMap]);

    if (!studentId) return <ErrorState message="Brak przypisanego ucznia" />;
    if ([attendanceQuery, statusesQuery, hoursQuery].some((q) => q.isPending))
        return <Spinner />;
    const firstError = [attendanceQuery, statusesQuery, hoursQuery].find(
        (q) => q.isError,
    );
    if (firstError?.isError)
        return <ErrorState message={firstError.error.message} />;

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

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="page-title font-headline">Obecność</h1>
            </div>

            <AttendanceStats
                percentage={percentage}
                absences={absences}
                lates={lates}
            />

            {monthlyData.length >= 2 ? (
                <div className="bg-surface-container-lowest shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] rounded-[var(--radius)] p-4 h-80">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={monthlyData}
                            margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid
                                strokeDasharray="3 3"
                                vertical={false}
                                stroke="hsl(var(--border))"
                                opacity={0.4}
                            />
                            <XAxis
                                dataKey="month"
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                            />
                            <YAxis
                                stroke="hsl(var(--muted-foreground))"
                                fontSize={12}
                                tickLine={false}
                                axisLine={false}
                                tickMargin={10}
                            />
                            <Tooltip
                                cursor={{
                                    fill: "hsl(var(--muted))",
                                    opacity: 0.4,
                                }}
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                    color: "hsl(var(--foreground))",
                                }}
                            />
                            <Legend wrapperStyle={{ paddingTop: "20px" }} />
                            <Bar
                                dataKey="nieobecność"
                                fill="#ef4444"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                            <Bar
                                dataKey="spóźnienie"
                                fill="#f59e0b"
                                radius={[4, 4, 0, 0]}
                                maxBarSize={40}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            ) : null}

            <AttendanceAbsencesView
                records={attendance}
                resolveStatusName={resolveStatusName}
                getStatusVariant={getStatusVariant}
                hours={hours}
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
            />

            <button className="btn-ghost" onClick={() => setExcuseOpen(true)}>
                Zgłoś usprawiedliwienie
            </button>
            <ExcuseModal
                open={excuseOpen}
                onClose={() => setExcuseOpen(false)}
            />
        </div>
    );
}
