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
        <div className="space-y-3 pb-4 border-b border-border/50">
            <h1 className="page-title">Kalendarz</h1>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="text-base sm:text-lg font-medium">{label}</div>
                <div className="flex items-center gap-1">
                    <button
                        className="btn-ghost h-9 w-9 p-0 flex items-center justify-center"
                        onClick={prev}
                        aria-label="Poprzedni"
                        style={{
                            paddingLeft: "8px",
                            paddingRight: "8px",
                        }}
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                    <button
                        className="btn-ghost h-9 px-3 text-sm"
                        onClick={() => onDateChange(new Date())}
                    >
                        Dziś
                    </button>
                    <button
                        className="btn-ghost h-9 w-9 p-0 flex items-center justify-center"
                        onClick={next}
                        aria-label="Następny"
                        style={{
                            paddingLeft: "8px",
                            paddingRight: "8px",
                        }}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="bg-muted rounded-lg p-1 grid grid-cols-4 gap-1">
                {VIEWS.map((v) => (
                    <button
                        key={v.key}
                        onClick={() => onViewModeChange(v.key)}
                        className={cn(
                            "rounded-md px-2 py-1.5 text-sm font-medium transition-colors",
                            viewMode === v.key
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                    >
                        {v.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
