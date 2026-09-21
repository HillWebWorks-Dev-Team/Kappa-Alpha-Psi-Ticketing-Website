"use client";

import Image from "next/image";
import { useEffect, useId, useRef } from "react";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
};

export function CheckoutPreparingModal({
  open,
  title = "Preparing checkout",
  message = "Please wait while we secure your order…",
}: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-overlay" role="presentation">
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <Image
          src="/logo.jpg"
          alt=""
          width={56}
          height={56}
          className="modal__logo"
          aria-hidden
          priority
        />
        <h2 id={titleId} className="modal__title">
          {title}
        </h2>
        <p className="modal__copy">{message}</p>
      </div>
    </div>
  );
}
