export const Spinner = ({ label = "Ładowanie..." }: { label?: string }) => (
  <div className="flex items-center justify-center h-48 text-muted-foreground">{label}</div>
);