import { useMemo, useState } from "react";
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

type ViewMode = "list" | "board";
type StatusFilter = "upcoming" | "completed" | "overdue";

const subjectIconMap: Record<string, { bg: string; color: string; badgeBg: string; badgeText: string }> = {
  matematyka: { bg: "bg-blue-50", color: "text-blue-600", badgeBg: "bg-blue-100", badgeText: "text-blue-700" },
  fizyka: { bg: "bg-amber-50", color: "text-amber-600", badgeBg: "bg-amber-100", badgeText: "text-amber-700" },
  "język polski": { bg: "bg-emerald-50", color: "text-emerald-600", badgeBg: "bg-emerald-100", badgeText: "text-emerald-700" },
  chemia: { bg: "bg-purple-50", color: "text-purple-600", badgeBg: "bg-purple-100", badgeText: "text-purple-700" },
  "język angielski": { bg: "bg-rose-50", color: "text-rose-600", badgeBg: "bg-rose-100", badgeText: "text-rose-700" },
  historia: { bg: "bg-orange-50", color: "text-orange-600", badgeBg: "bg-orange-100", badgeText: "text-orange-700" },
  biologia: { bg: "bg-green-50", color: "text-green-600", badgeBg: "bg-green-100", badgeText: "text-green-700" },
  geografia: { bg: "bg-teal-50", color: "text-teal-600", badgeBg: "bg-teal-100", badgeText: "text-teal-700" },
  informatyka: { bg: "bg-cyan-50", color: "text-cyan-600", badgeBg: "bg-cyan-100", badgeText: "text-cyan-700" },
  wf: { bg: "bg-lime-50", color: "text-lime-600", badgeBg: "bg-lime-100", badgeText: "text-lime-700" },
  muzyka: { bg: "bg-pink-50", color: "text-pink-600", badgeBg: "bg-pink-100", badgeText: "text-pink-700" },
  plastyka: { bg: "bg-violet-50", color: "text-violet-600", badgeBg: "bg-violet-100", badgeText: "text-violet-700" },
};

function getSubjectStyle(subjectName: string) {
  const lower = subjectName.toLowerCase();
  for (const [key, style] of Object.entries(subjectIconMap)) {
    if (lower.includes(key)) return style;
  }
  return { bg: "bg-slate-50", color: "text-slate-600", badgeBg: "bg-slate-100", badgeText: "text-slate-700" };
}

function getStatusInfo(item: Homework) {
  const dueMs = Date.parse(item.termin);
  const now = Date.now();
  const diffDays = Math.floor((dueMs - now) / (24 * 60 * 60 * 1000));

  if (dueMs < now) {
    return { label: "Zaległe", bg: "bg-red-100", text: "text-red-700" };
  }
  if (diffDays === 0) {
    return { label: "Dzisiaj", bg: "bg-red-100", text: "text-red-700" };
  }
  if (diffDays === 1) {
    return { label: "Jutro", bg: "bg-orange-100", text: "text-orange-700" };
  }
  if (diffDays <= 3) {
    return { label: `${diffDays} dni`, bg: "bg-amber-100", text: "text-amber-700" };
  }
  if (diffDays <= 7) {
    return { label: `${diffDays} dni`, bg: "bg-blue-100", text: "text-blue-700" };
  }
  return { label: `${diffDays} dni`, bg: "bg-slate-100", text: "text-slate-600" };
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
      className="w-full bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4 hover:shadow-lg hover:shadow-slate-200/50 transition-all group border border-transparent hover:border-primary/5 text-left"
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

  const { upcoming, past } = useMemo(() => {
    const now = Date.now();
    const up = [...homework]
      .filter((item) => Date.parse(item.termin) >= now)
      .sort((a, b) => Date.parse(a.termin) - Date.parse(b.termin));
    const pa = [...homework]
      .filter((item) => Date.parse(item.termin) < now)
      .sort((a, b) => Date.parse(b.termin) - Date.parse(a.termin));
    return { upcoming: up, past: pa };
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

  const mostUrgent = upcoming.length > 0 ? upcoming[0] : null;
  const totalCount = homework.length;
  const overdueCount = past.length;
  const progressPercent = totalCount > 0 ? Math.round(((totalCount - overdueCount) / totalCount) * 100) : 0;

  if (!classId) return <ErrorState message="Brak przypisanej klasy" />;
  if ([homeworkQuery, subjectsQuery, teachersQuery].some((q) => q.isPending)) return <Spinner />;
  const firstError = [homeworkQuery, subjectsQuery, teachersQuery].find((q) => q.isError);
  if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">Zadania domowe</h1>
          <p className="text-on-surface-variant font-body text-sm mt-1">
            Masz {upcoming.length} aktywn{upcoming.length === 1 ? "e" : upcoming.length < 5 ? "e" : "ych"} zadani{upcoming.length === 1 ? "e" : "a"} na ten tydzień.
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
        {/* Most Urgent Task */}
        {mostUrgent ? (
          <div className="md:col-span-2 bg-primary-container p-8 rounded-xl text-white flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-500" />
            <div className="relative z-10">
              <span className="bg-white/20 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest backdrop-blur-md">
                Najbliższy termin
              </span>
              <h2 className="text-2xl md:text-4xl font-black mt-6 leading-tight max-w-md">
                {mostUrgent.opis.length > 60 ? `${mostUrgent.opis.slice(0, 60)}...` : mostUrgent.opis}
              </h2>
              <div className="flex items-center gap-6 mt-8">
                <div className="flex items-center gap-2">
                  <CalendarDays size={18} className="opacity-70" />
                  <span className="font-medium">
                    {new Date(mostUrgent.termin).toLocaleDateString("pl-PL", { day: "numeric", month: "long" })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen size={18} className="opacity-70" />
                  <span className="font-medium">
                    {subjects.find((s) => s.id === mostUrgent.przedmiot)?.nazwa ?? subjects.find((s) => s.id === mostUrgent.przedmiot)?.Nazwa ?? ""}
                  </span>
                </div>
              </div>
            </div>
            <div className="relative z-10 mt-8">
              <button
                onClick={() => setSelectedHomework(mostUrgent)}
                className="bg-white text-primary px-8 py-3 rounded-full font-bold text-sm hover:bg-slate-100 transition-colors shadow-xl flex items-center gap-2"
              >
                Przejdź do zadania
                <ArrowRight size={16} />
              </button>
            </div>
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
