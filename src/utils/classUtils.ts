type ClassLike = {
  id?: number | null;
  numer?: number | string | null;
  nazwa?: string | null;
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
