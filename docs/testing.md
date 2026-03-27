# Testy w projekcie `edziennik-frontend`

Ten dokument opisuje, jak uruchamiać testy, jak jest skonfigurowane środowisko testowe oraz jak dopisywać kolejne testy w spójny sposób.

## 1. Stack testowy

W projekcie używamy:

- `vitest` — runner testów i asercje (`vi`, `expect`, `describe`, `it`)
- `jsdom` — środowisko przeglądarki dla testów komponentów React
- `@testing-library/react` — render komponentów i selektory z perspektywy użytkownika
- `@testing-library/user-event` — interakcje użytkownika (kliknięcia, klawiatura)
- `@testing-library/jest-dom` — dodatkowe matchery (`toBeInTheDocument`, itp.)
- `@vitest/coverage-v8` — raport pokrycia kodu testami

## 2. Konfiguracja

### Główne miejsca konfiguracji

- `package.json` — skrypty testowe
- `vite.config.ts` — konfiguracja `test` (środowisko, setup, coverage)
- `tsconfig.app.json` — typy dla Vitest (`vitest/globals`)
- `src/test/setup.ts` — setup globalny testów (`@testing-library/jest-dom/vitest`)

### Ważne ustawienia

W `vite.config.ts`:

- `environment: "jsdom"`
- `globals: true`
- `setupFiles: "./src/test/setup.ts"`
- coverage provider: `v8`

## 3. Uruchamianie testów

Z katalogu głównego projektu:

```zsh
npm test
```

Tryb watch:

```zsh
npm run test:watch
```

Raport pokrycia:

```zsh
npm run test:coverage
```

## 4. Aktualna struktura testów

Obecnie testy znajdują się obok testowanych plików (`*.test.ts` / `*.test.tsx`).

### Utils

- `src/utils/gradeUtils.test.ts`
- `src/utils/dateUtils.test.ts`
- `src/utils/cn.test.ts`

### Services

- `src/services/api.test.ts`

### Komponenty UI / Feature

- `src/components/ui/Badge.test.tsx`
- `src/components/ui/Button.test.tsx`
- `src/components/ui/Modal.test.tsx`
- `src/components/grades/GradeCard.test.tsx`
- `src/components/homework/HomeworkCard.test.tsx`

## 5. Co testujemy

### Testy jednostkowe (utils)

- formatowanie i mapowanie wartości (`gradeUtils`, `dateUtils`)
- logikę pomocniczą (`cn`)

### Testy serwisów API

- poprawne budowanie zapytań
- obsługę `401` i odświeżania tokenu
- obsługę `204 No Content`
- rzucanie błędów przy niepoprawnej odpowiedzi

### Testy komponentów

- renderowanie danych
- interakcje użytkownika (`click`, `Escape`)
- warunkowe renderowanie (np. badge `ZALEGŁE`)

## 6. Dobre praktyki dla nowych testów

1. **Testuj zachowanie, nie implementację**
   - preferuj selektory z perspektywy użytkownika (`getByRole`, `getByText`)
2. **Nazywaj testy po polsku i konkretnie**
   - np. `"zamyka się po ESC"`
3. **Mockuj granice systemu**
   - `fetch`, auth, czas (`vi.useFakeTimers`) tylko tam, gdzie potrzebne
4. **Trzymaj testy blisko kodu**
   - `Component.tsx` + `Component.test.tsx`
5. **Unikaj kruchych asercji klas CSS**
   - używaj ich tylko tam, gdzie kolor/variant jest częścią kontraktu UI

## 7. Typowe problemy i rozwiązania

### 1) `Link` bez routera

Jeśli testujesz komponent z `react-router-dom` `Link`, opakuj render w `MemoryRouter`.

### 2) Timeout przy `userEvent`

Nie mieszaj globalnych fake timerów z interakcjami bez potrzeby. Włączaj fake timery lokalnie dla konkretnego testu i pamiętaj o `vi.useRealTimers()`.

### 3) Mocki `vi.mock(...)` i hoisting

Dla mocków używanych w factory `vi.mock` stosuj `vi.hoisted(...)`, aby uniknąć błędów typu `Cannot access ... before initialization`.

## 8. Rozszerzanie pokrycia (rekomendacja)

Następne sensowne kroki:

- dodać testy stron (`Login`, `Layout`, `GradesPage`, `MessagesPage`)
- dodać testy hooków (`src/hooks`)
- dodać testy regresyjne dla krytycznych flow (logowanie, pobieranie danych, fallbacki błędów)

## 9. Checklista PR związana z testami

Przed mergem:

- [ ] `npm test` przechodzi lokalnie
- [ ] nowe funkcje mają testy jednostkowe lub komponentowe
- [ ] krytyczne bugfixy mają test regresyjny
- [ ] (opcjonalnie) `npm run test:coverage` wygenerowany i sprawdzony

---

W razie potrzeby można rozbudować dokument o sekcję CI (np. GitHub Actions) i minimalny próg coverage dla pull requestów.
