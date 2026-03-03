import { API_BASE_URL } from "../constants";
import type {
  Attendance,
  AttendanceStatus,
  BehaviorPoint,
  ClassInfo,
  Event,
  FinalGrade,
  Grade,
  Homework,
  LessonHour,
  LuckyNumber,
  Message,
  PeriodGrade,
  Student,
  Subject,
  Teacher,
  TimetableEntry,
  TimetablePlan,
  UserProfile,
  Zajecia,
  DayOfWeek,
} from "../types/api";
import { getAuthToken, logout, refreshAccessToken } from "./auth";

const makeHeaders = (token: string | null, extra?: HeadersInit): HeadersInit => ({
  "Content-Type": "application/json",
  ...(token
    ? {
        Authorization: `Bearer ${token}`,
        "X-Authorization": `Bearer ${token}`,
      }
    : {}),
  ...extra,
});

export async function fetchWithAuth<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  let token = getAuthToken();
  let response = await fetch(url, {
    ...options,
    headers: makeHeaders(token, options.headers),
  });

  if (response.status === 401) {
    token = await refreshAccessToken();
    if (!token) {
      logout();
      window.location.href = "/";
      throw new Error("Session expired");
    }
    response = await fetch(url, {
      ...options,
      headers: makeHeaders(token, options.headers),
    });
  }

  if (!response.ok) {
    throw new Error(`API Error ${response.status}: ${response.statusText}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export const getGrades = (studentId: number) => fetchWithAuth<Grade[]>(`/oceny/?uczen=${studentId}`);
export const getPeriodGrades = (studentId: number) =>
  fetchWithAuth<PeriodGrade[]>(`/oceny-okresowe/?uczen=${studentId}`);
export const getFinalGrades = (studentId: number) =>
  fetchWithAuth<FinalGrade[]>(`/oceny-koncowe/?uczen=${studentId}`);
export const getBehaviorPoints = (studentId: number) =>
  fetchWithAuth<BehaviorPoint[]>(`/zachowanie-punkty/?uczen=${studentId}`);

export const getAttendance = (studentId: number, dateFrom?: string, dateTo?: string) => {
  const params = new URLSearchParams({ uczen_id: String(studentId) });
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);
  return fetchWithAuth<Attendance[]>(`/frekwencja/?${params.toString()}`);
};
export const getAttendanceStatuses = () => fetchWithAuth<AttendanceStatus[]>("/statusy/");

export const getTimetablePlan = (classId: number) =>
  fetchWithAuth<TimetablePlan[]>(`/plany-zajec/?klasa_id=${classId}`);
export const getTimetableEntries = (planId: number) =>
  fetchWithAuth<TimetableEntry[]>(`/plan-wpisy/?plan_id=${planId}`);
export const getLessonHours = () => fetchWithAuth<LessonHour[]>("/godziny-lekcyjne/");
export const getDaysOfWeek = () => fetchWithAuth<DayOfWeek[]>("/dni-tygodnia/");
export const getZajecia = () => fetchWithAuth<Zajecia[]>("/zajecia/");

export const getInboxMessages = (userId: number) =>
  fetchWithAuth<Message[]>(`/wiadomosci/?odbiorca=${userId}`);
export const getSentMessages = (userId: number) =>
  fetchWithAuth<Message[]>(`/wiadomosci/?nadawca=${userId}`);
export const markMessageRead = (id: number) =>
  fetchWithAuth<Message>(`/wiadomosci/${id}/`, {
    method: "PATCH",
    body: JSON.stringify({ przeczytana: true }),
  });
export const sendMessage = (data: {
  nadawca: number;
  odbiorca: number;
  temat: string;
  tresc: string;
}) =>
  fetchWithAuth<Message>("/wiadomosci/", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getStudents = () => fetchWithAuth<Student[]>("/uczniowie/");
export const getStudent = (id: number) => fetchWithAuth<Student>(`/uczniowie/${id}/`);
export const getTeachers = () => fetchWithAuth<Teacher[]>("/nauczyciele/");
export const getUserProfile = (userId: number) =>
  fetchWithAuth<{ id: number; username: string; first_name: string; last_name: string }>(
    `/users/${userId}/`,
  );
export const getClass = (classId: number) => fetchWithAuth<ClassInfo>(`/klasy/${classId}/`);
export const getClasses = () => fetchWithAuth<ClassInfo[]>("/klasy/");
export const getUserSettings = (userId: number) => fetchWithAuth<UserProfile[]>(`/profile/?user=${userId}`);
export const updateUserSettings = (profileId: number, data: Partial<UserProfile>) =>
  fetchWithAuth<UserProfile>(`/profile/${profileId}/`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const getSubjects = () => fetchWithAuth<Subject[]>("/przedmioty/");
export const getHomework = (classId: number, subjectId?: number) => {
  const params = new URLSearchParams({ klasa: String(classId) });
  if (subjectId) params.set("przedmiot", String(subjectId));
  return fetchWithAuth<Homework[]>(`/prace-domowe/?${params.toString()}`);
};
export const getEvents = (classId: number) => fetchWithAuth<Event[]>(`/wydarzenia/?klasa=${classId}`);
export const getLuckyNumber = async (classId: number): Promise<LuckyNumber | null> => {
  try {
    return await fetchWithAuth<LuckyNumber>(`/lucky-number/?klasa=${classId}`);
  } catch (error) {
    if (error instanceof Error && error.message.includes("API Error 404")) {
      return null;
    }
    throw error;
  }
};