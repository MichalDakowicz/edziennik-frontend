import { Link } from "react-router-dom";
import type { Message } from "../../../types/api";

type TeacherUnreadMessagesCardProps = {
    unreadInbox: Message[];
    onOpenMessage: (message: Message) => void;
    formatDateLabel: (value: string) => string;
};

export default function TeacherUnreadMessagesCard({
    unreadInbox,
    onOpenMessage,
    formatDateLabel,
}: TeacherUnreadMessagesCardProps) {
    return (
        <div className="space-y-6 flex flex-col">
            <div className="bg-surface-container-lowest rounded-xl shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] overflow-hidden flex flex-col h-full">
                <div className="flex items-center justify-between p-5 bg-surface-container-low">
                    <h3 className="section-title text-base font-bold font-headline">
                        Nieodczytane wiadomości
                    </h3>
                    <Link
                        to="/dashboard/messages"
                        className="text-xs font-medium text-primary hover:text-primary/80 uppercase tracking-wide font-body"
                    >
                        Wszystkie
                    </Link>
                </div>

                <div className="p-4 space-y-3 flex-1 overflow-y-auto">
                    {unreadInbox.length ? (
                        unreadInbox.map((message) => (
                            <div
                                key={message.id}
                                onClick={() => onOpenMessage(message)}
                                className="block group cursor-pointer"
                            >
                                <div className="bg-background rounded-lg p-3 hover:shadow-[0_8px_32px_-4px_rgba(25,28,29,0.06)] transition-all relative overflow-hidden group-hover:bg-accent/5">
                                    <div
                                        className={`absolute top-0 left-0 w-1 h-full ${message.przeczytana ? "bg-border" : "bg-primary"}`}
                                    />
                                    <div className="pl-3">
                                        <div className="flex justify-between items-start mb-1">
                                            <p className="font-semibold text-sm text-on-surface truncate pr-2 group-hover:text-primary transition-colors font-body">
                                                {message.temat || "(bez tematu)"}
                                            </p>
                                            <span className="text-[10px] text-on-surface-variant whitespace-nowrap">
                                                {formatDateLabel(
                                                    message.data_wyslania,
                                                )}
                                            </span>
                                        </div>
                                        <p className="text-xs text-on-surface-variant line-clamp-2 font-body">
                                            {message.tresc}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-on-surface-variant">
                            <p className="text-sm font-body">
                                Brak nieodczytanych wiadomości
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
