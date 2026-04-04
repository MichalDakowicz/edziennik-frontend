import { Link, useLocation } from "react-router-dom";

type BreadcrumbItem = {
    label: string;
    href?: string;
};

type BreadcrumbsProps = {
    items: BreadcrumbItem[];
};

const routeLabels: Record<string, string> = {
    dashboard: "Pulpit",
    teacher: "Panel nauczyciela",
    grades: "Oceny",
    attendance: "Frekwencja",
    homework: "Zadania domowe",
    messages: "Wiadomości",
    notifications: "Powiadomienia",
    profile: "Profil",
    calendar: "Kalendarz",
};

export function AutoBreadcrumbs({ items }: BreadcrumbsProps) {
    return (
        <nav className="flex items-center gap-1 text-sm text-on-surface-variant/60 mb-4">
            <Link to="/dashboard" className="hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-[18px]">home</span>
            </Link>
            {items.map((item, i) => (
                <span key={i} className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                    {item.href ? (
                        <Link to={item.href} className="hover:text-primary transition-colors">
                            {item.label}
                        </Link>
                    ) : (
                        <span className="text-on-surface font-semibold">{item.label}</span>
                    )}
                </span>
            ))}
        </nav>
    );
}

export function useAutoBreadcrumbs(overrides?: Record<string, string>): BreadcrumbItem[] {
    const location = useLocation();
    const segments = location.pathname.split("/").filter(Boolean);

    const items: BreadcrumbItem[] = [];
    let path = "";

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];
        path += `/${segment}`;

        if (segment === "dashboard" || segment === "teacher") {
            continue;
        }

        const isLast = i === segments.length - 1;
        const label = overrides?.[segment] || routeLabels[segment] || segment;

        if (isLast) {
            items.push({ label });
        } else {
            items.push({ label, href: path });
        }
    }

    return items;
}
