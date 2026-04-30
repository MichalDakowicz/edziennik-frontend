import { Link } from "react-router-dom";
import StudentGreeting from "./student/StudentGreeting";
import StudentHomeworkCard from "./student/StudentHomeworkCard";
import StudentLiveStreamCard from "./student/StudentLiveStreamCard";
import StudentRecentGradesCard from "./student/StudentRecentGradesCard";
import StudentScheduleCard from "./student/StudentScheduleCard";
import type { StudentDashboardProps } from "./student/types";

export default function StudentDashboard({
    firstName,
    weightedAverage,
    unreadCount,
    lessonsWithState,
    recentGrades,
    upcomingHomework,
    liveItems,
    getSubjectName,
    getGradeSubjectName,
    getTeacherNameForLesson,
    formatHour,
    formatRelativeDay,
}: StudentDashboardProps) {
    return (
        <div className="space-y-8">
            <StudentGreeting firstName={firstName} />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <StudentScheduleCard
                        lessonsWithState={lessonsWithState}
                        getSubjectName={getSubjectName}
                        getTeacherNameForLesson={getTeacherNameForLesson}
                        formatHour={formatHour}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StudentRecentGradesCard
                            recentGrades={recentGrades}
                            getGradeSubjectName={getGradeSubjectName}
                            formatRelativeDay={formatRelativeDay}
                        />

                        <StudentHomeworkCard
                            upcomingHomework={upcomingHomework}
                            getGradeSubjectName={getGradeSubjectName}
                            formatRelativeDay={formatRelativeDay}
                        />
                    </div>
                </div>

                <div className="lg:col-span-4 flex flex-col gap-6">
                    <div className="flex gap-6">
                        <div className="flex-1 bg-surface-container-lowest px-6 py-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)]">
                            <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-1 font-body">
                                Średnia ocen
                            </p>
                            <p className="text-2xl font-black text-primary font-headline">
                                {weightedAverage.toFixed(2)}
                            </p>
                        </div>
                        <Link
                            to="/dashboard/messages"
                            className="flex-1 bg-surface-container-lowest px-6 py-4 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] transition-all hover:shadow-[0_12px_36px_-4px_rgba(25,28,29,0.12)]"
                        >
                            <p className="text-[10px] uppercase tracking-widest text-outline font-bold mb-1 font-body">
                                Nieprzeczytane
                            </p>
                            <p className="text-2xl font-black text-on-surface font-headline">
                                {unreadCount}
                            </p>
                        </Link>
                    </div>

                    <StudentLiveStreamCard
                        liveItems={liveItems}
                        formatRelativeDay={formatRelativeDay}
                    />
                </div>
            </div>
        </div>
    );
}
