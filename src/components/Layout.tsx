import { useEffect, useMemo, useRef, useState } from "react";
import {
    Link,
    NavLink,
    Outlet,
    useLocation,
    useNavigate,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, logout } from "../services/auth";
import { getClasses, getInboxMessages, getLuckyNumber } from "../services/api";
import { keys } from "../services/queryKeys";
import { cn } from "../utils/cn";
import { formatClassDisplay } from "../utils/classUtils";
import { usePageSearch } from "../hooks/usePageSearch";
import PageSearchDropdown from "./PageSearchDropdown";
import logo from "../assets/logo_example.svg";

type NavItem = {
    label: string;
    to: string;
    icon: string;
    student?: boolean;
    parent?: boolean;
    teacher?: boolean;
};

const navItems: NavItem[] = [
    {
        label: "Pulpit",
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
        label: "Kalendarz",
        to: "/dashboard/calendar",
        icon: "calendar_month",
        student: true,
        parent: true,
    },
    {
        label: "Zadania domowe",
        to: "/dashboard/homework",
        icon: "assignment",
        student: true,
        parent: true,
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
    {
        label: "Wiadomości",
        to: "/dashboard/messages",
        icon: "mail",
        student: true,
        parent: true,
        teacher: true,
    },
    {
        label: "Powiadomienia",
        to: "/dashboard/notifications",
        icon: "notifications",
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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchOpen, setSearchOpen] = useState(false);
    const [searchSelectedIndex, setSearchSelectedIndex] = useState(-1);
    const searchInputRef = useRef<HTMLInputElement>(null);

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

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.defaultPrevented) return;
            if (!(event.ctrlKey || event.metaKey) || event.altKey || event.shiftKey) return;
            if (event.key.toLowerCase() !== "k") return;
            event.preventDefault();
            if (sidebarCollapsed) {
                setSidebarCollapsed(false);
                setTimeout(() => searchInputRef.current?.focus(), 300);
            } else {
                searchInputRef.current?.focus();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [sidebarCollapsed]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
                setProfileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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

    const { data: teacherClasses } = useQuery({
        queryKey: keys.classes(),
        queryFn: getClasses,
        enabled: user?.role === "nauczyciel" || user?.role === "admin",
    });

    const teacherClassId = useMemo(() => {
        if (user?.role !== "nauczyciel" && user?.role !== "admin") return null;
        const stored = sessionStorage.getItem("teacher:selected-class-id");
        const id = stored ? Number(stored) : null;
        if (id && teacherClasses?.some((c) => c.id === id)) return id;
        return null;
    }, [teacherClasses, user?.role]);

    const setTeacherClassId = (id: number | null) => {
        if (id === null) {
            sessionStorage.removeItem("teacher:selected-class-id");
        } else {
            sessionStorage.setItem("teacher:selected-class-id", String(id));
        }
    };

    const unreadCount = useMemo(
        () => inbox?.filter((m) => !m.przeczytana).length ?? 0,
        [inbox],
    );

    const searchResults = usePageSearch(searchQuery, user?.role ?? "uczen");

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
                "fixed left-0 top-0 h-full hidden md:flex flex-col p-4 gap-2 bg-surface-bright transition-[width] duration-300 z-40",
                sidebarCollapsed ? "w-20" : "w-64 pt-4"
            )}>
                {/* Brand */}
                <div className={cn("flex items-center justify-between", sidebarCollapsed && "pt-0 px-0 justify-center")}>
                    <div className={cn("flex items-center gap-3", sidebarCollapsed && "justify-center")}>
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shrink-0">
                            <img src={logo} alt="Logo" className="w-6 h-6 object-contain brightness-0 invert" />
                        </div>
                        {!sidebarCollapsed && (
                            <div>
                                <h2 className="text-xl font-black text-primary font-headline leading-tight">Modéa</h2>
                            </div>
                        )}
                    </div>
                    {!sidebarCollapsed && (
                        <button
                            className="rounded-full hover:bg-surface-container-high transition-colors text-on-surface-variant shrink-0"
                            onClick={() => setSidebarCollapsed(true)}
                            title="Zwiń"
                        >
                            <span className="material-symbols-outlined">dock_to_left</span>
                        </button>
                    )}
                </div>

                {/* Nav Links */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1.5 no-scrollbar flex flex-col items-center w-full">
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
                    {sidebarCollapsed ? (
                        <button
                            className="w-full flex items-center justify-center p-3 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface-variant hover:text-primary"
                            onClick={() => {
                                setSidebarCollapsed(false);
                                setTimeout(() => searchInputRef.current?.focus(), 300);
                            }}
                            title="Szukaj"
                        >
                            <span className="material-symbols-outlined">search</span>
                        </button>
                    ) : (
                        <div className="mb-4">
                            <div className="relative w-full">
                                {searchOpen && searchQuery.trim() && (
                                    <PageSearchDropdown
                                        results={searchResults}
                                        selectedIndex={searchSelectedIndex}
                                        query={searchQuery}
                                        onSelect={(page) => {
                                            navigate(page.to);
                                            setSearchQuery("");
                                            setSearchOpen(false);
                                            setSearchSelectedIndex(-1);
                                        }}
                                    />
                                )}
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <span className="material-symbols-outlined text-outline text-sm">search</span>
                                </div>
                                <input
                                    ref={searchInputRef}
                                    className="w-full bg-surface-container-highest border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all font-body outline-none text-on-surface placeholder-outline/70"
                                    placeholder="Szukaj... (Ctrl+K)"
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setSearchSelectedIndex(-1);
                                        setSearchOpen(true);
                                    }}
                                    onFocus={() => setSearchOpen(true)}
                                    onBlur={() => {
                                        setTimeout(() => setSearchOpen(false), 150);
                                    }}
                                    onKeyDown={(e) => {
                                        if (!searchOpen || !searchQuery.trim()) return;
                                        if (e.key === "ArrowDown") {
                                            e.preventDefault();
                                            setSearchSelectedIndex((i) =>
                                                Math.min(i + 1, searchResults.length - 1),
                                            );
                                        } else if (e.key === "ArrowUp") {
                                            e.preventDefault();
                                            setSearchSelectedIndex((i) => Math.max(i - 1, -1));
                                        } else if (e.key === "Enter") {
                                            e.preventDefault();
                                            const target =
                                                searchSelectedIndex >= 0
                                                    ? searchResults[searchSelectedIndex]
                                                    : searchResults[0];
                                            if (target) {
                                                navigate(target.to);
                                                setSearchQuery("");
                                                setSearchOpen(false);
                                                setSearchSelectedIndex(-1);
                                            }
                                        } else if (e.key === "Escape") {
                                            setSearchOpen(false);
                                            setSearchQuery("");
                                            setSearchSelectedIndex(-1);
                                            searchInputRef.current?.blur();
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="relative" ref={profileMenuRef}>
                        <button 
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all active:scale-95 group",
                                sidebarCollapsed ? "justify-center" : "hover:text-primary hover:translate-x-1"
                            )}
                            onClick={() => sidebarCollapsed ? setSidebarCollapsed(false) : setProfileMenuOpen(!profileMenuOpen)}
                            title={sidebarCollapsed ? "Rozwiń" : "Profil"}
                        >
                            <div className="relative shrink-0">
                                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                </div>
                                {lucky?.lucky_number && user.role === "uczen" && (
                                    <div className="absolute -top-1 -right-1 bg-tertiary-fixed text-on-tertiary-fixed w-4 h-4 rounded-full flex items-center justify-center font-bold text-[10px] ring-2 ring-surface-bright" title="Twój szczęśliwy numerek">
                                        {lucky.lucky_number}
                                    </div>
                                )}
                            </div>
                            {!sidebarCollapsed && (
                                <>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-bold text-on-surface truncate">{user.firstName}</p>
                                        <p className="text-sm font-bold text-on-surface truncate">{user.lastName}</p>
                                    </div>
                                    <span className="material-symbols-outlined text-on-surface-variant text-sm shrink-0">
                                        {profileMenuOpen ? 'expand_less' : 'expand_more'}
                                    </span>
                                </>
                            )}
                        </button>

                        {profileMenuOpen && (
                            <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface rounded-xl shadow-lg border border-outline/10 overflow-hidden z-50">
                                {(user.role === "nauczyciel" || user.role === "admin") && teacherClasses && teacherClasses.length > 0 && (
                                    <div className="px-4 py-3 border-b border-outline/10">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1.5">
                                            Aktywna klasa
                                        </label>
                                        <select
                                            value={teacherClassId ?? ""}
                                            onChange={(e) => setTeacherClassId(e.target.value ? Number(e.target.value) : null)}
                                            className="w-full bg-surface-container-highest border-none rounded-lg py-1.5 px-3 text-xs font-semibold focus:ring-2 focus:ring-primary/20 transition-all outline-none text-on-surface"
                                        >
                                            <option value="">Wybierz klasę...</option>
                                            {teacherClasses.map((c) => (
                                                <option key={c.id} value={c.id}>
                                                    {formatClassDisplay(c)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-on-surface hover:bg-surface-container transition-colors"
                                    onClick={() => {
                                        setProfileMenuOpen(false);
                                        navigate("/dashboard/profile");
                                    }}
                                >
                                    <span className="material-symbols-outlined text-on-surface">settings</span>
                                    Ustawienia
                                </button>
                                <button
                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error hover:bg-surface-container transition-colors"
                                    onClick={() => {
                                        setProfileMenuOpen(false);
                                        handleLogout();
                                    }}
                                >
                                    <span className="material-symbols-outlined">logout</span>
                                    Wyloguj
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Mobile Bottom NavBar */}
            <nav className="fixed bottom-0 left-0 w-full bg-surface-container-lowest/95 backdrop-blur-md flex md:hidden justify-around items-center h-16 z-50 px-4 pb-safe">
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
