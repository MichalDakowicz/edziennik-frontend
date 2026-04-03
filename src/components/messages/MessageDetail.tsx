import type { Message } from "../../types/api";
import { formatDateTime } from "../../utils/dateUtils";
import { Modal } from "../ui/Modal";

export default function MessageDetail({
  message,
  open,
  onClose,
  resolveUserName,
  inline,
}: {
  message: Message | null;
  open: boolean;
  onClose: () => void;
  resolveUserName: (id: number) => string;
  inline?: boolean;
}) {
  if (!message) return null;

  const content = (
    <div className="space-y-3 text-sm text-on-surface font-body">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-bold text-outline-variant uppercase tracking-widest">
          {resolveUserName(message.nadawca)}
        </span>
        <span className="text-[10px] text-outline">{formatDateTime(message.data_wyslania)}</span>
      </div>
      <div className={`p-5 rounded-2xl text-sm text-on-surface leading-relaxed ${
        inline ? "bg-white shadow-sm rounded-tl-none" : "bg-surface-container-low"
      }`}>
        <p className="mb-4 font-bold text-primary">{message.temat}</p>
        <p className="whitespace-pre-wrap">{message.tresc}</p>
      </div>
    </div>
  );

  if (inline) return content;

  return (
    <Modal open={open} onClose={onClose} title={message.temat}>
      <div className="space-y-3 text-sm text-on-surface-variant font-body">
        <p>Od: {resolveUserName(message.nadawca)}</p>
        <p>Do: {resolveUserName(message.odbiorca)}</p>
        <p>Data: {formatDateTime(message.data_wyslania)}</p>
        <hr className="border-border/50" />
        <p className="whitespace-pre-wrap">{message.tresc}</p>
      </div>
    </Modal>
  );
}
