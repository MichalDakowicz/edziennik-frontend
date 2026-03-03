import { Modal } from "../ui/Modal";

export default function ExcuseModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title="Usprawiedliwienie">
      <p className="text-muted-foreground">Usprawiedliwienia składane są przez rodzica lub wychowawcę.</p>
    </Modal>
  );
}