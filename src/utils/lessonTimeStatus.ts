export type ScheduleDayState =
  | "before-lesson"
  | "active-lesson"
  | "break"
  | "after-school";

export type LessonTimeBadgeKind = "to-lesson" | "to-break" | "break";

export type LessonTimeBadge = {
  kind: LessonTimeBadgeKind;
  text: string;
};

export type TimeAwareLesson = {
  id: number | string;
  startMinutes: number | null;
  endMinutes: number | null;
};

export type ScheduleContext = {
  dayState: ScheduleDayState;
  activeLessonId: number | string | null;
  nearestUpcomingLessonId: number | string | null;
};

export const parseClockToMinutes = (
  value: string | null | undefined,
): number | null => {
  if (!value) return null;

  const [hours, minutes] = value.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;

  return hours * 60 + minutes;
};

export const buildScheduleContext = (
  lessons: TimeAwareLesson[],
  nowMinutes: number,
): ScheduleContext => {
  const activeLesson = lessons.find(
    (lesson) =>
      lesson.startMinutes !== null &&
      lesson.startMinutes <= nowMinutes &&
      (lesson.endMinutes === null || nowMinutes < lesson.endMinutes),
  );

  let nearestUpcoming: TimeAwareLesson | null = null;
  for (const lesson of lessons) {
    if (lesson.startMinutes === null || lesson.startMinutes <= nowMinutes) {
      continue;
    }

    if (
      !nearestUpcoming ||
      lesson.startMinutes < (nearestUpcoming.startMinutes ?? Number.MAX_SAFE_INTEGER)
    ) {
      nearestUpcoming = lesson;
    }
  }

  if (activeLesson) {
    return {
      dayState: "active-lesson",
      activeLessonId: activeLesson.id,
      nearestUpcomingLessonId: nearestUpcoming?.id ?? null,
    };
  }

  if (nearestUpcoming) {
    const hasPastLesson = lessons.some(
      (lesson) => lesson.endMinutes !== null && nowMinutes >= lesson.endMinutes,
    );

    return {
      dayState: hasPastLesson ? "break" : "before-lesson",
      activeLessonId: null,
      nearestUpcomingLessonId: nearestUpcoming.id,
    };
  }

  return {
    dayState: "after-school",
    activeLessonId: null,
    nearestUpcomingLessonId: null,
  };
};

export const buildLessonTimeBadge = (
  lesson: TimeAwareLesson,
  context: ScheduleContext,
  nowMinutes: number,
): LessonTimeBadge | null => {
  if (context.dayState === "active-lesson" && context.activeLessonId === lesson.id) {
    if (lesson.endMinutes === null) {
      return {
        kind: "to-break",
        text: "Do przerwy wkrótce",
      };
    }

    return {
      kind: "to-break",
      text: `Do przerwy ${Math.max(lesson.endMinutes - nowMinutes, 0)} min`,
    };
  }

  if (
    context.dayState === "before-lesson" &&
    context.nearestUpcomingLessonId === lesson.id &&
    lesson.startMinutes !== null
  ) {
    return {
      kind: "to-lesson",
      text: `Za ${Math.max(lesson.startMinutes - nowMinutes, 0)} min`,
    };
  }

  if (
    context.dayState === "break" &&
    context.nearestUpcomingLessonId === lesson.id &&
    lesson.startMinutes !== null
  ) {
    return {
      kind: "break",
      text: `Przerwa ${Math.max(lesson.startMinutes - nowMinutes, 0)} min`,
    };
  }

  return null;
};