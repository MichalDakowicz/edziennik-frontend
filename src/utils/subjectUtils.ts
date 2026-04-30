export type SubjectColors = {
    bg: string;
    text: string;
    borderLeft: string;
    badgeBg: string;
    badgeText: string;
};

const SUBJECT_COLOR_MAP: Record<string, SubjectColors> = {
    matematyka:            { bg: "bg-blue-50 dark:bg-blue-400/10",    text: "text-blue-600 dark:text-blue-400",    borderLeft: "border-l-blue-500",    badgeBg: "bg-blue-100 dark:bg-blue-400/10",    badgeText: "text-blue-700 dark:text-blue-300"    },
    fizyka:                { bg: "bg-amber-50 dark:bg-amber-400/10",   text: "text-amber-600 dark:text-amber-400",  borderLeft: "border-l-amber-500",   badgeBg: "bg-amber-100 dark:bg-amber-400/10",   badgeText: "text-amber-700 dark:text-amber-300"  },
    "język polski":        { bg: "bg-emerald-50 dark:bg-emerald-400/10", text: "text-emerald-600 dark:text-emerald-400", borderLeft: "border-l-emerald-500", badgeBg: "bg-emerald-100 dark:bg-emerald-400/10", badgeText: "text-emerald-700 dark:text-emerald-300" },
    polski:                { bg: "bg-emerald-50 dark:bg-emerald-400/10", text: "text-emerald-600 dark:text-emerald-400", borderLeft: "border-l-emerald-500", badgeBg: "bg-emerald-100 dark:bg-emerald-400/10", badgeText: "text-emerald-700 dark:text-emerald-300" },
    chemia:                { bg: "bg-purple-50 dark:bg-purple-400/10",  text: "text-purple-600 dark:text-purple-400",  borderLeft: "border-l-purple-500",  badgeBg: "bg-purple-100 dark:bg-purple-400/10",  badgeText: "text-purple-700 dark:text-purple-300"  },
    "język angielski":     { bg: "bg-rose-50 dark:bg-rose-400/10",     text: "text-rose-600 dark:text-rose-400",     borderLeft: "border-l-rose-500",    badgeBg: "bg-rose-100 dark:bg-rose-400/10",     badgeText: "text-rose-700 dark:text-rose-300"     },
    angielski:             { bg: "bg-rose-50 dark:bg-rose-400/10",     text: "text-rose-600 dark:text-rose-400",     borderLeft: "border-l-rose-500",    badgeBg: "bg-rose-100 dark:bg-rose-400/10",     badgeText: "text-rose-700 dark:text-rose-300"     },
    historia:              { bg: "bg-orange-50 dark:bg-orange-400/10", text: "text-orange-600 dark:text-orange-400", borderLeft: "border-l-orange-500",  badgeBg: "bg-orange-100 dark:bg-orange-400/10", badgeText: "text-orange-700 dark:text-orange-300" },
    biologia:              { bg: "bg-green-50 dark:bg-green-400/10",   text: "text-green-600 dark:text-green-400",   borderLeft: "border-l-green-500",   badgeBg: "bg-green-100 dark:bg-green-400/10",   badgeText: "text-green-700 dark:text-green-300"   },
    geografia:             { bg: "bg-teal-50 dark:bg-teal-400/10",     text: "text-teal-600 dark:text-teal-400",     borderLeft: "border-l-teal-500",    badgeBg: "bg-teal-100 dark:bg-teal-400/10",     badgeText: "text-teal-700 dark:text-teal-300"     },
    informatyka:           { bg: "bg-cyan-50 dark:bg-cyan-400/10",     text: "text-cyan-600 dark:text-cyan-400",     borderLeft: "border-l-cyan-500",    badgeBg: "bg-cyan-100 dark:bg-cyan-400/10",     badgeText: "text-cyan-700 dark:text-cyan-300"     },
    wf:                    { bg: "bg-lime-50 dark:bg-lime-400/10",     text: "text-lime-600 dark:text-lime-400",     borderLeft: "border-l-lime-500",    badgeBg: "bg-lime-100 dark:bg-lime-400/10",     badgeText: "text-lime-700 dark:text-lime-300"     },
    "w-f":                 { bg: "bg-lime-50 dark:bg-lime-400/10",     text: "text-lime-600 dark:text-lime-400",     borderLeft: "border-l-lime-500",    badgeBg: "bg-lime-100 dark:bg-lime-400/10",     badgeText: "text-lime-700 dark:text-lime-300"     },
    "wychowanie fizyczne": { bg: "bg-lime-50 dark:bg-lime-400/10",     text: "text-lime-600 dark:text-lime-400",     borderLeft: "border-l-lime-500",    badgeBg: "bg-lime-100 dark:bg-lime-400/10",     badgeText: "text-lime-700 dark:text-lime-300"     },
    muzyka:                { bg: "bg-pink-50 dark:bg-pink-400/10",     text: "text-pink-600 dark:text-pink-400",     borderLeft: "border-l-pink-500",    badgeBg: "bg-pink-100 dark:bg-pink-400/10",     badgeText: "text-pink-700 dark:text-pink-300"     },
    plastyka:              { bg: "bg-violet-50 dark:bg-violet-400/10", text: "text-violet-600 dark:text-violet-400", borderLeft: "border-l-violet-500",  badgeBg: "bg-violet-100 dark:bg-violet-400/10", badgeText: "text-violet-700 dark:text-violet-300" },
    religia:               { bg: "bg-amber-50 dark:bg-amber-400/10",   text: "text-amber-600 dark:text-amber-400",  borderLeft: "border-l-amber-500",   badgeBg: "bg-amber-100 dark:bg-amber-400/10",   badgeText: "text-amber-700 dark:text-amber-300"  },
    etyka:                 { bg: "bg-amber-50 dark:bg-amber-400/10",   text: "text-amber-600 dark:text-amber-400",  borderLeft: "border-l-amber-500",   badgeBg: "bg-amber-100 dark:bg-amber-400/10",   badgeText: "text-amber-700 dark:text-amber-300"  },
    wos:                   { bg: "bg-sky-50 dark:bg-sky-400/10",       text: "text-sky-600 dark:text-sky-400",       borderLeft: "border-l-sky-500",     badgeBg: "bg-sky-100 dark:bg-sky-400/10",       badgeText: "text-sky-700 dark:text-sky-300"       },
    podstawy:              { bg: "bg-slate-50 dark:bg-slate-400/10",   text: "text-slate-600 dark:text-slate-400",  borderLeft: "border-l-slate-500",   badgeBg: "bg-slate-100 dark:bg-slate-400/10",   badgeText: "text-slate-700 dark:text-slate-300"  },
    niemiecki:             { bg: "bg-indigo-50 dark:bg-indigo-400/10", text: "text-indigo-600 dark:text-indigo-400", borderLeft: "border-l-indigo-500", badgeBg: "bg-indigo-100 dark:bg-indigo-400/10", badgeText: "text-indigo-700 dark:text-indigo-300" },
    rosyjski:              { bg: "bg-red-50 dark:bg-red-400/10",       text: "text-red-600 dark:text-red-400",       borderLeft: "border-l-red-500",     badgeBg: "bg-red-100 dark:bg-red-400/10",       badgeText: "text-red-700 dark:text-red-300"       },
    hiszpański:            { bg: "bg-yellow-50 dark:bg-yellow-400/10", text: "text-yellow-600 dark:text-yellow-400", borderLeft: "border-l-yellow-500", badgeBg: "bg-yellow-100 dark:bg-yellow-400/10", badgeText: "text-yellow-700 dark:text-yellow-300" },
    łacina:                { bg: "bg-stone-50 dark:bg-stone-400/10",   text: "text-stone-600 dark:text-stone-400",  borderLeft: "border-l-stone-500",   badgeBg: "bg-stone-100 dark:bg-stone-400/10",   badgeText: "text-stone-700 dark:text-stone-300"  },
    godzi:                 { bg: "bg-slate-50 dark:bg-slate-400/10",   text: "text-slate-600 dark:text-slate-400",  borderLeft: "border-l-slate-500",   badgeBg: "bg-slate-100 dark:bg-slate-400/10",   badgeText: "text-slate-700 dark:text-slate-300"  },
};

