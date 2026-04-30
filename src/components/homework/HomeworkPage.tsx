import { useMemo, useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { getHomework, getSubjects, getTeachers } from "../../services/api";
import { keys } from "../../services/queryKeys";
import { getCurrentUser } from "../../services/auth";
import { ErrorState } from "../ui/ErrorState";
import { Spinner } from "../ui/Spinner";
import HomeworkCard from "./HomeworkCard";
import HomeworkModal from "./HomeworkModal";
import type { Homework, Subject } from "../../types/api";
import { CalendarDays, ArrowRight, BookOpen, LayoutList, LayoutGrid, ChevronRight } from "lucide-react";
import { AutoBreadcrumbs, useAutoBreadcrumbs } from "../ui/Breadcrumbs";

const CAROUSEL_INTERVAL_MS = 4000;

function plZadanie(n: number): string {
    if (n === 1) return "zadanie";
    if (n % 100 >= 11 && n % 100 <= 14) return "zadań";
    if (n % 10 >= 2 && n % 10 <= 4) return "zadania";
    return "zadań";
}

function plAktywne(n: number): string {
    if (n === 1) return "aktywne";
    if (n % 100 >= 11 && n % 100 <= 14) return "aktywnych";
    if (n % 10 >= 2 && n % 10 <= 4) return "aktywne";
    return "aktywnych";
}

type ViewMode = "list" | "board";
type StatusFilter = "upcoming" | "completed" | "overdue";

const subjectIconMap: Record<string, { bg: string; color: string; badgeBg: string; badgeText: string }> = {
  matematyka: { bg: "bg-blue-50 dark:bg-blue-400/10", color: "text-blue-600 dark:text-blue-400", badgeBg: "bg-blue-100 dark:bg-blue-400/10", badgeText: "text-blue-700 dark:text-blue-300" },
  fizyka: { bg: "bg-amber-50 dark:bg-amber-400/10", color: "text-amber-600 dark:text-amber-400", badgeBg: "bg-amber-100 dark:bg-amber-400/10", badgeText: "text-amber-700 dark:text-amber-300" },
  "język polski": { bg: "bg-emerald-50 dark:bg-emerald-400/10", color: "text-emerald-600 dark:text-emerald-400", badgeBg: "bg-emerald-100 dark:bg-emerald-400/10", badgeText: "text-emerald-700 dark:text-emerald-300" },
  chemia: { bg: "bg-purple-50 dark:bg-purple-400/10", color: "text-purple-600 dark:text-purple-400", badgeBg: "bg-purple-100 dark:bg-purple-400/10", badgeText: "text-purple-700 dark:text-purple-300" },
  "język angielski": { bg: "bg-rose-50 dark:bg-rose-400/10", color: "text-rose-600 dark:text-rose-400", badgeBg: "bg-rose-100 dark:bg-rose-400/10", badgeText: "text-rose-700 dark:text-rose-300" },
  historia: { bg: "bg-orange-50 dark:bg-orange-400/10", color: "text-orange-600 dark:text-orange-400", badgeBg: "bg-orange-100 dark:bg-orange-400/10", badgeText: "text-orange-700 dark:text-orange-300" },
  biologia: { bg: "bg-green-50 dark:bg-green-400/10", color: "text-green-600 dark:text-green-400", badgeBg: "bg-green-100 dark:bg-green-400/10", badgeText: "text-green-700 dark:text-green-300" },
  geografia: { bg: "bg-teal-50 dark:bg-teal-400/10", color: "text-teal-600 dark:text-teal-400", badgeBg: "bg-teal-100 dark:bg-teal-400/10", badgeText: "text-teal-700 dark:text-teal-300" },
  informatyka: { bg: "bg-cyan-50 dark:bg-cyan-400/10", color: "text-cyan-600 dark:text-cyan-400", badgeBg: "bg-cyan-100 dark:bg-cyan-400/10", badgeText: "text-cyan-700 dark:text-cyan-300" },
  wf: { bg: "bg-lime-50 dark:bg-lime-400/10", color: "text-lime-600 dark:text-lime-400", badgeBg: "bg-lime-100 dark:bg-lime-400/10", badgeText: "text-lime-700 dark:text-lime-300" },
  muzyka: { bg: "bg-pink-50 dark:bg-pink-400/10", color: "text-pink-600 dark:text-pink-400", badgeBg: "bg-pink-100 dark:bg-pink-400/10", badgeText: "text-pink-700 dark:text-pink-300" },
  plastyka: { bg: "bg-violet-50 dark:bg-violet-400/10", color: "text-violet-600 dark:text-violet-400", badgeBg: "bg-violet-100 dark:bg-violet-400/10", badgeText: "text-violet-700 dark:text-violet-300" },
};

function getSubjectStyle(subjectName: string) {
  const lower = subjectName.toLowerCase();
  for (const [key, style] of Object.entries(subjectIconMap)) {
    if (lower.includes(key)) return style;
  }
  return { bg: "bg-slate-50 dark:bg-slate-400/10", color: "text-slate-600 dark:text-slate-400", badgeBg: "bg-slate-100 dark:bg-slate-400/10", badgeText: "text-slate-700 dark:text-slate-300" };
}

function getStatusInfo(item: Homework) {
  const dueMs = Date.parse(item.termin);
  const now = Date.now();
  const diffDays = Math.floor((dueMs - now) / (24 * 60 * 60 * 1000));

  if (dueMs < now) {
    return { label: "Zaległe", bg: "bg-red-100 dark:bg-red-400/10", text: "text-red-700 dark:text-red-300" };
  }
  if (diffDays === 0) {
    return { label: "Dzisiaj", bg: "bg-red-100 dark:bg-red-400/10", text: "text-red-700 dark:text-red-300" };
  }
  if (diffDays === 1) {
    return { label: "Jutro", bg: "bg-orange-100 dark:bg-orange-400/10", text: "text-orange-700 dark:text-orange-300" };
  }
  if (diffDays <= 3) {
    return { label: `${diffDays} dni`, bg: "bg-amber-100 dark:bg-amber-400/10", text: "text-amber-700 dark:text-amber-300" };
  }
  if (diffDays <= 7) {
    return { label: `${diffDays} dni`, bg: "bg-blue-100 dark:bg-blue-400/10", text: "text-blue-700 dark:text-blue-300" };
  }
  return { label: `${diffDays} dni`, bg: "bg-slate-100 dark:bg-slate-400/10", text: "text-slate-600 dark:text-slate-300" };
}

function HomeworkListItem({
  item,
  subject,
  onClick,
}: {
  item: Homework;
  subject?: Subject;
  onClick: () => void;
}) {
  const subjectName = subject?.nazwa ?? subject?.Nazwa ?? `#${item.przedmiot}`;
  const style = getSubjectStyle(subjectName);
  const status = getStatusInfo(item);
  const dueDate = new Date(item.termin).toLocaleDateString("pl-PL", { day: "numeric", month: "long", year: "numeric" });

  return (
    <button
      onClick={onClick}
      className="w-full bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4 hover:shadow-[0_8px_24px_-4px_rgba(25,28,29,0.06)] dark:hover:shadow-[0_8px_24px_-4px_rgba(0,0,0,0.5)] transition-all group border border-transparent hover:border-primary/5 text-left"
    >
      <div className={`w-10 h-10 ${style.bg} ${style.color} rounded-lg flex items-center justify-center flex-shrink-0 font-bold text-sm`}>
        {subjectName.charAt(0).toUpperCase()}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-bold text-on-surface font-headline text-sm truncate">
            {item.opis.length > 80 ? `${item.opis.slice(0, 80)}...` : item.opis}
          </h3>
          <span className={`${status.bg} ${status.text} px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0`}>
            {status.label}
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1">
          <span className="text-xs font-medium" style={{ color: style.color }}>{subjectName}</span>
          <span className="text-xs text-slate-400 font-body flex items-center gap-1">
            <CalendarDays size={12} />
            {dueDate}
          </span>
        </div>
      </div>

      <ChevronRight size={18} className="text-slate-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all flex-shrink-0" />
    </button>
  );
}

export default function HomeworkPage() {
  const breadcrumbs = useAutoBreadcrumbs({ homework: "Zadania domowe" });
  const user = getCurrentUser();
  const classId = user?.classId;
  const [subjectId, setSubjectId] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("upcoming");
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);

  const homeworkQuery = useQuery({
    queryKey: classId ? ["homework-page", classId, subjectId] : ["homework-page", "na"],
    queryFn: () => getHomework(classId as number, subjectId === "all" ? undefined : subjectId),
    enabled: Boolean(classId),
  });
  const subjectsQuery = useQuery({ queryKey: keys.subjects(), queryFn: getSubjects });
  const teachersQuery = useQuery({ queryKey: keys.teachers(), queryFn: getTeachers });

  const homework = homeworkQuery.data ?? [];
  const subjects = subjectsQuery.data ?? [];
  const teachers = teachersQuery.data ?? [];

  const { upcoming, past, upcomingSoon } = useMemo(() => {
    const now = Date.now();
    const threeDaysMs = 4 * 24 * 60 * 60 * 1000;
    const up = [...homework]
      .filter((item) => Date.parse(item.termin) >= now)
      .sort((a, b) => Date.parse(a.termin) - Date.parse(b.termin));
    const pa = [...homework]
      .filter((item) => Date.parse(item.termin) < now)
      .sort((a, b) => Date.parse(b.termin) - Date.parse(a.termin));
    const soon = up.filter((item) => Date.parse(item.termin) - now <= threeDaysMs);
    return { upcoming: up, past: pa, upcomingSoon: soon };
  }, [homework]);

  const filteredHomework = useMemo(() => {
    let items: typeof homework;
    switch (statusFilter) {
      case "upcoming":
        items = upcoming;
        break;
      case "overdue":
        items = past;
        break;
      case "completed":
        items = [];
        break;
      default:
        items = upcoming;
    }
    return subjectId === "all" ? items : items.filter((item) => item.przedmiot === subjectId);
  }, [upcoming, past, statusFilter, subjectId]);

  const totalCount = homework.length;
  const overdueCount = past.length;
  const progressPercent = totalCount > 0 ? Math.round(((totalCount - overdueCount) / totalCount) * 100) : 0;

  const [carouselIndex, setCarouselIndex] = useState(0);

  const nextSlide = useCallback(() => {
    setCarouselIndex((prev) => (prev + 1) % upcomingSoon.length);
  }, [upcomingSoon.length]);

  useEffect(() => {
    if (upcomingSoon.length <= 1) return;
    const timer = setInterval(nextSlide, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [upcomingSoon.length, nextSlide]);

  if (!classId) return <ErrorState message="Brak przypisanej klasy" />;
  if ([homeworkQuery, subjectsQuery, teachersQuery].some((q) => q.isPending)) return <Spinner />;
  const firstError = [homeworkQuery, subjectsQuery, teachersQuery].find((q) => q.isError);
  if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

  return (
    <div className="space-y-6">
      <AutoBreadcrumbs items={breadcrumbs} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">Zadania domowe</h1>
          <p className="text-on-surface-variant font-body text-sm mt-1">
            Masz {upcoming.length} {plAktywne(upcoming.length)} {plZadanie(upcoming.length)} na ten tydzień.
          </p>
        </div>
        <div className="flex bg-surface-container-low p-1 rounded-full">
          <button
            onClick={() => setViewMode("list")}
            className={`px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
              viewMode === "list"
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-slate-500 hover:text-primary"
            }`}
          >
            <LayoutList size={16} />
            Lista
          </button>
          <button
            onClick={() => setViewMode("board")}
            className={`px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
              viewMode === "board"
                ? "bg-surface-container-lowest text-primary shadow-sm"
                : "text-slate-500 hover:text-primary"
            }`}
          >
            <LayoutGrid size={16} />
            Tablica
          </button>
        </div>
      </div>

      {/* Bento Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Most Urgent Task / Carousel */}
        {upcomingSoon.length > 0 ? (
          <div className="md:col-span-2 bg-primary-container rounded-xl text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />

            {/* Carousel slides */}
            <div className="relative z-10 overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${carouselIndex * 100}%)` }}
              >
                {upcomingSoon.map((hw, idx) => {
                  const subjectName = subjects.find((s) => s.id === hw.przedmiot)?.nazwa ?? subjects.find((s) => s.id === hw.przedmiot)?.Nazwa ?? "";
                  return (
                    <div key={hw.id} className="w-full flex-shrink-0 p-8">
                      <div className="flex items-center justify-between mb-4">
                        <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                          {idx === 0 ? "Najbliższy termin" : `${idx + 1}. zadanie`}
                        </span>
                        {upcomingSoon.length > 1 && (
                          <span className="text-xs font-medium opacity-70">
                            {idx + 1} / {upcomingSoon.length}
                          </span>
                        )}
                      </div>
                      <h2 className="text-2xl md:text-4xl font-black leading-tight max-w-md">
                        {hw.opis.length > 60 ? `${hw.opis.slice(0, 60)}...` : hw.opis}
                      </h2>
                      <div className="flex items-center gap-6 mt-8">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={18} className="opacity-70" />
                          <span className="font-medium">
                            {new Date(hw.termin).toLocaleDateString("pl-PL", { day: "numeric", month: "long" })}
                          </span>
                        </div>
                        {subjectName && (
                          <div className="flex items-center gap-2">
                            <BookOpen size={18} className="opacity-70" />
                            <span className="font-medium">{subjectName}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-8">
                        <button
                          onClick={() => setSelectedHomework(hw)}
                          className="bg-white text-primary px-8 py-3 rounded-full font-bold text-sm hover:bg-slate-100 transition-colors shadow-xl flex items-center gap-2"
                        >
                          Przejdź do zadania
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Carousel dots */}
            {upcomingSoon.length > 1 && (
              <div className="relative z-10 flex items-center justify-center gap-2 pb-6">
                {upcomingSoon.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCarouselIndex(idx)}
                    className={`rounded-full transition-all duration-300 ${
                      idx === carouselIndex
                        ? "w-8 h-2 bg-white"
                        : "w-2 h-2 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Przejdź do slajdu ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="md:col-span-2 bg-primary-container p-8 rounded-xl text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h2 className="text-2xl font-black mt-4">Brak nadchodzących zadań</h2>
              <p className="mt-2 opacity-80">Czas na odpoczynek! 🎉</p>
            </div>
          </div>
        )}

        {/* Weekly Progress */}
        <div className="bg-surface-container-lowest p-8 rounded-xl flex flex-col justify-between">
          <div>
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 font-body">Postęp tygodnia</p>
            <div className="flex items-end justify-between mb-2">
              <span className="text-5xl font-black text-primary font-headline">{progressPercent}%</span>
              <span className="text-sm font-medium text-slate-400 mb-2 font-body">
                {totalCount - overdueCount}/{totalCount} zadań
              </span>
            </div>
            <div className="w-full bg-surface-container-low h-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-sm font-body">
              <span className="text-slate-500">Zaległe</span>
              <span className="font-bold text-red-500">{overdueCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm font-body">
              <span className="text-slate-500">Zakończone</span>
              <span className="font-bold text-tertiary">{totalCount - overdueCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex gap-2">
          {(["upcoming", "completed", "overdue"] as StatusFilter[]).map((filter) => {
            const labels: Record<StatusFilter, string> = {
              upcoming: "Nadchodzące",
              completed: "Zakończone",
              overdue: "Zaległe",
            };
            return (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${
                  statusFilter === filter
                    ? "bg-primary text-white"
                    : "bg-surface-container-lowest text-slate-600 hover:bg-surface-container-low"
                }`}
              >
                {labels[filter]}
              </button>
            );
          })}
        </div>
        <div className="ml-auto">
          <select
            className="bg-surface-container-lowest rounded-full text-sm font-medium px-6 py-2.5 focus:ring-2 focus:ring-primary/20 text-slate-600 font-body"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value === "all" ? "all" : Number(e.target.value))}
          >
            <option value="all">Wszystkie przedmioty</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.nazwa ?? subject.Nazwa ?? `#${subject.id}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Homework Content */}
      {viewMode === "list" ? (
        <div className="space-y-3">
          {filteredHomework.map((item) => (
            <HomeworkListItem
              key={item.id}
              item={item}
              subject={subjects.find((s) => s.id === item.przedmiot)}
              onClick={() => setSelectedHomework(item)}
            />
          ))}

          {/* Empty "Add New" state */}
          {filteredHomework.length === 0 && (
            <div className="text-center py-16 text-slate-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-body">Brak zadań w tej kategorii</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHomework.map((item) => (
            <HomeworkCard
              key={item.id}
              item={item}
              subject={subjects.find((s) => s.id === item.przedmiot)}
              onClick={() => setSelectedHomework(item)}
            />
          ))}

          {/* Empty "Add New" state card */}
          <button className="border-2 border-dashed border-slate-200 p-6 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:border-primary/50 hover:text-primary transition-all cursor-pointer group min-h-[200px]">
            <div className="w-12 h-12 rounded-full border-2 border-dashed border-current flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <span className="font-bold text-sm font-body">Dodaj własne zadanie</span>
            <span className="text-xs mt-1 font-body">Stwórz przypomnienie lub notatkę</span>
          </button>
        </div>
      )}

      <HomeworkModal
        open={Boolean(selectedHomework)}
        onClose={() => setSelectedHomework(null)}
        item={selectedHomework}
        subject={subjects.find((s) => s.id === selectedHomework?.przedmiot)}
        teacher={teachers.find((t) => t.id === selectedHomework?.nauczyciel)}
      />
    </div>
  );
}
