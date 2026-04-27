## Why

Obecny komunikat „za ile lekcja” jest mniej użyteczny w trakcie trwania zajęć, bo użytkownik częściej chce wiedzieć, ile czasu zostało do najbliższej przerwy. Zmiana poprawi czytelność informacji czasowej i lepiej odpowie na realny kontekst pracy ucznia i nauczyciela.

## What Changes

- Zastąpienie komunikatu czasu względnego „za ile lekcja” komunikatem „ile zostało do przerwy” w kontekście aktywnej lekcji.
- Ujednolicenie logiki wyliczania odliczania na podstawie końca bieżącego bloku lekcyjnego.
- Dodanie jasnych stanów granicznych: przed lekcją, w trakcie lekcji, przerwa, oraz po zakończeniu dnia.
- Dostosowanie tekstów UI tak, aby komunikaty były spójne językowo i jednoznaczne dla użytkownika.

## Capabilities

### New Capabilities
- `break-countdown-display`: Wyświetlanie odliczania do najbliższej przerwy zamiast odliczania do rozpoczęcia lekcji, gdy lekcja już trwa.

### Modified Capabilities
- _Brak zmian istniejących capability speców._

## Impact

- Affected code: komponenty UI odpowiedzialne za etykietę czasu przy lekcji (widok dashboardu/najbliższej lekcji i ewentualnie widok planu dnia), oraz helpery czasu.
- APIs: brak zmian API backendowego.
- Dependencies: brak nowych zależności.
- Systems: zmiana zachowania warstwy prezentacji czasu po stronie klienta.
