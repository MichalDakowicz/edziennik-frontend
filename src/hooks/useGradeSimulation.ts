import { useState, useMemo } from "react";
import type { Grade } from "../types/api";
import { computeWeightedAverage, computeWeightedAverageWithOverrides } from "../utils/gradeUtils";

export interface UseGradeSimulationReturn {
  simulationActive: boolean;
  overrides: Map<number, string>;
  toggleSimulation: () => void;
  activateSimulation: () => void;
  setOverride: (gradeId: number, value: string) => void;
  clearOverride: (gradeId: number) => void;
  resetAll: () => void;
  realAvg: number;
  simulatedAvg: number;
  deltaAvg: number;
}

export function useGradeSimulation(grades: Grade[]): UseGradeSimulationReturn {
  const [simulationActive, setSimulationActive] = useState(false);
  const [overrides, setOverrides] = useState<Map<number, string>>(new Map());

  const realAvg = useMemo(() => computeWeightedAverage(grades), [grades]);
  const simulatedAvg = useMemo(
    () => computeWeightedAverageWithOverrides(grades, overrides),
    [grades, overrides],
  );
  const deltaAvg = simulatedAvg - realAvg;

  const toggleSimulation = () => {
    setSimulationActive((prev) => {
      if (prev) setOverrides(new Map());
      return !prev;
    });
  };

  const activateSimulation = () => {
    setSimulationActive(true);
  };

  const setOverride = (gradeId: number, value: string) => {
    setOverrides((prev) => {
      const next = new Map(prev);
      next.set(gradeId, value);
      return next;
    });
  };

  const clearOverride = (gradeId: number) => {
    setOverrides((prev) => {
      const next = new Map(prev);
      next.delete(gradeId);
      return next;
    });
  };

  const resetAll = () => setOverrides(new Map());

  return {
    simulationActive,
    overrides,
    toggleSimulation,
    activateSimulation,
    setOverride,
    clearOverride,
    resetAll,
    realAvg,
    simulatedAvg,
    deltaAvg,
  };
}
