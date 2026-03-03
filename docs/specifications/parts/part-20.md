## Part 20 – Profile Page

File: `src/components/profile/ProfilePage.tsx`

### Data fetched

```typescript
const { data: profiles } = useQuery({
    queryKey: keys.userProfile(userId),
    queryFn: () => getUserSettings(userId),
});
const profile = profiles?.[0];
```

### Layout

**Card 1 – Personal info (read-only)**

- Full name
- Username
- Email
- Role badge

**Card 2 – Preferences**

- Theme selector: three buttons `Jasny | Ciemny | Systemowy`
- Current selection highlighted
- On click: `PATCH /profile/<profileId>/` with `{ theme_preference: 'light' | 'dark' | 'system' }`
- Show success toast on update

> Note: actual theme switching in the UI is implemented by toggling class on `<html>` element. Listen to `matchMedia('(prefers-color-scheme: dark)')` for system mode.

**Card 3 – Security (informational)**

- "Zmiana hasła jest możliwa poprzez administratora systemu."

---

