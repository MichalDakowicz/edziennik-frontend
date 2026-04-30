import { Link } from "react-router-dom";

type StudentStatsBarProps = {
    weightedAverage: number;
    unreadCount: number;
};

export default function StudentStatsBar({ weightedAverage, unreadCount }: StudentStatsBarProps) {
    return (
        <div className="flex gap-6">
            <div className="flex-1 bg-surface-container-lowest px-6 py-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)]">
                <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-1 font-body">
                    Średnia ocen
                </p>
                <p className="text-2xl font-black text-primary font-headline">
                    {weightedAverage.toFixed(2)}
                </p>
            </div>
            <Link
                to="/dashboard/messages"
                className="flex-1 bg-surface-container-lowest px-6 py-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] transition-all hover:shadow-[0_12px_36px_-4px_rgba(25,28,29,0.12)]"
            >
                <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-1 font-body">
                    Nieprzeczytane
                </p>
                <p className="text-2xl font-black text-on-surface font-headline">
                    {unreadCount}
                </p>
            </Link>
        </div>
    );
}
