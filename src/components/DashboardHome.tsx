import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  getAttendance,
  getAttendanceStatuses,
  getEvents,
  getGrades,
  getHomework,
  getInboxMessages,
  getLessonHours,
  getLuckyNumber,
  getTimetableEntries,
  getTimetablePlan,
  getSubjects,
  getZajecia,
  getDaysOfWeek,
} from "../services/api";
import { getCurrentUser } from "../services/auth";
import { Card } from "./ui/Card";
import { Spinner } from "./ui/Spinner";
import { ErrorState } from "./ui/ErrorState";
import { formatGradeValue, computeWeightedAverage, getGradeColor } from "../utils/gradeUtils";
import { formatDate } from "../utils/dateUtils";

export default function DashboardHome() {
  const user = getCurrentUser();

  const query = useQuery({
    queryKey: user ? ["dashboard-home", user.id, user.role, user.studentId, user.classId] : ["dashboard-home", "guest"],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return null;

      if (user.role === "uczen" && user.studentId && user.classId) {
        const [lucky, attendance, attendanceStatuses, plans, grades, inbox, homework, events, hours, subjects, zajecia, days] = await Promise.all([
          getLuckyNumber(user.classId),
          getAttendance(user.studentId),
          getAttendanceStatuses(),
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
        const entries = latestPlan ? await getTimetableEntries(latestPlan.id) : [];
        return { lucky, attendance, attendanceStatuses, entries, grades, inbox, homework, events, hours, subjects, zajecia, days };
      }

      const inbox = await getInboxMessages(user.id);
      return { inbox };
    },
  });

  if (!user) return <ErrorState message="Brak zalogowanego użytkownika" />;
  if (query.isPending) return <Spinner />;
  if (query.isError) return <ErrorState message={query.error.message} />;

  const data = query.data;
  if (!data) return null;

  if (user.role !== "uczen") {
    const unread = data.inbox?.filter((message: any) => !message.przeczytana).length ?? 0;
    return (
      <div>
        <h1 className="page-title mb-6">Pulpit</h1>
        <Card>
          <p className="text-foreground">Nieprzeczytane wiadomości: {unread}</p>
          <Link className="text-primary hover:text-primary/80 mt-2 inline-block" to="/dashboard/messages">
            Przejdź do wiadomości
          </Link>
        </Card>
      </div>
    );
  }

  const studentData = data as any;
  const attendanceCount = studentData.attendance?.length ?? 0;
  
  const statusMap = new Map((studentData.attendanceStatuses || []).map((s: any) => [s.id, s.Wartosc]));

  const absentCount = studentData.attendance?.filter((record: any) => {
    const statusText = statusMap.get(record.status)?.toLowerCase() || "";
    return statusText.includes("nieobecn") || statusText.includes("uspraw");
  }).length ?? 0;

  const recentGrades = [...(studentData.grades || [])].sort((a, b) => Date.parse(b.data_wystawienia) - Date.parse(a.data_wystawienia)).slice(0, 5);
  const weighted = computeWeightedAverage(studentData.grades || []);
  const unreadMessages = studentData.inbox?.filter((message: any) => !message.przeczytana).slice(0, 3) || [];
  const upcomingHomework = [...(studentData.homework || [])].filter((item) => Date.parse(item.termin) >= Date.now()).sort((a, b) => Date.parse(a.termin) - Date.parse(b.termin)).slice(0, 3);
  const upcomingEvents = [...(studentData.events || [])].filter((item) => Date.parse(item.data) >= Date.now()).sort((a, b) => Date.parse(a.data) - Date.parse(b.data)).slice(0, 3);

  const attendancePercentage = attendanceCount ? ((attendanceCount - absentCount) / attendanceCount) * 100 : 100;
  const attendanceColor = attendancePercentage >= 90 ? "text-emerald-400" : attendancePercentage >= 75 ? "text-yellow-400" : "text-red-400";

  const today = new Date();
  const todayDayOfWeek = today.getDay(); // 0 = niedziela, 1 = poniedzialek, etc.
  
  // Find the day ID from the database using the "Numer" field
  // JS getDay(): 0=Sun, 1=Mon, ..., 6=Sat
  // DB Numer: Usually 1=Mon, ..., 7=Sun
  const jsDayToDbNumer = todayDayOfWeek === 0 ? 7 : todayDayOfWeek;
  
  const targetDayObj = (studentData.days || []).find((d: any) => d.Numer === jsDayToDbNumer);
  const targetDayId = targetDayObj ? targetDayObj.id : null;

  const zajeciaMap = new Map((studentData.zajecia || []).map((z: any) => [z.id, z]));
  const przedmiotMap = new Map((studentData.subjects || []).map((s: any) => [s.id, s]));

  const getSubjectName = (zajeciaId: number) => {
    const zajecia = zajeciaMap.get(zajeciaId);
    if (!zajecia) return "Nieznany przedmiot";
    const subject = przedmiotMap.get(zajecia.przedmiot);
    return subject ? subject.nazwa : "Nieznany przedmiot";
  };
  
  const getGradeSubjectName = (subjectId: number) => {
      const subject = przedmiotMap.get(subjectId);
      return subject ? subject.nazwa : "Nieznany przedmiot";
  };

  const todayLessons = (studentData.entries || [])
    .filter((entry: any) => targetDayId && (entry.dzien_tygodnia ?? entry.DzienTygodnia) === targetDayId)
    .map((entry: any) => {
      const hour = (studentData.hours || []).find((h: any) => h.id === entry.godzina_lekcyjna);
      return { ...entry, hour };
    })
    .sort((a: any, b: any) => (a.hour?.Numer ?? 0) - (b.hour?.Numer ?? 0));

  const currentHourTime = today.getHours() * 60 + today.getMinutes();
  const nextLesson = todayLessons.find((lesson: any) => {
    if (!lesson.hour) return false;
    const [h, m] = lesson.hour.CzasDo.split(":").map(Number);
    return (h * 60 + m) > currentHourTime;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-foreground tracking-tight">Witaj, {user.firstName}!</h2>
        <span className="text-muted-foreground text-sm bg-secondary px-3 py-1 rounded-full border border-border/40">
          {new Date().toLocaleDateString("pl-PL", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex flex-col p-4 cursor-pointer hover:border-border transition group">
          <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Średnia ocen</div>
          <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">{weighted.toFixed(2)}</div>
        </Card>
        <Card className="flex flex-col p-4 cursor-pointer hover:border-border transition group">
          <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Frekwencja</div>
          <div className={`text-2xl font-bold ${attendanceColor}`}>
            {Math.round(attendancePercentage)}%
          </div>
        </Card>
        <Card className="flex flex-col p-4">
          <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Następna lekcja</div>
          <div className="truncate text-foreground font-semibold">
            {nextLesson ? (
               <div className="flex justify-between items-center group">
                 <span className="truncate mr-2 group-hover:text-primary transition-colors">{getSubjectName(nextLesson.zajecia)}</span>
                 <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md shrink-0 font-mono tracking-wide">{nextLesson.hour?.CzasOd?.substring(0, 5)}</span>
               </div>
             ) : (
                <span className="text-muted-foreground text-sm italic">Brak kolejnych lekcji</span>
             )}
          </div>
        </Card>
        <Card className="flex flex-col p-4 cursor-pointer hover:border-border transition group">
          <div className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Nowe wiadomości</div>
          <div className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
            {studentData.inbox?.filter((message: any) => !message.przeczytana).length ?? 0}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-foreground">Ostatnie oceny</h3>
            <Link to="/dashboard/grades" className="text-xs text-primary hover:text-primary/80 font-medium">Zobacz wszystkie</Link>
          </div>
          <div className="bg-card/50 border border-border/40 rounded-xl overflow-hidden">
            <div className="divide-y divide-border/30">
              {recentGrades.length ? recentGrades.map((grade: any) => (
                <div key={grade.id} className="flex items-center justify-between p-3 hover:bg-secondary/30 transition-colors">
                  <div className="flex-1 font-medium text-sm text-foreground truncate mr-2">{getGradeSubjectName(grade.przedmiot)}</div>
                  <div className={`flex shrink-0 w-8 h-8 rounded-lg text-sm font-bold border items-center justify-center ${getGradeColor(grade.wartosc)}`}>
                    {formatGradeValue(grade.wartosc)}
                  </div>
                </div>
              )) : <div className="p-4 text-center text-sm text-muted-foreground">Brak ocen</div>}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mt-8 mb-2">
            <h3 className="text-xl font-bold text-foreground">Dzisiejszy plan lekcji</h3>
          </div>
          <div className="space-y-2">
            {todayLessons.length > 0 ? todayLessons.map((lesson: any) => {
              const isNext = nextLesson && nextLesson.id === lesson.id;
              return (
              <div key={lesson.id} className={`flex items-center p-3 rounded-xl border ${isNext ? "border-primary bg-primary/5" : "border-border/40 bg-card/50"}`}>
                <div className="w-16 font-mono text-xs text-muted-foreground mr-4 text-center">
                   <div className="font-bold text-foreground">{lesson.hour?.Numer ?? "-"}</div>
                   <div>{lesson.hour?.CzasOd}</div>
                </div>
                <div className="flex-1">
                  <div className={`font-semibold text-sm ${isNext ? "text-primary" : "text-foreground"}`}>
                    {getSubjectName(lesson.zajecia)}
                  </div>
                  {isNext && <span className="text-[10px] uppercase font-bold text-primary tracking-wider bg-primary/10 px-1.5 py-0.5 rounded">Teraz / Następna</span>}
                </div>
              </div>
            )}) : <div className="text-muted-foreground italic py-4 bg-card/30 rounded-xl border border-border/30 px-4">Brak lekcji na dzisiaj</div>}
          </div>

          <div className="flex items-center justify-between mt-8 mb-2">
            <h3 className="text-xl font-bold text-foreground">Wiadomości</h3>
            <Link to="/dashboard/messages" className="text-xs text-primary hover:text-primary/80 font-medium">Przejdź do skrzynki</Link>
          </div>
          <div className="space-y-3">
            {unreadMessages.length ? unreadMessages.map((message: any) => (
              <div key={message.id} className="bg-card/50 rounded-xl border border-border/40 p-4 hover:border-border transition-colors flex gap-4 items-start cursor-pointer">
                <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-primary animate-pulse"></div>
                <div className="min-w-0">
                  <p className="font-semibold text-foreground text-sm mb-1 truncate">{message.temat}</p>
                  <p className="text-muted-foreground text-xs">Otrzymano nieprzeczytaną wiadomość</p>
                </div>
              </div>
            )) : <div className="text-muted-foreground italic col-span-full py-4 bg-card/30 rounded-xl border border-border/30 px-4">Brak nowych wiadomości</div>}
          </div>

          {/* 
          <div className="flex items-center justify-between mt-8 mb-2">
            <h3 className="text-xl font-bold text-foreground">Nadchodzące wydarzenia i zadania</h3>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcomingHomework.map((item: any) => (
               <div key={`hw-${item.id}`} className="bg-primary/5 rounded-xl border border-primary/10 p-4">
                 <div className="text-xs text-primary font-mono mb-1">{formatDate(item.termin)}</div>
                 <div className="font-semibold text-sm">Praca domowa</div>
               </div>
            ))}
            {upcomingEvents.map((item: any) => (
              <div key={`ev-${item.id}`} className="bg-card/50 rounded-xl border border-border/40 p-4">
                <div className="text-xs text-muted-foreground font-mono mb-1">{formatDate(item.data)}</div>
                <div className="font-semibold text-sm truncate">{item.tytul}</div>
              </div>
            ))}
          </div>
           */}
        </div>
      </div>
    </div>
  );
}
