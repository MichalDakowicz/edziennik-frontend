import type { ReactNode } from "react";
import type { SearchablePage } from "../config/pages";
import { cn } from "../utils/cn";

function highlight(text: string, query: string): ReactNode {
    const q = query.trim();
    if (!q) return text;
    const idx = text.toLowerCase().indexOf(q.toLowerCase());
    if (idx === -1) return text;
    return (
        <>
            {text.slice(0, idx)}
            <mark className="bg-primary/20 text-primary not-italic rounded-sm">
                {text.slice(idx, idx + q.length)}
            </mark>
            {text.slice(idx + q.length)}
        </>
    );
}

type Props = {
    results: SearchablePage[];
    selectedIndex: number;
    query: string;
    onSelect: (page: SearchablePage) => void;
};

export default function PageSearchDropdown({ results, selectedIndex, query, onSelect }: Props) {
    return (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface rounded-xl shadow-lg border border-outline/10 z-50 max-h-72 overflow-y-auto">
            {results.length === 0 ? (
                <div className="px-4 py-3 text-sm text-on-surface-variant text-center">
                    Brak wyników dla „{query.trim()}"
                </div>
            ) : (
                <ul>
                    {results.map((page, i) => (
                        <li key={page.to}>
                            <button
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors",
                                    i === selectedIndex
                                        ? "bg-primary/10 text-primary"
                                        : "text-on-surface hover:bg-surface-container",
                                )}
                                onMouseDown={(e) => {
                                    e.preventDefault(); // prevent input blur before click fires
                                    onSelect(page);
                                }}
                            >
                                <span
                                    className="material-symbols-outlined shrink-0 text-[18px]"
                                    style={
                                        i === selectedIndex
                                            ? { fontVariationSettings: "'FILL' 1" }
                                            : {}
                                    }
                                >
                                    {page.icon}
                                </span>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-headline font-semibold truncate">
                                        {highlight(page.label, query)}
                                    </span>
                                    {page.description && (
                                        <span className="text-xs text-on-surface-variant truncate">
                                            {page.description}
                                        </span>
                                    )}
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
