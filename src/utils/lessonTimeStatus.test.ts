import {
  buildLessonTimeBadge,
  buildScheduleContext,
  parseClockToMinutes,
  type TimeAwareLesson,
} from "./lessonTimeStatus";

describe("lessonTimeStatus", () => {
  const baseLessons: TimeAwareLesson[] = [
    { id: 1, startMinutes: 8 * 60, endMinutes: 8 * 60 + 45 },
    { id: 2, startMinutes: 8 * 60 + 55, endMinutes: 9 * 60 + 40 },
  ];

  it("parses HH:mm to minutes", () => {
    expect(parseClockToMinutes("08:15:00")).toBe(495);
    expect(parseClockToMinutes("09:05")).toBe(545);
    expect(parseClockToMinutes(null)).toBeNull();
    expect(parseClockToMinutes("invalid")).toBeNull();
  });

  it("shows lesson countdown before first lesson", () => {
    const now = 7 * 60 + 50;
    const context = buildScheduleContext(baseLessons, now);

    expect(context.dayState).toBe("before-lesson");

    const badge = buildLessonTimeBadge(baseLessons[0], context, now);
    expect(badge).toEqual({ kind: "to-lesson", text: "Za 10 min" });
  });

  it("shows break countdown during active lesson", () => {
    const now = 8 * 60 + 20;
    const context = buildScheduleContext(baseLessons, now);

    expect(context.dayState).toBe("active-lesson");

    const badge = buildLessonTimeBadge(baseLessons[0], context, now);
    expect(badge).toEqual({ kind: "to-break", text: "Do przerwy 25 min" });
  });

  it("switches to break state at lesson end boundary", () => {
    const now = 8 * 60 + 45;
    const context = buildScheduleContext(baseLessons, now);

    expect(context.dayState).toBe("break");

    const badge = buildLessonTimeBadge(baseLessons[1], context, now);
    expect(badge).toEqual({ kind: "break", text: "Przerwa 10 min" });
  });

  it("uses fallback text when active lesson misses end time", () => {
    const lessons: TimeAwareLesson[] = [
      { id: 1, startMinutes: 8 * 60, endMinutes: null },
      { id: 2, startMinutes: 9 * 60, endMinutes: 9 * 60 + 45 },
    ];
    const now = 8 * 60 + 5;
    const context = buildScheduleContext(lessons, now);

    expect(context.dayState).toBe("active-lesson");

    const badge = buildLessonTimeBadge(lessons[0], context, now);
    expect(badge).toEqual({ kind: "to-break", text: "Do przerwy wkrótce" });
  });

  it("returns no badge after school", () => {
    const now = 10 * 60;
    const context = buildScheduleContext(baseLessons, now);

    expect(context.dayState).toBe("after-school");
    expect(buildLessonTimeBadge(baseLessons[1], context, now)).toBeNull();
  });
});
