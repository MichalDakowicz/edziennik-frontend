import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClass, getDaysOfWeek, getLessonHours, getSubjects, getTimetableEntries, getTimetablePlan, getZajecia } from "../../services/api";
import { getCurrentUser } from "../../services/auth";
import { keys } from "../../services/queryKeys";
import { ErrorState } from "../ui/ErrorState";
import { Spinner } from "../ui/Spinner";
import TimetableGrid from "./TimetableGrid";
import { formatClassDisplay } from "../../utils/classUtils";

export default function TimetablePage() {
  const user = getCurrentUser();
  const classId = user?.classId;

  const query = useQuery({
    queryKey: classId ? keys.timetable(classId) : ["timetable", "na"],
    enabled: Boolean(classId),
    queryFn: async () => {
      const [plans, days, hours, subjects, zajecia, klasa] = await Promise.all([
        getTimetablePlan(classId as number),
        getDaysOfWeek(),
        getLessonHours(),
        getSubjects(),
        getZajecia(),
        getClass(classId as number),
      ]);
      const latestPlan = [...plans].sort((a, b) => b.id - a.id)[0];
      const entries = latestPlan ? await getTimetableEntries(latestPlan.id) : [];
      return { days, hours, subjects, zajecia, klasa, entries };
    },
  });

  const data = query.data;

  const todayLessons = useMemo(() => {
    if (!data) return [];
    const today = new Date();
    const dayNum = today.getDay() === 0 ? 7 : today.getDay();
    const todayDay = data.days.find((d) => d.Numer === dayNum);

    if (!todayDay) return [];
    return data.entries
      .filter((entry) => (entry.dzien_tygodnia ?? entry.DzienTygodnia) === todayDay.id)
      .sort((a, b) => a.godzina_lekcyjna - b.godzina_lekcyjna)
      .map((entry) => {
        const lesson = data.zajecia.find((item) => item.id === entry.zajecia);
        const subject = data.subjects.find((item) => item.id === lesson?.przedmiot);
        const hour = data.hours.find((item) => item.id === entry.godzina_lekcyjna);
        return {
          id: entry.id,
          subject: subject?.nazwa ?? subject?.Nazwa ?? "-",
          hour: hour ? `${hour.CzasOd.slice(0, 5)}-${hour.CzasDo.slice(0, 5)}` : "",
        };
      });
  }, [data]);

  if (!classId) return <ErrorState message="Brak przypisanej klasy" />;
  if (query.isPending) return <Spinner />;
  if (query.isError) return <ErrorState message={query.error.message} />;

  if (!data) return <Spinner />;

  const classDisplay = formatClassDisplay(data.klasa);

  return (
    <div className="space-y-4">
      <h1 className="page-title font-headline">Plan lekcji</h1>
      <p className="text-on-surface-variant font-body">Klasa: {classDisplay}</p>
      <TimetableGrid days={data.days} hours={data.hours} entries={data.entries} zajecia={data.zajecia} subjects={data.subjects} />
      <div className="bg-card/50 /50 rounded-xl p-4">
        <h2 className="section-title mb-3">Dzisiaj</h2>
        {todayLessons.length ? (
          <ul className="space-y-2">
            {todayLessons.map((lesson) => <li key={lesson.id} className="text-on-surface font-body">{lesson.hour} · {lesson.subject}</li>)}
          </ul>
        ) : (
          <p className="text-on-surface-variant font-body">Brak lekcji</p>
        )}
      </div>
    </div>
  );
}