import { useState, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
    getAttendance,
    getAttendanceStatuses,
    getEvents,
    getGrades,
    getHomework,
    getInboxMessages,
    getLessonHours,
    getLuckyNumber,
    getTimetableEntries,
    getTimetablePlan,
    getSubjects,
    getZajecia,
    getDaysOfWeek,
    getTeachers,
    getUserProfile,
    markMessageRead,
} from "../services/api";
import { getCurrentUser } from "../services/auth";
import { keys } from "../services/queryKeys";
import { Card } from "./ui/Card";
import { Spinner } from "./ui/Spinner";
import { ErrorState } from "./ui/ErrorState";
import MessageDetail from "./messages/MessageDetail";
import {
    formatGradeValue,
    computeWeightedAverage,
    getGradeColor,
    getPercentageColor,
} from "../utils/gradeUtils";
import { formatDate } from "../utils/dateUtils";

export default function DashboardHome() {
    const user = getCurrentUser();
    const queryClient = useQueryClient();
    const [selectedMessage, setSelectedMessage] = useState<any | null>(null);

    const markReadMutation = useMutation({
        mutationFn: (id: number) => markMessageRead(id),
        onError: () =>
            toast.error("Nie udało się oznaczyć wiadomości jako przeczytanej"),
        onSuccess: () => {
            // Invalidate dashboard query to refresh the unread count
            if (user) {
                queryClient.invalidateQueries({
                    queryKey: [
                        "dashboard-home",
                        user.id,
                        user.role,
                        user.studentId,
                        user.classId,
                    ],
                });
                // Also invalidate basic inbox query if cached elsewhere
                queryClient.invalidateQueries({
                    queryKey: keys.inbox(user.id),
                });
            }
        },
    });

    const teachersQuery = useQuery({
        queryKey: keys.teachers(),
        queryFn: getTeachers,
        enabled: Boolean(user),
    });

    const query = useQuery({
        queryKey: user
            ? [
                  "dashboard-home",
                  user.id,
                  user.role,
                  user.studentId,
                  user.classId,
              ]
            : ["dashboard-home", "guest"],
        enabled: Boolean(user),
        queryFn: async () => {
            if (!user) return null;

            if (user.role === "uczen" && user.studentId && user.classId) {
                const [
                    lucky,
                    attendance,
                    attendanceStatuses,
                    plans,
                    grades,
                    inbox,
                    homework,
                    events,
                    hours,
                    subjects,
                    zajecia,
                    days,
                ] = await Promise.all([
                    getLuckyNumber(user.classId),
                    getAttendance(user.studentId),
                    getAttendanceStatuses(),
                    getTimetablePlan(user.classId),
                    getGrades(user.studentId),
                    getInboxMessages(user.id),
                    getHomework(user.classId),
                    getEvents(user.classId),
                    getLessonHours(),
                    getSubjects(),
                    getZajecia(),
                    getDaysOfWeek(),
                ]);

                const latestPlan = [...plans].sort((a, b) => b.id - a.id)[0];
                const entries = latestPlan
                    ? await getTimetableEntries(latestPlan.id)
                    : [];
                return {
                    lucky,
                    attendance,
                    attendanceStatuses,
                    entries,
                    grades,
                    inbox,
                    homework,
                    events,
                    hours,
                    subjects,
                    zajecia,
                    days,
                };
            }

            const inbox = await getInboxMessages(user.id);
            return { inbox };
        },
    });

    const inboxData = (query.data as any)?.inbox ?? [];

    const userIds = useMemo(() => {
        const unread = inboxData.filter((m: any) => !m.przeczytana);
        const ids = unread.map((m: any) => m.nadawca);
        if (selectedMessage) {
            ids.push(selectedMessage.nadawca);
            ids.push(selectedMessage.odbiorca);
        }
        return [...new Set(ids)].filter((id) => id); // filter out null/undefined
    }, [inboxData, selectedMessage]);

    const usersQuery = useQuery({
        queryKey: ["message-users", userIds],
        queryFn: async () => {
            const entries = await Promise.all(
                (userIds as number[]).map(async (id: number) => {
                    try {
                        const p = await getUserProfile(id);
                        return { id, name: `${p.first_name} ${p.last_name}` };
                    } catch (e) {
                        return { id, name: `Użytkownik #${id}` };
                    }
                }),
            );
            return new Map(entries.map((e) => [e.id, e.name]));
        },
        enabled: userIds.length > 0,
    });

    if (!user) return <ErrorState message="Brak zalogowanego użytkownika" />;
    if (query.isPending) return <Spinner />;
    if (query.isError) return <ErrorState message={query.error.message} />;

    const data = query.data;
    if (!data) return null;

    if (user.role !== "uczen") {
        const unread =
            data.inbox?.filter((message: any) => !message.przeczytana).length ??
            0;
        const unreadInbox = [...(data.inbox ?? [])]
            .filter((message: any) => !message.przeczytana)
            .sort(
                (a: any, b: any) =>
                    Date.parse(b.data_wyslania) - Date.parse(a.data_wyslania),
            );
        
        if (user.role === "nauczyciel" || user.role === "admin") {
            return (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-colors group-hover:bg-primary/10" />
                            <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2 font-body">
                                Panel nauczyciela
                            </div>
                            <div className="flex flex-col relative z-10">
                                <span className="text-xl font-bold text-on-surface truncate font-headline">
                                    {user.firstName}
                                </span>
                                <span className="text-xs text-on-surface-variant mt-1 font-body">
                                    {formatDate(new Date().toISOString())}
                                </span>
                            </div>
                        </div>

                        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] hover:shadow-md transition-shadow">
                            <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2 font-body">
                                Nieprzeczytane
                            </div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold tabular-nums text-on-surface font-headline">
                                    {unread}
                                </span>
                                <span className="text-xs text-on-surface-variant font-body">
                                    wiadomości
                                </span>
                            </div>
                        </div>

                        <Link
                            to="/dashboard/messages"
                            className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] hover:shadow-md transition-shadow block group cursor-pointer"
                        >
                            <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2 group-hover:text-primary transition-colors font-body">
                                Wiadomości
                            </div>
                            <div className="text-sm text-on-surface-variant group-hover:text-primary transition-colors font-body">
                                Przejdź do skrzynki odbiorczej
                            </div>
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2 space-y-6">
                            <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] overflow-hidden">
                                <div className="flex items-center justify-between p-5 bg-surface-container-low">
                                    <h3 className="section-title text-base font-bold font-headline">
                                        Szybkie akcje
                                    </h3>
                                </div>

                                <div className="space-y-1">
                                    <Link
                                        to="/dashboard/teacher/grades"
                                        className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors group"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors font-body">
                                                Wystawianie ocen
                                            </p>
                                            <p className="text-xs text-on-surface-variant mt-0.5 font-body">
                                                Dodaj i edytuj oceny uczniów
                                            </p>
                                        </div>
                                        <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors font-body">
                                            Otwórz
                                        </span>
                                    </Link>

                                    <Link
                                        to="/dashboard/teacher/attendance"
                                        className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors group"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors font-body">
                                                Sprawdzanie obecności
                                            </p>
                                            <p className="text-xs text-on-surface-variant mt-0.5 font-body">
                                                Zaznacz obecność uczniów
                                            </p>
                                        </div>
                                        <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors font-body">
                                            Otwórz
                                        </span>
                                    </Link>

                                    <Link
                                        to="/dashboard/teacher/homework"
                                        className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors group"
                                    >
                                        <div>
                                            <p className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors font-body">
                                                Zadania domowe
                                            </p>
                                            <p className="text-xs text-on-surface-variant mt-0.5 font-body">
                                                Twórz i aktualizuj zadania
                                            </p>
                                        </div>
                                        <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors font-body">
                                            Otwórz
                                        </span>
                                    </Link>
                                </div>
                            </div>

                        </div>

                        <div className="space-y-6 flex flex-col">
                            <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] overflow-hidden flex flex-col h-full">
                                <div className="flex items-center justify-between p-5 bg-surface-container-low">
                                    <h3 className="section-title text-base font-bold font-headline">
                                        Nieodczytane wiadomości
                                    </h3>
                                    <Link
                                        to="/dashboard/messages"
                                        className="text-xs font-medium text-primary hover:text-primary/80 uppercase tracking-wide font-body"
                                    >
                                        Wszystkie
                                    </Link>
                                </div>

                                <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                                    {unreadInbox.length ? (
                                        unreadInbox.map((message: any) => (
                                            <div
                                                key={message.id}
                                                onClick={() => handleOpenMessage(message)}
                                                className="block group cursor-pointer"
                                            >
                                                <div className="bg-background rounded-lg p-3 hover:border-primary/50 hover:shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] transition-all relative overflow-hidden group-hover:bg-accent/5">
                                                    <div
                                                        className={`absolute top-0 left-0 w-1 h-full ${message.przeczytana ? "bg-border" : "bg-primary"}`}
                                                    />
                                                    <div className="pl-3">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="font-semibold text-sm text-on-surface truncate pr-2 group-hover:text-primary transition-colors font-body">
                                                                {message.temat || "(bez tematu)"}
                                                            </p>
                                                            <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
                                                                {formatDate(message.data_wyslania)}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-on-surface-variant line-clamp-2 font-body">
                                                            {message.tresc}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant">
                                            <p className="text-sm font-body">
                                                Brak nieodczytanych wiadomości
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <MessageDetail
                        message={selectedMessage}
                        open={Boolean(selectedMessage)}
                        onClose={() => setSelectedMessage(null)}
                        resolveUserName={resolveUserName}
                    />
                </div>
            );
        }

        return (
            <div>
                <h1 className="page-title mb-6 font-headline">Pulpit</h1>
                <Card>
                    <p className="text-on-surface font-body">
                        Nieprzeczytane wiadomości: {unread}
                    </p>
                    <Link
                        className="text-primary hover:text-primary/80 mt-2 inline-block"
                        to="/dashboard/messages"
                    >
                        Przejdź do wiadomości
                    </Link>
                </Card>
            </div>
        );
    }

    const studentData = data as any;
    const attendanceCount = studentData.attendance?.length ?? 0;

    const statusMap = new Map(
        (studentData.attendanceStatuses || []).map((s: any) => [
            s.id,
            s.Wartosc,
        ]),
    );

    const absentCount =
        studentData.attendance?.filter((record: any) => {
            const statusText = (
                String(statusMap.get(record.status)) || ""
            ).toLowerCase();
            return (
                statusText.includes("nieobecn") || statusText.includes("uspraw")
            );
        }).length ?? 0;

    const recentGrades = [...(studentData.grades || [])]
        .sort(
            (a, b) =>
                Date.parse(b.data_wystawienia) - Date.parse(a.data_wystawienia),
        )
        .slice(0, 5);
    const weighted = computeWeightedAverage(studentData.grades || []);
    const unreadMessages =
        studentData.inbox?.filter((message: any) => !message.przeczytana) || [];

    const attendancePercentage = attendanceCount
        ? ((attendanceCount - absentCount) / attendanceCount) * 100
        : 100;
    const attendanceColorClass = getPercentageColor(attendancePercentage);

    const today = new Date();
    const todayDayOfWeek = today.getDay(); // 0 = niedziela, 1 = poniedzialek, etc.

    // Find the day ID from the database using the "Numer" field
    // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
    // DB Numer: Usually 1=Mon, ..., 7=Sun
    const jsDayToDbNumer = todayDayOfWeek === 0 ? 7 : todayDayOfWeek;

    const targetDayObj = (studentData.days || []).find(
        (d: any) => d.Numer === jsDayToDbNumer,
    );
    const targetDayId = targetDayObj ? targetDayObj.id : null;

    const zajeciaMap = new Map(
        (studentData.zajecia || []).map((z: any) => [z.id, z]),
    );
    const przedmiotMap = new Map(
        (studentData.subjects || []).map((s: any) => [s.id, s]),
    );

    // Resolve user name using users query cache or teachers cache
    function resolveUserName(id: number) {
        if (!id) return "Nieznany";
        if (id === user?.id) return "Ja";

        const name = usersQuery.data?.get(id);
        if (name) return name;

        const teachers = teachersQuery.data || [];
        const teacher = teachers.find((t: any) => t.user?.id === id);
        if (teacher)
            return `${teacher.user.first_name} ${teacher.user.last_name}`;

        return `Użytkownik #${id}`;
    }

    const handleOpenMessage = (message: any) => {
        setSelectedMessage(message);
        if (!message.przeczytana) {
            markReadMutation.mutate(message.id);
        }
    };

    const getSubjectName = (zajeciaId: number) => {
        const zajecia = zajeciaMap.get(zajeciaId);
        if (!zajecia) return "Nieznany przedmiot";
        const subject = przedmiotMap.get((zajecia as any).przedmiot);
        return subject ? (subject as any).nazwa : "Nieznany przedmiot";
    };

    const getGradeSubjectName = (subjectId: number) => {
        const subject = przedmiotMap.get(subjectId);
        return subject ? (subject as any).nazwa : "Nieznany przedmiot";
    };
    const todayLessons = (studentData.entries || [])
        .filter(
            (entry: any) =>
                targetDayId &&
                (entry.dzien_tygodnia ?? entry.DzienTygodnia) === targetDayId,
        )
        .map((entry: any) => {
            const hour = (studentData.hours || []).find(
                (h: any) => h.id === entry.godzina_lekcyjna,
            );
            return { ...entry, hour };
        })
        .sort((a: any, b: any) => (a.hour?.Numer ?? 0) - (b.hour?.Numer ?? 0));

    const currentHourTime = today.getHours() * 60 + today.getMinutes();
    const nextLesson = todayLessons.find((lesson: any) => {
        if (!lesson.hour) return false;
        const [h, m] = lesson.hour.CzasDo.split(":").map(Number);
        return h * 60 + m > currentHourTime;
    });

    return (
        <div className="space-y-6">
            {/* 4 Cards Grid - Replaced Header & Lucky Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Card 1: Welcome */}
                <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-colors group-hover:bg-primary/10" />
                    <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2 font-body">
                        Dzień dobry
                    </div>
                    <div className="flex flex-col relative z-10">
                        <span className="text-xl font-bold text-on-surface truncate font-headline">
                            {user.firstName}
                        </span>
                        <span className="text-xs text-on-surface-variant mt-1 font-body">
                            {formatDate(new Date().toISOString())}
                        </span>
                    </div>
                </div>

                {/* Card 2: Average */}
                <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] hover:shadow-md transition-shadow">
                    <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2 font-body">
                        Średnia ocen
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tabular-nums text-on-surface font-headline">
                            {weighted.toFixed(2)}
                        </span>
                        <span className="text-xs text-on-surface-variant font-body">
                            ważona
                        </span>
                    </div>
                </div>

                {/* Card 3: Attendance */}
                <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] hover:shadow-md transition-shadow">
                    <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2 font-body">
                        Frekwencja
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span
                            className={`text-3xl font-bold tabular-nums ${attendanceColorClass}`}
                        >
                            {Math.round(attendancePercentage)}%
                        </span>
                        <span className="text-xs text-on-surface-variant font-body">
                            obecności
                        </span>
                    </div>
                </div>

                {/* Card 4: Messages */}
                <Link
                    to="/dashboard/messages"
                    className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] hover:shadow-md transition-shadow block group cursor-pointer"
                >
                    <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2 group-hover:text-primary transition-colors font-body">
                        Wiadomości
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold tabular-nums text-on-surface group-hover:text-primary transition-colors font-headline">
                            {studentData.inbox?.filter(
                                (message: any) => !message.przeczytana,
                            ).length ?? 0}
                        </span>
                        <span className="text-xs text-on-surface-variant font-body">
                            nieprzeczytane
                        </span>
                    </div>
                </Link>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Left Column: Schedule & Grades */}
                <div className="xl:col-span-2 space-y-6">
                    {/* Today's Schedule Details */}
                    <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] overflow-hidden">
                        <div className="flex items-center justify-between p-5 bg-surface-container-low">
                            <h3 className="section-title text-base font-bold font-headline">
                                Dzisiejszy plan
                            </h3>
                            <Link
                                to="/dashboard/timetable"
                                className="text-xs font-medium text-primary hover:text-primary/80 uppercase tracking-wide font-body"
                            >
                                Pełny plan
                            </Link>
                        </div>

                        <div className="p-0">
                            {/* Next Lesson Highlight */}
                            {nextLesson && (
                                <div className="p-4 bg-primary/5 flex items-center gap-4 relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                    <div className="w-12 h-12 rounded-xl bg-background flex items-center justify-center text-primary font-bold shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] relative z-10">
                                        <span className="text-xl font-headline">
                                            {nextLesson.hour?.Numer}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0 relative z-10">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs text-on-surface-variant font-mono tabular-nums font-body">
                                                {nextLesson.hour?.CzasOd?.substring(
                                                    0,
                                                    5,
                                                )}{" "}
                                                -{" "}
                                                {nextLesson.hour?.CzasDo?.substring(
                                                    0,
                                                    5,
                                                )}
                                            </span>
                                        </div>
                                        <p className="font-bold text-on-surface truncate text-lg leading-tight font-body">
                                            {getSubjectName(nextLesson.zajecia)}
                                        </p>
                                    </div>
                                    <div className="text-right relative z-10 flex flex-row items-center gap-2">
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-primary text-primary-foreground uppercase tracking-wide">
                                            Teraz
                                        </span>
                                        <div className="text-xs text-on-surface-variant uppercase tracking-wider font-bold mb-1 font-body">
                                            Sala
                                        </div>
                                        <div className="bg-background px-3 py-1 rounded-md font-mono text-sm shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] inline-block font-body">
                                            {nextLesson.sala ?? "—"}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Schedule List */}
                            <div className="overflow-x-auto">
                                {todayLessons.length > 0 ? (
                                    <table className="w-full text-sm text-left font-body">
                                        <thead className="bg-surface-container-low text-xs text-on-surface-variant uppercase tracking-wider font-semibold font-body">
                                            <tr>
                                                <th className="px-5 py-3 w-16 text-center">
                                                    Nr
                                                </th>
                                                <th className="px-5 py-3 w-32">
                                                    Godzina
                                                </th>
                                                <th className="px-5 py-3">
                                                    Przedmiot
                                                </th>
                                                <th className="px-5 py-3 w-24 text-right">
                                                    Sala
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="">
                                            {todayLessons.map((lesson: any) => {
                                                const isNext =
                                                    nextLesson &&
                                                    nextLesson.id === lesson.id;
                                                const isPast =
                                                    nextLesson &&
                                                    (lesson.hour?.Numer ?? 0) <
                                                        (nextLesson.hour
                                                            ?.Numer ?? 0);

                                                return (
                                                    <tr
                                                        key={lesson.id}
                                                        className={`group hover:bg-surface-container-low transition-colors ${isPast ? "opacity-40" : ""} ${isNext ? "bg-primary/5" : "even:bg-surface-container-low"} font-body`}
                                                    >
                                                        <td className="px-5 py-3 text-center font-mono font-medium text-on-surface-variant group-hover:text-on-surface transition-colors">
                                                            {lesson.hour?.Numer}
                                                        </td>
                                                        <td className="px-5 py-3 font-mono text-on-surface-variant tabular-nums">
                                                            {lesson.hour?.CzasOd?.substring(
                                                                0,
                                                                5,
                                                            )}{" "}
                                                            -{" "}
                                                            {lesson.hour?.CzasDo?.substring(
                                                                0,
                                                                5,
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3 font-medium text-on-surface">
                                                            {getSubjectName(
                                                                lesson.zajecia,
                                                            )}
                                                        </td>
                                                        <td className="px-5 py-3 text-right text-on-surface-variant font-medium">
                                                            {lesson.sala ?? "-"}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                ) : (
                                    <div className="p-12 text-center flex flex-col items-center justify-center text-on-surface-variant bg-surface-container-lowest/50">
                                        <p className="text-sm font-body">
                                            Brak zaplanowanych lekcji na dzisiaj
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Grades Block */}
                    <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] overflow-hidden">
                        <div className="flex items-center justify-between p-5 bg-surface-container-low">
                            <h3 className="section-title text-base font-bold font-headline">
                                Ostatnie oceny
                            </h3>
                            <Link
                                to="/dashboard/grades"
                                className="text-xs font-medium text-primary hover:text-primary/80 uppercase tracking-wide font-body"
                            >
                                Wszystkie oceny
                            </Link>
                        </div>
                        <div>
                            {recentGrades.length ? (
                                <div className="space-y-1">
                                    {recentGrades.map((grade: any) => (
                                        <div
                                            key={grade.id}
                                            className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors group"
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <span
                                                    className={`flex shrink-0 w-10 h-10 rounded-lg font-bold tabular-nums text-lg items-center justify-center shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)]  ${getGradeColor(grade.wartosc)}`}
                                                >
                                                    {formatGradeValue(
                                                        grade.wartosc,
                                                    )}
                                                </span>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-sm text-on-surface truncate group-hover:text-primary transition-colors font-body">
                                                        {getGradeSubjectName(
                                                            grade.przedmiot,
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-on-surface-variant truncate font-body">
                                                        {grade.opis ||
                                                            "Ocena cząstkowa"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5 font-body">
                                                    Waga: {grade.waga}
                                                </p>
                                                <p className="text-xs text-on-surface-variant tabular-nums font-body">
                                                    {formatDate(
                                                        grade.data_wystawienia,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-on-surface-variant italic">
                                    Brak ostatnich ocen
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Messages (Inbox Preview) */}
                <div className="space-y-6 flex flex-col">
                    <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] overflow-hidden flex flex-col h-full">
                        <div className="flex items-center justify-between p-5 bg-surface-container-low">
                            <h3 className="section-title text-base font-bold font-headline">
                                Wiadomości
                            </h3>
                            <Link
                                to="/dashboard/messages"
                                className="text-xs font-medium text-primary hover:text-primary/80 uppercase tracking-wide font-body"
                            >
                                Skrzynka
                            </Link>
                        </div>
                        <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                            {unreadMessages.length ? (
                                unreadMessages.map((message: any) => (
                                    <div
                                        key={message.id}
                                        onClick={() =>
                                            handleOpenMessage(message)
                                        }
                                        className="block group cursor-pointer"
                                    >
                                        <div className="bg-background rounded-lg p-3 hover:border-primary/50 hover:shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] transition-all relative overflow-hidden group-hover:bg-accent/5">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
                                            <div className="pl-3">
                                                <div className="flex justify-between items-start mb-1">
                                                    <p className="font-semibold text-sm text-on-surface truncate pr-2 group-hover:text-primary transition-colors font-body">
                                                        {message.temat}
                                                    </p>
                                                    <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
                                                        {formatDate(
                                                            message.data_wyslania,
                                                        )}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-on-surface-variant line-clamp-2 font-body">
                                                    {message.tresc.substring(
                                                        0,
                                                        60,
                                                    )}
                                                    ...
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant">
                                    <p className="text-sm font-body">
                                        Brak nowych wiadomości
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <MessageDetail
                message={selectedMessage}
                open={Boolean(selectedMessage)}
                onClose={() => setSelectedMessage(null)}
                resolveUserName={resolveUserName}
            />
        </div>
    );
}
