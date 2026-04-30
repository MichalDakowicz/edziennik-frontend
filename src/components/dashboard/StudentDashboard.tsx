import StudentGreeting from "./student/StudentGreeting";
import StudentHomeworkCard from "./student/StudentHomeworkCard";
import StudentLiveStreamCard from "./student/StudentLiveStreamCard";
import StudentRecentGradesCard from "./student/StudentRecentGradesCard";
import StudentScheduleCard from "./student/StudentScheduleCard";
import StudentStatsBar from "./student/StudentStatsBar";
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
                    <StudentStatsBar
                        weightedAverage={weightedAverage}
                        unreadCount={unreadCount}
                    />

                    <StudentLiveStreamCard
                        liveItems={liveItems}
                        formatRelativeDay={formatRelativeDay}
                    />
                </div>
            </div>
        </div>
    );
}
