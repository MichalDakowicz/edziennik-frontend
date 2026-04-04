import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Spinner } from "../ui/Spinner";
import { getClasses, getSubjects, createHomework } from "../../services/api";
import { formatClassDisplay } from "../../utils/classUtils";
import { useTeacherClassSelector } from "../../hooks/useTeacherClassSelector";
import { getCurrentUser } from "../../services/auth";
import { AutoBreadcrumbs, useAutoBreadcrumbs } from "../ui/Breadcrumbs";

export default function HomeworkCreatePage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const user = getCurrentUser();
    const { selectedClassId: hookClassId } = useTeacherClassSelector();

    const [title, setTitle] = useState("");
    const [classId, setClassId] = useState<number | null>(hookClassId);
    const [subjectId, setSubjectId] = useState<number | null>(null);
    const [description, setDescription] = useState("");
    const [deadline, setDeadline] = useState("");
    const [isRequired, setIsRequired] = useState(true);
    const [weight, setWeight] = useState(1);

    const { data: classes, isLoading: classesLoading } = useQuery({
        queryKey: ["classes"],
        queryFn: getClasses,
    });

    const { data: subjects, isLoading: subjectsLoading } = useQuery({
        queryKey: ["subjects"],
        queryFn: getSubjects,
    });

    const createMutation = useMutation({
        mutationFn: (data: any) =>
            createHomework(data),
        onSuccess: () => {
            toast.success("Praca domowa opublikowana");
            queryClient.invalidateQueries({ queryKey: ["homework"] });
            navigate("/dashboard/teacher/homework");
        },
        onError: (error) => {
            toast.error(`Błąd: ${(error as Error).message}`);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!classId) {
            toast.error("Wybierz klasę");
            return;
        }
        if (!subjectId) {
            toast.error("Wybierz przedmiot");
            return;
        }
        if (!description.trim()) {
            toast.error("Opis jest wymagany");
            return;
        }
        if (!deadline) {
            toast.error("Termin jest wymagany");
            return;
        }
        createMutation.mutate({
            klasa: classId,
            przedmiot: subjectId,
            nauczyciel: user?.teacherId ?? 0,
            opis: description,
            termin: deadline,
            data_wystawienia: new Date().toISOString(),
        });
    };

    const breadcrumbs = useAutoBreadcrumbs({ homework: "Zadania domowe", new: "Nowe zadanie" });

    if (classesLoading || subjectsLoading) return <Spinner />;

    return (
        <div className="space-y-10">
            <AutoBreadcrumbs items={breadcrumbs} />
            {/* Header */}
            <div className="mb-10">
                <button
                    onClick={() => navigate("/dashboard/teacher/homework")}
                    className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider hover:underline mb-4"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span>Wróć do zadań</span>
                </button>
                <h1 className="text-4xl font-extrabold text-on-surface tracking-tight font-headline">
                    Tworzenie nowego zadania
                </h1>
                <p className="text-on-surface-variant text-lg mt-1">
                    Zdefiniuj parametry pracy domowej dla Twoich uczniów.
                </p>
            </div>

            <div className="grid grid-cols-12 gap-8">
                {/* Main Form Area */}
                <div className="col-span-12 lg:col-span-8 space-y-8">
                    {/* Form Section */}
                    <form onSubmit={handleSubmit}>
                        <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-on-surface mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">edit_note</span>
                                Szczegóły Zadania
                            </h2>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                                        Tytuł zadania
                                    </label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="np. Analiza funkcji kwadratowej w praktyce"
                                        className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-primary/20 text-sm font-medium placeholder:text-on-surface-variant/50 outline-none text-on-surface"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                                            Klasa
                                        </label>
                                        <select
                                            value={classId ?? ""}
                                            onChange={(e) => setClassId(e.target.value ? Number(e.target.value) : null)}
                                            className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                                        >
                                            <option value="">Wybierz klasę</option>
                                            {classes?.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {formatClassDisplay(c)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                                            Przedmiot
                                        </label>
                                        <select
                                            value={subjectId ?? ""}
                                            onChange={(e) => setSubjectId(e.target.value ? Number(e.target.value) : null)}
                                            className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-primary/20 outline-none text-on-surface"
                                        >
                                            <option value="">Wybierz przedmiot</option>
                                            {subjects?.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.nazwa}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-on-surface-variant mb-2">
                                        Opis i wymagania
                                    </label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Opisz dokładnie co uczniowie mają wykonać..."
                                        rows={6}
                                        className="w-full bg-surface-container-low border-none rounded-xl py-4 px-5 focus:ring-2 focus:ring-primary/20 resize-none outline-none text-on-surface placeholder:text-on-surface-variant/50"
                                    />
                                </div>
                                <div className="bg-primary/5 p-6 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-surface-container-lowest rounded-full flex items-center justify-center text-primary shadow-sm">
                                            <span className="material-symbols-outlined">calendar_month</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-on-surface">Termin oddania</p>
                                            <p className="text-xs text-on-surface-variant">
                                                {deadline
                                                    ? `Oddanie do ${new Date(deadline).toLocaleDateString("pl-PL")}`
                                                    : "Ustaw termin dla uczniów"}
                                            </p>
                                        </div>
                                    </div>
                                    <input
                                        type="date"
                                        value={deadline}
                                        onChange={(e) => setDeadline(e.target.value)}
                                        className="bg-surface-container-lowest border-none rounded-lg text-sm font-semibold text-on-surface focus:ring-2 focus:ring-primary px-4 py-2 outline-none"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Attachments Section — TODO: requires file upload API */}
                        {/*
                        <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm mt-8">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">attachment</span>
                                    Materiały i Załączniki
                                </h2>
                                <button className="text-sm font-bold text-primary hover:bg-primary/5 px-4 py-2 rounded-full transition-colors">
                                    Dodaj link zewnętrzny
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="group cursor-pointer border-2 border-dashed border-outline-variant/30 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-primary/50 hover:bg-primary/5 transition-all">
                                    <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-surface-container-lowest transition-all">
                                        <span className="material-symbols-outlined">upload_file</span>
                                    </div>
                                    <p className="text-sm font-bold text-on-surface-variant">Prześlij pliki</p>
                                    <p className="text-xs text-on-surface-variant/50 text-center">PDF, DOCX, JPG (max 25MB)</p>
                                </div>
                            </div>
                        </section>
                        */}
                    </form>
                </div>

                {/* Sidebar Settings & Stats */}
                <div className="col-span-12 lg:col-span-4 space-y-8">
                    {/* Additional Settings */}
                    <section className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
                        <h2 className="text-lg font-bold text-on-surface mb-6">Ustawienia dodatkowe</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-on-surface">Zadanie obowiązkowe</p>
                                    <p className="text-xs text-on-surface-variant">Wpływa na średnią końcową</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={isRequired}
                                        onChange={(e) => setIsRequired(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-surface-container-highest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-outline-variant after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-on-surface mb-3">
                                    Waga zadania (Skala 1-5)
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {[1, 2, 3, 4, 5].map((w) => (
                                        <button
                                            key={w}
                                            type="button"
                                            onClick={() => setWeight(w)}
                                            className={`py-2 rounded-lg font-bold transition-all ${
                                                weight === w
                                                    ? "bg-primary text-white"
                                                    : "bg-surface-container-low text-on-surface-variant hover:bg-primary hover:text-white"
                                            }`}
                                        >
                                            {w}
                                        </button>
                                    ))}
                                </div>
                                <p className="mt-3 text-xs text-on-surface-variant/50 italic">
                                    Standardowa waga dla prac domowych to 1.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Class Insights — TODO: requires HomeworkSubmission API */}
                    {/*
                    <section className="bg-primary text-white rounded-xl p-8 shadow-xl overflow-hidden relative">
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
                        <h2 className="text-lg font-bold mb-6 relative z-10">Wgląd w klasę 3A</h2>
                        <div className="space-y-6 relative z-10">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-white/70">Średnia z poprzednich zadań</p>
                                <p className="text-2xl font-black">4.25</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold text-white/70 uppercase tracking-tighter">
                                    <span>Stopień trudności</span>
                                    <span>Wysoki</span>
                                </div>
                                <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                                    <div className="bg-white h-full w-[75%] rounded-full" />
                                </div>
                            </div>
                        </div>
                    </section>
                    */}

                    {/* Sticky Action */}
                    <div className="sticky top-24 space-y-4">
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="w-full py-4 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {createMutation.isPending ? "Publikowanie..." : "Opublikuj zadanie"}
                        </button>
                        {/* TODO: Requires Homework.is_draft field in backend */}
                        <button
                            type="button"
                            onClick={() => toast.info("Szkice zostaną dodane po aktualizacji backendu")}
                            className="w-full py-4 bg-surface-container-low text-on-surface-variant rounded-xl font-bold hover:bg-surface-container transition-all"
                        >
                            Zapisz jako szkic
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate("/dashboard/teacher/homework")}
                            className="w-full py-4 bg-surface-container-lowest text-on-surface-variant rounded-xl font-bold hover:bg-surface-container-low transition-all"
                        >
                            Anuluj
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
