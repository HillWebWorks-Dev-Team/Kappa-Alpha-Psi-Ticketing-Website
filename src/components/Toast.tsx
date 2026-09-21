"use client";

import { useEffect } from "react";

export type ToastTone = "info" | "ok" | "error";

type ToastProps = {
  message: string;
  tone?: ToastTone;
  onDismiss: () => void;
  durationMs?: number;
};

export function Toast({
  message,
  tone = "info",
  onDismiss,
  durationMs = 6000,
}: ToastProps) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, durationMs);
    return () => window.clearTimeout(id);
  }, [durationMs, onDismiss, message]);

  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="true">
      <div className={`toast toast--${tone}`} role="status">
        <p className="toast__message">{message}</p>
        <button
          type="button"
          className="toast__close"
          aria-label="Dismiss notification"
          onClick={onDismiss}
        >
          ×
        </button>
      </div>
    </div>
  );
}
