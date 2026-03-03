import { useMemo, useState } from "react";
import {
    Link,
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { Menu, X, LogOut } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, logout } from "../services/auth";
import { getInboxMessages, getLuckyNumber } from "../services/api";
import { keys } from "../services/queryKeys";
import { Badge } from "./ui/Badge";
import { cn } from "../utils/cn";

type NavItem = {
    label: string;
    to: string;
    student?: boolean;
    parent?: boolean;
    teacher?: boolean;
};

const navItems: NavItem[] = [
    {
        label: "Pulpit",
        to: "/dashboard",
        student: true,
        parent: true,
        teacher: true,
    },
    { label: "Oceny", to: "/dashboard/grades", student: true, parent: true },
    {
        label: "Obecność",
        to: "/dashboard/attendance",
        student: true,
        parent: true,
    },
    {
        label: "Plan lekcji",
        to: "/dashboard/timetable",
        student: true,
        parent: true,
    },
    {
        label: "Prace domowe",
        to: "/dashboard/homework",
        student: true,
        parent: true,
    },
    {
        label: "Terminarz",
        to: "/dashboard/events",
        student: true,
        parent: false,
    },
    {
        label: "Wiadomości",
        to: "/dashboard/messages",
        student: true,
        parent: true,
        teacher: true,
    },
    {
        label: "Profil",
        to: "/dashboard/profile",
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
        <div className="flex h-screen bg-zinc-950 text-foreground overflow-hidden">
            <div className="md:hidden p-4 border-b border-zinc-800 bg-card flex items-center justify-between z-10 w-full fixed top-0 h-16">
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
                <aside className="h-full w-72 bg-card border-r border-zinc-800 flex flex-col shadow-sm">
                    <div className="p-6">
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
                        <div className="mt-3 text-sm text-muted-foreground">
                            <p>
                                {user.firstName} {user.lastName}
                            </p>
                        </div>
                    </div>
                    <nav className="px-4 py-2 space-y-1 flex-1 overflow-y-auto">
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
                                        "flex items-center justify-between px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                                        active
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                                    )}
                                    onClick={() => setMobileOpen(false)}
                                >
                                    <span>{item.label}</span>
                                    {item.to === "/dashboard/messages" &&
                                    unreadCount > 0 ? (
                                        <Badge
                                            variant={
                                                active ? "secondary" : "default"
                                            }
                                            className="ml-ml-auto shrink-0"
                                        >
                                            {unreadCount}
                                        </Badge>
                                    ) : null}
                                </NavLink>
                            );
                        })}
                    </nav>
                    <div className="p-4 border-t border-zinc-800">
                        <button
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors text-sm font-medium"
                            onClick={handleLogout}
                        >
                            <LogOut size={16} />
                            Wyloguj
                        </button>
                    </div>
                </aside>
            </div>

            {mobileOpen ? (
                <div
                    className="fixed inset-0 z-30 bg-zinc-950/80 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            ) : null}

            <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
                <div className="container p-4 md:p-8 max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
