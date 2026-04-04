import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserSettings } from "../../services/api";
import { getCurrentUser } from "../../services/auth";
import { keys } from "../../services/queryKeys";
import { useTheme, type Theme } from "../ThemeProvider";
import { ErrorState } from "../ui/ErrorState";
import { Spinner } from "../ui/Spinner";
import { Badge } from "../ui/Badge";
import { cn } from "../../utils/cn";
import { AutoBreadcrumbs, useAutoBreadcrumbs } from "../ui/Breadcrumbs";

type NotificationPref = {
    id: string;
    label: string;
    description: string;
    icon: string;
    iconBg: string;
    iconColor: string;
    enabled: boolean;
};

const sections = [
    { id: "profil", label: "Profil", icon: "person" },
    { id: "wyglad", label: "Wygląd", icon: "palette" },
    {
        id: "powiadomienia",
        label: "Powiadomienia",
        icon: "notifications_active",
    },
    { id: "bezpieczenstwo", label: "Bezpieczeństwo", icon: "shield" },
];

export default function ProfilePage() {
    const user = getCurrentUser();
    const { theme: selectedTheme, setTheme: handleThemeChange } = useTheme();
    const [activeSection, setActiveSection] = useState("profil");

    const [notifications, setNotifications] = useState<NotificationPref[]>([
        {
            id: "grades",
            label: "Nowe oceny",
            description: "Otrzymuj alert natychmiast po wpisaniu oceny",
            icon: "grade",
            iconBg: "bg-blue-50 dark:bg-blue-400/10",
            iconColor: "text-blue-600 dark:text-blue-400",
            enabled: true,
        },
        {
            id: "messages",
            label: "Wiadomości",
            description: "Powiadomienia o nowych wiadomościach od nauczycieli",
            icon: "mail",
            iconBg: "bg-purple-50 dark:bg-purple-400/10",
            iconColor: "text-purple-600 dark:text-purple-400",
            enabled: true,
        },
        {
            id: "homework",
            label: "Zadania domowe",
            description: "Przypomnienia o nadchodzących terminach",
            icon: "assignment",
            iconBg: "bg-orange-50 dark:bg-orange-400/10",
            iconColor: "text-orange-600 dark:text-orange-400",
            enabled: true,
        },
        {
            id: "announcements",
            label: "Ogłoszenia szkolne",
            description: "Ważne komunikaty od dyrekcji i administracji",
            icon: "campaign",
            iconBg: "bg-green-50 dark:bg-green-400/10",
            iconColor: "text-green-600 dark:text-green-400",
            enabled: true,
        },
    ]);

    const profileQuery = useQuery({
        queryKey: user ? keys.userProfile(user.id) : ["profile", "na"],
        queryFn: () => getUserSettings(user?.id as number),
        enabled: Boolean(user),
    });

    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.scrollY + 120;
            for (const section of [...sections].reverse()) {
                const el = document.getElementById(section.id);
                if (el && el.offsetTop <= scrollPos) {
                    setActiveSection(section.id);
                    break;
                }
            }
        };

        const scrollContainer = document.querySelector(
            '[class*="overflow-y-auto"]',
        );
        if (scrollContainer) {
            scrollContainer.addEventListener("scroll", handleScroll, {
                passive: true,
            });
            return () =>
                scrollContainer.removeEventListener("scroll", handleScroll);
        }
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: "-20% 0px -70% 0px", threshold: 0 },
        );

        sections.forEach((section) => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [profileQuery.data]);

    const scrollToSection = (id: string) => {
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const toggleNotification = (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n.id === id ? { ...n, enabled: !n.enabled } : n)),
        );
    };

    const breadcrumbs = useAutoBreadcrumbs({ profile: "Profil" });

    if (!user) return <ErrorState message="Brak zalogowanego użytkownika" />;
    if (profileQuery.isPending) return <Spinner />;
    if (profileQuery.isError)
        return <ErrorState message={profileQuery.error.message} />;

    return (
        <div className="min-h-screen bg-background">
            <AutoBreadcrumbs items={breadcrumbs} />
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-on-surface font-headline tracking-tight">
                    Ustawienia
                </h1>
                <p className="text-on-surface-variant text-sm mt-1">
                    Zarządzaj swoim kontem i preferencjami
                </p>
            </div>

            <div className="flex gap-8">
                {/* Sidebar */}
                <aside className="hidden lg:block w-56 shrink-0 sticky top-8 self-start">
                    <nav className="space-y-1">
                        {sections.map((section) => (
                            <button
                                key={section.id}
                                onClick={() => scrollToSection(section.id)}
                                className={cn(
                                    "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left",
                                    activeSection === section.id
                                        ? "text-primary font-bold bg-surface-container-lowest shadow-sm"
                                        : "text-on-surface-variant hover:text-primary hover:bg-surface-container",
                                )}
                            >
                                <span
                                    className="material-symbols-outlined text-[20px]"
                                    style={
                                        activeSection === section.id
                                            ? {
                                                  fontVariationSettings:
                                                      "'FILL' 1",
                                              }
                                            : {}
                                    }
                                >
                                    {section.icon}
                                </span>
                                {section.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 max-w-3xl space-y-12 pb-24">
                    {/* Profil */}
                    <section id="profil" className="scroll-mt-24">
                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold text-on-surface font-headline">
                                Profil
                            </h2>
                            <p className="text-on-surface-variant text-sm mt-1">
                                Zarządzaj swoimi danymi osobowymi i tożsamością
                                w systemie.
                            </p>
                        </div>
                        <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="relative group">
                                    <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center ring-4 ring-primary/10">
                                        <span className="material-symbols-outlined text-6xl text-primary">
                                            person
                                        </span>
                                    </div>
                                </div>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                                            Imię
                                        </label>
                                        <div className="px-4 py-3 bg-surface-container-low rounded-lg text-on-surface font-medium">
                                            {user.firstName}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                                            Nazwisko
                                        </label>
                                        <div className="px-4 py-3 bg-surface-container-low rounded-lg text-on-surface font-medium">
                                            {user.lastName}
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                                            Rola
                                        </label>
                                        <div className="px-4 py-3 bg-primary-fixed/30 dark:bg-primary/10 text-on-primary-fixed-variant dark:text-primary rounded-lg font-medium flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">
                                                school
                                            </span>
                                            {user.role === "uczen"
                                                ? "Uczeń"
                                                : user.role === "rodzic"
                                                  ? "Rodzic"
                                                  : "Nauczyciel"}
                                        </div>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                                            Adres e-mail
                                        </label>
                                        <div className="px-4 py-3 bg-surface-container-low rounded-lg text-on-surface font-medium">
                                            {user.email}
                                        </div>
                                    </div>
                                    <div className="space-y-1 md:col-span-2">
                                        <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                                            Nazwa użytkownika
                                        </label>
                                        <div className="px-4 py-3 bg-surface-container-low rounded-lg text-on-surface font-medium">
                                            {user.username}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Wygląd */}
                    <section id="wyglad" className="scroll-mt-24">
                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold text-on-surface font-headline">
                                Wygląd
                            </h2>
                            <p className="text-on-surface-variant text-sm mt-1">
                                Personalizuj interfejs, aby pracowało Ci się
                                wygodniej.
                            </p>
                        </div>
                        <div className="bg-surface-container-lowest rounded-xl p-6 shadow-sm space-y-4">
                            <h3 className="font-bold text-on-surface flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">
                                    contrast
                                </span>
                                Tryb interfejsu
                            </h3>
                            <div className="grid grid-cols-4 gap-3">
                                <button
                                    onClick={() => handleThemeChange("light" as Theme)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                                        selectedTheme === "light"
                                            ? "border-primary bg-primary/5"
                                            : "border-transparent bg-surface-container hover:bg-surface-container-high",
                                    )}
                                >
                                    <div className="w-full h-12 bg-[#ffffff] rounded shadow-inner mb-1 ring-1 ring-black/10"></div>
                                    <span className="text-xs font-semibold">
                                        Jasny
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleThemeChange("dark" as Theme)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                                        selectedTheme === "dark"
                                            ? "border-primary bg-primary/5"
                                            : "border-transparent bg-surface-container hover:bg-surface-container-high",
                                    )}
                                >
                                    <div className="w-full h-12 bg-[#1e1e2e] rounded shadow-inner mb-1 ring-1 ring-white/10"></div>
                                    <span className="text-xs font-semibold">
                                        Ciemny
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleThemeChange("oled" as Theme)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                                        selectedTheme === "oled"
                                            ? "border-primary bg-primary/5"
                                            : "border-transparent bg-surface-container hover:bg-surface-container-high",
                                    )}
                                >
                                    <div className="w-full h-12 bg-[#000000] rounded shadow-inner mb-1 ring-1 ring-white/10"></div>
                                    <span className="text-xs font-semibold">
                                        OLED
                                    </span>
                                </button>
                                <button
                                    onClick={() => handleThemeChange("system" as Theme)}
                                    className={cn(
                                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                                        selectedTheme === "system"
                                            ? "border-primary bg-primary/5"
                                            : "border-transparent bg-surface-container hover:bg-surface-container-high",
                                    )}
                                >
                                    <div className="w-full h-12 rounded shadow-inner mb-1 bg-gradient-to-r from-surface-container-lowest to-slate-800"></div>
                                    <span className="text-xs font-semibold">
                                        Systemowy
                                    </span>
                                </button>
                            </div>
                        </div>
                    </section>

                    {/* Powiadomienia */}
                    <section id="powiadomienia" className="scroll-mt-24">
                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold text-on-surface font-headline">
                                Powiadomienia
                            </h2>
                            <p className="text-on-surface-variant text-sm mt-1">
                                Bądź na bieżąco z tym, co dzieje się w szkole.
                            </p>
                        </div>
                        <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden divide-y divide-surface-container">
                            {notifications.map((notif) => (
                                <label
                                    key={notif.id}
                                    className="flex items-center justify-between p-6 hover:bg-surface-container/50 transition-colors cursor-pointer"
                                >
                                    <div className="flex gap-4 items-center">
                                        <div
                                            className={cn("flex items-center justify-center w-10 h-10 rounded-lg", notif.iconBg, notif.iconColor)}
                                        >
                                            <span className="material-symbols-outlined">
                                                {notif.icon}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="font-semibold text-on-surface">
                                                {notif.label}
                                            </div>
                                            <div className="text-sm text-on-surface-variant">
                                                {notif.description}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={notif.enabled}
                                            onChange={() =>
                                                toggleNotification(notif.id)
                                            }
                                            className="w-6 h-6 text-primary rounded-lg border-outline-variant focus:ring-primary cursor-pointer"
                                        />
                                    </div>
                                </label>
                            ))}
                        </div>
                    </section>

                    {/* Bezpieczeństwo */}
                    <section id="bezpieczenstwo" className="scroll-mt-24">
                        <div className="mb-6">
                            <h2 className="text-2xl font-extrabold text-on-surface font-headline">
                                Bezpieczeństwo
                            </h2>
                            <p className="text-on-surface-variant text-sm mt-1">
                                Chroń swoje konto i monitoruj aktywność.
                            </p>
                        </div>
                        <div className="space-y-6">
                            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="flex gap-4 items-center">
                                    <div className="p-3 rounded-full bg-red-50 dark:bg-red-400/10 text-red-600 dark:text-red-400">
                                        <span className="material-symbols-outlined">
                                            lock
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-on-surface">
                                            Hasło dostępu
                                        </h3>
                                        <p className="text-sm text-on-surface-variant">
                                            Zmiana hasła jest możliwa poprzez
                                            administratora systemu.
                                        </p>
                                    </div>
                                </div>
                                <Badge variant="warning">
                                    Kontakt z administratorem
                                </Badge>
                            </div>
                            <div className="bg-surface-container-lowest rounded-xl p-8 shadow-sm">
                                <h3 className="font-bold text-on-surface mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">
                                        security
                                    </span>
                                    Podsumowanie konta
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                                        <div className="flex gap-3 items-center">
                                            <span className="material-symbols-outlined text-green-600 dark:text-green-400">
                                                check_circle
                                            </span>
                                            <div>
                                                <div className="font-semibold text-sm text-on-surface">
                                                    Konto aktywne
                                                </div>
                                                <div className="text-xs text-on-surface-variant">
                                                    Twoje konto jest w pełni
                                                    aktywne
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 bg-surface-container-low rounded-xl">
                                        <div className="flex gap-3 items-center">
                                            <span className="material-symbols-outlined text-primary">
                                                person
                                            </span>
                                            <div>
                                                <div className="font-semibold text-sm text-on-surface">
                                                    Rola:{" "}
                                                    {user.role === "uczen"
                                                        ? "Uczeń"
                                                        : user.role === "rodzic"
                                                          ? "Rodzic"
                                                          : "Nauczyciel"}
                                                </div>
                                                <div className="text-xs text-on-surface-variant">
                                                    Uprawnienia do podglądu
                                                    dziennika
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    );
}
