"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AcceptedPaymentMethods } from "@/components/AcceptedPaymentMethods";
import { CheckoutForm } from "@/components/CheckoutForm";
import { CheckoutProgress } from "@/components/CheckoutProgress";
import {
  IconArrowRight,
  IconInfo,
  IconPerson,
  IconShield,
  IconStar,
  IconTicket,
  IconUsers,
} from "@/components/Icons";
import { formatCurrency } from "@/lib/format";
import type { SelectableTicketType } from "@/components/TicketSelector";

function iconForTicket(name: string, index: number) {
  const n = name.toLowerCase();
  if (n.includes("vip")) return IconStar;
  if (n.includes("table") || n.includes("sponsor")) return IconUsers;
  if (n.includes("couple") || n.includes("pair")) return IconUsers;
  if (index === 0) return IconPerson;
  return IconUsers;
}

type Props = {
  eventSlug: string;
  eventTitle: string;
  ticketTypes: SelectableTicketType[];
  supportEmail?: string;
  doorCheckDisclaimer?: string;
  demoMode: boolean;
};

export function TicketsCheckoutFlow({
  eventSlug,
  eventTitle,
  ticketTypes,
  supportEmail = "",
  doorCheckDisclaimer = "",
  demoMode,
}: Props) {
  const [step, setStep] = useState(1);
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(ticketTypes.map((t) => [t.id, 0]))
  );
  const stepAnchorRef = useRef<HTMLDivElement>(null);
  const stepMountedRef = useRef(false);

  const selected = useMemo(
    () =>
      ticketTypes
        .map((t) => ({ ...t, quantity: qty[t.id] || 0 }))
        .filter((t) => t.quantity > 0),
    [qty, ticketTypes]
  );

  const totalCents = selected.reduce(
    (sum, t) => sum + t.priceCents * t.quantity,
    0
  );
  const totalTickets = selected.reduce((sum, t) => sum + t.quantity, 0);

  const lines = selected.map((t) => ({
    ticketTypeId: t.id,
    name: t.name,
    quantity: t.quantity,
    unitPriceCents: t.priceCents,
  }));

  function scrollStepIntoView() {
    // Use a non-sticky sentinel: sticky progress's getBoundingClientRect()
    // reports the stuck viewport position, which cancels out to "stay put".
    const target =
      stepAnchorRef.current ?? document.getElementById("ticket-options");
    const header =
      Number.parseFloat(
        getComputedStyle(document.documentElement)
          .getPropertyValue("--header-h")
          .trim()
      ) || 76;

    if (!target) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const top = Math.max(
      0,
      target.getBoundingClientRect().top + window.scrollY - header
    );
    window.scrollTo({ top, left: 0, behavior: "auto" });
  }

  useEffect(() => {
    if (!stepMountedRef.current) {
      stepMountedRef.current = true;
      return;
    }
    // Wait for the shorter step content to paint so scroll position is correct.
    let timeoutId = 0;
    let raf2 = 0;
    const raf1 = window.requestAnimationFrame(() => {
      raf2 = window.requestAnimationFrame(() => {
        scrollStepIntoView();
        // Mobile browsers sometimes need a second pass after sticky/layout settle.
        timeoutId = window.setTimeout(scrollStepIntoView, 120);
      });
    });
    return () => {
      window.cancelAnimationFrame(raf1);
      window.cancelAnimationFrame(raf2);
      window.clearTimeout(timeoutId);
    };
  }, [step]);

  function updateQty(id: string, next: number) {
    setQty((prev) => ({
      ...prev,
      [id]: Math.max(0, next),
    }));
  }

  function goToStep(next: number) {
    if (next >= 1 && next <= 3 && next <= step) {
      setStep(next);
    }
  }

  function continueFromSelect() {
    if (selected.length === 0) return;
    setStep(2);
    scrollStepIntoView();
  }

  function continueFromReview() {
    if (selected.length === 0) return;
    setStep(3);
    scrollStepIntoView();
  }

  return (
    <>
      {/* Non-sticky scroll target - sits where the progress bar lives in document flow */}
      <div
        ref={stepAnchorRef}
        className="tickets-step-anchor"
        aria-hidden
      />
      <div className="tickets-progress-wrap">
        <div className="container">
          <CheckoutProgress current={step} onStepClick={goToStep} />
        </div>
      </div>

      <section id="ticket-options" className="tickets-page-section">
        <div className="container">
          {step === 1 ? (
            <div className="ts-layout">
              <div className="ts-panel">
                <div className="ts-panel__head">
                  <div>
                    <h2 className="ts-panel__title">
                      Ticket Options
                      <span className="ts-panel__title-rule" aria-hidden />
                    </h2>
                  </div>
                  <p className="ts-panel__note">
                    Select your ticket type and quantity to continue.
                  </p>
                </div>

                {doorCheckDisclaimer ? (
                  <aside className="ts-disclaimer" role="note">
                    <IconInfo className="ts-disclaimer__icon" aria-hidden />
                    <p>{doorCheckDisclaimer}</p>
                  </aside>
                ) : null}

                <ul className="ts-list">
                  {ticketTypes.map((t, index) => {
                    const quantity = qty[t.id] || 0;
                    const Icon = iconForTicket(t.name, index);

                    return (
                      <li
                        key={t.id}
                        className={`ts-card ${
                          quantity > 0 ? "is-selected" : ""
                        }`}
                      >
                        <span className="ts-card__icon" aria-hidden>
                          <Icon />
                        </span>

                        <div className="ts-card__info">
                          <h3 className="ts-card__name">{t.name}</h3>
                          <p className="ts-card__desc">
                            {t.description || "Includes event access."}
                          </p>
                          <p className="ts-card__price">
                            {formatCurrency(t.priceCents)}
                          </p>
                        </div>

                        <div
                          className="ts-qty"
                          role="group"
                          aria-label={`${t.name} quantity`}
                        >
                          <button
                            type="button"
                            className="ts-qty__btn ts-qty__btn--minus"
                            aria-label={`Decrease ${t.name} quantity`}
                            disabled={quantity === 0}
                            onClick={() => updateQty(t.id, quantity - 1)}
                          >
                            −
                          </button>
                          <span className="ts-qty__value" aria-live="polite">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            className="ts-qty__btn ts-qty__btn--plus"
                            aria-label={`Increase ${t.name} quantity`}
                            onClick={() => updateQty(t.id, quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <aside className="ts-support">
                  <IconInfo className="ts-support__icon" />
                  <div>
                    <h3>Need Something Special?</h3>
                    <p>
                      For group purchases, sponsorship opportunities, or custom
                      requests, please contact us
                      {supportEmail ? (
                        <>
                          {" "}
                          at{" "}
                          <a
                            className="text-link"
                            href={`mailto:${supportEmail}`}
                          >
                            {supportEmail}
                          </a>
                        </>
                      ) : (
                        <>; support contact will be published once confirmed</>
                      )}
                      .
                    </p>
                  </div>
                </aside>
              </div>

              <aside className="ts-summary" aria-live="polite">
                <div className="ts-summary__head">
                  <IconTicket className="ts-summary__bag" aria-hidden />
                  <h2>Order Summary</h2>
                  <span className="ts-summary__rule" aria-hidden />
                </div>

                {selected.length === 0 ? (
                  <div className="ts-summary__empty">
                    <IconTicket
                      className="ts-summary__empty-icon"
                      aria-hidden
                    />
                    <p className="ts-summary__empty-title">
                      No tickets selected yet.
                    </p>
                    <p className="ts-summary__empty-copy">
                      Choose your ticket type and quantity to get started.
                    </p>
                  </div>
                ) : (
                  <ul className="ts-summary__lines">
                    {selected.map((t) => (
                      <li key={t.id}>
                        <div>
                          <strong>{t.name}</strong>
                          <span>
                            {t.quantity} × {formatCurrency(t.priceCents)}
                          </span>
                        </div>
                        <span>
                          {formatCurrency(t.priceCents * t.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="ts-summary__total">
                  <span>Total</span>
                  <span>{formatCurrency(totalCents)}</span>
                </div>
                <p className="ts-summary__hint">
                  Estimated subtotal; final amount is confirmed at checkout.
                </p>

                <button
                  type="button"
                  className="btn btn--primary btn--block ts-summary__cta"
                  disabled={totalTickets === 0}
                  onClick={continueFromSelect}
                >
                  <span>Continue to Review</span>
                  <IconArrowRight className="btn__icon" />
                </button>

                <p className="ts-summary__secure">
                  <IconShield className="ts-summary__lock" aria-hidden />
                  Secure payment processing
                </p>

                <AcceptedPaymentMethods className="ts-summary__payments" />
              </aside>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="review-layout">
              <div className="review-panel">
                <div className="ts-panel__head">
                  <div>
                    <h2 className="ts-panel__title">
                      Review Your Order
                      <span className="ts-panel__title-rule" aria-hidden />
                    </h2>
                  </div>
                  <p className="ts-panel__note">
                    Confirm your tickets before entering payment details.
                  </p>
                </div>

                <p className="review-panel__event">{eventTitle}</p>

                <ul className="review-lines">
                  {selected.map((t) => (
                    <li key={t.id} className="review-line">
                      <div className="review-line__main">
                        <strong>{t.name}</strong>
                        <span>
                          {t.quantity} × {formatCurrency(t.priceCents)}
                        </span>
                      </div>
                      <span className="review-line__total">
                        {formatCurrency(t.priceCents * t.quantity)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="review-total">
                  <span>Order total</span>
                  <span>{formatCurrency(totalCents)}</span>
                </div>
              </div>

              <aside className="ts-summary">
                <div className="ts-summary__head">
                  <IconTicket className="ts-summary__bag" aria-hidden />
                  <h2>Ready to pay</h2>
                  <span className="ts-summary__rule" aria-hidden />
                </div>
                <p className="ts-summary__empty-copy">
                  Next you’ll enter your name and email so we can send your QR
                  tickets after payment.
                </p>
                <div className="ts-summary__total">
                  <span>Total</span>
                  <span>{formatCurrency(totalCents)}</span>
                </div>

                <div className="review-actions review-actions--sidebar">
                  <button
                    type="button"
                    className="btn btn--primary btn--block ts-summary__cta"
                    onClick={continueFromReview}
                  >
                    <span>Continue to Checkout</span>
                    <IconArrowRight className="btn__icon" />
                  </button>
                  <button
                    type="button"
                    className="btn btn--secondary btn--block"
                    onClick={() => setStep(1)}
                  >
                    Edit tickets
                  </button>
                </div>

                <p className="ts-summary__secure">
                  <IconShield className="ts-summary__lock" aria-hidden />
                  Secure payment processing
                </p>
                <AcceptedPaymentMethods className="ts-summary__payments" />
              </aside>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="checkout-step">
              <div className="ts-panel__head checkout-step__head">
                <div>
                  <h2 className="ts-panel__title">
                    Checkout
                    <span className="ts-panel__title-rule" aria-hidden />
                  </h2>
                </div>
                <p className="ts-panel__note">
                  Enter your details to complete your purchase and receive QR
                  tickets.
                </p>
              </div>

              <CheckoutForm
                eventSlug={eventSlug}
                eventTitle={eventTitle}
                lines={lines}
                totalCents={totalCents}
                demoMode={demoMode}
              />

              <button
                type="button"
                className="btn btn--secondary checkout-step__back"
                onClick={() => setStep(2)}
              >
                Back to review
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </>
  );
}
