# Backend TODO — Pełna funkcjonalność modułu prac domowych

## 1. Model: `HomeworkSubmission` (Zgłoszenie pracy domowej)

**Opis:** Przechowuje informacje o oddaniu pracy domowej przez ucznia.

| Pole | Typ | Opis |
|---|---|---|
| `id` | int (PK) | Auto-increment |
| `homework` | int (FK → Homework) | Powiązane zadanie |
| `uczen` | int (FK → Uczeń) | Kto oddał |
| `tresc` | text | Treść odpowiedzi ucznia |
| `zalacznik` | file (nullable) | Opcjonalny plik załączony |
| `data_oddania` | datetime | Kiedy oddano |
| `status` | char/enum | `"oddane"` / `"sprawdzone"` / `"odrzucone"` |
| `ocena` | string (nullable) | Ocena wystawiona przez nauczyciela |
| `komentarz` | text (nullable) | Feedback nauczyciela do odpowiedzi |

### Wymagane endpointy:

| Endpoint | Metoda | Opis |
|---|---|---|
| `/prace-domowe/{id}/zgloszenia/` | GET | Lista zgłoszeń dla zadania (nauczyciel) |
| `/zgloszenia/` | GET | Lista zgłoszeń ucznia (uczeń) |
| `/zgloszenia/` | POST | Uczeń oddaje zadanie |
| `/zgloszenia/{id}/` | GET | Szczegóły zgłoszenia |
| `/zgloszenia/{id}/` | PATCH | Nauczyciel ocenia/aktualizuje status |
| `/zgloszenia/{id}/` | DELETE | Usunięcie zgłoszenia |

### UI które to odblokuje:
- Pasek postępu oddania (np. `18/24 oddanych`) w kartach zadań
- Przycisk "Zobacz odpowiedzi" w kartach zadań
- Tabela odpowiedzi uczniów w `HomeworkDetailPage` (obecnie mock data)
- Widget "Aktywność klas" w sidebarze strony listy zadań
- Widget "Wgląd w klasę" w sidebarze strony tworzenia zadania
- Statusy: Oddane / Spóźnione / Brak w tabeli uczniów
- Przycisk "Oceń" przy oddanych pracach
- Przycisk "Przypomnij" dla uczniów którzy nie oddali

---

## 2. Rozszerzenie modelu `Homework`

**Opis:** Aktualny model ma tylko: `id, klasa, przedmiot, nauczyciel, opis, data_wystawienia, termin`. Brakuje pól potrzebnych w UI.

### Potrzebne nowe pola:

| Pole | Typ | Opis |
|---|---|---|
| `tytul` | string (nullable) | Tytuł zadania (obecnie UI ma pole "Tytuł", ale API używa `opis` jako tytułu) |
| `waga` | int (default: 3) | Waga zadania (skala 1-5, obecnie UI ma selektor 1-5 ale pole nie jest wysyłane) |
| `obowiazkowe` | bool (default: true) | Czy zadanie obowiązkowe (toggle w UI tworzenia) |

### Wymagane zmiany API:
- `POST /prace-domowe/` — akceptuj nowe pola (`waga`, `obowiazkowe`, `tytul`)
- `PATCH /prace-domowe/{id}/` — umożliwia aktualizację nowych pól
- `GET /prace-domowe/` — zwracaj nowe pola w odpowiedzi

### UI które to odblokuje:
- Pole "Tytuł zadania" w formularzu tworzenia (obecnie unused)
- Selektor wagi 1-5 w sidebarze tworzenia (obecnie unused)
- Toggle "Zadanie obowiązkowe" w sidebarze tworzenia (obecnie unused)

---

## 3. Upload plików (Załączniki)

**Opis:** Nauczyciel może dodać pliki PDF/DOCX/JPG jako materiały do zadania.

### Potrzebne pola w `Homework`:

| Pole | Typ | Opis |
|---|---|---|
| `zalaczniki` | ManyToMany → FileAttachment | Lista załączników |

### Model: `FileAttachment`

