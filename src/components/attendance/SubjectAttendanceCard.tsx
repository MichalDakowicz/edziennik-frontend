interface SubjectAttendanceCardProps {
    name: string;
    percentage: number;
    absences: number;
    lates: number;
    status: "safe" | "warning" | "danger" | "perfect";
}

export default function SubjectAttendanceCard({
    name,
    percentage,
    absences,
    lates,
    status,
}: SubjectAttendanceCardProps) {
    const getStatusInfo = () => {
        switch (status) {
            case "safe":
                return {
                    label: "Bezpiecznie",
                    color: "text-green-600 dark:text-green-400",
                    bgColor: "bg-green-50 dark:bg-green-400/10",
                    barColor: "bg-green-500 dark:bg-green-400",
                };
            case "warning":
                return {
                    label: "Uwaga",
                    color: "text-amber-600 dark:text-amber-400",
                    bgColor: "bg-amber-50 dark:bg-amber-400/10",
                    barColor: "bg-amber-500 dark:bg-amber-400",
                };
            case "danger":
                return {
                    label: "Zagrożenie",
                    color: "text-red-600 dark:text-red-400",
                    bgColor: "bg-red-50 dark:bg-red-400/10",
                    barColor: "bg-red-500 dark:bg-red-400",
                };
            case "perfect":
                return {
                    label: "Idealnie",
                    color: "text-emerald-600 dark:text-emerald-400",
                    bgColor: "bg-emerald-50 dark:bg-emerald-400/10",
                    barColor: "bg-emerald-500 dark:bg-emerald-400",
                };
        }
    };

    const getPercentageColor = () => {
        if (percentage >= 95) return "text-green-600 dark:text-green-400";
        if (percentage >= 90) return "text-on-surface";
        return "text-red-600 dark:text-red-400";
    };

    const getIcon = () => {
        // Map subject names to material icons
        const iconMap: Record<string, string> = {
            "Matematyka": "functions",
            "Język Polski": "history_edu",
            "Język Angielski": "translate",
            "Biologia": "science",
            "Geografia": "public",
            "Filozofia": "psychology",
            "Fizyka": "bolt",
            "Chemia": "science",
            "Historia": "menu_book",
            "Informatyka": "computer",
        };
        return iconMap[name] || "school";
    };

    const getIconColor = () => {
        const colorMap: Record<string, string> = {
            "Matematyka": "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-400/10",
            "Język Polski": "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-400/10",
            "Język Angielski": "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-400/10",
            "Biologia": "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-400/10",
            "Geografia": "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-400/10",
            "Filozofia": "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-400/10",
        };
        return colorMap[name] || "text-primary bg-primary/10";
    };

    const statusInfo = getStatusInfo();

    return (
        <div className="bg-surface-container-lowest p-6 rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] hover:shadow-[0_12px_40px_-4px_rgba(25,28,29,0.08)] transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getIconColor()}`}>
                        <span className="material-symbols-outlined">{getIcon()}</span>
                    </div>
                    <h4 className="font-bold text-on-surface font-headline">{name}</h4>
                </div>
                <span className={`text-2xl font-black ${getPercentageColor()}`}>{percentage}%</span>
            </div>
            
            <div className="space-y-4">
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                    <div 
                        className={`h-full rounded-full transition-all duration-500 ${statusInfo.barColor}`}
                        style={{ width: `${percentage}%` }}
                    />
                </div>
                
                <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase">Nieob.</span>
                            <span className="text-xs font-bold text-on-surface">{absences}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-on-surface-variant uppercase">Spóźn.</span>
                            <span className="text-xs font-bold text-on-surface">{lates}</span>
                        </div>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${statusInfo.color} ${statusInfo.bgColor}`}>
                        {statusInfo.label}
                    </span>
                </div>
            </div>
        </div>
    );
}