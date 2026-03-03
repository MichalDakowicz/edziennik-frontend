## Part 9 – Shared UI Components

### `Card.tsx`

```tsx
export const Card = ({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) => (
    <div
        className={`bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 ${className}`}
    >
        {children}
    </div>
);
```

### `Badge.tsx`

```tsx
type Variant =
    | "default"
    | "success"
    | "warning"
    | "danger"
    | "info"
    | "neutral";
const variants: Record<Variant, string> = {
    default: "bg-zinc-800 text-zinc-300 border-zinc-700",
    success: "bg-emerald-900/20 text-emerald-400 border-emerald-900/30",
    warning: "bg-yellow-900/20 text-yellow-400 border-yellow-900/30",
    danger: "bg-red-900/20 text-red-400 border-red-900/30",
    info: "bg-blue-900/20 text-blue-400 border-blue-900/30",
    neutral: "bg-zinc-900 text-zinc-400 border-zinc-800",
};
export const Badge = ({
    children,
    variant = "default",
}: {
    children: React.ReactNode;
    variant?: Variant;
}) => (
    <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[variant]}`}
    >
        {children}
    </span>
);
```

### `Modal.tsx`

```tsx
export const Modal = ({
    open,
    onClose,
    title,
    children,
}: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}) => {
    if (!open) return null;
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-zinc-800">
                    <h3 className="text-lg font-bold text-zinc-100">{title}</h3>
                </div>
                <div className="p-6 overflow-y-auto flex-1">{children}</div>
            </div>
        </div>
    );
};
```

### `Spinner.tsx`

```tsx
export const Spinner = ({ label = "Ładowanie..." }: { label?: string }) => (
    <div className="flex items-center justify-center h-48 text-zinc-500">
        {label}
    </div>
);
```

### `EmptyState.tsx`

```tsx
export const EmptyState = ({ message }: { message: string }) => (
    <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 p-12 text-center text-zinc-500">
        {message}
    </div>
);
```

---

