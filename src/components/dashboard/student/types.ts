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
    onClick?: () => void;
    to?: string;
};

export type StudentDashboardProps = {
    firstName: string;
    weightedAverage: number;
    unreadCount: number;
    lessonsWithState: any[];
    recentGrades: any[];
    upcomingHomework: any[];
    liveItems: LiveItem[];
    getSubjectName: (zajeciaId: number) => string;
    getGradeSubjectName: (subjectId: number) => string;
    getTeacherNameForLesson: (zajeciaId: number) => string;
    formatHour: (value: string | null | undefined) => string;
    formatRelativeDay: (value: string) => string;
};
