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

    const dotClassMap: Record<LiveItem["kind"], string> = {
        message: "bg-primary",
        grade: "bg-tertiary-container",
        homework: "bg-tertiary-fixed-dim",
        attendance: "bg-on-secondary-container",
        event: "bg-outline",
        behavior: "bg-secondary",
    };

    return (
        <aside className="lg:col-span-4">
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-error"></span>
                        </span>
                        <h2 className="text-lg font-bold font-headline text-on-surface">
                            Ostatnie
                        </h2>
                    </div>
                    <span className="text-xs text-outline font-medium font-body">
                        Dla Ciebie
                    </span>
                </div>

                <div className="space-y-3 flex-grow overflow-y-auto pr-2">
                    {liveItems.length > 0 ? (
                        liveItems.map((item) => {
                            const dotClass = dotClassMap[item.kind];
                            const isClickable = Boolean(item.onClick || item.to);
                            const hoverClass = isClickable
                                ? "hover:bg-surface-container-high cursor-pointer"
                                : "";

                            return (
                                <div key={item.id} className="flex items-start gap-3">
                                    <span
                                        className={`mt-1.5 w-2.5 h-2.5 rounded-full ${dotClass}`}
                                    ></span>

                                    {item.to ? (
                                        <Link
                                            to={item.to}
                                            onClick={item.onClick}
                                            className={`flex-1 p-3 rounded-xl bg-surface-container-low ${hoverClass}`}
                                        >
                                            <p className="text-[10px] text-outline font-bold uppercase tracking-wider mb-1 font-body">
                                                {item.label || kindLabelMap[item.kind]} • {formatRelativeDay(item.date)}
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
                                            className={`flex-1 p-3 rounded-xl bg-surface-container-low ${hoverClass}`}
                                            onClick={item.onClick}
                                        >
                                            <p className="text-[10px] text-outline font-bold uppercase tracking-wider mb-1 font-body">
                                                {item.label || kindLabelMap[item.kind]} • {formatRelativeDay(item.date)}
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
                    to="/dashboard/messages"
                    className="mt-6 w-full py-2 text-sm font-bold text-primary bg-primary-fixed/30 rounded-xl hover:bg-primary-fixed/50 transition-all text-center font-body"
                >
                    Zobacz wszystkie powiadomienia
                </Link>
            </div>
        </aside>
    );
}
