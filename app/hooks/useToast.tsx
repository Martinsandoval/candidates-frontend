"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import * as Toast from "@radix-ui/react-toast";
import ToastAlert from "@/app/components/common/ToastAlert/ToastAlert";
import { ToastAlertVariant, ToastVariant } from "@/app/components/common/ToastAlert/enums";
import type { ToastOptions } from "@/app/hooks/types";

export { ToastAlertVariant, ToastVariant };
export type { ToastOptions };

interface ToastEntry extends ToastOptions {
  id: string;
}

interface ToastContextValue {
  showToast: (opts: ToastOptions) => void;
}

export function isNetworkError(err: unknown): boolean {
  return err instanceof TypeError;
}

export const SUCCESS_TOAST: Pick<ToastOptions, "alertVariant" | "toastVariant"> = {
  alertVariant: ToastAlertVariant.SUCCESS,
  toastVariant: ToastVariant.FLYOUT,
};

export function toastForError(err: unknown, fallbackTitle: string): ToastOptions {
  const network = isNetworkError(err);
  return {
    title: network ? "Network error" : fallbackTitle,
    message: network
      ? "Check your connection and try again."
      : err instanceof Error
        ? err.message
        : "An unexpected error occurred.",
    alertVariant: ToastAlertVariant.DANGER,
    toastVariant: network ? ToastVariant.BANNER : ToastVariant.FLYOUT,
  };
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastEntry[]>([]);

  const showToast = useCallback((opts: ToastOptions) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { ...opts, id }]);
  }, []);

  function dismiss(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast.Provider swipeDirection="right">
        {children}
        {toasts.map((t) => (
          <ToastAlert
            key={t.id}
            id={t.id}
            title={t.title}
            message={t.message}
            alertVariant={t.alertVariant}
            toastVariant={t.toastVariant}
            show
            onClose={() => dismiss(t.id)}
          />
        ))}
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
