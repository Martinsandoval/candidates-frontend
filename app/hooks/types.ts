import type { ToastAlertVariant, ToastVariant } from "@/app/components/common/ToastAlert/enums";

export interface ToastOptions {
  title: string;
  message: string;
  alertVariant: ToastAlertVariant;
  toastVariant: ToastVariant;
}

export interface UserPreferences {
  pageSize?: number | "all";
}
