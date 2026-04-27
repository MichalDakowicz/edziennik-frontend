## 1. Analiza i przygotowanie logiki czasu

- [x] 1.1 Zlokalizować komponenty i helpery odpowiedzialne za komunikat „za ile lekcja” w widokach dashboardu/planu dnia.
- [x] 1.2 Zdefiniować i zaimplementować deterministyczne rozróżnienie stanów: przed lekcją, aktywna lekcja, przerwa, po lekcjach.
- [x] 1.3 Ustalić wspólny format komunikatów czasu oraz fallback dla brakującego `endTime` aktywnej lekcji.

## 2. Implementacja UI i formatterów

- [x] 2.1 Zmienić logikę aktywnej lekcji tak, aby odliczała do końca bieżącej lekcji (do przerwy), a nie do rozpoczęcia kolejnej.
- [x] 2.2 Zaktualizować etykiety tekstowe w UI dla wszystkich stanów czasowych, zachowując spójność językową.
- [x] 2.3 Ujednolicić użycie helpera/formatera czasu we wszystkich dotkniętych komponentach, aby uniknąć duplikacji warunków.

## 3. Walidacja i testy regresji

- [x] 3.1 Dodać lub zaktualizować testy jednostkowe dla przypadków granicznych (start/koniec lekcji, 0-1 min do końca, brak `endTime`).
- [ ] 3.2 Zweryfikować manualnie zachowanie widoku dla scenariuszy: przed lekcją, w trakcie lekcji, przerwa, po ostatniej lekcji.
- [ ] 3.3 Uruchomić zestaw testów projektu i potwierdzić brak regresji w istniejących widokach harmonogramu.
