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
import { Legend } from "./Legend";
import { MonthView } from "./MonthView";
import { ThreeDayView } from "./ThreeDayView";
import { WeekView } from "./WeekView";
import type { TimetableData, ViewMode } from "./types";

export default function KalendarzPage() {
  const user = getCurrentUser();
  const classId = user?.classId;
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("week");

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
  const viewProps = { date: currentDate, timetable, events, homework };

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
      <CalendarNavHeader
        currentDate={currentDate}
        viewMode={viewMode}
        onDateChange={setCurrentDate}
        onViewModeChange={setViewMode}
      />
      <div>{renderView()}</div>
      <Legend />
    </div>
  );
}
