import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEvents, getSubjects } from "../../services/api";
import { keys } from "../../services/queryKeys";
import { getCurrentUser } from "../../services/auth";
import { ErrorState } from "../ui/ErrorState";
import { Spinner } from "../ui/Spinner";
import { Badge } from "../ui/Badge";
import EventCalendar from "./EventCalendar";
import { formatDateTime } from "../../utils/dateUtils";

export default function EventsPage() {
  const user = getCurrentUser();
  const classId = user?.classId;
  const [view, setView] = useState<"list" | "calendar">("list");
  const [expanded, setExpanded] = useState<number[]>([]);

  const eventsQuery = useQuery({
    queryKey: classId ? keys.events(classId) : ["events", "na"],
    queryFn: () => getEvents(classId as number),
    enabled: Boolean(classId),
  });
  const subjectsQuery = useQuery({ queryKey: keys.subjects(), queryFn: getSubjects });

  const events = useMemo(() => {
    return [...(eventsQuery.data ?? [])].sort((a, b) => Date.parse(a.data) - Date.parse(b.data));
  }, [eventsQuery.data]);

  const subjects = subjectsQuery.data ?? [];

  const grouped = useMemo(() => {
    const map = new Map<string, typeof events>();
    events.forEach((event) => {
      const key = new Date(event.data).toLocaleDateString("pl-PL", { month: "long", year: "numeric" });
      const currentItems = map.get(key) ?? [];
      currentItems.push(event);
      map.set(key, currentItems);
    });
    return map;
  }, [events]);

  const past = events.filter((event) => Date.parse(event.data) < Date.now());

  if (!classId) return <ErrorState message="Brak przypisanej klasy" />;
  if ([eventsQuery, subjectsQuery].some((q) => q.isPending)) return <Spinner />;
  const firstError = [eventsQuery, subjectsQuery].find((q) => q.isError);
  if (firstError?.isError) return <ErrorState message={firstError.error.message} />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">Terminarz</h1>
        </div>
        <div className="flex bg-surface-container-low p-1 rounded-full">
          <button className={view === "list" ? "px-4 py-1.5 text-sm font-semibold rounded-full bg-white dark:bg-surface-container-high text-primary shadow-sm transition-all" : "px-4 py-1.5 text-sm font-semibold rounded-full text-on-surface-variant hover:text-primary transition-all"} onClick={() => setView("list")}>Lista</button>
          <button className={view === "calendar" ? "px-4 py-1.5 text-sm font-semibold rounded-full bg-white dark:bg-surface-container-high text-primary shadow-sm transition-all" : "px-4 py-1.5 text-sm font-semibold rounded-full text-on-surface-variant hover:text-primary transition-all"} onClick={() => setView("calendar")}>Kalendarz</button>
        </div>
      </div>

      {view === "calendar" ? <EventCalendar events={events} /> : null}

      {view === "list" ? (
        <div className="space-y-6">
          {[...grouped.entries()].map(([month, items]) => (
            <section key={month} className="space-y-2">
              <h2 className="section-title">{month}</h2>
              {items.map((event) => {
                const open = expanded.includes(event.id);
                const subject = subjects.find((s) => s.id === event.przedmiot);
                return (
                  <div key={event.id} className="bg-card/50 /50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{event.tytul}</h3>
                      {subject ? <Badge variant="info">{subject.nazwa ?? subject.Nazwa}</Badge> : null}
                    </div>
                    <p className="text-sm text-on-surface-variant font-body mb-2">{formatDateTime(event.data)}</p>
                    <button className="text-sm text-primary hover:text-primary/80" onClick={() => setExpanded((current) => (open ? current.filter((id) => id !== event.id) : [...current, event.id]))}>
                      {open ? "Ukryj opis" : "Pokaż opis"}
                    </button>
                    {open ? <p className="mt-2 text-on-surface font-body whitespace-pre-wrap">{event.opis}</p> : null}
                  </div>
                );
              })}
            </section>
          ))}
          {past.length ? (
            <section>
              <h2 className="section-title">Minione</h2>
              <p className="text-on-surface-variant font-body text-sm">Liczba minionych wydarzeń: {past.length}</p>
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}