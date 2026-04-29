import { useMemo } from "react";
import type { Role } from "../types/auth";
import { searchablePages, type SearchablePage } from "../config/pages";

function scoreMatch(page: SearchablePage, query: string): number {
    const q = query.toLowerCase().trim();
    if (!q) return 0;

    const label = page.label.toLowerCase();
    if (label.startsWith(q)) return 3;
    if (label.includes(q)) return 2;
    if (page.keywords.some((k) => k.toLowerCase().includes(q))) return 1;
    if (page.description?.toLowerCase().includes(q)) return 1;
    return 0;
}

export function usePageSearch(query: string, role: Role): SearchablePage[] {
    return useMemo(() => {
        const q = query.trim();
        if (!q) return [];

        return searchablePages
            .filter((page) => page.roles.includes(role))
            .map((page) => ({ page, score: scoreMatch(page, q) }))
            .filter(({ score }) => score > 0)
            .sort((a, b) => b.score - a.score)
            .map(({ page }) => page);
    }, [query, role]);
}
