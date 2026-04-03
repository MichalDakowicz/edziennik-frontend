import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    getAttendance,
    getAttendanceStatuses,
    getBehaviorPoints,
    getEvents,
    getGrades,
    getHomework,
    getInboxMessages,
    getTeachers,
    markMessageRead,
} from "../../services/api";
import { getCurrentUser } from "../../services/auth";
import { keys } from "../../services/queryKeys";
import { formatDate } from "../../utils/dateUtils";
import { ErrorState } from "../ui/ErrorState";
import { Spinner } from "../ui/Spinner";
import { useStudentDashboardModel } from "../dashboard/useStudentDashboardModel";

export default function NotificationsPage() {
    const user = getCurrentUser();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const inboxQuery = useQuery({
        queryKey: user ? keys.inbox(user.id) : ["inbox", "na"],
        queryFn: () => getInboxMessages(user?.id as number),
        enabled: Boolean(user),
    });

    const teachersQuery = useQuery({
        queryKey: keys.teachers(),
        queryFn: getTeachers,
        enabled: Boolean(user),
    });

    const gradesQuery = useQuery({
        queryKey:
            user?.role === "uczen" && user?.studentId
                ? keys.grades(user.studentId)
                : ["grades", "na"],
        queryFn: () => getGrades(user?.studentId as number),
        enabled: Boolean(user?.role === "uczen" && user?.studentId),
    });

    const homeworkQuery = useQuery({
        queryKey:
            user?.role === "uczen" && user?.classId
                ? keys.homework(user.classId)
                : ["homework", "na"],
        queryFn: () => getHomework(user?.classId as number),
        enabled: Boolean(user?.role === "uczen" && user?.classId),
    });

    const eventsQuery = useQuery({
        queryKey:
            user?.role === "uczen" && user?.classId
                ? keys.events(user.classId)
                : ["events", "na"],
        queryFn: () => getEvents(user?.classId as number),
        enabled: Boolean(user?.role === "uczen" && user?.classId),
    });

    const attendanceQuery = useQuery({
        queryKey:
            user?.role === "uczen" && user?.studentId
                ? keys.attendance(user.studentId)
                : ["attendance", "na"],
        queryFn: () => getAttendance(user?.studentId as number),
        enabled: Boolean(user?.role === "uczen" && user?.studentId),
    });

    const attendanceStatusesQuery = useQuery({
        queryKey: ["attendance-statuses"],
        queryFn: getAttendanceStatuses,
        enabled: Boolean(user?.role === "uczen"),
    });

    const behaviorQuery = useQuery({
        queryKey:
            user?.role === "uczen" && user?.studentId
                ? keys.behavior(user.studentId)
                : ["behavior", "na"],
        queryFn: () => getBehaviorPoints(user?.studentId as number),
        enabled: Boolean(user?.role === "uczen" && user?.studentId),
    });

    const markReadMutation = useMutation({
        mutationFn: (id: number) => markMessageRead(id),
        onSuccess: () => {
            if (user) queryClient.invalidateQueries({ queryKey: keys.inbox(user.id) });
        },
        onError: () => {
            toast.error("Nie udało się oznaczyć wiadomości jako przeczytanej");
        },
    });

    const safeStudentData = {
        inbox: inboxQuery.data ?? [],
        grades: gradesQuery.data ?? [],
        homework: homeworkQuery.data ?? [],
        events: eventsQuery.data ?? [],
        attendance: attendanceQuery.data ?? [],
        attendanceStatuses: attendanceStatusesQuery.data ?? [],
        behaviorPoints: behaviorQuery.data ?? [],
        subjects: [],
        zajecia: [],
        days: [],
        entries: [],
        hours: [],
    };

    const openMessage = (message: any) => {
        if (!message.przeczytana) {
            markReadMutation.mutate(message.id);
        }
        navigate(`/dashboard/messages/${message.id}`);
    };

    const model = useStudentDashboardModel({
        studentData: safeStudentData,
        teachers: teachersQuery.data ?? [],
        onOpenMessage: openMessage,
        maxLiveItems: 40,
    });

    const notifications = model.liveItems;

    if (!user) return <ErrorState message="Brak zalogowanego użytkownika" />;

    const loadingQueries = [
        inboxQuery,
        teachersQuery,
        gradesQuery,
        homeworkQuery,
        eventsQuery,
        attendanceQuery,
        attendanceStatusesQuery,
        behaviorQuery,
    ];

    if (loadingQueries.some((query) => query.isPending)) return <Spinner />;
    const firstError = loadingQueries.find((query) => query.isError);
    if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

    const badgeClassByKind: Record<string, string> = {
        message: "bg-primary-fixed text-on-primary-fixed",
        grade: "bg-tertiary-fixed text-on-tertiary-fixed",
        homework: "bg-tertiary-fixed/60 text-on-tertiary-fixed-variant",
        attendance: "bg-secondary-fixed text-on-secondary-fixed",
        event: "bg-surface-container-high text-on-surface",
        behavior: "bg-secondary-fixed-dim text-on-secondary-fixed-variant",
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">Powiadomienia</h1>
                    <p className="text-on-surface-variant font-body text-sm mt-1">
                        Najnowsze aktualizacje i zmiany dotyczace Twojego konta.
                    </p>
                </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)]">
                {notifications.length > 0 ? (
                    <div className="space-y-2">
                        {notifications.map((item) => {
                            const badgeClass =
                                badgeClassByKind[item.kind] ||
                                "bg-surface-container-high text-on-surface";
                            const clickable = Boolean(item.onClick || item.to);

                            if (item.to) {
                                return (
                                    <Link
                                        key={item.id}
                                        to={item.to}
                                        onClick={item.onClick}
                                        className={`block rounded-xl p-4 ${clickable ? "hover:bg-surface-container-low transition-colors" : ""}`}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}>
                                                        {item.label}
                                                    </span>
                                                    <span className="text-[11px] text-outline font-body">
                                                        {formatDate(item.date)}
                                                    </span>
                                                </div>
                                                <p className="text-sm font-semibold text-on-surface font-body truncate">
                                                    {item.title}
                                                </p>
                                                <p className="text-xs text-on-surface-variant font-body mt-1 line-clamp-2">
                                                    {item.body}
                                                </p>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            }

                            return (
                                <div
                                    key={item.id}
                                    className={`rounded-xl p-4 ${clickable ? "hover:bg-surface-container-low transition-colors cursor-pointer" : ""}`}
                                    onClick={item.onClick}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${badgeClass}`}>
                                                    {item.label}
                                                </span>
                                                <span className="text-[11px] text-outline font-body">
                                                    {formatDate(item.date)}
                                                </span>
                                            </div>
                                            <p className="text-sm font-semibold text-on-surface font-body truncate">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-on-surface-variant font-body mt-1 line-clamp-2">
                                                {item.body}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p className="text-on-surface-variant font-body text-sm py-4">
                        Brak powiadomien.
                    </p>
                )}
            </div>
        </div>
    );
}
