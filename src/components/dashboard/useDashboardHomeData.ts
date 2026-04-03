import { useQuery } from "@tanstack/react-query";
import type { CurrentUser } from "../../types/auth";
import {
    getAttendance,
    getAttendanceStatuses,
    getBehaviorPoints,
    getDaysOfWeek,
    getEvents,
    getGrades,
    getHomework,
    getInboxMessages,
    getLessonHours,
    getLuckyNumber,
    getSubjects,
    getTimetableEntries,
    getTimetablePlan,
    getZajecia,
} from "../../services/api";

export function useDashboardHomeData(user: CurrentUser | null) {
    return useQuery({
        queryKey: user
            ? [
                  "dashboard-home",
                  user.id,
                  user.role,
                  user.studentId,
                  user.classId,
              ]
            : ["dashboard-home", "guest"],
        enabled: Boolean(user),
        queryFn: async () => {
            if (!user) return null;

            if (user.role === "uczen" && user.studentId && user.classId) {
                const [
                    lucky,
                    attendance,
                    attendanceStatuses,
                    behaviorPoints,
                    plans,
                    grades,
                    inbox,
                    homework,
                    events,
                    hours,
                    subjects,
                    zajecia,
                    days,
                ] = await Promise.all([
                    getLuckyNumber(user.classId),
                    getAttendance(user.studentId),
                    getAttendanceStatuses(),
                    getBehaviorPoints(user.studentId),
                    getTimetablePlan(user.classId),
                    getGrades(user.studentId),
                    getInboxMessages(user.id),
                    getHomework(user.classId),
                    getEvents(user.classId),
                    getLessonHours(),
                    getSubjects(),
                    getZajecia(),
                    getDaysOfWeek(),
                ]);

                const latestPlan = [...plans].sort((a, b) => b.id - a.id)[0];
                const entries = latestPlan
                    ? await getTimetableEntries(latestPlan.id)
                    : [];

                return {
                    lucky,
                    attendance,
                    attendanceStatuses,
                    behaviorPoints,
                    entries,
                    grades,
                    inbox,
                    homework,
                    events,
                    hours,
                    subjects,
                    zajecia,
                    days,
                };
            }

            const inbox = await getInboxMessages(user.id);
            return { inbox };
        },
    });
}
