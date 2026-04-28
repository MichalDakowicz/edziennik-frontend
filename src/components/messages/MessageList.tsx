import type { Message } from "../../types/api";
import { formatDate } from "../../utils/dateUtils";

export default function MessageList({
  messages,
  onOpen,
  mode,
  resolveUserName,
  selectedId,
}: {
  messages: Message[];
  onOpen: (message: Message) => void;
  mode: "inbox" | "sent" | "announcements";
  resolveUserName: (id: number) => string;
  selectedId: number | null;
}) {
  return (
    <div className="space-y-1.5">
      {messages.map((message) => {
        const isSelected = message.id === selectedId;
        return (
          <button
            key={message.id}
            className={`w-full text-left p-4 rounded-xl transition-all cursor-pointer ${
              isSelected
                ? "bg-surface-container-lowest"
                : "hover:bg-surface-container-low"
            }`}
            onClick={() => onOpen(message)}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-sm truncate ${
                    message.przeczytana
                      ? "font-semibold text-on-surface"
                      : "font-bold text-on-surface"
                  }`}>
                    {mode === "inbox" ? resolveUserName(message.nadawca) : resolveUserName(message.odbiorca)}
                  </span>
                  <span className="text-[10px] text-outline font-medium shrink-0 ml-2">
                    {formatDate(message.data_wyslania)}
                  </span>
                </div>
                <h4 className={`text-sm mb-1 truncate ${
                  message.przeczytana
                    ? "font-medium text-on-surface-variant"
                    : "font-semibold text-primary"
                }`}>
                  {message.temat}
                </h4>
                <p className="text-xs text-on-surface-variant/70 line-clamp-2 leading-relaxed">
                  {message.tresc.slice(0, 120)}
                </p>
              </div>
              {!message.przeczytana && mode === "inbox" && (
                <span className="w-2 h-2 bg-primary rounded-full shrink-0 mt-1" />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
