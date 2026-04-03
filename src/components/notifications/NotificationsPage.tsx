import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    getAttendance,
    getAttendanceStatuses,
    getBehaviorPoints,
    getDaysOfWeek,
    getEvents,
    getGrades,
    getHomework,
    getInboxMessages,
    getLessonHours,
    getSubjects,
    getTeachers,
    getTimetableEntries,
    getTimetablePlan,
    getZajecia,
    markMessageRead,
} from "../../services/api";
import { getCurrentUser } from "../../services/auth";
import { keys } from "../../services/queryKeys";
import { formatDate } from "../../utils/dateUtils";
import { ErrorState } from "../ui/ErrorState";
import { Spinner } from "../ui/Spinner";
import { useStudentDashboardModel } from "../dashboard/useStudentDashboardModel";
import type { LiveItem } from "../dashboard/student/types";

type FilterKind = "all" | "grade" | "homework" | "message" | "event";

const filterConfig: Record<FilterKind, { label: string; icon?: string }> = {
    all: { label: "Wszystkie" },
    grade: { label: "Oceny", icon: "grade" },
    homework: { label: "Zadania", icon: "assignment" },
    message: { label: "Wiadomości", icon: "mail" },
    event: { label: "Ogłoszenia", icon: "campaign" },
};

const iconConfig: Record<string, { bg: string; iconColor: string; icon: string }> = {
    message: {
        bg: "bg-primary-fixed/80 dark:bg-primary/20",
        iconColor: "text-primary dark:text-primary",
        icon: "mail",
    },
    grade: {
        bg: "bg-tertiary-fixed/80 dark:bg-amber-400/10",
        iconColor: "text-tertiary dark:text-amber-400",
        icon: "grade",
    },
    homework: {
        bg: "bg-tertiary-fixed/50 dark:bg-orange-400/10",
        iconColor: "text-on-tertiary-fixed-variant dark:text-orange-400",
        icon: "assignment",
    },
    attendance: {
        bg: "bg-secondary-fixed/80 dark:bg-blue-400/10",
        iconColor: "text-on-secondary-fixed-variant dark:text-blue-400",
        icon: "rule",
    },
    event: {
        bg: "bg-surface-container-high dark:bg-surface-container",
        iconColor: "text-on-surface dark:text-on-surface",
        icon: "event",
    },
    behavior: {
        bg: "bg-secondary-fixed-dim/70 dark:bg-indigo-400/10",
        iconColor: "text-on-secondary-fixed-variant dark:text-indigo-400",
        icon: "star",
    },
};

function formatRelativeDay(isoDate: string): string {
    const date = new Date(isoDate);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = Math.round((startOfDate.getTime() - startOfToday.getTime()) / (24 * 60 * 60 * 1000));

    if (diff === 0) return "Dzisiaj";
    if (diff === -1) return "Wczoraj";
    if (diff === 1) return "Jutro";
    return formatDate(isoDate);
}

function groupByDay(items: LiveItem[]) {
    const groups: { day: string; items: LiveItem[] }[] = [];
    const map = new Map<string, LiveItem[]>();

    for (const item of items) {
        const day = formatRelativeDay(item.date);
        if (!map.has(day)) {
            map.set(day, []);
        }
        map.get(day)!.push(item);
    }

    for (const [day, dayItems] of map) {
        groups.push({ day, items: dayItems });
    }

    return groups;
}

