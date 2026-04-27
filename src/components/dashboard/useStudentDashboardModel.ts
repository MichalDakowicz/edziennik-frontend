import { useMemo } from "react";
import { formatDate } from "../../utils/dateUtils";
import { computeWeightedAverage } from "../../utils/gradeUtils";
import {
    buildLessonTimeBadge,
    buildScheduleContext,
    parseClockToMinutes,
} from "../../utils/lessonTimeStatus";
import type { Attendance, BehaviorPoint, Event, Grade, Homework, Message } from "../../types/api";
import type { LiveItem } from "./student/types";

type UseStudentDashboardModelArgs = {
    studentData: any;
    teachers: any[];
    onOpenMessage: (message: any) => void;
    maxLiveItems?: number;
};

export function useStudentDashboardModel({
    studentData,
    teachers,
    onOpenMessage,
    maxLiveItems = 10,
}: UseStudentDashboardModelArgs) {
    const zajeciaMap = useMemo(
        () => new Map((studentData.zajecia || []).map((z: any) => [z.id, z])),
        [studentData.zajecia],
    );

    const przedmiotMap = useMemo(
        () =>
            new Map((studentData.subjects || []).map((s: any) => [s.id, s])),
        [studentData.subjects],
    );

    const nauczycielMap = useMemo(
        () =>
            new Map(
                (teachers || []).map((teacher: any) => [
                    teacher.id,
                    `${teacher.user.first_name} ${teacher.user.last_name}`,
                ]),
            ),
        [teachers],
    );

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

    const getTeacherNameForLesson = (zajeciaId: number) => {
        const zajecia = zajeciaMap.get(zajeciaId) as any;
        if (!zajecia?.nauczyciel) return "Nauczyciel";
        return nauczycielMap.get(zajecia.nauczyciel) ?? "Nauczyciel";
    };

    const recentGrades = useMemo(
        () =>
            [...(studentData.grades || [])]
                .sort(
                    (a, b) =>
                        Date.parse(b.data_wystawienia) -
                        Date.parse(a.data_wystawienia),
                )
                .slice(0, 4),
        [studentData.grades],
    );

    const recentAttendance = useMemo(
        () =>
            [...(studentData.attendance || [])]
                .filter((record: any) => Boolean(record?.Data))
                .sort((a: any, b: any) => Date.parse(b.Data) - Date.parse(a.Data))
                .slice(0, 5),
        [studentData.attendance],
    );

    const statusMap = useMemo(
        () =>
            new Map(
                (studentData.attendanceStatuses || []).map((status: any) => [
                    status.id,
                    String(status.Wartosc || "").trim(),
                ]),
            ),
        [studentData.attendanceStatuses],
    );

    const recentBehaviorPoints = useMemo(
        () =>
            [...(studentData.behaviorPoints || [])]
                .sort(
                    (a: any, b: any) =>
                        Date.parse(b.data_wpisu) - Date.parse(a.data_wpisu),
                )
                .slice(0, 4),
        [studentData.behaviorPoints],
    );

    const weighted = useMemo(
        () => computeWeightedAverage(studentData.grades || []),
        [studentData.grades],
    );

    const unreadMessages = useMemo(
        () =>
            studentData.inbox?.filter((message: any) => !message.przeczytana) ||
            [],
        [studentData.inbox],
    );

    const latestInboxMessages = useMemo(
        () =>
            [...(studentData.inbox || [])]
                .sort(
                    (a: any, b: any) =>
                        Date.parse(b.data_wyslania) -
                        Date.parse(a.data_wyslania),
                )
                .slice(0, 8),
        [studentData.inbox],
    );

    const upcomingHomework = useMemo(
        () =>
            [...(studentData.homework || [])]
                .filter((item: any) => Date.parse(item.termin) >= Date.now())
                .sort(
                    (a: any, b: any) =>
                        Date.parse(a.termin) - Date.parse(b.termin),
                )
                .slice(0, 3),
        [studentData.homework],
    );

    const recentEvents = useMemo(
        () =>
            [...(studentData.events || [])]
                .sort((a: any, b: any) => Date.parse(b.data) - Date.parse(a.data))
                .slice(0, 6),
        [studentData.events],
    );

    const todayLessons = useMemo(() => {
        const today = new Date();
        const todayDayOfWeek = today.getDay();
        const jsDayToDbNumer = todayDayOfWeek === 0 ? 7 : todayDayOfWeek;
        const targetDayObj = (studentData.days || []).find(
            (day: any) => day.Numer === jsDayToDbNumer,
        );
        const targetDayId = targetDayObj ? targetDayObj.id : null;

        return (studentData.entries || [])
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
    }, [studentData.days, studentData.entries, studentData.hours]);

    const lessonsWithState = useMemo(() => {
        const currentHourTime = new Date().getHours() * 60 + new Date().getMinutes();
        const lessonsWithMinutes = todayLessons.map((lesson: any) => ({
            ...lesson,
            startMinutes: parseClockToMinutes(lesson.hour?.CzasOd),
            endMinutes: parseClockToMinutes(lesson.hour?.CzasDo),
        }));
        const scheduleContext = buildScheduleContext(lessonsWithMinutes, currentHourTime);

        return lessonsWithMinutes.map((lesson: any) => {
            const isCurrent = scheduleContext.activeLessonId === lesson.id;
            const isPast = lesson.endMinutes !== null && currentHourTime >= lesson.endMinutes;
            const timeBadge = buildLessonTimeBadge(
                {
                    id: lesson.id,
                    startMinutes: lesson.startMinutes,
                    endMinutes: lesson.endMinutes,
                },
                scheduleContext,
                currentHourTime,
            );

            return {
                ...lesson,
                isCurrent,
                isPast,
                timeBadge,
            };
        });
    }, [todayLessons]);

    const formatHour = (value: string | null | undefined) =>
        value ? value.substring(0, 5) : "--:--";

    const formatRelativeDay = (isoDate: string) => {
        const date = new Date(isoDate);
        const now = new Date();
        const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
        );
        const startOfDate = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
        );
        const diff = Math.round(
            (startOfDate.getTime() - startOfToday.getTime()) /
                (24 * 60 * 60 * 1000),
        );

        if (diff === 0) return "Dzisiaj";
        if (diff === 1) return "Jutro";
        if (diff === -1) return "Wczoraj";
        return formatDate(isoDate);
    };

    const attendanceDayHourToZajecia = useMemo(() => {
        const map = new Map<string, number>();
        const dayIdToNum = new Map((studentData.days || []).map((d: any) => [d.id, d.Numer]));
        for (const entry of studentData.entries || []) {
            const dayId = entry.dzien_tygodnia ?? entry.DzienTygodnia;
            if (dayId != null) {
                const dayNum = dayIdToNum.get(dayId);
                if (dayNum) {
                    const key = `${dayNum}_${entry.godzina_lekcyjna}`;
                    map.set(key, entry.zajecia);
                }
            }
        }
        return map;
    }, [studentData.entries, studentData.days]);

    const liveItems = useMemo(() => {
        const messageItems: LiveItem[] = latestInboxMessages.map((message: Message) => ({
            id: `msg-${message.id}`,
            kind: "message" as const,
            date: message.data_wyslania,
            label: message.przeczytana ? "Wiadomość" : "Nowa wiadomość",
            title: message.temat || "(bez tematu)",
            body: message.tresc,
            icon: "mail",
            isRead: Boolean(message.przeczytana),
            onClick: () => onOpenMessage(message),
            to: "/dashboard/messages",
        }));

        const gradeItems: LiveItem[] = recentGrades.map((grade: Grade) => ({
            id: `grade-${grade.id}`,
            kind: "grade" as const,
            date: grade.data_wystawienia,
            label: "Nowa ocena",
            title: `${getGradeSubjectName(grade.przedmiot)} • ${grade.wartosc}`,
            body: grade.opis || "Dodano nową ocenę cząstkową.",
            icon: "grade",
            isRead: true,
            onClick: undefined,
            to: "/dashboard/grades",
        }));

        const homeworkItems: LiveItem[] = upcomingHomework.map((item: Homework) => ({
            id: `homework-${item.id}`,
            kind: "homework" as const,
            date: item.data_wystawienia || item.termin,
            label: "Praca domowa",
            title: getGradeSubjectName(item.przedmiot),
            body: item.opis,
            icon: "assignment",
            isRead: true,
            onClick: undefined,
            to: "/dashboard/homework",
        }));

        const attendanceItems: LiveItem[] = recentAttendance.map((record: Attendance) => {
            const statusObj =
                typeof record.status === "object" && record.status
                    ? record.status
                    : null;
            const statusText = statusObj?.Wartosc
                ? String(statusObj.Wartosc)
                : statusMap.get(Number(record.status)) || "Status nieznany";

            const attendanceDate = new Date(record.Data);
            const dayOfWeek = attendanceDate.getDay() === 0 ? 7 : attendanceDate.getDay();
            const zajeciaId = attendanceDayHourToZajecia.get(`${dayOfWeek}_${record.godzina_lekcyjna}`);
            const subjectName = zajeciaId ? getSubjectName(zajeciaId) : null;

            return {
                id: `attendance-${record.id}`,
                kind: "attendance" as const,
                date: record.Data,
                label: "Frekwencja",
                title: subjectName ?? "Frekwencja",
                body: `Status: ${statusText}`,
                icon: "rule",
                isRead: true,
                onClick: undefined,
                to: "/dashboard/attendance",
            };
        });

        const behaviorItems: LiveItem[] = recentBehaviorPoints.map((point: BehaviorPoint) => {
            const pointsLabel = point.punkty > 0 ? `+${point.punkty}` : `${point.punkty}`;
            return {
                id: `behavior-${point.id}`,
                kind: "behavior" as const,
                date: point.data_wpisu,
                label: "Zachowanie",
                title: `Punkty: ${pointsLabel}`,
                body: point.opis || "Zaktualizowano punkty zachowania.",
                icon: "star",
                isRead: true,
                onClick: undefined,
                to: "/dashboard/grades",
            };
        });

        const eventItems: LiveItem[] = recentEvents.map((event: Event) => ({
            id: `event-${event.id}`,
            kind: "event" as const,
            date: event.data,
            label: "Wydarzenie",
            title: event.tytul,
            body: event.opis,
            icon: "event",
            isRead: true,
            onClick: undefined,
            to: "/dashboard/events",
        }));

        return [
            ...messageItems,
            ...gradeItems,
            ...homeworkItems,
            ...attendanceItems,
            ...behaviorItems,
            ...eventItems,
        ]
            .filter((item) => Boolean(item.date))
            .sort((a, b) => Date.parse(b.date) - Date.parse(a.date))
            .slice(0, maxLiveItems);
    }, [
        latestInboxMessages,
        maxLiveItems,
        onOpenMessage,
        recentAttendance,
        recentBehaviorPoints,
        recentEvents,
        recentGrades,
        statusMap,
        upcomingHomework,
    ]);

    return {
        weighted,
        unreadMessages,
        lessonsWithState,
        recentGrades,
        upcomingHomework,
        liveItems,
        getSubjectName,
        getGradeSubjectName,
        getTeacherNameForLesson,
        formatHour,
        formatRelativeDay,
    };
}
