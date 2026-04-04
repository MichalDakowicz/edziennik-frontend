import { useMemo } from 'react';
import { Plus } from 'lucide-react';
import { computeGradeValue, getGradeStyles, GRADE_NUMBERS, MODIFIERS, type Modifier, type GradePickerProps } from '../shared/types';

export default function GradePicker({ value, onChange, disabled = false, config }: GradePickerProps) {
  const showModifiers = config?.showModifiers ?? true;
  const minGrade = config?.minGrade ?? 1;
  const maxGrade = config?.maxGrade ?? 6;

  const { base, modifier } = useMemo(() => {
    if (!value || !value.trim()) return { base: null as number | null, modifier: '' as Modifier };
    const n = parseFloat(value);
    if (Number.isNaN(n)) return { base: null as number | null, modifier: '' as Modifier };
    const rounded = Math.round(n * 100) / 100;
    const frac = Math.round((rounded - Math.floor(rounded)) * 100) / 100;
    if (frac === 0) {
      const b = Math.floor(rounded);
      return { base: b >= minGrade && b <= maxGrade ? b : null, modifier: '' as Modifier };
    }
    if (frac === 0.5) {
      const b = Math.floor(rounded);
      return { base: b >= minGrade && b <= maxGrade ? b : null, modifier: '+' as Modifier };
    }
    if (frac === 0.75) {
      const b = Math.ceil(rounded);
      return { base: b >= minGrade && b <= maxGrade ? b : null, modifier: '-' as Modifier };
    }
    return { base: null as number | null, modifier: '' as Modifier };
  }, [value, minGrade, maxGrade]);

  const setGradeValue = (num: number | null, mod: Modifier) => {
    if (num === null) {
      onChange('');
      return;
    }
    onChange(computeGradeValue(num, mod).toFixed(2));
  };

  const handleNumberSelect = (num: number) => {
    if (disabled) return;
    const currentMod = modifier;
    if (base === num) {
      setGradeValue(null, '');
      return;
    }
    let nextMod = currentMod;
    if (num === 1 && currentMod === '-') nextMod = '';
    if (num === 6 && currentMod === '+') nextMod = '';
    setGradeValue(num, nextMod);
  };

  const handleModifierSelect = (mod: Modifier) => {
    if (disabled || !base) return;
    if (mod === '+' && base === 6) return;
    if (mod === '-' && base === 1) return;
    const next = modifier === mod ? '' : mod;
    setGradeValue(base, next);
  };

  const activeStyles = useMemo(() => getGradeStyles(base, modifier), [base, modifier]);

  const displayValue = useMemo(() => {
    if (!value || !value.trim()) return '-';
    const n = parseFloat(value);
    if (Number.isNaN(n)) return value;
    const frac = Math.round((n - Math.floor(n)) * 100);
    if (frac === 50) return `${Math.floor(n)}+`;
    if (frac === 75) return `${Math.ceil(n)}-`;
    return String(Math.round(n));
  }, [value]);

  const filteredGrades = GRADE_NUMBERS.filter((n) => n >= minGrade && n <= maxGrade);

  return (
    <div className="flex items-start gap-4">
      <div className="relative">
        <button
          type="button"
          className={`w-24 h-24 md:w-28 md:h-28 flex items-center justify-center rounded-3xl border-2 transition-all duration-200 shadow-sm select-none border-dashed ${activeStyles} bg-background ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          disabled={disabled}
        >
          {base === null && modifier === '' ? (
            <Plus size={36} strokeWidth={1.5} className="text-on-surface-variant font-body" />
          ) : (
            <div className="flex items-baseline text-4xl md:text-5xl font-bold tabular-nums">
              {base}
              {modifier && <span className="text-2xl md:text-3xl ml-1 opacity-80">{modifier}</span>}
            </div>
          )}
        </button>

        <div className="absolute bottom-full right-full mb-2 mr-2 p-2 rounded-3xl shadow-lg z-50 w-72 bg-popover text-popover-foreground">
          <div className="grid grid-cols-4 gap-1.5">
            <div className="col-span-3 grid grid-cols-3 gap-1.5">
              {filteredGrades.map((n) => {
                const isActive = base === n;
                const styles = getGradeStyles(n, modifier);
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => handleNumberSelect(n)}
                    disabled={disabled}
                    className={`h-14 rounded-xl text-2xl font-bold transition-all border ${
                      isActive
                        ? `${styles} shadow-sm scale-[1.03] z-10 border-current`
                        : 'bg-surface-container-highest text-on-surface-variant font-body hover:bg-surface-container-highest/80 border-border disabled:opacity-50'
                    }`}
                  >
                    {n}
                  </button>
                );
              })}
            </div>

            {showModifiers && (
              <div className="flex flex-col gap-1.5">
                {MODIFIERS.map((mod) => {
                  const isActive = modifier === mod;
                  const isDisabled = !base || (mod === '+' && base === 6) || (mod === '-' && base === 1) || disabled;
                  const styles = base !== null ? getGradeStyles(base, mod) : 'bg-surface-container-highest text-on-surface-variant font-body border-border';
                  return (
                    <button
                      key={mod}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => handleModifierSelect(mod)}
                      className={`flex-1 rounded-xl text-2xl font-bold transition-all border disabled:opacity-20 disabled:cursor-not-allowed ${
                        isActive
                          ? `${styles} shadow-sm scale-[1.03] z-10 border-current`
                          : 'bg-surface-container-highest text-on-surface-variant font-body hover:bg-surface-container-highest/80 border-border'
                      }`}
                    >
                      {mod}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-24 h-24 rounded-xl bg-surface-container-low">
        <span className="text-3xl font-bold tabular-nums text-on-surface font-body">
          {displayValue}
        </span>
      </div>
    </div>
  );
}