const FALLBACK_COLORS: SubjectColors = {
    bg: "bg-slate-50 dark:bg-slate-400/10",
    text: "text-slate-600 dark:text-slate-400",
    borderLeft: "border-l-slate-500",
    badgeBg: "bg-slate-100 dark:bg-slate-400/10",
    badgeText: "text-slate-700 dark:text-slate-300",
};

export function getSubjectColors(subjectName: string): SubjectColors {
    const lower = subjectName.toLowerCase();
    for (const [key, colors] of Object.entries(SUBJECT_COLOR_MAP)) {
        if (lower.includes(key)) return colors;
    }
    return FALLBACK_COLORS;
}

const SUBJECT_ICON_MAP: Record<string, string> = {
    "język polski": "menu_book",
    polski: "menu_book",
    matematyka: "calculate",
    fizyka: "rocket_launch",
    chemia: "science",
    biologia: "biotech",
    historia: "history_edu",
    geografia: "public",
    angielski: "translate",
    "język angielski": "translate",
    niemiecki: "translate",
    rosyjski: "translate",
    hiszpański: "translate",
    łacina: "translate",
    informatyka: "computer",
    wf: "sports_soccer",
    "w-f": "sports_soccer",
    "wychowanie fizyczne": "sports_soccer",
    plastyka: "palette",
    muzyka: "music_note",
    religia: "church",
    etyka: "balance",
    wos: "gavel",
    podstawy: "foundation",
};

