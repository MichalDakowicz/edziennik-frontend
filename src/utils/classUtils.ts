type ClassLike = {
  id?: number | null;
  numer?: number | string | null;
  nazwa?: string | null;
};

type StudentLike = {
  id: number;
  klasa: number | null;
  user?: {
    id?: number | null;
    first_name?: string | null;
    last_name?: string | null;
  };
};

export const formatClassDisplay = (classInfo?: ClassLike | null): string => {
  const numer = String(classInfo?.numer ?? "").trim();
  const nazwa = String(classInfo?.nazwa ?? "").trim();

  if (numer && nazwa) {
    if (nazwa.toLowerCase().startsWith(numer.toLowerCase())) {
      const suffix = nazwa.slice(numer.length).trimStart();
      return `${numer}${suffix}`;
    }
    return `${numer}${nazwa}`;
  }

  if (numer) return numer;
  if (nazwa) return nazwa;
  if (classInfo?.id != null) return `#${classInfo.id}`;
  return "-";
};

const compareStudentsAlphabetically = <T extends StudentLike>(left: T, right: T): number => {
  const lastNameComparison = (left.user?.last_name ?? "").localeCompare(right.user?.last_name ?? "", "pl", {
    sensitivity: "base",
  });
  if (lastNameComparison !== 0) return lastNameComparison;

  const firstNameComparison = (left.user?.first_name ?? "").localeCompare(right.user?.first_name ?? "", "pl", {
    sensitivity: "base",
  });
  if (firstNameComparison !== 0) return firstNameComparison;

  return left.id - right.id;
};

export const sortStudentsAlphabetically = <T extends StudentLike>(students: T[]): T[] => {
  return [...students].sort(compareStudentsAlphabetically);
};

export const getClassJournalNumberMap = <T extends StudentLike>(
  students: T[],
  classId: number | null | undefined,
): Map<number, number> => {
  if (classId == null) return new Map();

  const sortedClassStudents = sortStudentsAlphabetically(
    students.filter((student) => student.klasa === classId),
  );

  return new Map(sortedClassStudents.map((student, index) => [student.id, index + 1]));
};
