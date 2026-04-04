import type { Student, ClassInfo, Subject, Grade, PeriodGrade, FinalGrade } from '../../../types/api';

export type Modifier = '+' | '-' | '';

export interface GradePickerValue {
  base: number | null;
  modifier: Modifier;
  value: string;
}

export interface GradePickerProps {
  value?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  config?: {
    showModifiers?: boolean;
    minGrade?: number;
    maxGrade?: number;
  };
}

export interface FilterState {
  selectedClass: number | null;
  selectedSubject: number | null;
  selectedDate?: string;
  selectedWeight?: number;
  selectedDescription?: string;
}

export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  actions?: React.ReactNode;
}

export interface TeacherFilterBarProps {
  classes: ClassInfo[];
  subjects: Subject[];
  selectedClass: number | null;
  selectedSubject: number | null;
  onClassChange: (classId: number | null) => void;
  onSubjectChange: (subjectId: number | null) => void;
  showWeight?: boolean;
  selectedWeight?: number;
  onWeightChange?: (weight: number) => void;
  showDescription?: boolean;
  description?: string;
  onDescriptionChange?: (desc: string) => void;
  showCheckboxes?: boolean;
  doSredniej?: boolean;
  onDoSredniejChange?: (val: boolean) => void;
  punkty?: boolean;
  onPunktyChange?: (val: boolean) => void;
  opisowa?: boolean;
  onOpisowaChange?: (val: boolean) => void;
  isLoading?: boolean;
}

export interface StudentGradeRow {
  student: Student;
  grades: Grade[];
  periodGrades: PeriodGrade[];
  finalGrades: FinalGrade[];
  average: number;
  suggestedGrade: number;
}

export interface BatchGradeEntry {
  studentId: number;
  value: string;
}

export const GRADE_NUMBERS = [1, 3, 5, 2, 4, 6] as const;
export const MODIFIERS = ['+', '-'] as const;
export const WEIGHTS = [1, 2, 3, 4, 5] as const;

export function getNumericGrade(value: string): number {
  const n = parseFloat(value);
  return Number.isNaN(n) ? 0 : n;
}

export function formatGradeDisplay(value: string): string {
  const n = getNumericGrade(value);
  if (n === 0) return '-';
  const frac = Math.round((n - Math.floor(n)) * 100);
  if (frac === 50) return `${Math.floor(n)}+`;
  if (frac === 75) return `${Math.ceil(n)}-`;
  return String(Math.round(n));
}

export function parseGradeToBaseModifier(value: string): { base: number | null; modifier: Modifier } {
  const n = parseFloat(value);
  if (Number.isNaN(n) || n < 1 || n > 6) {
    return { base: null, modifier: '' };
  }
  const rounded = Math.round(n * 100) / 100;
  const frac = Math.round((rounded - Math.floor(rounded)) * 100) / 100;
  if (frac === 0) {
    return { base: Math.floor(rounded), modifier: '' };
  }
  if (frac === 0.5) {
    return { base: Math.floor(rounded), modifier: '+' };
  }
  if (frac === 0.75) {
    return { base: Math.ceil(rounded), modifier: '-' };
  }
  return { base: null, modifier: '' };
}

export function computeGradeValue(base: number, mod: Modifier): number {
  if (mod === '+') return base + 0.5;
  if (mod === '-') return base - 0.25;
  return base;
}

export function getGradeStyles(base: number | null, mod: Modifier): string {
  if (base === null) return 'bg-surface-container-highest text-on-surface-variant font-body border-border';
  const value = computeGradeValue(base, mod);
  if (value >= 5.0) return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50';
  if (value >= 4.0) return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50';
  if (value >= 3.0) return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/50';
  if (value >= 2.0) return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/50';
  return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/50';
}
