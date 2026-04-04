import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Spinner } from "../ui/Spinner";
import { EmptyState } from "../ui/EmptyState";
import { ErrorState } from "../ui/ErrorState";
import { keys } from "../../services/queryKeys";
import { getHomework, getClasses, getSubjects, deleteHomework } from "../../services/api";
import { formatClassDisplay } from "../../utils/classUtils";
import { useTeacherClassSelector } from "../../hooks/useTeacherClassSelector";

type FilterTab = "active" | "overdue" | "all";

const filterTabs: { key: FilterTab; label: string }[] = [
    { key: "active", label: "Aktywne" },
    { key: "overdue", label: "Do sprawdzenia" },
    { key: "all", label: "Wszystkie" },
];

function getSubjectColor(subjectName: string): string {
    const colors: Record<string, string> = {
        Matematyka: "bg-primary/10 text-primary",
        Fizyka: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
        Chemia: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
        Biologia: "bg-green-100 text-green-700 dark:bg-green-500/10 dark:text-green-400",
        Polski: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
        Historia: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
        Angielski: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
        Informatyka: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400",
    };
    return colors[subjectName] || "bg-surface-container-high text-on-surface-variant";
}

function isOverdue(termin: string): boolean {
    return new Date(termin) < new Date();
}

function formatDeadline(termin: string): string {
    const date = new Date(termin);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const diff = Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));

    if (diff === 0) return "Dziś";
    if (diff === 1) return "Jutro";
    if (diff === -1) return "Wczoraj";
    return date.toLocaleDateString("pl-PL", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function TeacherHomeworkPage() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const { selectedClassId: hookClassId, setSelectedClassId: setHookClassId } = useTeacherClassSelector();
    const [selectedClassId, setSelectedClassId] = useState<number | null>(hookClassId);
    const [selectedSubjectId, setSelectedSubjectId] = useState<number | null>(null);
    const [activeFilter, setActiveFilter] = useState<FilterTab>("active");

    useEffect(() => {
        if (hookClassId !== null && hookClassId !== selectedClassId) {
            setSelectedClassId(hookClassId);
        }
    }, [hookClassId]);

    const handleClassChange = (id: number | null) => {
        setSelectedClassId(id);
        setHookClassId(id);
    };

    const { data: classes, isLoading: classesLoading, error: classesError } = useQuery({
        queryKey: keys.classes?.() ?? ["classes"],
        queryFn: getClasses,
    });

    const { data: subjects, isLoading: subjectsLoading, error: subjectsError } = useQuery({
        queryKey: keys.subjects?.() ?? ["subjects"],
        queryFn: getSubjects,
    });

    const { data: homework, isLoading: homeworkLoading, error: homeworkError } = useQuery({
        queryKey: selectedClassId
            ? [...(keys.homework?.(selectedClassId) ?? ["homework", selectedClassId]), selectedSubjectId ?? "all"]
            : ["homework", "none"],
        queryFn: () =>
            selectedClassId
                ? getHomework(selectedClassId, selectedSubjectId ?? undefined)
                : Promise.resolve([]),
        enabled: !!selectedClassId,
    });

    const deleteHomeworkMutation = useMutation({
        mutationFn: deleteHomework,
        onSuccess: () => {
            toast.success("Praca domowa usunięta");
            queryClient.invalidateQueries({ queryKey: ["homework"] });
        },
        onError: () => toast.error("Błąd przy usuwaniu pracy domowej"),
    });

    const filteredHomework = useMemo(() => {
        if (!homework) return [];
        let items = [...homework];

        if (selectedSubjectId) {
            items = items.filter((hw) => hw.przedmiot === selectedSubjectId);
        }

        switch (activeFilter) {
            case "active":
                items = items.filter((hw) => !isOverdue(hw.termin));
                items.sort((a, b) => new Date(a.termin).getTime() - new Date(b.termin).getTime());
                break;
            case "overdue":
                items = items.filter((hw) => isOverdue(hw.termin));
                items.sort((a, b) => new Date(b.termin).getTime() - new Date(a.termin).getTime());
                break;
            case "all":
                items.sort((a, b) => new Date(b.data_wystawienia ?? b.termin).getTime() - new Date(a.data_wystawienia ?? a.termin).getTime());
                break;
        }

        return items;
    }, [homework, selectedSubjectId, activeFilter]);

    const stats = useMemo(() => {
        if (!homework) return { active: 0, overdue: 0, total: 0 };
        return {
            active: homework.filter((hw) => !isOverdue(hw.termin)).length,
            overdue: homework.filter((hw) => isOverdue(hw.termin)).length,
            total: homework.length,
        };
    }, [homework]);

    const selectedClass = useMemo(() => {
        if (!selectedClassId || !classes) return null;
        return classes.find((c) => c.id === selectedClassId) ?? null;
    }, [classes, selectedClassId]);

    const getSubjectName = (subjectId: number) => {
        if (!subjects) return "Przedmiot";
        const subject = subjects.find((s) => s.id === subjectId);
        return subject?.nazwa ?? "Przedmiot";
    };

    if (classesLoading || subjectsLoading) return <Spinner />;
    if (classesError) return <ErrorState message={`Błąd: ${(classesError as Error).message}`} />;
    if (subjectsError) return <ErrorState message={`Błąd: ${(subjectsError as Error).message}`} />;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold text-on-surface font-headline tracking-tight">
                        Zadania domowe
                    </h1>
                    <p className="text-on-surface-variant font-body text-sm">
                        {selectedClass
                            ? `Zarządzaj pracami domowymi — ${formatClassDisplay(selectedClass)}`
                            : "Wybierz klasę, aby zarządzać pracami domowymi."}
                    </p>
                </div>

                {/* Filter Tabs */}
                {selectedClassId && (
                    <div className="bg-surface-container-low p-1 rounded-full flex items-center">
                        {filterTabs.map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveFilter(tab.key)}
                                className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                                    activeFilter === tab.key
                                        ? "bg-surface-container-lowest text-primary shadow-sm"
                                        : "text-on-surface-variant hover:text-primary"
                                }`}
                            >
                                {tab.label}
                                {tab.key === "active" && stats.active > 0 && (
                                    <span className="ml-1.5 opacity-60">({stats.active})</span>
                                )}
                                {tab.key === "overdue" && stats.overdue > 0 && (
                                    <span className="ml-1.5 opacity-60">({stats.overdue})</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Class & Subject Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        Klasa
                    </label>
                    <select
                        value={selectedClassId ?? ""}
                        onChange={(e) => handleClassChange(e.target.value ? Number(e.target.value) : null)}
                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface"
                    >
                        <option value="">Wybierz klasę...</option>
                        {classes?.map((c) => (
                            <option key={c.id} value={c.id}>
                                {formatClassDisplay(c)}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-2">
                        Przedmiot
                    </label>
                    <select
                        value={selectedSubjectId ?? ""}
                        onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : null)}
                        disabled={!selectedClassId}
                        className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-2.5 px-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface disabled:opacity-50"
                    >
                        <option value="">Wszystkie przedmioty</option>
                        {subjects?.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.nazwa}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Content */}
            {selectedClassId ? (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    {/* Main Task List */}
                    <div className="xl:col-span-8 space-y-4">
                        {homeworkLoading ? (
                            <Spinner />
                        ) : homeworkError ? (
                            <ErrorState message={`Błąd: ${(homeworkError as Error).message}`} />
                        ) : filteredHomework.length > 0 ? (
                            filteredHomework.map((hw) => {
                                const subjectName = getSubjectName(hw.przedmiot);
                                const overdue = isOverdue(hw.termin);

                                return (
                                    <div
                                        key={hw.id}
                                        onClick={() => navigate(`/dashboard/teacher/homework/${hw.id}`)}
                                        className={`bg-surface-container-lowest rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow group cursor-pointer ${
                                            overdue ? "opacity-80" : ""
                                        }`}
                                    >
                                    <div className="flex flex-col md:flex-row gap-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider ${getSubjectColor(subjectName)}`}>
                                                    {subjectName}
                                                </span>
                                                {selectedClass && (
                                                    <span className="text-on-surface-variant text-xs font-medium">
                                                        {formatClassDisplay(selectedClass)}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-xl font-headline font-bold text-on-surface mb-2">
                                                {hw.opis.length > 80 ? hw.opis.substring(0, 80) + "..." : hw.opis}
                                            </h3>
                                            <div className="flex flex-wrap items-center gap-6">
                                                <div className="flex items-center gap-2 text-on-surface-variant">
                                                    <span className="material-symbols-outlined text-sm">calendar_today</span>
                                                    <span className={`text-xs font-semibold ${overdue ? "text-error" : ""}`}>
                                                        Termin: {formatDeadline(hw.termin)}
                                                    </span>
                                                </div>
                                                {/* TODO: Progress bar — requires HomeworkSubmission model
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-32 h-2 bg-surface-container rounded-full overflow-hidden">
                                                            <div className="w-3/4 h-full bg-primary rounded-full" />
                                                        </div>
                                                        <span className="text-xs font-bold text-primary">18/24 oddanych</span>
                                                    </div>
                                                */}
                                            </div>
                                        </div>
                                        <div className="flex md:flex-col justify-end gap-2 shrink-0">
                                            {/* TODO: "Zobacz odpowiedzi" button — requires HomeworkSubmission model
                                                <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-white rounded-full text-xs font-bold active:scale-95 transition-transform">
                                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                                    Zobacz odpowiedzi
                                                </button>
                                            */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (confirm("Czy na pewno chcesz usunąć tę pracę domową?")) {
                                                        deleteHomeworkMutation.mutate(hw.id);
                                                    }
                                                }}
                                                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-high/50 text-on-surface-variant rounded-full text-xs font-bold hover:bg-error/10 hover:text-error transition-colors active:scale-95"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                                Usuń
                                            </button>
                                        </div>
                                    </div>
                                    </div>
                                );
                            })
                        ) : (
                            <EmptyState message={
                                activeFilter === "active"
                                    ? "Brak aktywnych zadań domowych"
                                    : activeFilter === "overdue"
                                    ? "Brak przeterminowanych zadań"
                                    : "Brak prac domowych dla wybranej klasy"
                            } />
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="xl:col-span-4 space-y-6">
                        {/* Stats Widget */}
                        <div className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="text-lg font-headline font-bold mb-4">Podsumowanie</h4>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Aktywne zadania</p>
                                        <p className="text-4xl font-black">{stats.active}</p>
                                    </div>
                                    <div>
                                        <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Przeterminowane</p>
                                        <p className="text-4xl font-black">{stats.overdue}</p>
                                    </div>
                                    <button
                                        onClick={() => navigate("/dashboard/teacher/homework/new")}
                                        className="w-full mt-4 py-3 bg-white text-primary rounded-full font-bold text-sm hover:bg-surface-container-lowest transition-colors active:scale-95"
                                    >
                                        + Dodaj pracę domową
                                    </button>
                                </div>
                            </div>
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                            <div className="absolute -left-10 -top-10 w-32 h-32 bg-primary-container/30 rounded-full blur-2xl" />
                        </div>

                        {/* Upcoming Deadlines */}
                        <div className="bg-surface-container-low p-6 rounded-3xl">
                            <h4 className="text-sm font-bold text-on-surface-variant mb-4 flex items-center justify-between">
                                Nadchodzące terminy
                                <span className="material-symbols-outlined text-on-surface-variant/50 text-lg">more_horiz</span>
                            </h4>
                            {homework && homework.filter((hw) => !isOverdue(hw.termin)).length > 0 ? (
                                <ul className="space-y-4">
                                    {homework
                                        .filter((hw) => !isOverdue(hw.termin))
                                        .sort((a, b) => new Date(a.termin).getTime() - new Date(b.termin).getTime())
                                        .slice(0, 5)
                                        .map((hw) => {
                                            const subjectName = getSubjectName(hw.przedmiot);
                                            return (
                                                <li key={hw.id} className="flex items-start gap-3">
                                                    <div className="w-2 h-2 mt-2 rounded-full bg-primary shrink-0" />
                                                    <div>
                                                        <p className="text-xs font-bold text-on-surface">{subjectName}</p>
                                                        <p className="text-[10px] text-on-surface-variant">
                                                            Termin: {formatDeadline(hw.termin)}
                                                        </p>
                                                    </div>
                                                </li>
                                            );
                                        })}
                                </ul>
                            ) : (
                                <p className="text-xs text-on-surface-variant">Brak nadchodzących terminów</p>
                            )}
                        </div>

                        {/* Class Activity — requires HomeworkSubmission model */}
                        {/*
                        <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/10">
                            <div className="flex items-center justify-between mb-6">
                                <h4 className="text-sm font-bold text-on-surface">Aktywność klas</h4>
                                <span className="material-symbols-outlined text-primary">trending_up</span>
                            </div>
                            <div className="space-y-4">
                                {classes?.filter((c) => selectedClassId ? c.id === selectedClassId : true).map((c) => {
                                    const classHomework = homework?.filter((hw) => hw.klasa === c.id) ?? [];
                                    const totalSubmissions = 0; // TODO: fetch from HomeworkSubmission API
                                    const totalExpected = 0; // TODO: calculate from student count × homework count
                                    const percentage = totalExpected > 0 ? Math.round((totalSubmissions / totalExpected) * 100) : 0;
                                    return (
                                        <div key={c.id}>
                                            <div className="flex justify-between text-[10px] font-bold mb-1">
                                                <span className="text-on-surface-variant">{formatClassDisplay(c).toUpperCase()}</span>
                                                <span className="text-primary">{percentage}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        */}
                    </div>
                </div>
            ) : (
                <EmptyState message="Wybierz klasę, aby zobaczyć prace domowe" />
            )}
        </div>
    );
}
