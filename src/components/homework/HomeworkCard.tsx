import type { Homework, Subject } from "../../types/api";
import { CalendarDays, FileText, Calculator, Rocket, BookOpen, FlaskConical, Languages } from "lucide-react";

const subjectIconMap: Record<string, { icon: React.ElementType; bg: string; color: string; badgeBg: string; badgeText: string }> = {
  matematyka: { icon: Calculator, bg: "bg-blue-50 dark:bg-blue-400/10", color: "text-blue-600 dark:text-blue-400", badgeBg: "bg-blue-100 dark:bg-blue-400/10", badgeText: "text-blue-700 dark:text-blue-300" },
  fizyka: { icon: Rocket, bg: "bg-amber-50 dark:bg-amber-400/10", color: "text-amber-600 dark:text-amber-400", badgeBg: "bg-amber-100 dark:bg-amber-400/10", badgeText: "text-amber-700 dark:text-amber-300" },
  "język polski": { icon: BookOpen, bg: "bg-emerald-50 dark:bg-emerald-400/10", color: "text-emerald-600 dark:text-emerald-400", badgeBg: "bg-emerald-100 dark:bg-emerald-400/10", badgeText: "text-emerald-700 dark:text-emerald-300" },
  chemia: { icon: FlaskConical, bg: "bg-purple-50 dark:bg-purple-400/10", color: "text-purple-600 dark:text-purple-400", badgeBg: "bg-purple-100 dark:bg-purple-400/10", badgeText: "text-purple-700 dark:text-purple-300" },
  "język angielski": { icon: Languages, bg: "bg-rose-50 dark:bg-rose-400/10", color: "text-rose-600 dark:text-rose-400", badgeBg: "bg-rose-100 dark:bg-rose-400/10", badgeText: "text-rose-700 dark:text-rose-300" },
};

function getSubjectStyle(subjectName: string) {
  const lower = subjectName.toLowerCase();
  for (const [key, style] of Object.entries(subjectIconMap)) {
    if (lower.includes(key)) return style;
  }
  return { icon: BookOpen, bg: "bg-slate-50 dark:bg-slate-400/10", color: "text-slate-600 dark:text-slate-400", badgeBg: "bg-slate-100 dark:bg-slate-400/10", badgeText: "text-slate-700 dark:text-slate-300" };
}

function getStatusBadge(item: Homework) {
  const dueMs = Date.parse(item.termin);
  const now = Date.now();
  const diffDays = Math.floor((dueMs - now) / (24 * 60 * 60 * 1000));

  if (dueMs < now) {
    return { label: "Zaległe", bg: "bg-red-100 dark:bg-red-400/10", text: "text-red-700 dark:text-red-300" };
  }
  if (diffDays === 0) {
    return { label: `Dzisiaj`, bg: "bg-red-100 dark:bg-red-400/10", text: "text-red-700 dark:text-red-300" };
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

export default function HomeworkCard({
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
  const Icon = style.icon;
  const status = getStatusBadge(item);
  const dueMs = Date.parse(item.termin);
  const isOverdue = dueMs < Date.now();
  const dueDate = new Date(item.termin).toLocaleDateString("pl-PL", { day: "numeric", month: "long" });

  return (
    <button
      onClick={onClick}
      className="bg-surface-container-lowest p-6 rounded-xl hover:shadow-[0_20px_40px_-4px_rgba(25,28,29,0.06)] dark:hover:shadow-[0_20px_40px_-4px_rgba(0,0,0,0.6)] transition-all group cursor-pointer border border-transparent hover:border-primary/5 text-left"
    >
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 ${style.bg} ${style.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        <span className={`${status.bg} ${status.text} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider`}>
          {status.label}
        </span>
      </div>

      <p className="text-sm font-bold mb-1" style={{ color: style.color.replace("600", "700") }}>
        {subjectName}
      </p>
      <h3 className="text-xl font-bold text-on-surface leading-snug mb-4 font-headline line-clamp-2">
        {item.opis.length > 60 ? `${item.opis.slice(0, 60)}...` : item.opis}
      </h3>

      <div className="flex flex-col gap-3 mt-auto">
        <div className="flex items-center gap-2 text-slate-500">
          <CalendarDays size={18} />
          <span className="text-xs font-medium font-body">
            {isOverdue ? "Przeterminowano: " : "Termin: "}
            {dueDate}
          </span>
        </div>
        {!isOverdue && (
          <div className="flex items-center gap-2 text-slate-400">
            <FileText size={18} />
            <span className="text-xs font-body">
              {item.opis.length > 40 ? `${item.opis.slice(0, 40)}...` : item.opis}
            </span>
          </div>
        )}
      </div>
    </button>
  );
}
