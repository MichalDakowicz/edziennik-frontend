# Project Guidelines

## Code Style
- TypeScript strict mode enforced; unused variables cause build failures
- React functional components with hooks; no class components
- Tailwind CSS for styling with `cn()` utility (clsx + tailwind-merge) for conditional classes
- Form validation: React Hook Form + Zod schemas (see [AddPeriodGradeModal.tsx](src/components/teacher/AddPeriodGradeModal.tsx) for example)

## Architecture
- State Management: TanStack React Query for server state, local `useState` for UI
- Routing: React Router v6 with role-based guards (`uczen`, `nauczyciel`, `rodzic`, `admin`)
- Authentication: JWT tokens with automatic refresh; optional Firebase for email logins
- Data Flow: Centralized `fetchWithAuth` → typed API functions → query keys for cache invalidation → mutations with toast notifications

## Build and Test
- Install: `npm install`
- Dev: `npm run dev` (Vite dev server)
- Build: `npm run build` (TypeScript check + Vite production build)
- Preview: `npm run preview`
- API endpoint configurable via `VITE_API_BASE_URL` (defaults to Azure)

## Conventions
- Modals: Portal-based, controlled by parent state, ESC/backdrop closes
- Grade formatting: Special display (5.5 → "5+") via `gradeUtils.ts`; color-coded classes
- API responses: Polish field names (`nazwa/Nazwa`); 204 returns `undefined`
- Dark mode: localStorage class toggle + backend preference sync
- Query invalidation required after mutations to prevent stale UI</content>
<parameter name="filePath">c:\Users\infotech\Documents\GitHub\edziennik-frontend\.github\copilot-instructions.md