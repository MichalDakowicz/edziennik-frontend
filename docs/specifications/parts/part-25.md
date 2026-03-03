## Part 25 – State Management Rules

1. **Server state**: managed entirely by `@tanstack/react-query`. Never use `useState` for fetched data.
2. **UI state** (modals open/closed, selected tab, form inputs): `useState`.
3. **Auth state**: stored in `localStorage`, read via `getCurrentUser()`. No context needed.
4. **Theme**: stored in `UserProfile.theme_preference` (persisted to backend). Apply by toggling `dark` class on `document.documentElement`.

### Theme application (in `main.tsx` or `App.tsx`):

```typescript
const user = getCurrentUser();
if (user) {
    getUserSettings(user.id).then((profiles) => {
        const pref = profiles?.[0]?.theme_preference ?? "system";
        if (pref === "dark") document.documentElement.classList.add("dark");
        else if (pref === "light")
            document.documentElement.classList.remove("dark");
        else {
            const isDark = window.matchMedia(
                "(prefers-color-scheme: dark)",
            ).matches;
            document.documentElement.classList.toggle("dark", isDark);
        }
    });
}
```

---

