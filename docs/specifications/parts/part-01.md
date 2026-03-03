## Part 1 – Technology Stack

### Core

| Concern    | Library          | Version |
| ---------- | ---------------- | ------- |
| Framework  | React            | 18.x    |
| Language   | TypeScript       | 5.x     |
| Build tool | Vite             | 5.x     |
| Routing    | react-router-dom | 6.x     |
| Styling    | Tailwind CSS     | 3.x     |
| Icons      | lucide-react     | latest  |
| JWT decode | jwt-decode       | 4.x     |

### Added libraries (not in current PoC)

| Concern                 | Library                    | Rationale                                      |
| ----------------------- | -------------------------- | ---------------------------------------------- |
| Data fetching / caching | `@tanstack/react-query` v5 | Automatic refetch, loading/error states, cache |
| Forms                   | `react-hook-form`          | Grade entry, compose message, homework         |
| Validation              | `zod`                      | Schema validation for forms                    |
| Date formatting         | `date-fns`                 | Format Polish dates, relative time             |
| Toast notifications     | `sonner`                   | Non-blocking notifications                     |
| Charts                  | `recharts`                 | Grade averages, attendance chart               |
| Infinite scroll         | `@tanstack/react-virtual`  | Long message / grade lists                     |

### package.json additions

```json
{
    "dependencies": {
        "@tanstack/react-query": "^5.0.0",
        "react-hook-form": "^7.0.0",
        "zod": "^3.0.0",
        "date-fns": "^3.0.0",
        "sonner": "^1.0.0",
        "recharts": "^2.0.0"
    }
}
```

---

