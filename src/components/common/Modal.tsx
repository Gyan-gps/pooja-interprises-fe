import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type ModalSize = "md" | "lg";

const SIZE_CLS: Record<ModalSize, string> = {
  md: "max-w-lg",
  lg: "max-w-xl",
};

interface ModalProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  size?: ModalSize;
  onClose: () => void;
  children: ReactNode;
  /** Action row pinned below the scrollable body. */
  footer?: ReactNode;
}

export function Modal({ title, subtitle, icon, size = "md", onClose, children, footer }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKeyDown);
    panelRef.current?.querySelector<HTMLElement>("input, select, textarea, button")?.focus();
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div ref={panelRef} className={`bg-card rounded-2xl shadow-2xl w-full ${SIZE_CLS[size]} border border-border my-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 id={titleId} className="font-bold text-foreground flex items-center gap-2">
              {icon}
              {title}
            </h2>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">{children}</div>

        {footer && <div className="flex gap-2 px-6 pb-5">{footer}</div>}
      </div>
    </div>
  );
}
