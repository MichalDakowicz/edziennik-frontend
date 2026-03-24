import type { Message } from "../../types/api";
import { formatDateTime } from "../../utils/dateUtils";
import { Modal } from "../ui/Modal";

export default function MessageDetail({
  message,
  open,
  onClose,
  resolveUserName,
}: {
  message: Message | null;
  open: boolean;
  onClose: () => void;
  resolveUserName: (id: number) => string;
}) {
  if (!message) return null;

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