function NotificationCard({ item }: { item: LiveItem }) {
    const cfg = iconConfig[item.kind] || iconConfig.event;

    return (
        <div
            className={`group relative flex gap-4 p-5 rounded-[1.25rem] transition-all duration-200 ${
                item.isRead
                    ? "bg-surface-container-lowest dark:bg-surface-container"
                    : "bg-surface-container-lowest dark:bg-surface-container-high"
            } hover:shadow-lg hover:shadow-primary/5 dark:hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.5)]`}
        >
            {!item.isRead && (
                <div className="absolute top-5 right-5">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary ring-4 ring-primary/10 dark:ring-primary/20" />
                </div>
            )}

            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <span className={`material-symbols-outlined text-3xl ${cfg.iconColor}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {cfg.icon}
                </span>
            </div>

            <div className="flex-1 min-w-0 pr-8">
                <span className="text-[11px] font-bold uppercase tracking-widest block mb-1 text-on-surface-variant dark:text-on-surface-variant/80">
                    {item.label}
                </span>
                <h3 className="font-bold text-base leading-tight mb-1 text-on-surface dark:text-on-surface">
                    {item.title}
                </h3>
                <p className="text-on-surface-variant dark:text-on-surface-variant/70 text-sm line-clamp-2">
                    {item.body}
                </p>
            </div>
        </div>
    );
}

function NotificationRow({ item }: { item: LiveItem }) {
    const cfg = iconConfig[item.kind] || iconConfig.event;

    return (
        <div
            className={`flex items-center gap-5 p-5 rounded-[1.25rem] border transition-all duration-200 ${
                item.isRead
                    ? "bg-surface-container-lowest/60 dark:bg-surface-container/40 border-outline-variant/10 dark:border-outline-variant/5"
                    : "bg-surface-container-lowest/80 dark:bg-surface-container-high/60 border-outline-variant/20 dark:border-outline-variant/10"
            } hover:shadow-md hover:shadow-primary/5 dark:hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.5)]`}
        >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
                <span className={`material-symbols-outlined text-xl ${cfg.iconColor}`}>
                    {cfg.icon}
                </span>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-bold text-on-surface dark:text-on-surface">{item.title}</h3>
                    <span className="bg-surface-container-high dark:bg-surface-container text-[10px] font-bold px-2 py-0.5 rounded text-on-surface-variant dark:text-on-surface-variant/70 uppercase">
                        {item.label}
                    </span>
                </div>
                <p className="text-sm text-on-surface-variant dark:text-on-surface-variant/70 line-clamp-1">
                    {item.body}
                </p>
            </div>

            <div className="text-right shrink-0">
                <span className="text-[11px] font-medium text-outline dark:text-outline-variant">
                    {formatDate(item.date)}
                </span>
            </div>
        </div>
    );
}

export default function NotificationsPage() {
    const user = getCurrentUser();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState<FilterKind>("all");
    const [searchQuery, setSearchQuery] = useState("");

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

    const subjectsQuery = useQuery({
        queryKey: keys.subjects(),
        queryFn: getSubjects,
        enabled: Boolean(user),
    });

    const zajeciaQuery = useQuery({
        queryKey: ["zajecia"],
        queryFn: getZajecia,
        enabled: Boolean(user),
    });

    const timetablePlanQuery = useQuery({
        queryKey: user?.classId ? ["timetable-plan", user.classId] : ["timetable-plan", "na"],
        queryFn: () => getTimetablePlan(user!.classId as number),
        enabled: Boolean(user?.classId),
    });

    const timetableEntriesQuery = useQuery({
        queryKey: timetablePlanQuery.data ? ["timetable-entries", timetablePlanQuery.data[0]?.id] : ["timetable-entries", "na"],
        queryFn: () => {
            const latestPlan = [...(timetablePlanQuery.data ?? [])].sort((a, b) => b.id - a.id)[0];
            return latestPlan ? getTimetableEntries(latestPlan.id) : [];
        },
        enabled: Boolean(timetablePlanQuery.data),
    });

    const daysQuery = useQuery({
        queryKey: ["days-of-week"],
        queryFn: getDaysOfWeek,
        enabled: Boolean(user),
    });

    const hoursQuery = useQuery({
        queryKey: ["lesson-hours"],
        queryFn: getLessonHours,
        enabled: Boolean(user),
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
        subjects: subjectsQuery.data ?? [],
        zajecia: zajeciaQuery.data ?? [],
        days: daysQuery.data ?? [],
        entries: timetableEntriesQuery.data ?? [],
        hours: hoursQuery.data ?? [],
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

    const loadingQueries = [
        inboxQuery,
        teachersQuery,
        gradesQuery,
        homeworkQuery,
        eventsQuery,
        attendanceQuery,
        attendanceStatusesQuery,
        behaviorQuery,
        subjectsQuery,
        zajeciaQuery,
        timetablePlanQuery,
        timetableEntriesQuery,
        daysQuery,
        hoursQuery,
    ];

    const filteredNotifications = useMemo(() => {
        let items = activeFilter === "all" ? model.liveItems : model.liveItems.filter((item) => item.kind === activeFilter);
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            items = items.filter(
                (item) =>
                    item.title.toLowerCase().includes(q) ||
                    item.body.toLowerCase().includes(q) ||
                    item.label.toLowerCase().includes(q),
            );
        }
        return items;
    }, [model.liveItems, activeFilter, searchQuery]);

    const unreadCount = useMemo(
        () => model.liveItems.filter((item) => !item.isRead).length,
        [model.liveItems],
    );

    const groups = useMemo(() => groupByDay(filteredNotifications), [filteredNotifications]);

    const filterCounts = useMemo(() => {
        const counts: Record<string, number> = { all: model.liveItems.length };
        for (const item of model.liveItems) {
            counts[item.kind] = (counts[item.kind] || 0) + 1;
        }
        return counts;
    }, [model.liveItems]);

    if (!user) return <ErrorState message="Brak zalogowanego użytkownika" />;
    if (loadingQueries.some((query) => query.isPending)) return <Spinner />;
    const firstError = loadingQueries.find((query) => query.isError);
    if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

    return (
        <div className="space-y-8">
            {/* Header */}
            <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">Powiadomienia</h1>
                    <p className="text-on-surface-variant font-body text-sm mt-1">
                        {unreadCount > 0
                            ? `${unreadCount} nieprzeczytanych`
                            : "Wszystkie powiadomienia zostały przeczytane"}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={() => {
                            toast.info("Oznaczanie wszystkich jako przeczytane...");
                        }}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-surface-container-highest dark:bg-surface-container text-primary font-semibold rounded-full hover:bg-surface-container-high dark:hover:bg-surface-container-high transition-all text-sm"
                    >
                        <span className="material-symbols-outlined text-[18px]">done_all</span>
                        Oznacz wszystkie jako przeczytane
                    </button>
                )}
            </header>

            {/* Filter Tabs */}
            <div className="flex flex-col gap-3">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">search</span>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Szukaj powiadomień..."
                        className="w-full bg-surface-container-lowest dark:bg-surface-container border border-outline-variant/20 dark:border-outline-variant/10 rounded-2xl py-3 pl-11 pr-4 text-sm text-on-surface dark:text-on-surface placeholder-outline/50 dark:placeholder-outline-variant/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline/60 dark:text-outline-variant/50 hover:text-on-surface dark:hover:text-on-surface transition-colors"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    )}
                </div>
                <div className="bg-surface-container-lowest/80 dark:bg-surface-container/50 backdrop-blur-xl rounded-2xl p-2 flex items-center shadow-sm border border-outline-variant/10 dark:border-outline-variant/5">
                    <div className="pl-4 pr-3 border-r border-outline-variant/20 dark:border-outline-variant/10 hidden sm:block">
                        <span className="text-primary dark:text-primary font-bold text-xs">Co chcesz zobaczyć?</span>
                    </div>
                    <div className="flex-1 flex items-center gap-1 overflow-x-auto no-scrollbar px-2">
                        {(Object.keys(filterConfig) as FilterKind[]).map((key) => {
                            const isActive = activeFilter === key;
                            const count = filterCounts[key] || 0;
                            return (
                                <button
                                    key={key}
                                    onClick={() => setActiveFilter(key)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold flex-shrink-0 transition-all ${
                                        isActive
                                            ? "bg-primary text-on-primary dark:bg-primary dark:text-white shadow-sm"
                                            : "bg-transparent text-on-surface-variant dark:text-on-surface-variant/70 hover:bg-surface-container-high dark:hover:bg-surface-container"
                                    }`}
                                >
                                    {filterConfig[key].label}
                                    {count > 0 && (
                                        <span className={`ml-1.5 ${isActive ? "text-on-primary/70 dark:text-white/70" : "text-on-surface-variant/50 dark:text-on-surface-variant/40"}`}>
                                            ({count})
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Notifications */}
            {filteredNotifications.length > 0 ? (
                <div className="space-y-10">
                    {groups.map((group) => (
                        <section key={group.day}>
                            <div className="flex items-center gap-4 mb-5">
                                <h2 className="text-lg font-bold text-on-surface dark:text-on-surface font-headline">
                                    {group.day}
                                </h2>
                                <div className="h-px flex-1 bg-gradient-to-r from-outline-variant/40 dark:from-outline-variant/10 to-transparent" />
                                <span className="text-xs font-medium text-outline dark:text-outline-variant">
                                    {group.items.length}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {group.items.map((item, idx) => {
                                    if (item.to) {
                                        return (
                                            <Link
                                                key={item.id}
                                                to={item.to}
                                                onClick={item.onClick}
                                            >
                                                {idx < 3 ? <NotificationCard item={item} /> : <NotificationRow item={item} />}
                                            </Link>
                                        );
                                    }

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={item.onClick}
                                            className={item.onClick ? "cursor-pointer" : ""}
                                        >
                                            {idx < 3 ? <NotificationCard item={item} /> : <NotificationRow item={item} />}
                                        </div>
                                    );
                                })}
                            </div>
                        </section>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-surface-container-high dark:bg-surface-container flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-4xl text-outline dark:text-outline-variant">
                            notifications_off
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-on-surface dark:text-on-surface mb-1">
                        Brak powiadomień
                    </h3>
                    <p className="text-on-surface-variant dark:text-on-surface-variant/60 text-sm max-w-xs">
                        {activeFilter !== "all"
                            ? `Nie masz powiadomień w kategorii "${filterConfig[activeFilter].label}".`
                            : "Gdy pojawią się nowe aktualizacje, znajdziesz je tutaj."}
                    </p>
                </div>
            )}
        </div>
    );
}
