import { Link } from "react-router-dom";
import type { LiveItem } from "./types";

type StudentLiveStreamCardProps = {
    liveItems: LiveItem[];
    formatRelativeDay: (value: string) => string;
};

export default function StudentLiveStreamCard({
    liveItems,
    formatRelativeDay,
}: StudentLiveStreamCardProps) {
    const kindLabelMap: Record<LiveItem["kind"], string> = {
        message: "Wiadomość",
        grade: "Nowa ocena",
        homework: "Praca domowa",
        attendance: "Frekwencja",
        event: "Wydarzenie",
        behavior: "Zachowanie",
    };


    return (
        <aside className="h-full">
            <div className="bg-surface-container-lowest rounded-xl p-8 gap-3 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] h-full flex flex-col">
                <div className="flex justify-center mb-6">
                    <h2 className="text-2xl font-bold font-headline text-on-surface">
                        Ostatnie Wiadomości
                    </h2>
                </div>

                <div className="space-y-3">
                    {liveItems.length > 0 ? (
                        liveItems.map((item) => {
                            const dotClass = item.isRead ? "bg-outline" : "bg-primary";
                            const isClickable = Boolean(
                                item.onClick || item.to,
                            );
                            const hoverClass = isClickable
                                ? "hover:bg-surface-container-high cursor-pointer"
                                : "";

                            return (
                                <div key={item.id}>
                                    {item.to ? (
                                        <Link
                                            to={item.to}
                                            onClick={item.onClick}
                                            className={`relative block p-3 rounded-xl bg-surface-container-low ${hoverClass}`}
                                        >
                                            <span className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${dotClass}`}></span>
                                            <p className="text-[10px] text-outline font-bold uppercase tracking-wider mb-1 font-body">
                                                {item.label ||
                                                    kindLabelMap[
                                                        item.kind
                                                    ]}{" "}
                                                • {formatRelativeDay(item.date)}
                                            </p>
                                            <p className="text-sm font-semibold text-on-surface font-body">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 font-body">
                                                {item.body}
                                            </p>
                                        </Link>
                                    ) : (
                                        <div
                                            className={`relative p-3 rounded-xl bg-surface-container-low ${hoverClass}`}
                                            onClick={item.onClick}
                                        >
                                            <span className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full ${dotClass}`}></span>
                                            <p className="text-[10px] text-outline font-bold uppercase tracking-wider mb-1 font-body">
                                                {item.label ||
                                                    kindLabelMap[
                                                        item.kind
                                                    ]}{" "}
                                                • {formatRelativeDay(item.date)}
                                            </p>
                                            <p className="text-sm font-semibold text-on-surface font-body">
                                                {item.title}
                                            </p>
                                            <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 font-body">
                                                {item.body}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="text-sm text-on-surface-variant font-body">
                            Brak nowych aktualizacji.
                        </p>
                    )}
                </div>

                <Link
                    to="/dashboard/notifications"
                    className="flex-1 flex items-center justify-center w-full text-sm font-bold text-primary bg-surface-container-low rounded-xl hover:bg-surface-container-high transition-all text-center font-body"
                >
                Zobacz wszystkie powiadomienia
                </Link>
            </div>
        </aside>
    );
}
