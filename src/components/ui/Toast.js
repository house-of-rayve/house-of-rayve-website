"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Check, X, AlertCircle } from "lucide-react";

const ToastContext = createContext({ toast: () => {} });

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const toast = useCallback(
    (message, { type = "success", duration = 3200 } = {}) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((t) => [...t.slice(-3), { id, message, type }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  return (
    <ToastContext value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[100] flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="pointer-events-auto flex w-full max-w-sm animate-fade-up items-center gap-3 bg-olive-950 px-4 py-3 text-sm text-sand shadow-xl"
          >
            {t.type === "error" ? (
              <AlertCircle className="size-4 shrink-0 text-red-300" />
            ) : (
              <Check className="size-4 shrink-0 text-olive-400" />
            )}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => dismiss(t.id)} className="text-sand/60 hover:text-sand" aria-label="Dismiss">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

export const useToast = () => useContext(ToastContext);
