import TeacherHeroCards from "./teacher/TeacherHeroCards";
import TeacherQuickActionsCard from "./teacher/TeacherQuickActionsCard";
import TeacherUnreadMessagesCard from "./teacher/TeacherUnreadMessagesCard";
import type { TeacherDashboardProps } from "./teacher/types";

export default function TeacherDashboard({
    firstName,
    unreadCount,
    unreadInbox,
    onOpenMessage,
    currentDateLabel,
    formatDateLabel,
}: TeacherDashboardProps) {
    return (
        <div className="space-y-6">
            <TeacherHeroCards
                firstName={firstName}
                unreadCount={unreadCount}
                currentDateLabel={currentDateLabel}
            />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <TeacherQuickActionsCard />
                </div>

                <TeacherUnreadMessagesCard
                    unreadInbox={unreadInbox}
                    onOpenMessage={onOpenMessage}
                    formatDateLabel={formatDateLabel}
                />
            </div>
        </div>
    );
}
