import { jwtDecode } from "jwt-decode";
import { API_BASE_URL, REFRESH_KEY, TOKEN_KEY, USER_KEY } from "../constants";
import type { CurrentUser, TokenPayload } from "../types/auth";
import { firebaseGetIdToken, firebaseLogout, firebaseSignIn, isFirebaseEnabled } from "./firebase";

export const login = async (username: string, password: string): Promise<void> => {
  let firebaseToken: string | null = null;

  if (isFirebaseEnabled() && username.includes("@")) {
    try {
      await firebaseSignIn(username, password);
      firebaseToken = await firebaseGetIdToken();
    } catch {
      firebaseToken = null;
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(firebaseToken ? { "X-Firebase-Token": firebaseToken } : {}),
  };

  const response = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: "POST",
    headers,
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    if (response.status === 401) throw new Error("Nieprawidłowe dane logowania");
    throw new Error(`Błąd logowania: ${response.statusText}`);
  }

  const data = (await response.json()) as { access: string; refresh: string };
  const decoded: TokenPayload = jwtDecode(data.access);

  localStorage.setItem(TOKEN_KEY, data.access);
  localStorage.setItem(REFRESH_KEY, data.refresh);
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      id: decoded.user_id,
      username: decoded.username,
      firstName: decoded.first_name,
      lastName: decoded.last_name,
      email: decoded.email,
      role: decoded.role,
      studentId: decoded.uczen_id,
      classId: decoded.klasa_id,
      teacherId: decoded.nauczyciel_id,
      parentId: decoded.rodzic_id,
      childrenIds: decoded.dzieci_ids,
    } satisfies CurrentUser),
  );
};

export const logout = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.clear();
  void firebaseLogout();
};

export const getCurrentUser = (): CurrentUser | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as CurrentUser;
  } catch {
    return null;
  }
};

export const getAuthToken = (): string | null => localStorage.getItem(TOKEN_KEY);

export const refreshAccessToken = async (): Promise<string | null> => {
  const refresh = localStorage.getItem(REFRESH_KEY);
  if (!refresh) return null;

  const response = await fetch(`${API_BASE_URL}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });

  if (!response.ok) {
    logout();
    return null;
  }

  const data = (await response.json()) as { access?: string };
  if (!data.access) {
    logout();
    return null;
  }

  localStorage.setItem(TOKEN_KEY, data.access);
  return data.access;
};