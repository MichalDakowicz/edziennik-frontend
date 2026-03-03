## Part 29 – API Reference Summary Table

| Method | Endpoint              | Auth   | Query params                       | Used by                        |
| ------ | --------------------- | ------ | ---------------------------------- | ------------------------------ |
| POST   | `/auth/login/`        | None   | —                                  | Login                          |
| POST   | `/auth/refresh/`      | None   | —                                  | Token refresh                  |
| GET    | `/oceny/`             | Bearer | `uczen`                            | Grades                         |
| POST   | `/oceny/`             | Bearer | —                                  | Teacher grade entry            |
| PATCH  | `/oceny/<id>/`        | Bearer | —                                  | Teacher grade edit             |
| DELETE | `/oceny/<id>/`        | Bearer | —                                  | Teacher grade delete           |
| GET    | `/oceny-okresowe/`    | Bearer | `uczen`                            | Period grades                  |
| POST   | `/oceny-okresowe/`    | Bearer | —                                  | Teacher period grade           |
| GET    | `/oceny-koncowe/`     | Bearer | `uczen`                            | Final grades                   |
| GET    | `/zachowanie-punkty/` | Bearer | `uczen`                            | Behavior points                |
| POST   | `/zachowanie-punkty/` | Bearer | —                                  | Teacher behavior note          |
| GET    | `/frekwencja/`        | Bearer | `uczen_id`, `date_from`, `date_to` | Attendance                     |
| POST   | `/frekwencja/`        | Bearer | —                                  | Teacher attendance entry       |
| PATCH  | `/frekwencja/<id>/`   | Bearer | —                                  | Teacher attendance edit        |
| GET    | `/statusy/`           | Bearer | —                                  | Attendance statuses            |
| GET    | `/przedmioty/`        | Bearer | —                                  | Subjects                       |
| GET    | `/plany-zajec/`       | Bearer | `klasa_id`                         | Timetable                      |
| GET    | `/plan-wpisy/`        | Bearer | `plan_id`                          | Timetable entries              |
| GET    | `/godziny-lekcyjne/`  | Bearer | —                                  | Lesson hours                   |
| GET    | `/dni-tygodnia/`      | Bearer | —                                  | Days of week                   |
| GET    | `/zajecia/`           | Bearer | —                                  | Zajecia (subject+teacher link) |
| GET    | `/wiadomosci/`        | Bearer | `odbiorca`, `nadawca`              | Messages                       |
| POST   | `/wiadomosci/`        | Bearer | —                                  | Compose message                |
| PATCH  | `/wiadomosci/<id>/`   | Bearer | —                                  | Mark read                      |
| GET    | `/uczniowie/`         | Bearer | —                                  | Teacher: student list          |
| GET    | `/nauczyciele/`       | Bearer | —                                  | Message compose: teacher list  |
| GET    | `/users/<id>/`        | Bearer | —                                  | Resolve sender name            |
| GET    | `/klasy/`             | Bearer | —                                  | Class list                     |
| GET    | `/klasy/<id>/`        | Bearer | —                                  | Class info                     |
| GET    | `/profile/`           | Bearer | `user`                             | User settings                  |
| PATCH  | `/profile/<id>/`      | Bearer | —                                  | Save theme                     |
| GET    | `/prace-domowe/`      | Bearer | `klasa`, `przedmiot`               | Homework                       |
| POST   | `/prace-domowe/`      | Bearer | —                                  | Teacher add homework           |
| PATCH  | `/prace-domowe/<id>/` | Bearer | —                                  | Teacher edit homework          |
| DELETE | `/prace-domowe/<id>/` | Bearer | —                                  | Teacher delete homework        |
| GET    | `/wydarzenia/`        | Bearer | `klasa`                            | Events/test calendar           |
| POST   | `/wydarzenia/`        | Bearer | —                                  | Teacher add event              |
| GET    | `/lucky-number/`      | Bearer | `klasa`                            | Lucky number widget            |

---

