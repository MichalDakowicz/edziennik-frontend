import { Book, Bell, FileText } from "lucide-react";
import { cn } from "../../utils/cn";
import type { DisplayItem, EventItem, HomeworkItem } from "./types";

export function itemColorClass(kind: DisplayItem["kind"]): string {
  if (kind === "event")
    return "bg-teal-500/10 border-teal-500/30 text-teal-800 dark:text-teal-300 dark:border-teal-400/30";
  if (kind === "homework")
    return "bg-violet-500/10 border-violet-500/30 text-violet-800 dark:text-violet-300 dark:border-violet-400/30";
  return "bg-muted/60 border-border text-foreground";
}

export function ItemCard({ item, compact = false, onClick, fill = false }: { item: DisplayItem; compact?: boolean; onClick?: (item: DisplayItem) => void; fill?: boolean }) {
  const colorCls = itemColorClass(item.kind);
  const icon =
    item.kind === "lesson" ? (
      <Book className="size-3.5 flex-shrink-0 mt-0.5" />
    ) : item.kind === "event" ? (
      <Bell className="size-3.5 flex-shrink-0 mt-0.5" />
    ) : (
      <FileText className="size-3.5 flex-shrink-0 mt-0.5" />
    );

  if (compact) {
    return (
      <div
        onClick={() => onClick?.(item)}
        className={cn(
          "px-2 py-1 rounded border-l-2 text-[10px] md:text-xs flex items-start gap-1.5 min-w-0 overflow-hidden",
          onClick && "cursor-pointer hover:opacity-80 transition-opacity",
          colorCls,
        )}
      >
        {icon}
        <span className="block flex-1 min-w-0 truncate font-medium">
          {item.kind === "lesson" ? `${item.startTime} ${item.subject}` : item.title}
        </span>
      </div>
    );
  }

  return (
    <div 
      onClick={() => onClick?.(item)}
      className={cn(
        "p-3 rounded-lg border", 
        onClick && "cursor-pointer hover:opacity-80 transition-opacity",
        colorCls
      )}
    >
      <div className="flex items-start gap-2">
        {icon}
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">
            {item.kind === "lesson" ? item.subject : item.title}
          </div>
          {item.kind === "lesson" && (
            <div className="text-xs opacity-70 mt-0.5">
              {item.periodNum}. lekcja · {item.startTime}–{item.endTime}
            </div>
          )}
          {item.kind !== "lesson" && item.subject && (
            <div className="text-xs opacity-70 mt-0.5">{item.subject}</div>
          )}
          {item.kind !== "lesson" && item.description && (
            <div className={cn("text-xs opacity-60 mt-2 whitespace-pre-wrap", !fill && "line-clamp-3")}>
              {item.description}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Small chip for month cells — only events / homework */
export function ItemChip({ item }: { item: EventItem | HomeworkItem }) {
  const cls =
    item.kind === "event"
      ? "bg-teal-500/20 text-teal-800 dark:text-teal-300"
      : "bg-violet-500/20 text-violet-800 dark:text-violet-300";
  return (
    <div className={cn("text-[10px] px-1 py-0.5 rounded truncate leading-tight", cls)}>
      {item.title}
    </div>
  );
}
