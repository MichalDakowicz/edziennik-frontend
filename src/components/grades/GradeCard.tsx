import type { Grade } from "../../types/api";
import { computeWeightedAverage, formatGradeValue, getGradeColor } from "../../utils/gradeUtils";

interface GradeCardProps {
  subjectName: string;
  grades: Grade[];
  onSelect: (grade: Grade) => void;
}

export default function GradeCard({ subjectName, grades, onSelect }: GradeCardProps) {
  const avg = computeWeightedAverage(grades);

  return (
    <div className="bg-card border border-border/50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">{subjectName}</h3>
        <span className="text-xs px-2 py-1 rounded border border-blue-900/30 bg-blue-900/20 text-primary">avg: {avg.toFixed(2)}</span>
      </div>
      <div className="space-y-2">
        {grades.map((grade) => (
          <button
            key={grade.id}
            className="w-full text-left bg-zinc-950 border border-border/50 rounded-lg p-2 hover:border-border/50"
            onClick={() => onSelect(grade)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground">{grade.opis ?? "Ocena"}</p>
                <p className="text-xs text-muted-foreground">{new Date(grade.data_wystawienia).toLocaleDateString("pl-PL")} · Waga: {grade.waga}</p>
              </div>
              <span className={`px-2 py-1 rounded border text-sm ${getGradeColor(grade.wartosc)}`}>{formatGradeValue(grade.wartosc)}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}