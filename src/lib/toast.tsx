import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, X } from "lucide-react";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastOptions {
  action?: ToastAction;
  /** ms before auto-dismiss; the action window (e.g. Undo) should match this. */
  duration?: number;
}

interface ToastItem extends ToastOptions {
  id: number;
  message: string;
}

interface ToastContextValue {
  show: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((message: string, options?: ToastOptions) => {
    const id = ++idRef.current;
    const duration = options?.duration ?? 5000;
    setToasts(prev => [...prev, { id, message, ...options }]);
    window.setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 w-full max-w-sm px-4 sm:px-0">
        {toasts.map(t => (
          <div
            key={t.id}
            role="status"
            className="bg-card border border-border rounded-xl shadow-lg px-4 py-3 flex items-center gap-3"
          >
            <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            <p className="text-sm text-foreground flex-1">{t.message}</p>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action?.onClick();
                  dismiss(t.id);
                }}
                className="text-xs font-bold text-[#E84C1E] hover:underline cursor-pointer shrink-0"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
              className="text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside a ToastProvider");
  return ctx;
}
