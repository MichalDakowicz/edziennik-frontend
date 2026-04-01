import { Link } from "react-router-dom";

type StudentScheduleCardProps = {
    lessonsWithState: any[];
    getSubjectName: (zajeciaId: number) => string;
    getTeacherNameForLesson: (zajeciaId: number) => string;
    formatHour: (value: string | null | undefined) => string;
};

export default function StudentScheduleCard({
    lessonsWithState,
    getSubjectName,
    getTeacherNameForLesson,
    formatHour,
}: StudentScheduleCardProps) {
    return (
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)]">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">
                        schedule
                    </span>
                    <h2 className="text-xl font-bold font-headline text-on-surface">
                        Dzisiejszy plan lekcji
                    </h2>
                </div>
                <Link
                    to="/dashboard/timetable"
                    className="text-sm font-medium text-primary hover:text-primary/80 font-body"
                >
                    Pełny plan
                </Link>
            </div>

            <div className="space-y-3">
                {lessonsWithState.length > 0 ? (
                    lessonsWithState.map((lesson: any) => {
                        const wrapperClass = lesson.isCurrent
                            ? "bg-primary-fixed/30 relative overflow-hidden"
                            : lesson.isPast
                              ? "bg-surface-container-low/40 opacity-70"
                              : "hover:bg-surface-container-low";

                        return (
                            <div
                                key={lesson.id}
                                className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${wrapperClass}`}
                            >
                                {lesson.isCurrent ? (
                                    <div className="absolute right-0 top-0 h-full w-1 bg-primary"></div>
                                ) : null}

                                <div className="flex-shrink-0 w-16 text-center">
                                    <p className="text-xs font-bold text-outline font-body">
                                        {lesson.hour?.Numer
                                            ? `#${lesson.hour.Numer}`
                                            : "LEKCJA"}
                                    </p>
                                    <p className="text-xs text-on-surface-variant font-body">
                                        {formatHour(lesson.hour?.CzasOd)}
                                    </p>
                                </div>

                                <div className="flex-grow min-w-0">
                                    <h3 className="font-bold text-on-surface font-headline truncate">
                                        {getSubjectName(lesson.zajecia)}
                                    </h3>
                                    <p className="text-sm text-on-surface-variant font-body truncate">
                                        {formatHour(lesson.hour?.CzasOd)} - {formatHour(lesson.hour?.CzasDo)} • Sala {lesson.sala ?? "-"} • {getTeacherNameForLesson(lesson.zajecia)}
                                    </p>
                                </div>

                                <div className="flex-shrink-0">
                                    {lesson.minutesToStart !== null ? (
                                        <span className="text-xs font-semibold text-outline font-body">
                                            za {lesson.minutesToStart} min
                                        </span>
                                    ) : null}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-on-surface-variant font-body">
                        Brak zaplanowanych lekcji na dzisiaj.
                    </p>
                )}
            </div>
        </div>
    );
}
