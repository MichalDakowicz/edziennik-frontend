## Part 5 – Authentication Service

File: `src/services/auth.ts`

```typescript
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL, TOKEN_KEY, REFRESH_KEY, USER_KEY } from "../constants";
import type { TokenPayload, CurrentUser, Role } from "../types/auth";

export const login = async (
    username: string,
    password: string,
): Promise<void> => {
    const res = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
        if (res.status === 401) throw new Error("Nieprawidłowe dane logowania");
        throw new Error(`Błąd logowania: ${res.statusText}`);
    }

    const data = await res.json();
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

export const getAuthToken = (): string | null =>
    localStorage.getItem(TOKEN_KEY);

export const refreshAccessToken = async (): Promise<string | null> => {
    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) return null;
    const res = await fetch(`${API_BASE_URL}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
        logout();
        return null;
    }
    const data = await res.json();
    if (!data.access) {
        logout();
        return null;
    }
    localStorage.setItem(TOKEN_KEY, data.access);
    return data.access;
};
```

---

