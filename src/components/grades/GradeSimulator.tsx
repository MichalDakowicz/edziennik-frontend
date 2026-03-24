import { useMemo, useState } from "react";
import type { Grade, Subject } from "../../types/api";
import { simulateGradeNeeded } from "../../utils/gradeUtils";

interface GradeSimulatorProps {
  grades: Grade[];
  subjects: Subject[];
}

export default function GradeSimulator({ grades, subjects }: GradeSimulatorProps) {
  const [selectedSubjectId, setSelectedSubjectId] = useState<number>(subjects[0]?.id ?? 0);
  const [targetAvg, setTargetAvg] = useState(4);
  const [newGradeWeight, setNewGradeWeight] = useState(1);

  const subjectGrades = useMemo(
    () => grades.filter((grade) => grade.przedmiot === selectedSubjectId),
    [grades, selectedSubjectId],
  );

  const needed = simulateGradeNeeded(subjectGrades, targetAvg, newGradeWeight);

  return (
    <div className="bg-surface-container-lowest shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)]/50 rounded-xl p-4 space-y-3">
      <h3 className="section-title">Symulator oceny</h3>
      <label htmlFor="sim-subject" className="block text-sm text-on-surface-variant font-body">Przedmiot</label>
      <select id="sim-subject" className="input-base" value={selectedSubjectId} onChange={(event) => setSelectedSubjectId(Number(event.target.value))}>
        {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.nazwa ?? subject.Nazwa ?? `#${subject.id}`}</option>)}
      </select>
      <div className="grid md:grid-cols-2 gap-3">
        <div>
          <label htmlFor="sim-target" className="block text-sm text-on-surface-variant font-body">Docelowa średnia (1-6)</label>
          <input id="sim-target" className="input-base" type="number" min={1} max={6} step={0.01} value={targetAvg} onChange={(event) => setTargetAvg(Number(event.target.value))} />
        </div>
        <div>
          <label htmlFor="sim-weight" className="block text-sm text-on-surface-variant font-body">Waga nowej oceny (1-5)</label>
          <input id="sim-weight" className="input-base" type="number" min={1} max={5} value={newGradeWeight} onChange={(event) => setNewGradeWeight(Number(event.target.value))} />
        </div>
      </div>
      <p className="text-sm text-on-surface-variant font-body">
        {needed !== null
          ? `Aby uzyskać średnią ${targetAvg.toFixed(2)}, potrzebujesz oceny: ${needed.toFixed(2)}`
          : "Niemożliwe do osiągnięcia przy tej wadze"}
      </p>
    </div>
  );
}