import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Spinner } from "../ui/Spinner";
import { ErrorState } from "../ui/ErrorState";
import { getHomework, getClasses, getStudents, getSubjects, updateHomework } from "../../services/api";
import { Homework, Student } from "../../types/api";
import { formatClassDisplay } from "../../utils/classUtils";

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

function daysUntil(termin: string): number {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = new Date(termin);
    return Math.round((target.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
}

type SubmissionStatus = "submitted" | "overdue" | "missing";

type StudentSubmission = {
    student: Student;
    status: SubmissionStatus;
    submittedAt?: string;
    graded?: boolean;
    grade?: string;
};

export default function HomeworkDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const homeworkId = id ? Number(id) : null;

    const [editDescription, setEditDescription] = useState("");
    const [editDeadline, setEditDeadline] = useState("");

    const homeworkCache = queryClient.getQueriesData<Homework[]>({ queryKey: ["homework"] });
    const cachedHomework = homeworkCache
        .flatMap(([, data]) => data ?? [])
        .find((hw) => hw.id === homeworkId);

    const { data: homework, isLoading: homeworkLoading, error: homeworkError } = useQuery({
        queryKey: ["homework-detail", homeworkId],
        queryFn: async () => {
            if (cachedHomework) return cachedHomework;
            const classes = await queryClient.fetchQuery({
                queryKey: ["classes"],
                queryFn: getClasses,
            });
            if (!classes || classes.length === 0) throw new Error("Brak klas");
            for (const c of classes) {
                const list = await getHomework(c.id);
                const found = list.find((hw) => hw.id === homeworkId);
                if (found) return found;
            }
            throw new Error("Nie znaleziono pracy domowej");
        },
        enabled: Boolean(homeworkId),
    });

    const { data: classes } = useQuery({
        queryKey: ["classes"],
        queryFn: getClasses,
    });

    const { data: subjects } = useQuery({
        queryKey: ["subjects"],
        queryFn: getSubjects,
    });

    const { data: students } = useQuery({
        queryKey: ["students"],
        queryFn: getStudents,
    });

    useEffect(() => {
        if (homework) {
            setEditDescription(homework.opis);
            setEditDeadline(homework.termin);
        }
    }, [homework]);

    const updateMutation = useMutation({
        mutationFn: (data: { opis: string; termin: string }) =>
            updateHomework(homeworkId!, data),
        onSuccess: () => {
            toast.success("Praca domowa zaktualizowana");
            queryClient.invalidateQueries({ queryKey: ["homework-detail", homeworkId] });
            queryClient.invalidateQueries({ queryKey: ["homework"] });
        },
        onError: (error) => {
            toast.error(`Błąd: ${(error as Error).message}`);
        },
    });

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editDescription.trim()) {
            toast.error("Opis jest wymagany");
            return;
        }
        if (!editDeadline) {
            toast.error("Termin jest wymagany");
            return;
        }
        updateMutation.mutate({ opis: editDescription, termin: editDeadline });
    };

    const selectedClass = useMemo(() => {
        if (!homework || !classes) return null;
        return classes.find((c) => c.id === homework.klasa) ?? null;
    }, [homework, classes]);

    const subjectName = useMemo(() => {
        if (!homework || !subjects) return "Przedmiot";
        const subject = subjects.find((s) => s.id === homework.przedmiot);
        return subject?.nazwa ?? "Przedmiot";
    }, [homework, subjects]);

    const classStudents = useMemo(() => {
        if (!students || !homework) return [];
        return students.filter((s) => s.klasa === homework.klasa);
    }, [students, homework]);

    // TODO: Replace with real HomeworkSubmission data
    const submissions: StudentSubmission[] = useMemo(() => {
        if (!classStudents.length) return [];
        return classStudents.map((student, idx) => {
            const statuses: SubmissionStatus[] = ["submitted", "submitted", "missing", "overdue", "submitted"];
            const status = statuses[idx % statuses.length];
            return {
                student,
                status,
                submittedAt: status !== "missing" ? "2024-05-20T14:30:00Z" : undefined,
                graded: status === "submitted" && idx % 3 === 0,
                grade: status === "submitted" && idx % 3 === 0 ? "5" : undefined,
            };
        });
    }, [classStudents]);

    const submissionStats = useMemo(() => {
        const total = submissions.length;
        const submitted = submissions.filter((s) => s.status === "submitted").length;
        const overdue = submissions.filter((s) => s.status === "overdue").length;
        const missing = submissions.filter((s) => s.status === "missing").length;
        const percentage = total > 0 ? Math.round((submitted / total) * 100) : 0;
        return { total, submitted, overdue, missing, percentage };
    }, [submissions]);

    const getInitials = (student: Student) => {
        return `${(student.user?.first_name?.[0] ?? "")}${(student.user?.last_name?.[0] ?? "")}`.toUpperCase();
    };

    const getStatusBadge = (status: SubmissionStatus) => {
        switch (status) {
            case "submitted":
                return (
                    <span className="inline-flex items-center px-3 py-1 bg-tertiary-fixed/80 text-on-tertiary-fixed text-[10px] font-black uppercase rounded-full">
                        Oddane
                    </span>
                );
            case "overdue":
                return (
                    <span className="inline-flex items-center px-3 py-1 bg-secondary-fixed text-on-secondary-fixed-variant text-[10px] font-black uppercase rounded-full">
                        Spóźnione
                    </span>
                );
            case "missing":
                return (
                    <span className="inline-flex items-center px-3 py-1 bg-error-container text-on-error-container text-[10px] font-black uppercase rounded-full">
                        Brak
                    </span>
                );
        }
    };

    if (homeworkLoading) return <Spinner />;
    if (homeworkError) return <ErrorState message={`Błąd: ${(homeworkError as Error).message}`} />;
    if (!homework) return <ErrorState message="Nie znaleziono pracy domowej" />;

    const overdue = isOverdue(homework.termin);
    const daysLeft = daysUntil(homework.termin);

    return (
        <div className="space-y-10">
            {/* Header */}
            <section className="space-y-2">
                <button
                    onClick={() => navigate("/dashboard/teacher/homework")}
                    className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider hover:underline"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Wróć do zadań</span>
                </button>
                <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider bg-primary/10 text-primary">
                        {subjectName}
                    </span>
                    {selectedClass && (
                        <span className="text-on-surface-variant text-xs font-medium">
                            {formatClassDisplay(selectedClass)}
                        </span>
                    )}
                </div>
                <h1 className="text-4xl font-extrabold font-headline text-on-surface tracking-tight">
                    {homework.opis.length > 60 ? homework.opis.substring(0, 60) + "..." : homework.opis}
                </h1>
                <p className="text-on-surface-variant max-w-2xl leading-relaxed">
                    Termin: {formatDeadline(homework.termin)}
                    {overdue ? (
                        <span className="text-error font-semibold"> (przeterminowane)</span>
                    ) : (
                        <span className="text-primary font-semibold"> ({daysLeft} dni do końca)</span>
                    )}
                </p>
            </section>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Edit Section */}
                <div className="xl:col-span-4 space-y-6">
                    <div className="bg-surface-container-lowest rounded-3xl p-8 shadow-sm transition-all hover:shadow-md">
                        <h3 className="text-xl font-bold font-headline flex items-center gap-2 mb-8">
                            <span className="material-symbols-outlined text-primary">edit</span>
                            EDYCJA
                        </h3>
                        <form onSubmit={handleSave} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">
                                    Opis zadania
                                </label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={4}
                                    className="w-full bg-surface-container-highest border-none rounded-xl p-4 text-sm font-medium transition-all focus:ring-2 focus:ring-primary/20 outline-none text-on-surface resize-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">
                                    Termin oddania
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={editDeadline}
                                        onChange={(e) => setEditDeadline(e.target.value)}
                                        className="w-full bg-surface-container-highest border-none rounded-xl p-4 text-sm font-medium transition-all focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={updateMutation.isPending}
                                className="w-full bg-primary text-white py-4 rounded-full font-bold text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {updateMutation.isPending ? "Zapisywanie..." : "Zapisz zmiany"}
                            </button>
                        </form>
                    </div>

                    {/* Stats Quick View */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-primary/10 p-6 rounded-3xl space-y-1">
                            <span className="text-3xl font-black text-primary">{submissionStats.percentage}%</span>
                            <p className="text-xs font-bold text-primary/70 uppercase">Oddane</p>
                        </div>
                        <div className="bg-tertiary-fixed/50 p-6 rounded-3xl space-y-1">
                            <span className="text-3xl font-black text-on-tertiary-fixed-variant">
                                {daysLeft > 0 ? daysLeft : 0}
                            </span>
                            <p className="text-xs font-bold text-on-tertiary-fixed-variant/70 uppercase">
                                {daysLeft > 0 ? "Dni do końca" : "Po terminie"}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Student Submissions */}
                <div className="xl:col-span-8 space-y-6">
                    <div className="bg-surface-container-low rounded-3xl overflow-hidden">
                        <div className="p-8 pb-4 flex items-center justify-between">
                            <h3 className="text-xl font-bold font-headline flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">group</span>
                                ODPOWIEDZI UCZNIÓW
                            </h3>
                            <div className="flex gap-2">
                                {/* TODO: Filter button — requires HomeworkSubmission API */}
                                {/* <button className="px-4 py-2 bg-surface-container-lowest rounded-full text-xs font-bold text-on-surface-variant shadow-sm">
                                    Filtruj
                                </button> */}
                                {/* TODO: Export button */}
                                {/* <button className="px-4 py-2 bg-surface-container-lowest rounded-full text-xs font-bold text-on-surface-variant shadow-sm">
                                    Eksportuj
                                </button> */}
                            </div>
                        </div>

                        {submissions.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-xs font-bold text-on-surface-variant/50 uppercase tracking-widest">
                                            <th className="px-4 py-2">Uczeń</th>
                                            <th className="px-4 py-2">Status</th>
                                            <th className="px-4 py-2">Data oddania</th>
                                            <th className="px-4 py-2 text-right">Akcja</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {submissions.map((sub) => (
                                            <tr key={sub.student.id} className="group hover:scale-[1.01] transition-all">
                                                <td className="bg-surface-container-lowest rounded-l-2xl p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                                            {getInitials(sub.student)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-on-surface">
                                                                {sub.student.user?.first_name} {sub.student.user?.last_name}
                                                            </p>
                                                            <p className="text-xs text-on-surface-variant/50">
                                                                ID: {sub.student.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="bg-surface-container-lowest p-4">
                                                    {getStatusBadge(sub.status)}
                                                </td>
                                                <td className="bg-surface-container-lowest p-4 text-sm font-medium text-on-surface-variant">
                                                    {sub.submittedAt
                                                        ? new Date(sub.submittedAt).toLocaleDateString("pl-PL", {
                                                              day: "2-digit",
                                                              month: "short",
                                                              year: "numeric",
                                                          })
                                                        : "—"}
                                                </td>
                                                <td className="bg-surface-container-lowest rounded-r-2xl p-4 text-right">
                                                    {sub.graded ? (
                                                        <div className="flex items-center justify-end gap-2">
                                                            <span className="text-xs font-bold text-green-600 px-3 py-1 bg-green-50 dark:bg-green-500/10 rounded-full">
                                                                Oceniono: {sub.grade}
                                                            </span>
                                                            {/* TODO: View submission detail */}
                                                            {/* <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                                                                <span className="material-symbols-outlined">visibility</span>
                                                            </button> */}
                                                        </div>
                                                    ) : sub.status !== "missing" ? (
                                                        <button className="bg-primary text-white px-6 py-2 rounded-full text-xs font-bold hover:bg-primary/90 transition-colors shadow-sm">
                                                            Oceń
                                                        </button>
                                                    ) : (
                                                        <button className="text-primary hover:bg-primary/5 px-6 py-2 rounded-full text-xs font-bold transition-all">
                                                            Przypomnij
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <p className="text-on-surface-variant text-sm">Brak danych o oddanych pracach</p>
                                {/* TODO: Requires HomeworkSubmission model */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
