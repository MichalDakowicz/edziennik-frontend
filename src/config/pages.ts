import type { Role } from "../types/auth";

export type SearchablePage = {
    label: string;
    to: string;
    icon: string;
    keywords: string[];
    roles: Role[];
    description?: string;
};

const ALL: Role[] = ["uczen", "nauczyciel", "rodzic", "admin"];
const STUDENT_PARENT: Role[] = ["uczen", "rodzic", "admin"];
const TEACHER: Role[] = ["nauczyciel", "admin"];

export const searchablePages: SearchablePage[] = [
    {
        label: "Pulpit",
        to: "/dashboard",
        icon: "dashboard",
        keywords: ["pulpit", "strona główna", "home", "start"],
        roles: ALL,
        description: "Strona główna",
    },
    {
        label: "Oceny",
        to: "/dashboard/grades",
        icon: "grade",
        keywords: ["oceny", "stopnie", "grades", "wyniki"],
        roles: STUDENT_PARENT,
        description: "Twoje oceny",
    },
    {
        label: "Frekwencja",
        to: "/dashboard/attendance",
        icon: "rule",
        keywords: ["frekwencja", "obecność", "nieobecność", "attendance"],
        roles: STUDENT_PARENT,
        description: "Sprawdź swoją frekwencję",
    },
    {
        label: "Historia frekwencji",
        to: "/dashboard/attendance/history",
        icon: "history",
        keywords: ["frekwencja", "historia", "obecność", "nieobecność", "attendance", "archiwum"],
        roles: STUDENT_PARENT,
        description: "Pełna historia obecności",
    },
    {
        label: "Kalendarz",
        to: "/dashboard/calendar",
        icon: "calendar_month",
        keywords: ["kalendarz", "plan lekcji", "terminarz", "events", "calendar", "timetable", "plan", "harmonogram"],
        roles: STUDENT_PARENT,
        description: "Kalendarz i plan lekcji",
    },
    {
        label: "Zadania domowe",
        to: "/dashboard/homework",
        icon: "assignment",
        keywords: ["zadania", "homework", "praca domowa", "zadanie", "lekcja"],
        roles: STUDENT_PARENT,
        description: "Zadania do wykonania",
    },
    {
        label: "Wiadomości",
        to: "/dashboard/messages",
        icon: "mail",
        keywords: ["wiadomości", "messages", "mail", "skrzynka", "inbox", "email", "poczta"],
        roles: ALL,
        description: "Skrzynka odbiorcza",
    },
    {
        label: "Powiadomienia",
        to: "/dashboard/notifications",
        icon: "notifications",
        keywords: ["powiadomienia", "notifications", "alerty", "alerts"],
        roles: ALL,
        description: "Twoje powiadomienia",
    },
    {
        label: "Profil i ustawienia",
        to: "/dashboard/profile",
        icon: "settings",
        keywords: ["profil", "ustawienia", "settings", "konto", "account", "hasło", "password", "dane"],
        roles: ALL,
        description: "Ustawienia konta",
    },
    {
        label: "Wystawianie ocen",
        to: "/dashboard/teacher/grades",
        icon: "grade",
        keywords: ["oceny", "wystawianie", "grades", "stopnie", "wprowadź oceny", "dodaj ocenę"],
        roles: TEACHER,
        description: "Wystaw oceny uczniom",
    },
    {
        label: "Sprawdzanie obecności",
        to: "/dashboard/teacher/attendance",
        icon: "rule",
        keywords: ["obecność", "frekwencja", "attendance", "sprawdzanie", "lista"],
        roles: TEACHER,
        description: "Zaznacz obecność klasy",
    },
    {
        label: "Zadania domowe — lista",
        to: "/dashboard/teacher/homework",
        icon: "assignment",
        keywords: ["zadania", "homework", "praca domowa", "zadanie", "lista", "zarządzaj"],
        roles: TEACHER,
        description: "Zarządzaj zadaniami domowymi",
    },
    {
        label: "Nowe zadanie domowe",
        to: "/dashboard/teacher/homework/new",
        icon: "assignment_add",
        keywords: ["nowe zadanie", "homework", "dodaj zadanie", "create homework", "stwórz", "utwórz"],
        roles: TEACHER,
        description: "Utwórz nowe zadanie domowe",
    },
];
