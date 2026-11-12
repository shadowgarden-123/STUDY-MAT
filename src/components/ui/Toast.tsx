import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon } from "@/components/icons/Icon";

type ToastOptions = {
  actionLabel?: string;
  onAction?: () => void;
  duration?: number;
};

type ToastItem = ToastOptions & { id: number; message: string };

type ToastContextValue = {
  showToast: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const showToast = useCallback((message: string, options?: ToastOptions) => {
    const id = nextId.current++;
    setToasts((current) => [...current.slice(-2), { id, message, ...options }]);
    const duration =
      options?.duration ?? (options?.actionLabel ? 10_000 : 5_000);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="us-toast-region" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="us-toast">
            <Icon name="check" size={20} className="us-toast__icon" />
            <span>{toast.message}</span>
            {toast.actionLabel ? (
              <button
                type="button"
                className="us-toast__action"
                onClick={() => {
                  toast.onAction?.();
                  setToasts((current) =>
                    current.filter((item) => item.id !== toast.id),
                  );
                }}
              >
                {toast.actionLabel}
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast doit être utilisé dans ToastProvider");
  }
  return context;
}
