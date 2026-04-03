export function Legend() {
  return (
    <div className="flex flex-wrap gap-6 items-center text-xs text-on-surface-variant font-body">
      <span className="text-xs font-label text-outline uppercase tracking-wider">Legenda:</span>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-primary" />
        <span className="font-medium">STEM</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-secondary" />
        <span className="font-medium">Humanistyczne</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-tertiary" />
        <span className="font-medium">Arts</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-error" />
        <span className="font-medium">Wydarzenie</span>
      </div>
    </div>
  );
}
