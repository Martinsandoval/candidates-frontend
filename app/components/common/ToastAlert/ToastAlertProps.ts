import type React from "react";
import type { ToastAlertVariant, ToastVariant } from "./enums";

interface ToastAlertProps {
  /**
   * An identifier for the toast, used by ToastContext.
   */
  id: string | undefined;
  /**
   * Text or component to display as title
   */
  title: string | React.FC;
  /**
   * Text or component to display as message
   */
  message: string | React.FC;
  /**
   * Variant of the toast to display. Values could be flyout or banner
   */
  toastVariant: ToastVariant;
  /**
   * Variant of the alert to display. Values could be info, danger, warning, and success
   */
  alertVariant: ToastAlertVariant;
  /**
   * Delay hiding the toast (ms)
   */
  delay?: number;
  /**
   * A callback fired when the close button is clicked or autohide is enabled.
   */
  onClose?: () => void;
  /**
   * Classname(s) to apply to the toast.
   */
  className?: string;
  /**
   * Whether to show the toast or not.
   */
  show?: boolean;
}

export default ToastAlertProps;
