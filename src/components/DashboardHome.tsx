import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { getTeachers, markMessageRead } from "../services/api";
import { getCurrentUser } from "../services/auth";
import type { Grade, Message, Teacher } from "../types/api";
import { keys } from "../services/queryKeys";
import { formatDate } from "../utils/dateUtils";
import StudentDashboard from "./dashboard/StudentDashboard";
import TeacherDashboard from "./dashboard/TeacherDashboard";
import GradeModal from "./grades/GradeModal";
import { useDashboardHomeData } from "./dashboard/useDashboardHomeData";
import { useMessageUsersMap } from "./dashboard/useMessageUsersMap";
import { useStudentDashboardModel } from "./dashboard/useStudentDashboardModel";
import MessageDetail from "./messages/MessageDetail";
import { Card } from "./ui/Card";
import { ErrorState } from "./ui/ErrorState";
import { Spinner } from "./ui/Spinner";

export default function DashboardHome() {
    const user = getCurrentUser();
    const queryClient = useQueryClient();
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [selectedGrade, setSelectedGrade] = useState<Grade | null>(null);

    const markReadMutation = useMutation({
        mutationFn: (id: number) => markMessageRead(id),
        onError: () =>
            toast.error("Nie udało się oznaczyć wiadomości jako przeczytanej"),
        onSuccess: () => {
            if (user) {
                queryClient.invalidateQueries({
                    queryKey: [
                        "dashboard-home",
                        user.id,
                        user.role,
                        user.studentId,
                        user.classId,
                    ],
                });
                queryClient.invalidateQueries({
                    queryKey: keys.inbox(user.id),
                });
            }
        },
    });

    const teachersQuery = useQuery({
        queryKey: keys.teachers(),
        queryFn: getTeachers,
        enabled: Boolean(user),
    });

    const query = useDashboardHomeData(user);
    const inboxData = (query.data as { inbox?: Message[] } | null)?.inbox ?? [];
    const usersQuery = useMessageUsersMap(inboxData, selectedMessage);

    const handleOpenMessage = (message: Message) => {
        setSelectedMessage(message);
        if (!message.przeczytana) {
            markReadMutation.mutate(message.id);
        }
    };

    const studentModel = useStudentDashboardModel({
        studentData:
            user?.role === "uczen" ? ((query.data as { inbox?: Message[] } | null) ?? {}) : {},
        teachers: (teachersQuery.data || []) as Teacher[],
        onOpenMessage: handleOpenMessage,
    });

    if (!user) return <ErrorState message="Brak zalogowanego użytkownika" />;
    if (query.isPending) return <Spinner />;
    if (query.isError) return <ErrorState message={query.error.message} />;

    const data = query.data;
    if (!data) return null;

    const resolveUserName = (id: number) => {
        if (!id) return "Nieznany";
        if (id === user.id) return "Ja";

        const fromInboxCache = usersQuery.data?.get(id);
        if (fromInboxCache) return fromInboxCache;

        const teacher = (teachersQuery.data || []).find((item: Teacher) => item.user?.id === id);
        if (teacher) {
            return `${teacher.user.first_name} ${teacher.user.last_name}`;
        }

        return `Użytkownik #${id}`;
    };

    if (user.role !== "uczen") {
        const unread = data.inbox?.filter((message: Message) => !message.przeczytana).length ?? 0;
        const unreadInbox = [...(data.inbox ?? [])]
            .filter((message: Message) => !message.przeczytana)
            .sort((a: Message, b: Message) => Date.parse(b.data_wyslania) - Date.parse(a.data_wyslania));

        if (user.role === "nauczyciel" || user.role === "admin") {
            return (
                <>
                    <TeacherDashboard
                        firstName={user.firstName}
                        unreadCount={unread}
                        unreadInbox={unreadInbox}
                        onOpenMessage={handleOpenMessage}
                        currentDateLabel={formatDate(new Date().toISOString())}
                        formatDateLabel={formatDate}
                    />
                    <MessageDetail
                        message={selectedMessage}
                        open={Boolean(selectedMessage)}
                        onClose={() => setSelectedMessage(null)}
                        resolveUserName={resolveUserName}
                    />
                </>
            );
        }

        return (
            <div>
                <h1 className="page-title mb-6 font-headline">Pulpit</h1>
                <Card>
                    <p className="text-on-surface font-body">
                        Nieprzeczytane wiadomości: {unread}
                    </p>
                    <Link
                        className="text-primary hover:text-primary/80 mt-2 inline-block"
                        to="/dashboard/messages"
                    >
                        Przejdź do wiadomości
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <>
            <StudentDashboard
                firstName={user.firstName}
                weightedAverage={studentModel.weighted}
                unreadCount={studentModel.unreadMessages.length}
                lessonsWithState={studentModel.lessonsWithState}
                recentGrades={studentModel.recentGrades}
                subjects={studentModel.subjects}
                upcomingHomework={studentModel.upcomingHomework}
                liveItems={studentModel.liveItems}
                getSubjectName={studentModel.getSubjectName}
                getGradeSubjectName={studentModel.getGradeSubjectName}
                getTeacherNameForLesson={studentModel.getTeacherNameForLesson}
                formatHour={studentModel.formatHour}
                formatRelativeDay={studentModel.formatRelativeDay}
                onGradeClick={setSelectedGrade}
            />
            <MessageDetail
                message={selectedMessage}
                open={Boolean(selectedMessage)}
                onClose={() => setSelectedMessage(null)}
                resolveUserName={resolveUserName}
            />
            <GradeModal
                open={Boolean(selectedGrade)}
                onClose={() => setSelectedGrade(null)}
                grade={selectedGrade}
                subjects={studentModel.subjects}
            />
        </>
    );
}
