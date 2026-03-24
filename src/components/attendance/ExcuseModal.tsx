import { Modal } from "../ui/Modal";

export default function ExcuseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Usprawiedliwienie">
      <p className="text-on-surface-variant font-body">Usprawiedliwienia składane są przez rodzica lub wychowawcę.</p>
    </Modal>
  );
}