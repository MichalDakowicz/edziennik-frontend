import { useEffect, useRef } from "react";

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        ref={contentRef}
        className={`bg-card/50 border border-border/50 rounded-xl shadow-xl w-full max-h-[90vh] flex flex-col ${className}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-6 border-b border-border/50">
          <h3 className="text-lg font-bold text-foreground">{title}</h3>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};