import { Card } from "../ui/Card";

export default function AttendanceStats({ percentage, absences, lates }: { percentage: number; absences: number; lates: number }) {
  const color = percentage >= 90 ? "text-emerald-400" : percentage >= 75 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="bg-card border-border/50">
        <p className="stat-label">Frekwencja</p>
        <p className={`stat-value mt-2 ${color}`}>{Math.round(percentage)}%</p>
      </Card>
      <Card className="bg-card border-border/50">
        <p className="stat-label">Liczba nieobecności</p>
        <p className="stat-value mt-2">{absences}</p>
      </Card>
      <Card className="bg-card border-border/50">
        <p className="stat-label">Liczba spóźnień</p>
        <p className="stat-value mt-2">{lates}</p>
      </Card>
    </div>
  );
}