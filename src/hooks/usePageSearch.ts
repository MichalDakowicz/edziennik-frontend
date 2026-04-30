import { useQuery } from "@tanstack/react-query";
import type { Role } from "../types/auth";
import { searchablePages, type SearchablePage } from "../config/pages";
import { getSubjects } from "../services/api";
import { keys } from "../services/queryKeys";

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

const SUBJECT_ROLES: Role[] = ["uczen", "rodzic", "admin"];

export function usePageSearch(query: string, role: Role): SearchablePage[] {
    const { data: subjects } = useQuery({
        queryKey: keys.subjects(),
        queryFn: getSubjects,
        enabled: role === "uczen" || role === "rodzic" || role === "admin",
        staleTime: 5 * 60 * 1000,
    });

    const q = query.trim();

    console.log("[usePageSearch]", { q, role, subjectsLoaded: !!subjects, subjectsCount: subjects?.length });

    if (!q) return [];

    const subjectPages: SearchablePage[] = (subjects ?? []).map((s) => {
        const name = s.nazwa ?? s.Nazwa ?? `#${s.id}`;
        return {
            label: name,
            to: `/dashboard/grades/${s.id}`,
            icon: "menu_book",
            keywords: [name.toLowerCase(), "oceny", "stopnie", "przedmiot"],
            roles: SUBJECT_ROLES,
            description: "Oceny z przedmiotu",
        };
    });

    const allPages = [...searchablePages, ...subjectPages];
    return allPages
        .filter((page) => page.roles.includes(role))
        .map((page) => ({ page, score: scoreMatch(page, q) }))
        .filter(({ score }) => score > 0)
        .sort((a, b) => b.score - a.score)
        .map(({ page }) => page);
}
