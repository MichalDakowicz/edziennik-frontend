export interface Subject {
  id: number;
  nazwa?: string;
  Nazwa?: string;
  nazwa_skrocona?: string | null;
}

export interface Grade {
  id: number;
  wartosc: string;
  waga: number;
  opis: string | null;
  data_wystawienia: string;
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
  okres: number;
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
  punkty: number;
  opis: string | null;
  data_wpisu: string;
  nauczyciel_wpisujacy: number | null;
}

export interface AttendanceStatus {
  id: number;
  Wartosc: string;
}

export interface AttendanceStatusObject {
  id?: number;
  Wartosc?: string;
}

export interface Attendance {
  id: number;
  Data: string;
  uczen: number;
  godzina_lekcyjna: number;
  status: number | null | AttendanceStatusObject;
}

export interface LessonHour {
  id: number;
  Numer: number;
  CzasOd: string;
  CzasDo: string;
  CzasTrwania: number;
}

export interface DayOfWeek {
  id: number;
  Nazwa: string;
  Numer: number;
}

export interface TimetableEntry {
  id: number;
  dzien_tygodnia?: number;
  DzienTygodnia?: number;
  godzina_lekcyjna: number;
  zajecia: number;
}

export interface TimetablePlan {
  id: number;
  klasa: number;
  ObowiazujeOdDnia: string;
  wpisy: number[];
}

export interface Zajecia {
  id: number;
  przedmiot: number;
  nauczyciel: number | null;
}

export interface Message {
  id: number;
  nadawca: number;
  odbiorca: number;
  temat: string;
  tresc: string;
  data_wyslania: string;
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
  numer_w_dzienniku?: number | null;
  nr_w_dzienniku?: number | null;
  NumerWDzienniku?: number | null;
  numerWDzienniku?: number | null;
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
  data_wystawienia: string;
  termin: string;
}

export interface Event {
  id: number;
  tytul: string;
  opis: string;
  data: string; // YYYY-MM-DD
  calodobowe: boolean;
  godzina_od: string | null; // HH:mm:ss
  godzina_do: string | null; // HH:mm:ss
  klasa: number | null;
  przedmiot: number | null;
  nauczyciel: number | null;
}

export interface UserProfile {
  id: number;
  user: number;
  theme_preference: "light" | "dark" | "oled" | "system";
}

export interface LuckyNumber {
  date: string;
  lucky_number: number;
  klasa_id: number | null;
}