import { Link } from "react-router-dom";

export default function TeacherQuickActionsCard() {
    return (
        <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] overflow-hidden">
            <div className="flex items-center justify-between p-5 bg-surface-container-low">
                <h3 className="section-title text-base font-bold font-headline">
                    Szybkie akcje
                </h3>
            </div>

            <div className="space-y-1">
                <Link
                    to="/dashboard/teacher/grades"
                    className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors group"
                >
                    <div>
                        <p className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors font-body">
                            Wystawianie ocen
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5 font-body">
                            Dodaj i edytuj oceny uczniów
                        </p>
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors font-body">
                        Otwórz
                    </span>
                </Link>

                <Link
                    to="/dashboard/teacher/attendance"
                    className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors group"
                >
                    <div>
                        <p className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors font-body">
                            Sprawdzanie obecności
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5 font-body">
                            Zaznacz obecność uczniów
                        </p>
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors font-body">
                        Otwórz
                    </span>
                </Link>

                <Link
                    to="/dashboard/teacher/homework"
                    className="flex items-center justify-between p-4 hover:bg-surface-container-low transition-colors group"
                >
                    <div>
                        <p className="font-semibold text-sm text-on-surface group-hover:text-primary transition-colors font-body">
                            Zadania domowe
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5 font-body">
                            Twórz i aktualizuj zadania
                        </p>
                    </div>
                    <span className="text-xs font-medium text-on-surface-variant group-hover:text-primary transition-colors font-body">
                        Otwórz
                    </span>
                </Link>
            </div>
        </div>
    );
}
