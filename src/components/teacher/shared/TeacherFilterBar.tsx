import type { TeacherFilterBarProps } from './types';

export default function TeacherFilterBar({
  classes,
  subjects,
  selectedClass,
  selectedSubject,
  onClassChange,
  onSubjectChange,
  showWeight = false,
  selectedWeight = 1,
  onWeightChange,
  showDescription = false,
  description = '',
  onDescriptionChange,
  showCheckboxes = false,
  doSredniej = true,
  onDoSredniejChange,
  punkty = false,
  onPunktyChange,
  opisowa = false,
  onOpisowaChange,
  isLoading = false,
}: TeacherFilterBarProps) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm mb-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-on-surface font-headline">Filtry</h3>
          <p className="text-xs text-on-surface-variant font-body mt-0.5">
            Wybierz przedmiot i klasę, aby wystawić oceny.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {selectedSubject && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Przedmiot:
              <span className="font-semibold">
                {subjects?.find((s) => s.id === selectedSubject)?.nazwa ?? `#${selectedSubject}`}
              </span>
            </span>
          )}
          {selectedClass && (
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-secondary-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              Klasa:
              <span className="font-semibold">
                {classes?.find((c) => c.id === selectedClass)?.nazwa ?? `#${selectedClass}`}
              </span>
            </span>
          )}
          {showWeight && (
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-highest px-2.5 py-1 text-on-surface-variant font-body">
              Waga: <span className="font-semibold text-on-surface font-body">{selectedWeight}</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1.5fr)] lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1.2fr)]">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Przedmiot</label>
            <select
              value={selectedSubject ?? ''}
              onChange={(e) => onSubjectChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
              disabled={isLoading}
            >
              <option value="">Wybierz przedmiot</option>
              {subjects?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nazwa}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Klasa</label>
            <select
              value={selectedClass ?? ''}
              onChange={(e) => onClassChange(e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
              disabled={isLoading}
            >
              <option value="">Wybierz klasę</option>
              {classes?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nazwa}
                </option>
              ))}
            </select>
          </div>
        </div>

        {showWeight && (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Waga (1-5)</label>
              <div className="inline-flex rounded-lg p-1 bg-surface-container border border-outline-variant/30">
                {[1, 2, 3, 4, 5].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => onWeightChange?.(w)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                      selectedWeight === w
                        ? 'bg-primary text-white shadow-sm'
                        : 'text-on-surface-variant hover:bg-surface-container-high'
                    }`}
                  >
                    {w}
                  </button>
                ))}
              </div>
            </div>

            {showDescription && (
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Opis / Kategoria</label>
                <input
                  value={description}
                  onChange={(e) => onDescriptionChange?.(e.target.value)}
                  placeholder="np. Klasówka, odpowiedź ustna..."
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            )}
          </div>
        )}

        {showCheckboxes && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-on-surface-variant mb-1.5">Dodatkowe opcje</label>
            <div className="space-y-1.5 rounded-lg border border-outline-variant/30 bg-surface-container-low px-3 py-2">
              <label className="flex items-center justify-between gap-2 text-xs text-on-surface">
                <span>Czy do średniej</span>
                <input
                  type="checkbox"
                  checked={doSredniej}
                  onChange={(e) => onDoSredniejChange?.(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer accent-primary"
                />
              </label>
              <label className="flex items-center justify-between gap-2 text-xs text-on-surface">
                <span>Czy punktowa</span>
                <input
                  type="checkbox"
                  checked={punkty}
                  onChange={(e) => onPunktyChange?.(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer accent-primary"
                />
              </label>
              <label className="flex items-center justify-between gap-2 text-xs text-on-surface">
                <span>Czy opisowa</span>
                <input
                  type="checkbox"
                  checked={opisowa}
                  onChange={(e) => onOpisowaChange?.(e.target.checked)}
                  className="w-4 h-4 rounded cursor-pointer accent-primary"
                />
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
