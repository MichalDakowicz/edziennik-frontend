import { Link } from "react-router-dom";
import { formatGradeValue, getGradeColor } from "../../../utils/gradeUtils";

type StudentRecentGradesCardProps = {
    recentGrades: any[];
    getGradeSubjectName: (subjectId: number) => string;
    formatRelativeDay: (value: string) => string;
};

export default function StudentRecentGradesCard({
    recentGrades,
    getGradeSubjectName,
    formatRelativeDay,
}: StudentRecentGradesCardProps) {
    return (
        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)]">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold font-headline text-on-surface">
                    Ostatnie oceny
                </h2>
                <Link
                    to="/dashboard/grades"
                    className="text-xs text-primary font-medium hover:text-primary/80 font-body"
                >
                    Wszystkie
                </Link>
            </div>

            <div className="space-y-4">
                {recentGrades.length > 0 ? (
                    recentGrades.map((grade: any) => (
                        <div key={grade.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3 min-w-0">
                                <div
                                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shadow-[0_8px_24px_-6px_rgba(25,28,29,0.14)] ${getGradeColor(grade.wartosc)}`}
                                >
                                    {formatGradeValue(grade.wartosc)}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-sm text-on-surface truncate font-body">
                                        {getGradeSubjectName(grade.przedmiot)}
                                    </p>
                                    <p className="text-[10px] text-outline uppercase tracking-wider font-body truncate">
                                        {grade.opis || "Ocena cząstkowa"}
                                    </p>
                                </div>
                            </div>
                            <span className="text-[10px] text-outline font-medium font-body">
                                {formatRelativeDay(grade.data_wystawienia)}
                            </span>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-on-surface-variant font-body">
                        Brak ostatnich ocen.
                    </p>
                )}
            </div>
        </div>
    );
}
