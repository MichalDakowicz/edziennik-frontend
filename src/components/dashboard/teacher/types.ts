import type { Message } from "../../../types/api";

export type TeacherDashboardProps = {
    firstName: string;
    unreadCount: number;
    unreadInbox: Message[];
    onOpenMessage: (message: Message) => void;
    currentDateLabel: string;
    formatDateLabel: (value: string) => string;
};
