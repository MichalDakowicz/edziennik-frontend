import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

type DeleteConfirmModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    itemName?: string;
};

export default function DeleteConfirmModal({
    open,
    onClose,
    onConfirm,
    title = "Usuń pracę domową",
    message = "Czy na pewno chcesz usunąć tę pracę domową? Tej operacji nie można cofnąć.",
    itemName,
}: DeleteConfirmModalProps) {
    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!open) return;
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        const target = contentRef.current?.querySelector<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        target?.focus();
        return () => window.removeEventListener("keydown", handleEsc);
    }, [onClose, open]);

    if (!open) return null;

    const modal = (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60"
            onClick={onClose}
            aria-modal
            role="dialog"
        >
            <div
                ref={contentRef}
                className="bg-surface-container-lowest rounded-3xl shadow-lg w-full max-w-md overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-8 pb-0">
                    <div className="w-14 h-14 rounded-full bg-error/10 flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-error text-3xl">delete_forever</span>
                    </div>
                    <h3 className="text-xl font-bold font-headline text-on-surface mb-2">{title}</h3>
                    <p className="text-sm text-on-surface-variant leading-relaxed">
                        {message}
                        {itemName && (
                            <span className="block mt-2 font-semibold text-on-surface">
                                „{itemName}"
                            </span>
                        )}
                    </p>
                </div>
                <div className="p-8 pt-6 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-surface-container-high text-on-surface rounded-full font-bold text-sm hover:bg-surface-container transition-colors"
                    >
                        Anuluj
                    </button>
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        style={{ backgroundColor: '#ba1a1a', color: '#ffffff' }}
                        className="flex-1 py-3 rounded-full font-bold text-sm hover:opacity-90 active:scale-95 transition-all"
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                        Usuń
                    </button>
                </div>
            </div>
        </div>
    );

    return createPortal(modal, document.body);
}
