## Part 28 – Environment and Build

File: `frontend/.env.example` (create this file):

```
VITE_API_BASE_URL=https://dziennik.polandcentral.cloudapp.azure.com/api
```

Update `src/constants.ts` to read from env:

```typescript
export const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ??
    "https://dziennik.polandcentral.cloudapp.azure.com/api";
```

---