export function getSubjectIcon(subjectName: string): string {
    const lower = subjectName.toLowerCase();
    for (const [key, icon] of Object.entries(SUBJECT_ICON_MAP)) {
        if (lower.includes(key)) return icon;
    }
    return "school";
}

export type NotificationIconConfig = {
    iconColor: string;
    iconBg: string;
    icon: string;
};

const NOTIFICATION_ICON_MAP: Record<string, NotificationIconConfig> = {
    message:    { iconColor: "text-primary dark:text-primary",                       iconBg: "bg-primary/15 dark:bg-primary/20",          icon: "mail"       },
    grade:      { iconColor: "text-tertiary dark:text-amber-400",                    iconBg: "bg-tertiary/15 dark:bg-amber-400/15",        icon: "grade"      },
    homework:   { iconColor: "text-on-tertiary-fixed-variant dark:text-orange-400",  iconBg: "bg-orange-400/15 dark:bg-orange-400/15",     icon: "assignment" },
    attendance: { iconColor: "text-on-secondary-fixed-variant dark:text-blue-400",   iconBg: "bg-blue-400/15 dark:bg-blue-400/15",         icon: "rule"       },
    event:      { iconColor: "text-on-surface dark:text-on-surface",                 iconBg: "bg-surface-container-high",                  icon: "event"      },
    behavior:   { iconColor: "text-on-secondary-fixed-variant dark:text-indigo-400", iconBg: "bg-indigo-400/15 dark:bg-indigo-400/15",     icon: "star"       },
};

const NOTIFICATION_ICON_FALLBACK: NotificationIconConfig = {
    iconColor: "text-on-surface dark:text-on-surface",
    iconBg: "bg-surface-container-high",
    icon: "event",
};

export function getNotificationIconConfig(kind: string): NotificationIconConfig {
    return NOTIFICATION_ICON_MAP[kind] ?? NOTIFICATION_ICON_FALLBACK;
}
