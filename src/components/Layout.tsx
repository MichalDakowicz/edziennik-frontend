import { useEffect, useMemo, useState } from "react";
import {
    Link,
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, logout } from "../services/auth";
import { getInboxMessages, getLuckyNumber, getStudents } from "../services/api";
import { keys } from "../services/queryKeys";
import { cn } from "../utils/cn";
import { getClassJournalNumberMap } from "../utils/classUtils";

type NavItem = {
    label: string;
    to: string;
    icon: string; // Changed to string for material symbols
    student?: boolean;
    parent?: boolean;
    teacher?: boolean;
};

const navItems: NavItem[] = [
    {
        label: "Inteligentny Kokpit",
        to: "/dashboard",
        icon: "dashboard",
        student: true,
        parent: true,
        teacher: true,
    },
    { 
        label: "Oceny", 
        to: "/dashboard/grades", 
        icon: "grade", 
        student: true, 
        parent: true 
    },
    {
        label: "Frekwencja",
        to: "/dashboard/attendance",
        icon: "rule",
        student: true,
        parent: true,
    },
    {
        label: "Plan Lekcji",
        to: "/dashboard/calendar",
        icon: "calendar_today",
        student: true,
        parent: true,
    },
    {
        label: "Zadania Domowe",
        to: "/dashboard/homework",
        icon: "assignment",
        student: true,
        parent: true,
    },
    {
        label: "Wiadomości",
        to: "/dashboard/messages",
        icon: "mail",
        student: true,
        parent: true,
        teacher: true,
    },
    {
        label: "Wystawianie ocen",
        to: "/dashboard/teacher/grades",
        icon: "grade",
        teacher: true,
    },
    {
        label: "Sprawdzanie obecności",
        to: "/dashboard/teacher/attendance",
        icon: "rule",
        teacher: true,
    },
    {
        label: "Zadania domowe",
        to: "/dashboard/teacher/homework",
        icon: "assignment",
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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("layout:sidebar-collapsed");
        setSidebarCollapsed(stored === "1");
    }, []);

    useEffect(() => {
        localStorage.setItem("layout:sidebar-collapsed", sidebarCollapsed ? "1" : "0");
    }, [sidebarCollapsed]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented) return;
            if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
            if (event.key.toLowerCase() !== "b") return;

            const target = event.target as HTMLElement | null;
            const isEditable = Boolean(
                target &&
                    (target.tagName === "INPUT" ||
                        target.tagName === "TEXTAREA" ||
                        target.tagName === "SELECT" ||
                        target.isContentEditable),
            );
            if (isEditable) return;

            event.preventDefault();

            if (window.matchMedia("(min-width: 768px)").matches) {
                setSidebarCollapsed((prev) => !prev);
                return;
            }
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

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

    const { data: studentsList } = useQuery({
        queryKey: user?.role === "uczen" ? ["students", "for-current-user", user?.id] : ["students", "na"],
        queryFn: getStudents,
        enabled: Boolean(user?.role === "uczen"),
    });

    const currentStudent = studentsList?.find((student) =>
        user?.studentId ? student.id === user.studentId : student.user?.id === user?.id,
    );
    const currentClassId = currentStudent?.klasa ?? user?.classId ?? null;
    const classJournalNumbers = getClassJournalNumberMap(studentsList ?? [], currentClassId);
    const studentJournalNumber = currentStudent ? classJournalNumbers.get(currentStudent.id) ?? null : null;
    const displayName = user
        ? user.role === "uczen" && studentJournalNumber !== null
            ? `${user.firstName} ${user.lastName} (${studentJournalNumber})`
            : `${user.firstName} ${user.lastName}`
        : "";

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
        <div className="flex h-screen bg-background text-on-surface overflow-hidden font-body">
            
            {/* SideNavBar (Desktop) */}
            <nav className={cn(
                "fixed left-0 top-0 h-full hidden md:flex flex-col p-4 gap-2 bg-surface-bright border-r border-outline-variant/20 transition-[width] duration-300 z-40",
                sidebarCollapsed ? "w-20" : "w-64 pt-20"
            )}>
                {/* Brand */}
                <div className={cn("mb-6 px-4 flex items-center justify-between", sidebarCollapsed && "pt-6 px-0 justify-center")}>
                    <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
                        </div>
                        {!sidebarCollapsed && (
                            <div>
                                <h2 className="text-xl font-black text-primary font-headline leading-tight">Modéa</h2>
                                <p className="text-[10px] uppercase tracking-widest text-outline font-bold leading-none">Academic Excellence</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Display */}
                {!sidebarCollapsed && (
                    <div className="px-4 mb-4 mt-2">
                        <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-on-surface truncate">{displayName}</p>
                                <p className="text-xs text-on-surface-variant capitalize">{user.role}</p>
                            </div>
                            {lucky?.lucky_number && user.role === "uczen" && (
                                <div className="bg-tertiary-fixed text-on-tertiary-fixed w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0" title="Twój szczęśliwy numerek">
                                    {lucky.lucky_number}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto space-y-1.5 no-scrollbar flex flex-col items-center w-full">
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
                                    "flex items-center w-full rounded-xl transition-all active:scale-95 group relative",
                                    sidebarCollapsed ? "justify-center p-3" : "px-4 py-3 gap-3",
                                    active
                                        ? "text-primary font-bold bg-surface-container-lowest shadow-sm"
                                        : "text-on-surface-variant hover:text-primary hover:translate-x-1"
                                )}
                                title={sidebarCollapsed ? item.label : undefined}
                            >
                                <span className="material-symbols-outlined shrink-0" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                    {item.icon}
                                </span>
                                {!sidebarCollapsed && (
                                    <span className="font-headline text-sm w-full flex justify-between items-center">
                                        {item.label}
                                        {item.to === "/dashboard/messages" && unreadCount > 0 && (
                                            <span className="bg-error text-white text-[10px] px-1.5 py-0.5 rounded-full">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </span>
                                )}
                                {sidebarCollapsed && item.to === "/dashboard/messages" && unreadCount > 0 && (
                                    <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-surface-bright"></span>
                                )}
                            </NavLink>
                        );
                    })}
                </div>

                {/* Bottom Actions */}
                <div className="mt-auto pt-4 flex flex-col gap-2 w-full">
                    {!sidebarCollapsed && (
                        <div className="mb-4">
                            <div className="relative w-full">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline text-sm">search</span>
                                </div>
                                <input 
                                    className="w-full bg-surface-container-highest border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-body outline-none text-on-surface placeholder-outline/70" 
                                    placeholder="Szukaj..." 
                                    type="text"
                                />
                            </div>
                        </div>
                    )}

                    <div className={cn("flex items-center", sidebarCollapsed ? "flex-col gap-4" : "justify-between px-2 mb-4")}>
                        <button 
                            className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant group flex relative"
                            onClick={() => navigate("/dashboard/profile")}
                            title="Profil"
                        >
                            <span className="material-symbols-outlined group-hover:text-primary transition-colors">person</span>
                        </button>
                        <button 
                            className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant relative group flex"
                            onClick={() => navigate("/dashboard/messages")}
                            title="Powiadomienia"
                        >
                            <span className="material-symbols-outlined group-hover:text-primary transition-colors">notifications</span>
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full ring-2 ring-surface-bright"></span>
                            )}
                        </button>
                        <button 
                            className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant group flex relative"
                            onClick={handleLogout}
                            title="Wyloguj"
                        >
                            <span className="material-symbols-outlined group-hover:text-error transition-colors">logout</span>
                        </button>
                        <button 
                            className="p-2 rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant group flex relative"
                            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                            title={sidebarCollapsed ? "Rozwiń" : "Zwiń"}
                        >
                            <span className="material-symbols-outlined group-hover:text-primary transition-colors">
                                {sidebarCollapsed ? 'dock_to_right' : 'dock_to_left'}
                            </span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom NavBar */}
            <nav className="fixed bottom-0 left-0 w-full bg-surface-container-lowest/95 backdrop-blur-md flex md:hidden justify-around items-center h-16 z-50 px-4 border-t border-outline-variant/20 pb-safe">
                {items.slice(0, 4).map((item) => {
                    const active = location.pathname === item.to || (item.to !== "/dashboard" && location.pathname.startsWith(item.to));
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={cn(
                                "flex flex-col items-center gap-1",
                                active ? "text-primary" : "text-outline"
                            )}
                        >
                            <span className="material-symbols-outlined" style={active ? { fontVariationSettings: "'FILL' 1" } : {}}>
                                {item.icon}
                            </span>
                            <span className={cn("text-[10px]", active ? "font-bold" : "font-medium")}>
                                {item.label}
                            </span>
                        </NavLink>
                    );
                })}
            </nav>

            {/* Main Canvas */}
            <main className={cn(
                "flex-1 overflow-y-auto bg-background transition-[margin] duration-300",
                sidebarCollapsed ? "md:ml-20" : "md:ml-64",
                "pb-20 md:pb-0" // Add bottom padding on mobile for navbar
            )}>
                <div className="container mx-auto p-4 md:p-8 max-w-7xl">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
