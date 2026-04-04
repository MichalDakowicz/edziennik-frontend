import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getDaysOfWeek,
  getLessonHours,
  getSubjects,
  getTimetableEntries,
  getTimetablePlan,
  getZajecia,
  getEvents,
  getHomework,
} from "../../services/api";
import { getCurrentUser } from "../../services/auth";
import { keys } from "../../services/queryKeys";
import { ErrorState } from "../ui/ErrorState";
import { Spinner } from "../ui/Spinner";
import { CalendarNavHeader } from "./CalendarNavHeader";
import { DayView } from "./DayView";
import { MonthView } from "./MonthView";
import { ThreeDayView } from "./ThreeDayView";
import { WeekView } from "./WeekView";
import type { TimetableData, ViewMode, DisplayItem } from "./types";
import { Modal } from "../ui/Modal";
import { AutoBreadcrumbs, useAutoBreadcrumbs } from "../ui/Breadcrumbs";

export default function KalendarzPage() {
  const breadcrumbs = useAutoBreadcrumbs({ calendar: "Kalendarz" });
  const user = getCurrentUser();
  const classId = user?.classId;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedItem, setSelectedItem] = useState<DisplayItem | null>(null);

  const timetableQuery = useQuery({
    queryKey: classId ? keys.timetable(classId) : ["timetable", "na"],
    enabled: Boolean(classId),
    queryFn: async () => {
      const [plans, days, hours, subjects, zajecia] = await Promise.all([
        getTimetablePlan(classId as number),
        getDaysOfWeek(),
        getLessonHours(),
        getSubjects(),
        getZajecia(),
      ]);
      const latestPlan = [...plans].sort((a, b) => b.id - a.id)[0];
      const entries = latestPlan ? await getTimetableEntries(latestPlan.id) : [];
      return { days, hours, subjects, zajecia, entries } satisfies TimetableData;
    },
  });

  const eventsQuery = useQuery({
    queryKey: classId ? keys.events(classId) : ["events", "na"],
    queryFn: () => getEvents(classId as number),
    enabled: Boolean(classId),
  });

  const homeworkQuery = useQuery({
    queryKey: classId ? keys.homework(classId) : ["homework", "na"],
    queryFn: () => getHomework(classId as number),
    enabled: Boolean(classId),
  });

  if (!classId) return <ErrorState message="Brak przypisanej klasy" />;
  if ([timetableQuery, eventsQuery, homeworkQuery].some((q) => q.isPending)) return <Spinner />;
  const firstError = [timetableQuery, eventsQuery, homeworkQuery].find((q) => q.isError);
  if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

  const timetable = timetableQuery.data!;
  const events = eventsQuery.data ?? [];
  const homework = homeworkQuery.data ?? [];
  const viewProps = { date: currentDate, timetable, events, homework, onItemClick: setSelectedItem };

  const renderView = () => {
    switch (viewMode) {
      case "day":
        return <DayView {...viewProps} />;
      case "three-days":
        return <ThreeDayView {...viewProps} />;
      case "week":
        return <WeekView {...viewProps} />;
      case "month":
        return <MonthView {...viewProps} />;
    }
  };

  return (
    <div className="space-y-6">
      <AutoBreadcrumbs items={breadcrumbs} />
      <CalendarNavHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onDateChange={setCurrentDate}
        onViewModeChange={setViewMode}
      />
      <div>{renderView()}</div>

      <Modal
        open={selectedItem !== null}
        onClose={() => setSelectedItem(null)}
        title=""
        className="max-w-md"
      >
        {selectedItem && (
          <div className="p-6 pt-0">
            {selectedItem.kind === "lesson" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>menu_book</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-on-surface font-headline">{selectedItem.subject}</h3>
                    <p className="text-xs text-on-surface-variant">{selectedItem.periodNum}. lekcja</p>
                  </div>
                </div>
                <div className="bg-surface-container-low rounded-xl p-3 flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant text-sm">schedule</span>
                  <span className="text-sm font-medium text-on-surface">{selectedItem.startTime} – {selectedItem.endTime}</span>
                </div>
              </div>
            )}

            {selectedItem.kind === "event" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-error/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>event</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-on-surface font-headline truncate">{selectedItem.title}</h3>
                    {selectedItem.subject && (
                      <p className="text-xs text-on-surface-variant">{selectedItem.subject}</p>
                    )}
                  </div>
                </div>
                {selectedItem.startTime && selectedItem.endTime && (
                  <div className="bg-surface-container-low rounded-xl p-3 flex items-center gap-3">
                    <span className="material-symbols-outlined text-on-surface-variant text-sm">schedule</span>
                    <span className="text-sm font-medium text-on-surface">{selectedItem.startTime} – {selectedItem.endTime}</span>
                  </div>
                )}
                {selectedItem.description && (
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <p className="text-sm text-on-surface whitespace-pre-wrap">{selectedItem.description}</p>
                  </div>
                )}
              </div>
            )}

            {selectedItem.kind === "homework" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>assignment</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-on-surface font-headline truncate">{selectedItem.title}</h3>
                    {selectedItem.subject && (
                      <p className="text-xs text-on-surface-variant">{selectedItem.subject}</p>
                    )}
                  </div>
                </div>
                {selectedItem.description && (
                  <div className="bg-surface-container-low rounded-xl p-4">
                    <p className="text-sm text-on-surface whitespace-pre-wrap">{selectedItem.description}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
