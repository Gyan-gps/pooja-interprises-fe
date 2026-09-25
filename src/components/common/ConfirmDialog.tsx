import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ConfirmDialogProps {
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  /** Red confirm button for destructive actions (delete). Defaults to true. */
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  /** Extra content between the description and the footer, e.g. a reassignment select. */
  children?: ReactNode;
  /** Disables the confirm button, e.g. while a required extra field is empty. */
  confirmDisabled?: boolean;
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = "Delete",
  danger = true,
  onConfirm,
  onClose,
  children,
  confirmDisabled,
}: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      icon={danger ? <AlertTriangle size={16} className="text-destructive" /> : undefined}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} className="flex-1 justify-center">Cancel</Button>
          <button
            type="button"
            disabled={confirmDisabled}
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 font-semibold text-sm rounded-lg transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              danger
                ? "bg-destructive text-destructive-foreground hover:opacity-90"
                : "bg-primary text-primary-foreground hover:opacity-90"
            }`}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      {children}
    </Modal>
  );
}
