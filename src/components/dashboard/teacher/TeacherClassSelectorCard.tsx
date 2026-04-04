import { useTeacherClassSelector } from "../../../hooks/useTeacherClassSelector";
import { formatClassDisplay } from "../../../utils/classUtils";

export default function TeacherClassSelectorCard() {
    const { classes, selectedClassId, setSelectedClassId, isLoading } = useTeacherClassSelector();

    return (
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-colors group-hover:bg-primary/10" />
            <div className="text-on-surface-variant text-xs font-bold uppercase tracking-wider mb-3 font-body relative z-10">
                Aktywna klasa
            </div>
            <select
                value={selectedClassId ?? ""}
                onChange={(e) => setSelectedClassId(e.target.value ? Number(e.target.value) : null)}
                disabled={isLoading}
                className="w-full bg-surface-container-highest border-none rounded-xl py-2.5 px-4 text-sm font-semibold focus:ring-2 focus:ring-primary/20 transition-all font-body outline-none text-on-surface disabled:opacity-50 relative z-10"
            >
                <option value="">Wybierz klasę...</option>
                {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                        {formatClassDisplay(c)}
                    </option>
                ))}
            </select>
        </div>
    );
}
