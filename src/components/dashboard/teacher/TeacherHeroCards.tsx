import { Link } from "react-router-dom";

type TeacherHeroCardsProps = {
    firstName: string;
    unreadCount: number;
    currentDateLabel: string;
};

export default function TeacherHeroCards({
    firstName,
    unreadCount,
    currentDateLabel,
}: TeacherHeroCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-colors group-hover:bg-primary/10" />
                <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2 font-body">
                    Panel nauczyciela
                </div>
                <div className="flex flex-col relative z-10">
                    <span className="text-xl font-bold text-on-surface truncate font-headline">
                        {firstName}
                    </span>
                    <span className="text-xs text-on-surface-variant mt-1 font-body">
                        {currentDateLabel}
                    </span>
                </div>
            </div>

            <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] hover:shadow-md transition-shadow">
                <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-2 font-body">
                    Nieprzeczytane
                </div>
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold tabular-nums text-on-surface font-headline">
                        {unreadCount}
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
    );
}
