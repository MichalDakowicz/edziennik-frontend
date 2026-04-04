import { Link } from "react-router-dom";
import TeacherClassSelectorCard from "./teacher/TeacherClassSelectorCard";
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <TeacherClassSelectorCard />
                <TeacherHeroCards
                    firstName={firstName}
                    unreadCount={unreadCount}
                    currentDateLabel={currentDateLabel}
                />
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
