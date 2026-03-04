import { Card } from "../ui/Card";
import { getPercentageColor } from "../../utils/gradeUtils";

export default function AttendanceStats({ percentage, absences, lates }: { percentage: number; absences: number; lates: number }) {
  const colorClass = getPercentageColor(percentage);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-card border border-border">
        <p className="stat-label">Frekwencja</p>
        <p className={`stat-value mt-2 tabular-nums ${colorClass}`}>{Math.round(percentage)}%</p>
      </Card>
      <Card className="bg-card border border-border">
        <p className="stat-label">Liczba nieobecności</p>
        <p className="stat-value mt-2 tabular-nums">{absences}</p>
      </Card>
      <Card className="bg-card border border-border">
        <p className="stat-label">Liczba spóźnień</p>
        <p className="stat-value mt-2 tabular-nums">{lates}</p>
      </Card>
    </div>
  );
}