| Pole | Typ | Opis |
|---|---|---|
| `id` | int (PK) | Auto-increment |
| `plik` | file | Plik (PDF, DOCX, JPG, max 25MB) |
| `nazwa` | string | Nazwa pliku |
| `rozmiar` | int | Rozmiar w bajtach |
| `data_dodania` | datetime | Kiedy dodano |

### Wymagane endpointy:
| Endpoint | Metoda | Opis |
|---|---|---|
| `/upload/` | POST | Upload pliku (multipart/form-data) |
| `/zalaczniki/{id}/` | GET | Pobierz plik |
| `/zalaczniki/{id}/` | DELETE | Usuń załącznik |

### UI które to odblokuje:
- Sekcja "Materiały i Załączniki" w formularzu tworzenia (obecnie zakomentowana)
- Upload drag-and-drop w formularzu tworzenia

---

## 4. Dedykowany endpoint detali zadania

**Opis:** Obecnie `HomeworkDetailPage` iteruje po wszystkich klasach i pobiera listę zadań dla każdej, żeby znaleźć jedno zadanie po ID. To jest nieefektywne.

### Wymagany endpoint:
| Endpoint | Metoda | Opis |
|---|---|---|
| `/prace-domowe/{id}/` | GET | Szczegóły pojedynczego zadania (bez needu podawania classId) |

### UI które to odblokuje:
- Szybsze ładowanie `HomeworkDetailPage`
- Eliminacja błędu "Nie znaleziono pracy domowej" przy bezpośrednim wejściu na URL

---

## 5. System powiadomień / przypomnień

**Opis:** Przycisk "Przypomnij" przy uczniach którzy nie oddali zadania.

### Wymagane endpointy:
| Endpoint | Metoda | Opis |
|---|---|---|
| `/prace-domowe/{id}/przypomnij/` | POST | Wyślij przypomnienie do wszystkich którzy nie oddali |
| `/prace-domowe/{id}/przypomnij/{uczen_id}/` | POST | Wyślij przypomnienie do konkretnego ucznia |

### UI które to odblokuje:
- Przycisk "Przypomnij" w tabeli odpowiedzi uczniów (status: Brak)

---

## 6. Eksport danych

**Opis:** Eksport listy zgłoszeń do CSV/PDF.

### Wymagane endpointy:
| Endpoint | Metoda | Opis |
|---|---|---|
| `/prace-domowe/{id}/zgloszenia/export/?format=csv` | GET | Eksport do CSV |
| `/prace-domowe/{id}/zgloszenia/export/?format=pdf` | GET | Eksport do PDF |

### UI które to odblokuje:
- Przycisk "Eksportuj" w sekcji odpowiedzi uczniów (obecnie zakomentowany)

---

## 7. Filtrowanie zadań po statusie (backend)

**Opis:** Obecnie filtrowanie "Aktywne / Do sprawdzenia / Wszystkie" działa po stronie frontendu. Przy dużej liczbie zadań warto przenieść to na backend.

### Wymagane parametry query:
| Parametr | Wartości | Opis |
|---|---|---|
| `status` | `active`, `overdue`, `all` | Filtr po terminie |
| `przedmiot` | int ID | Filtr po przedmiocie |

### Endpoint:
`GET /prace-domowe/?klasa={id}&status={status}&przedmiot={id}`

---

## Podsumowanie priorytetów

| Priorytet | Element | Złożoność |
|---|---|---|
| **HIGH** | Model `HomeworkSubmission` + CRUD endpoints | Średnia |
| **HIGH** | Endpoint `/prace-domowe/{id}/` (detale) | Niska |
| **MEDIUM** | Rozszerzenie `Homework` (tytul, waga, obowiazkowe) | Niska |
| **MEDIUM** | Powiadomienia / przypomnienia | Średnia |
| **LOW** | Upload plików (załączniki) | Wysoka |
| **LOW** | Eksport CSV/PDF | Średnia |
| **LOW** | Filtrowanie zadań po statusie (backend) | Niska |
