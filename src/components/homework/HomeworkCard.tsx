import type { Homework, Subject } from "../../types/api";
import { CalendarDays, FileText, Calculator, Rocket, BookOpen, FlaskConical, Languages } from "lucide-react";
import { getSubjectColors } from "../../utils/subjectUtils";

const SUBJECT_ICON_MAP: Record<string, React.ElementType> = {
  matematyka: Calculator,
  fizyka: Rocket,
  "język polski": BookOpen,
  polski: BookOpen,
  chemia: FlaskConical,
  "język angielski": Languages,
  angielski: Languages,
};

function getSubjectIcon(subjectName: string): React.ElementType {
  const lower = subjectName.toLowerCase();
  for (const [key, icon] of Object.entries(SUBJECT_ICON_MAP)) {
    if (lower.includes(key)) return icon;
  }
  return BookOpen;
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
  const colors = getSubjectColors(subjectName);
  const Icon = getSubjectIcon(subjectName);
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
        <div className={`w-12 h-12 ${colors.bg} ${colors.text} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        <span className={`${status.bg} ${status.text} px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider`}>
          {status.label}
        </span>
      </div>

      <p className={`text-sm font-bold mb-1 ${colors.badgeText}`}>
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
