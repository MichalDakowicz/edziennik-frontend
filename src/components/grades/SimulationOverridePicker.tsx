import { useEffect, useRef } from "react";
import { formatGradeValue, getGradeColor, getGradeBorderColor } from "../../utils/gradeUtils";

const GRADE_OPTIONS: { value: string; label: string }[] = [
  { value: "1", label: "1" },
  { value: "2", label: "2" },
  { value: "2.5", label: "2+" },
  { value: "3", label: "3" },
  { value: "3.5", label: "3+" },
  { value: "3.75", label: "4-" },
  { value: "4", label: "4" },
  { value: "4.5", label: "4+" },
  { value: "4.75", label: "5-" },
  { value: "5", label: "5" },
  { value: "5.5", label: "5+" },
  { value: "5.75", label: "6-" },
  { value: "6", label: "6" },
];

interface SimulationOverridePickerProps {
  currentValue: string;
  originalValue: string;
  isOverridden: boolean;
  onSelect: (value: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export default function SimulationOverridePicker({
  currentValue,
  originalValue,
  isOverridden,
  onSelect,
  onClear,
  onClose,
}: SimulationOverridePickerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute left-0 right-0 z-50 mt-1 bg-surface-container-highest rounded-2xl shadow-2xl border border-outline/10 p-4 animate-in fade-in slide-in-from-top-1 duration-150"
    >
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-widest text-outline font-body">
          Wybierz ocenę symulowaną
        </p>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-surface-container transition-colors"
        >
          <span className="material-symbols-outlined text-sm text-outline">close</span>
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {GRADE_OPTIONS.map((opt) => {
          const isSelected = currentValue === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => {
                if (isSelected && isOverridden) {
                  onClear();
                } else {
                  onSelect(opt.value);
                }
              }}
              className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-bold border-b-2 transition-all hover:scale-110 active:scale-95 font-headline text-sm
                ${isSelected
                  ? `${getGradeColor(opt.value)} ${getGradeBorderColor(opt.value)} ring-2 ring-primary ring-offset-1 scale-105`
                  : `${getGradeColor(opt.value)} ${getGradeBorderColor(opt.value)} opacity-60 hover:opacity-100`
                }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {isOverridden && (
        <div className="mt-3 pt-3 border-t border-outline/10 flex items-center justify-between">
          <p className="text-xs text-outline font-body">
            Oryginał:{" "}
            <span className={`font-bold ${getGradeColor(originalValue)} px-1.5 py-0.5 rounded`}>
              {formatGradeValue(originalValue)}
            </span>
          </p>
          <button
            onClick={onClear}
            className="text-xs text-error font-bold hover:underline font-body"
          >
            Przywróć oryginał
          </button>
        </div>
      )}
    </div>
  );
}
