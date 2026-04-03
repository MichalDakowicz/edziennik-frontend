# Modéa – Electronic Gradebook Frontend

A modern React-based frontend for a Polish school electronic gradebook system (dziennik elektroniczny). Supports students, teachers, and parents with role-based access to grades, attendance, timetable, homework, messages, and more.

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite 5
- **Routing**: React Router DOM 6
- **Styling**: Tailwind CSS 3
- **Data Fetching**: TanStack React Query v5
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Charts**: Recharts
- **Dates**: date-fns
- **Auth**: JWT (jwt-decode)
- **Testing**: Vitest + Testing Library
- **Notifications**: Sonner

## Features

### Student Portal
- View grades (partial, period, final)
- Grade simulator (calculate needed grade for target average)
- Behavior points tracking
- Attendance overview with stats and charts
- Class timetable
- Homework assignments with due dates
- School events calendar
- Internal messaging system
- Lucky number of the day

### Teacher Portal
- Enter and manage student grades
- Mark attendance for classes
- Create and assign homework
- Manage school events
- Internal messaging

### Parent Portal
- View child's grades, attendance, homework
- Support for multiple children

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable UI primitives
│   ├── grades/          # Student grades pages
│   ├── attendance/      # Attendance pages
│   ├── timetable/      # Timetable pages
│   ├── messages/        # Messaging system
│   ├── homework/       # Homework pages
│   ├── events/          # Calendar/events
│   ├── profile/         # User profile
│   ├── teacher/         # Teacher-specific pages
│   └── calendar/        # Calendar components
├── services/
│   ├── auth.ts          # Authentication
│   ├── api.ts           # API client
│   └── queryKeys.ts     # React Query keys
├── hooks/               # Custom React hooks
├── types/               # TypeScript types
├── utils/               # Utility functions
└── constants.ts         # App constants
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Starts the development server at `http://localhost:5173`

### Build

```bash
npm run build
```

### Testing

```bash
npm run test           # Run tests once
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
```

## API Configuration

The app connects to a backend API. Configure the base URL in `src/constants.ts`:

```typescript
export const API_BASE_URL = "https://dziennik.polandcentral.cloudapp.azure.com/api";
```

## Authentication

The app uses JWT-based authentication:
- `access_token` - short-lived token stored in localStorage
- `refresh_token` - longer-lived token for refreshing access
- `user` - serialized user object with role information

Supported roles: `uczen` (student), `nauczyciel` (teacher), `rodzic` (parent), `admin`

## License

MIT
