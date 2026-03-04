import { isSameDay } from "date-fns";
import type { Event, Homework } from "../../types/api";
import type {
  DisplayItem,
  EventItem,
  HomeworkItem,
  LessonItem,
  TimetableData,
} from "./types";

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function getLessonsForDate(date: Date, timetable: TimetableData): LessonItem[] {
  const dayNum = date.getDay() === 0 ? 7 : date.getDay();
  const dayRecord = timetable.days.find((d) => d.Numer === dayNum);
  if (!dayRecord) return [];
  return timetable.entries
    .filter((e) => (e.dzien_tygodnia ?? e.DzienTygodnia) === dayRecord.id)
    .map((entry) => {
      const hour = timetable.hours.find((h) => h.id === entry.godzina_lekcyjna);
      const zajecia = timetable.zajecia.find((z) => z.id === entry.zajecia);
      const subject = timetable.subjects.find((s) => s.id === zajecia?.przedmiot);
      return {
        kind: "lesson" as const,
        id: `lesson-${entry.id}`,
        subject: subject?.nazwa ?? subject?.Nazwa ?? "Lekcja",
        periodNum: hour?.Numer ?? 0,
        startTime: hour?.CzasOd?.slice(0, 5) ?? "",
        endTime: hour?.CzasDo?.slice(0, 5) ?? "",
      };
    })
    .sort((a, b) => a.periodNum - b.periodNum);
}

export function getEventsForDate(
  date: Date,
  events: Event[],
  subjects: TimetableData["subjects"],
): EventItem[] {
  return events
    .filter((e) => isSameDay(new Date(e.data), date))
    .map((e) => {
      const subject = subjects.find((s) => s.id === e.przedmiot);
      return {
        kind: "event" as const,
        id: `event-${e.id}`,
        title: e.tytul,
        description: e.opis,
        subject: subject?.nazwa ?? subject?.Nazwa ?? undefined,
      };
    });
}

export function getHomeworkForDate(
  date: Date,
  homework: Homework[],
  subjects: TimetableData["subjects"],
): HomeworkItem[] {
  return homework
    .filter((h) => isSameDay(new Date(h.termin), date))
    .map((h) => {
      const subject = subjects.find((s) => s.id === h.przedmiot);
      return {
        kind: "homework" as const,
        id: `hw-${h.id}`,
        title: subject?.nazwa ?? subject?.Nazwa ?? "Praca domowa",
        description: h.opis,
        subject: subject?.nazwa ?? subject?.Nazwa ?? undefined,
      };
    });
}

export function getAllItemsForDate(
  date: Date,
  timetable: TimetableData,
  events: Event[],
  homework: Homework[],
): DisplayItem[] {
  return [
    ...getLessonsForDate(date, timetable),
    ...getEventsForDate(date, events, timetable.subjects),
    ...getHomeworkForDate(date, homework, timetable.subjects),
  ];
}
