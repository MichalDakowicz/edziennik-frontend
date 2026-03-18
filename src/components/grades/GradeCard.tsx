import type { Grade } from "../../types/api";
import { computeWeightedAverage, formatGradeValue, getGradeColor, getSuggestedGrade } from "../../utils/gradeUtils";
import { formatDate } from "../../utils/dateUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/Table";

interface GradeCardProps {
  subjectName: string;
  grades: Grade[];
  onSelect: (grade: Grade) => void;
}

export default function GradeCard({ subjectName, grades, onSelect }: GradeCardProps) {
  const avg = computeWeightedAverage(grades);
  const suggestedGrade = getSuggestedGrade(avg);

  return (
    <div className="bg-card rounded-xl overflow-hidden h-full flex flex-col hover:border-border/80 transition-shadow">
      <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
        <h3 className="font-semibold text-foreground">{subjectName}</h3>
        <div className="flex gap-2">
          <span className="text-xs px-2.5 py-1 rounded-md tabular-nums font-bold text-primary bg-primary/10 border border-primary/20 dark:bg-primary/20 dark:border-primary/30">
            Średnia: {avg.toFixed(2)}
          </span>
          <span className={`text-xs px-2.5 py-1 rounded-md tabular-nums font-bold ${getGradeColor(suggestedGrade)}`}>
            Propozycja: {suggestedGrade}
          </span>
        </div>
      </div>
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader className="bg-muted/50 hidden md:table-header-group">
            <TableRow className="hover:bg-transparent border-b border-border">
              <TableHead className="w-[80px] text-xs uppercase tracking-wider font-bold text-muted-foreground p-3">Ocena</TableHead>
              <TableHead className="text-xs uppercase tracking-wider font-bold text-muted-foreground p-3">Opis</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider font-bold text-muted-foreground w-[80px] p-3">Waga</TableHead>
              <TableHead className="text-right text-xs uppercase tracking-wider font-bold text-muted-foreground w-[120px] p-3">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {grades.map((grade) => (
              <TableRow 
                key={grade.id} 
                className="cursor-pointer hover:bg-muted/50 border-b border-border/50 last:border-0 transition-colors"
                onClick={() => onSelect(grade)}
              >
                <TableCell className="font-medium p-3">
                  <span className={`inline-flex items-center justify-center w-8 h-8 rounded-md font-bold text-sm ${getGradeColor(grade.wartosc)}`}>
                    {formatGradeValue(grade.wartosc)}
                  </span>
                </TableCell>
                <TableCell className="p-3">
                  <span className="block text-sm font-medium text-foreground">{grade.opis || "Ocena cząstkowa"}</span>
                  <span className="md:hidden text-xs text-muted-foreground mt-1 block">
                    {formatDate(grade.data_wystawienia)} · Waga: {grade.waga}
                  </span>
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground hidden md:table-cell p-3 font-medium">
                  {grade.waga}
                </TableCell>
                <TableCell className="text-right tabular-nums text-muted-foreground hidden md:table-cell p-3">
                  {formatDate(grade.data_wystawienia)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
