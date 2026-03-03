## Part 4 – Types

File: `src/types/auth.ts`

```typescript
export type Role = "uczen" | "nauczyciel" | "rodzic" | "admin";

export interface TokenPayload {
    user_id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    role: Role;
    uczen_id?: number;
    klasa_id?: number;
    nauczyciel_id?: number;
    rodzic_id?: number;
    dzieci_ids?: number[];
    exp: number;
}

export interface CurrentUser {
    id: number;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    role: Role;
    studentId?: number; // uczen_id
    classId?: number; // klasa_id
    teacherId?: number; // nauczyciel_id
    parentId?: number; // rodzic_id
    childrenIds?: number[]; // dzieci_ids
}
```

File: `src/types/api.ts`

```typescript
export interface Subject {
    id: number;
    nazwa: string;
    nazwa_skrocona?: string | null;
}

export interface Grade {
    id: number;
    wartosc: string; // decimal as string e.g. "4.50" (4+), "4.75" (5-)
    waga: number;
    opis: string | null;
    data_wystawienia: string; // ISO datetime
    czy_punkty: boolean;
    czy_opisowa: boolean;
    czy_do_sredniej: boolean;
    uczen: number;
    nauczyciel: number | null;
    przedmiot: number;
}

export interface PeriodGrade {
    id: number;
    uczen: number;
    wartosc: string;
    okres: number; // 1 = first semester, 2 = second semester
    przedmiot: number | null;
    nauczyciel: number | null;
}

export interface FinalGrade {
    id: number;
    uczen: number;
    wartosc: string;
    przedmiot: number;
    nauczyciel: number | null;
}

export interface BehaviorPoint {
    id: number;
    uczen: number;
    punkty: number; // positive = commendation, negative = note
    opis: string | null;
    data_wpisu: string; // ISO datetime
    nauczyciel_wpisujacy: number | null;
}

export interface AttendanceStatus {
    id: number;
    Wartosc: string;
}

export interface Attendance {
    id: number;
    Data: string; // ISO date "YYYY-MM-DD"
    uczen: number;
    godzina_lekcyjna: number;
    status: number | null | { id?: number; Wartosc?: string };
}

export interface LessonHour {
    id: number;
    Numer: number;
    CzasOd: string; // "HH:MM:SS"
    CzasDo: string;
    CzasTrwania: number; // minutes
}

export interface DayOfWeek {
    id: number;
    Nazwa: string;
    Numer: number; // 1=Monday ... 7=Sunday
}

export interface TimetableEntry {
    id: number;
    dzien_tygodnia: number;
    godzina_lekcyjna: number;
    zajecia: number;
}

export interface TimetablePlan {
    id: number;
    klasa: number;
    ObowiazujeOdDnia: string; // ISO date
    wpisy: number[];
}

export interface Zajecia {
    id: number;
    przedmiot: number;
    nauczyciel: number | null;
}

export interface Message {
    id: number;
    nadawca: number; // user.id (not uczen/nauczyciel id)
    odbiorca: number;
    temat: string;
    tresc: string;
    data_wyslania: string; // ISO datetime
    przeczytana: boolean;
}

export interface Teacher {
    id: number;
    user: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    telefon: string;
}

export interface Student {
    id: number;
    user: {
        id: number;
        username: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    klasa: number | null;
    telefon: string | null;
    data_urodzenia: string;
}

export interface ClassInfo {
    id: number;
    nazwa: string | null;
    numer: number | null;
    wychowawca: number | null;
}

export interface Homework {
    id: number;
    klasa: number;
    przedmiot: number;
    nauczyciel: number;
    opis: string;
    data_wystawienia: string; // ISO datetime
    termin: string; // ISO date (due date)
}

export interface Event {
    id: number;
    tytul: string;
    opis: string;
    data: string; // ISO datetime
    klasa: number | null;
    przedmiot: number | null;
    nauczyciel: number | null;
}

export interface UserProfile {
    id: number;
    user: number;
    theme_preference: "light" | "dark" | "system";
}

export interface LuckyNumber {
    date: string;
    lucky_number: number;
    klasa_id: number | null;
}
```

---

