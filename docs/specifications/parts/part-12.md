## Part 12 – Login Page

File: `src/components/Login.tsx`

**Behavior:**

- Centered card on `bg-[#09090b]` full-screen
- Username + password inputs
- On submit: calls `login()` from auth service
- On success: navigate to `/dashboard`
- On failure: show inline error message
- Redirect to `/dashboard` if already logged in (check `getCurrentUser()` in useEffect)
- The login accepts all roles (uczen, nauczyciel, rodzic, admin); do NOT restrict to only students like the PoC does

**Form fields:**

- `username` – text input, required, placeholder `nazwa_uzytkownika`
- `password` – password input, required, placeholder `••••••••`
- Submit button with spinner when loading

---

