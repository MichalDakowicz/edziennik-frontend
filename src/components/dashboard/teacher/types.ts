export type TeacherDashboardProps = {
    firstName: string;
    unreadCount: number;
    unreadInbox: any[];
    onOpenMessage: (message: any) => void;
    currentDateLabel: string;
    formatDateLabel: (value: string) => string;
};
