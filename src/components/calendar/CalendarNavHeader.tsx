import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";
import { cap } from "./helpers";
import type { ViewMode } from "./types";

interface CalendarNavHeaderProps {
    currentDate: Date;
    viewMode: ViewMode;
    onDateChange: (d: Date) => void;
    onViewModeChange: (m: ViewMode) => void;
}

const VIEWS: { key: ViewMode; label: string }[] = [
    { key: "day", label: "Dzień" },
    { key: "three-days", label: "3 Dni" },
    { key: "week", label: "Tydzień" },
    { key: "month", label: "Miesiąc" },
];

export function CalendarNavHeader({
    currentDate,
    viewMode,
    onDateChange,
    onViewModeChange,
}: CalendarNavHeaderProps) {
    const prev = () => {
        const d = new Date(currentDate);
        if (viewMode === "day") d.setDate(d.getDate() - 1);
        else if (viewMode === "three-days") d.setDate(d.getDate() - 3);
        else if (viewMode === "week") d.setDate(d.getDate() - 7);
        else d.setMonth(d.getMonth() - 1);
        onDateChange(d);
    };

    const next = () => {
        const d = new Date(currentDate);
        if (viewMode === "day") d.setDate(d.getDate() + 1);
        else if (viewMode === "three-days") d.setDate(d.getDate() + 3);
        else if (viewMode === "week") d.setDate(d.getDate() + 7);
        else d.setMonth(d.getMonth() + 1);
        onDateChange(d);
    };

    const label =
        viewMode === "day"
            ? cap(format(currentDate, "d MMMM yyyy, EEEE", { locale: pl }))
            : cap(format(currentDate, "LLLL yyyy", { locale: pl }));

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
            <div>
                <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">Kalendarz</h1>
                <p className="text-on-surface-variant mt-1 font-body text-sm">{label}</p>
            </div>
            <div className="flex items-center gap-2">
                <div className="flex bg-surface-container-low p-1 rounded-full">
                    {VIEWS.map((v) => (
                        <button
                            key={v.key}
                            onClick={() => onViewModeChange(v.key)}
                            className={cn(
                                "px-4 py-1.5 text-sm font-semibold rounded-full transition-all",
                                viewMode === v.key
                                    ? "bg-white text-primary shadow-sm"
                                    : "text-on-surface-variant hover:text-primary"
                            )}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-1">
                    <button
                        className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors"
                        onClick={prev}
                        aria-label="Poprzedni"
                    >
                        <ChevronLeft className="w-4 h-4 text-on-surface-variant" />
                    </button>
                    <button
                        className="px-3 py-1.5 text-sm font-medium rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant"
                        onClick={() => onDateChange(new Date())}
                    >
                        Dziś
                    </button>
                    <button
                        className="p-1.5 rounded-full hover:bg-surface-container-high transition-colors"
                        onClick={next}
                        aria-label="Następny"
                    >
                        <ChevronRight className="w-4 h-4 text-on-surface-variant" />
                    </button>
                </div>
            </div>
        </div>
    );
}
