import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

export const Modal = ({
  open,
  onClose,
  title,
  children,
  className = "max-w-lg"
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => {
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
      style={{ top: 0, left: 0, right: 0, bottom: 0 }}
      onClick={onClose}
      aria-modal
      role="dialog"
    >
      <div
        ref={contentRef}
        className={`bg-surface-container-lowest shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] rounded-[var(--radius)] w-full max-h-[90vh] flex flex-col shadow-lg ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 pb-2">
          <h3 className="text-lg font-bold text-on-surface font-body">{title}</h3>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};