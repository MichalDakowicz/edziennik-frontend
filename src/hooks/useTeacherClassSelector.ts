import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getClasses } from "../services/api";
import { keys } from "../services/queryKeys";
import { getCurrentUser } from "../services/auth";

const STORAGE_KEY = "teacher:selected-class-id";

export function useTeacherClassSelector() {
    const user = getCurrentUser();
    const isTeacher = user?.role === "nauczyciel" || user?.role === "admin";

    const { data: classes, isLoading, error } = useQuery({
        queryKey: keys.classes(),
        queryFn: getClasses,
        enabled: isTeacher,
    });

    const selectedClassId = useMemo(() => {
        if (!isTeacher) return null;
        const stored = sessionStorage.getItem(STORAGE_KEY);
        const id = stored ? Number(stored) : null;
        if (id && classes?.some((c) => c.id === id)) return id;
        return null;
    }, [classes, isTeacher]);

    const setSelectedClassId = useCallback((id: number | null) => {
        if (id === null) {
            sessionStorage.removeItem(STORAGE_KEY);
        } else {
            sessionStorage.setItem(STORAGE_KEY, String(id));
        }
        window.dispatchEvent(new CustomEvent("teacher-class-change", { detail: { classId: id } }));
    }, []);

    const selectedClass = useMemo(() => {
        if (!selectedClassId || !classes) return null;
        return classes.find((c) => c.id === selectedClassId) ?? null;
    }, [classes, selectedClassId]);

    return {
        classes: classes ?? [],
        selectedClassId,
        selectedClass,
        setSelectedClassId,
        isLoading,
        error,
    };
}
