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
    subjects,
    upcomingHomework,
    liveItems,
    getSubjectName,
    getGradeSubjectName,
    getTeacherNameForLesson,
    formatHour,
    formatRelativeDay,
    onGradeClick,
}: StudentDashboardProps) {
    return (
        <div className="space-y-8">
            <StudentGreeting
                firstName={firstName}
                weightedAverage={weightedAverage}
                unreadCount={unreadCount}
            />

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
                            onGradeClick={onGradeClick}
                        />

                        <StudentHomeworkCard
                            upcomingHomework={upcomingHomework}
                            getGradeSubjectName={getGradeSubjectName}
                            formatRelativeDay={formatRelativeDay}
                        />
                    </div>
                </div>

                <StudentLiveStreamCard
                    liveItems={liveItems}
                    formatRelativeDay={formatRelativeDay}
                />
            </div>
        </div>
    );
}
