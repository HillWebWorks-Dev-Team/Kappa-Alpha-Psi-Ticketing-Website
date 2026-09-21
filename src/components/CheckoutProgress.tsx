"use client";

type Step = {
  n: number;
  label: string;
};

const STEPS: Step[] = [
  { n: 1, label: "Select Tickets" },
  { n: 2, label: "Review Order" },
  { n: 3, label: "Checkout" },
  { n: 4, label: "Confirmation" },
];

type Props = {
  /** 1-based active step index */
  current?: number;
  /** Called when a completed (earlier) step is clicked */
  onStepClick?: (step: number) => void;
};

export function CheckoutProgress({ current = 1, onStepClick }: Props) {
  return (
    <nav className="checkout-progress" aria-label="Checkout progress">
      <ol className="checkout-progress__list">
        {STEPS.map((step, i) => {
          const status =
            step.n < current ? "is-done" : step.n === current ? "is-active" : "";
          const canJump = Boolean(onStepClick) && step.n < current && step.n < 4;

          return (
            <li key={step.label} className={`checkout-progress__item ${status}`}>
              {i > 0 ? (
                <span className="checkout-progress__line" aria-hidden />
              ) : null}
              {canJump ? (
                <button
                  type="button"
                  className="checkout-progress__hit"
                  onClick={() => onStepClick?.(step.n)}
                  aria-label={`Go back to ${step.label}`}
                >
                  <span className="checkout-progress__circle" aria-hidden>
                    ✓
                  </span>
                  <span className="checkout-progress__label">{step.label}</span>
                </button>
              ) : (
                <>
                  <span className="checkout-progress__circle" aria-hidden>
                    {step.n < current ? "✓" : step.n}
                  </span>
                  <span className="checkout-progress__label">
                    {step.n === current ? (
                      <strong>{step.label}</strong>
                    ) : (
                      step.label
                    )}
                  </span>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
