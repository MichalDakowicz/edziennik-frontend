import type { LessonTimeBadge } from "../../../utils/lessonTimeStatus";
import type {
    Homework,
    LessonHour,
    Grade,
    Subject,
    TimetableEntry,
} from "../../../types/api";

export type LiveItem = {
    id: string;
    kind:
        | "message"
        | "grade"
        | "homework"
        | "attendance"
        | "event"
        | "behavior";
    date: string;
    label: string;
    title: string;
    body: string;
    icon: string;
    isRead: boolean;
    onClick?: () => void;
    to?: string;
};

export type StudentLessonState = TimetableEntry & {
    hour?: LessonHour;
    isCurrent: boolean;
    isPast: boolean;
    timeBadge: LessonTimeBadge | null;
    sala?: string | number | null;
};

export type StudentDashboardProps = {
    firstName: string;
    weightedAverage: number;
    unreadCount: number;
    lessonsWithState: StudentLessonState[];
    recentGrades: Grade[];
    subjects: Subject[];
    upcomingHomework: Homework[];
    liveItems: LiveItem[];
    getSubjectName: (zajeciaId: number) => string;
    getGradeSubjectName: (subjectId: number) => string;
    getTeacherNameForLesson: (zajeciaId: number) => string;
    formatHour: (value: string | null | undefined) => string;
    formatRelativeDay: (value: string) => string;
    onGradeClick: (grade: Grade) => void;
};
