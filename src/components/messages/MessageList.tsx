import type { Message } from "../../types/api";
import { formatDate } from "../../utils/dateUtils";

export default function MessageList({
  messages,
  onOpen,
  mode,
  resolveUserName,
}: {
  messages: Message[];
  onOpen: (message: Message) => void;
  mode: "inbox" | "sent";
  resolveUserName: (id: number) => string;
}) {
  return (
    <div className="space-y-2">
      {messages.map((message) => (
        <button key={message.id} className="w-full text-left bg-card/50 /50 rounded-xl p-4 hover:border-border/50" onClick={() => onOpen(message)}>
          <div className="flex justify-between items-start gap-3">
            <div className="flex gap-2">
              <span className={`inline-block w-2.5 h-2.5 rounded-full mt-1 ${message.przeczytana ? "bg-zinc-500" : "bg-blue-400"}`} />
              <div>
                <p className="font-semibold text-on-surface font-body">{message.temat}</p>
                <p className="text-xs text-on-surface-variant font-body">
                  {mode === "inbox" ? `Od: ${resolveUserName(message.nadawca)}` : `Do: ${resolveUserName(message.odbiorca)}`}
                </p>
                <p className="text-sm text-on-surface-variant font-body">{message.tresc.slice(0, 120)}</p>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant font-body">{formatDate(message.data_wyslania)}</p>
          </div>
        </button>
      ))}
    </div>
  );
}