import type { DayOfWeek, LessonHour, Subject, TimetableEntry, Zajecia } from "../../types/api";

export type ViewMode = "day" | "three-days" | "week" | "month";

export interface TimetableData {
  days: DayOfWeek[];
  hours: LessonHour[];
  entries: TimetableEntry[];
  zajecia: Zajecia[];
  subjects: Subject[];
}

export interface LessonItem {
  kind: "lesson";
  id: string;
  subject: string;
  periodNum: number;
  startTime: string;
  endTime: string;
}

export interface EventItem {
  kind: "event";
  id: string;
  title: string;
  description: string;
  subject?: string;
  isAllDay: boolean;
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
}

export interface HomeworkItem {
  kind: "homework";
  id: string;
  title: string;
  description: string;
  subject?: string;
}

export type DisplayItem = LessonItem | EventItem | HomeworkItem;
