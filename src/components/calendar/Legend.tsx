export function Legend() {
  return (
    <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-muted/80 border border-border" />
        <span>Lekcja</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-teal-500/20 border border-teal-500/30" />
        <span>Wydarzenie</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-3 h-3 rounded bg-violet-500/20 border border-violet-500/30" />
        <span>Praca domowa</span>
      </div>
    </div>
  );
}
