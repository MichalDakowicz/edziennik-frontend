## Context

Aktualny interfejs pokazuje komunikat „za ile lekcja”, który dobrze działa przed rozpoczęciem zajęć, ale jest mniej użyteczny, gdy lekcja już trwa. W praktyce użytkownik podczas lekcji oczekuje informacji „ile zostało do przerwy”. Zmiana dotyczy logiki prezentacji czasu względnego w widokach klienta bez zmian w API.

## Goals / Non-Goals

**Goals:**
- Zmienić priorytet informacji czasowej w trakcie aktywnej lekcji na odliczanie do przerwy (końca bieżącej lekcji).
- Ustalić jednoznaczne stany wyświetlania komunikatu: przed lekcją, w trakcie lekcji, przerwa, po zakończeniu dnia.
- Zapewnić spójny format tekstu i brak „skoków” semantycznych na granicach czasu.

**Non-Goals:**
- Zmiana struktury danych planu lekcji po stronie backendu.
- Wprowadzanie nowych endpointów lub modyfikacja payloadów API.
- Przebudowa całego widoku planu zajęć lub nawigacji kalendarza.

## Decisions

- Decyzja: Dla aktywnej lekcji źródłem odliczania SHALL być `endTime` bieżącego bloku lekcyjnego.
  - Rationale: Przerwa zaczyna się po zakończeniu aktualnej lekcji, więc to najbliższy użyteczny punkt czasu.
  - Alternatywa: Odliczanie do startu kolejnej lekcji. Odrzucono, bo nie odpowiada na pytanie użytkownika „ile do przerwy”.

- Decyzja: Logika statusu SHALL opierać się o deterministyczny automat stanów czasowych.
  - Rationale: Upraszcza testowanie i eliminuje niespójności na granicach minut.
  - Alternatywa: Rozproszone warunki w komponentach UI. Odrzucono, bo zwiększa ryzyko regresji i rozjazdu komunikatów.

- Decyzja: Przed lekcją system SHALL zachować komunikat „do lekcji”, a zmianę zastosować tylko w stanie aktywnej lekcji.
  - Rationale: Zachowuje intuicyjność przed rozpoczęciem zajęć i minimalizuje zakres zmiany.
  - Alternatywa: Ujednolicenie wszystkich stanów do „do przerwy”. Odrzucono, bo przed lekcją byłoby semantycznie mylące.

- Decyzja: W przypadku braku kompletnego czasu końca lekcji UI SHALL użyć bezpiecznego fallbacku tekstowego (bez błędnego odliczania).
  - Rationale: Lepszy brak odliczania niż niepoprawna informacja czasowa.
  - Alternatywa: Wyliczanie heurystyczne. Odrzucono ze względu na ryzyko błędnych danych.

## Risks / Trade-offs

- [Granice czasu i strefa czasowa] → Mitigation: Porównania wykonywać na ustandaryzowanych obiektach czasu i dodać testy przypadków granicznych (0-1 min, start/koniec lekcji).
- [Niespójność między widokami] → Mitigation: Wspólny helper/formatter dla komunikatu czasu zamiast duplikacji logiki.
- [Niepełne dane planu] → Mitigation: Jawny fallback tekstowy i brak odliczania liczbowego przy brakujących timestampach.
