import { useMemo, useState } from "react";
import {
    Link,
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { 
    Menu, 
    X, 
    LogOut, 
    LayoutDashboard, 
    GraduationCap, 
    UserCheck, 
    CalendarRange, 
    BookOpen, 
    Mail, 
    User 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, logout } from "../services/auth";
import { getInboxMessages, getLuckyNumber } from "../services/api";
import { keys } from "../services/queryKeys";
import { Badge } from "./ui/Badge";
import { cn } from "../utils/cn";

type NavItem = {
    label: string;
    to: string;
    icon: React.ElementType;
    student?: boolean;
    parent?: boolean;
    teacher?: boolean;
};

const navItems: NavItem[] = [
    {
        label: "Pulpit",
        to: "/dashboard",
        icon: LayoutDashboard,
        student: true,
        parent: true,
        teacher: true,
    },
    { 
        label: "Oceny", 
        to: "/dashboard/grades", 
        icon: GraduationCap, 
        student: true, 
        parent: true 
    },
    {
        label: "Obecność",
        to: "/dashboard/attendance",
        icon: UserCheck,
        student: true,
        parent: true,
    },
    {
        label: "Kalendarz",
        to: "/dashboard/calendar",
        icon: CalendarRange,
        student: true,
        parent: true,
    },
    {
        label: "Prace domowe",
        to: "/dashboard/homework",
        icon: BookOpen,
        student: true,
        parent: true,
    },
    {
        label: "Wiadomości",
        to: "/dashboard/messages",
        icon: Mail,
        student: true,
        parent: true,
        teacher: true,
    },
    {
        label: "Profil",
        to: "/dashboard/profile",
        icon: User,
        student: true,
        parent: true,
        teacher: true,
    },
];

const isRoleAllowed = (role: string, item: NavItem): boolean => {
    if (role === "uczen") return Boolean(item.student);
    if (role === "rodzic") return Boolean(item.parent);
    if (role === "nauczyciel") return Boolean(item.teacher);
    return true;
};

export default function Layout() {
    const user = getCurrentUser();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const { data: inbox } = useQuery({
        queryKey: user ? keys.inbox(user.id) : ["inbox", "guest"],
        queryFn: () => (user ? getInboxMessages(user.id) : Promise.resolve([])),
        enabled: Boolean(user),
    });

    const { data: lucky } = useQuery({
        queryKey: ["lucky-number", user?.classId],
        queryFn: () =>
            user?.classId && user.role === "uczen"
                ? getLuckyNumber(user.classId)
                : Promise.resolve(null),
        enabled: Boolean(user?.role === "uczen" && user?.classId),
    });

    const unreadCount = useMemo(
        () => inbox?.filter((m) => !m.przeczytana).length ?? 0,
        [inbox],
    );

    if (!user) {
        return (
            <Link to="/" className="p-4 block">
                Powrót do logowania
            </Link>
        );
    }

    const items = navItems.filter((item) => isRoleAllowed(user.role, item));

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
            <div className="md:hidden p-4 border-b border-border bg-card flex items-center justify-between z-10 w-full fixed top-0 h-16">
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-lg">Modéa</h2>
                    {lucky?.lucky_number && (
                        <div className="bg-primary/20 text-primary w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold border border-primary/30">
                            {lucky.lucky_number}
                        </div>
                    )}
                </div>
                <button
                    className="p-2 hover:bg-accent rounded-md"
                    onClick={() => setMobileOpen((v) => !v)}
                    aria-label="Menu"
                >
                    {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            <div
                className={`fixed inset-y-0 left-0 z-40 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
                <aside className="h-full w-72 bg-card border-r border-border flex flex-col">
                    <div className="p-6 border-b border-border/50">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-foreground">
                                Modéa
                            </h1>
                            {lucky?.lucky_number && (
                                <div
                                    className="bg-primary/20 text-primary w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold border border-primary/30"
                                    title="Szczęśliwy numerek"
                                >
                                    {lucky.lucky_number}
                                </div>
                            )}
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground flex flex-col">
                            <span className="font-medium text-foreground">{user.firstName} {user.lastName}</span>
                            <span className="text-xs capitalize">{user.role}</span>
                        </div>
                    </div>
                    <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
                        <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-3">Menu</div>
                        {items.map((item) => {
                            const active =
                                location.pathname === item.to ||
                                (item.to !== "/dashboard" &&
                                    location.pathname.startsWith(item.to));
                            return (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={cn(
                                        "flex items-center justify-between px-3 py-2.5 rounded-md transition-all text-sm font-medium group relative overflow-hidden",
                                        active
                                            ? "bg-primary text-primary-foreground shadow-sm"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground",
                                    )}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <div className="flex items-center gap-3 relative z-10">
                                        <item.icon size={18} className={cn(active ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground")} />
                                        <span>{item.label}</span>
                                    </div>
                                    {item.to === "/dashboard/messages" &&
                                    unreadCount > 0 ? (
                                        <Badge
                                            variant={
                                                active ? "secondary" : "default"
                                            }
                                            className="ml-auto shrink-0 relative z-10 px-1.5 py-0.5"
                                        >
                                            {unreadCount}
                                        </Badge>
                                    ) : null}
                                </NavLink>
                            );
                        })}
                    </nav>
                    <div className="p-4 border-t border-border bg-muted/20">
                        <button
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-border bg-background hover:bg-muted/50 transition-colors text-sm font-medium text-foreground"
                            onClick={handleLogout}
                        >
                            <LogOut size={16} className="text-muted-foreground" />
                            Wyloguj się
                        </button>
                    </div>
                </aside>
            </div>

            {mobileOpen ? (
                <div
                    className="fixed inset-0 z-30 bg-background/80 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            ) : null}

            <main className="flex-1 overflow-y-auto pt-16 md:pt-0 bg-slate-50 dark:bg-background">
                <div className="container p-4 md:p-8 max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
