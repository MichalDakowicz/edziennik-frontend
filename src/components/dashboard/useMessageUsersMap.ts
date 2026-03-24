import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../../services/api";

export function useMessageUsersMap(inboxData: any[], selectedMessage: any | null) {
    const userIds = useMemo(() => {
        const unread = inboxData.filter((message: any) => !message.przeczytana);
        const ids = unread.map((message: any) => message.nadawca);
        if (selectedMessage) {
            ids.push(selectedMessage.nadawca);
            ids.push(selectedMessage.odbiorca);
        }
        return [...new Set(ids)].filter((id) => id);
    }, [inboxData, selectedMessage]);

    const usersQuery = useQuery({
        queryKey: ["message-users", userIds],
        queryFn: async () => {
            const entries = await Promise.all(
                (userIds as number[]).map(async (id: number) => {
                    try {
                        const profile = await getUserProfile(id);
                        return {
                            id,
                            name: `${profile.first_name} ${profile.last_name}`,
                        };
                    } catch {
                        return { id, name: `Użytkownik #${id}` };
                    }
                }),
            );
            return new Map(entries.map((entry) => [entry.id, entry.name]));
        },
        enabled: userIds.length > 0,
    });

    return usersQuery;
}
