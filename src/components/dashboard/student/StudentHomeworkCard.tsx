import { Link } from "react-router-dom";

type StudentHomeworkCardProps = {
    upcomingHomework: any[];
    getGradeSubjectName: (subjectId: number) => string;
    formatRelativeDay: (value: string) => string;
};

export default function StudentHomeworkCard({
    upcomingHomework,
    getGradeSubjectName,
    formatRelativeDay,
}: StudentHomeworkCardProps) {
    return (
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold font-headline text-on-surface">
                    Zadania domowe
                </h2>
                <Link
                    to="/dashboard/homework"
                    className="text-xs text-primary font-medium hover:text-primary/80 font-body"
                >
                    Wszystkie
                </Link>
            </div>

            <div className="space-y-3">
                {upcomingHomework.length > 0 ? (
                    upcomingHomework.map((item: any) => {
                        const dueMs = Date.parse(item.termin);
                        const diffDays = Math.floor(
                            (dueMs - Date.now()) / (24 * 60 * 60 * 1000),
                        );
                        const isUrgent = diffDays <= 1;
                        const wrapperClass = isUrgent
                            ? "bg-error-container/25"
                            : "bg-tertiary-fixed/20";
                        const titleClass = isUrgent
                            ? "text-on-error-container"
                            : "text-on-tertiary-fixed-variant";
                        const statusLabel = isUrgent ? "Pilne" : "Nadchodzące";

                        return (
                            <div
                                key={item.id}
                                className={`p-3 rounded-xl ${wrapperClass}`}
                            >
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h4 className={`font-bold text-xs font-body ${titleClass}`}>
                                        {item.opis}
                                    </h4>
                                    <span
                                        className={`text-[9px] font-black uppercase font-body ${titleClass}`}
                                    >
                                        {statusLabel}
                                    </span>
                                </div>
                                <p className={`text-[11px] font-body ${titleClass}/80`}>
                                    {getGradeSubjectName(item.przedmiot)} • Termin: {formatRelativeDay(item.termin)}
                                </p>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-sm text-on-surface-variant font-body">
                        Brak nadchodzących zadań.
                    </p>
                )}
            </div>
        </div>
    );
}
