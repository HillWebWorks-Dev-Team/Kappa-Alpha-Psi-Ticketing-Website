"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  /** Optional progress steps shown while the modal is open. */
  steps?: string[];
};

export function CheckoutPreparingModal({
  open,
  title = "Preparing checkout",
  message = "Please wait while we secure your order…",
  steps,
}: Props) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open || !steps?.length) {
      setActiveStep(0);
      return;
    }

    setActiveStep(0);
    const timers: number[] = [];
    steps.forEach((_, index) => {
      if (index === 0) return;
      timers.push(
        window.setTimeout(() => {
          setActiveStep(index);
        }, index * 2200)
      );
    });

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [open, steps]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="modal-overlay modal-overlay--checkout" role="presentation">
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy="true"
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

        {steps && steps.length > 0 ? (
          <ol className="modal__steps" aria-live="polite">
            {steps.map((step, index) => {
              const done = index < activeStep;
              const current = index === activeStep;
              return (
                <li
                  key={step}
                  className={
                    done
                      ? "modal__step modal__step--done"
                      : current
                        ? "modal__step modal__step--current"
                        : "modal__step"
                  }
                >
                  <span className="modal__step-mark" aria-hidden>
                    {done ? "✓" : current ? "" : index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              );
            })}
          </ol>
        ) : null}

        <div className="modal__spinner" aria-hidden>
          <svg
            className="modal__spinner-svg"
            viewBox="0 0 32 32"
            width="32"
            height="32"
          >
            <circle
              className="modal__spinner-track"
              cx="16"
              cy="16"
              r="12"
              fill="none"
              strokeWidth="3"
            />
            <circle
              className="modal__spinner-arc"
              cx="16"
              cy="16"
              r="12"
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>
    </div>,
    document.body
  );
}
