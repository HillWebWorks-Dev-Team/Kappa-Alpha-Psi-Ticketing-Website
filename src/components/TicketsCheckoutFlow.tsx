"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AcceptedPaymentMethods } from "@/components/AcceptedPaymentMethods";
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
  /** Extra notices shown above ticket options (e.g. liquor sold). */
  eventNotices?: string[];
  /** Kept for call-site compatibility; payment happens on /checkout. */
  demoMode?: boolean;
};

export function TicketsCheckoutFlow({
  eventSlug,
  ticketTypes,
  supportEmail = "",
  doorCheckDisclaimer = "",
  eventNotices = [],
}: Props) {
  const router = useRouter();
  const [qty, setQty] = useState<Record<string, number>>(() =>
    Object.fromEntries(ticketTypes.map((t) => [t.id, 0]))
  );

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

  function updateQty(id: string, next: number) {
    setQty((prev) => ({
      ...prev,
      [id]: Math.max(0, next),
    }));
  }

  function continueToCheckout() {
    if (selected.length === 0) return;
    const params = new URLSearchParams({ event: eventSlug });
    selected.forEach((t) => {
      params.append("t", `${t.id}:${t.quantity}`);
    });
    router.push(`/checkout?${params.toString()}`);
  }

  return (
    <>
      <div className="tickets-progress-wrap">
        <div className="container">
          <CheckoutProgress current={1} />
        </div>
      </div>

      <section id="ticket-options" className="tickets-page-section">
        <div className="container">
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
                  Select your ticket type and quantity to continue to checkout.
                </p>
              </div>

              {eventNotices.map((notice) => (
                <aside
                  key={notice}
                  className="ts-disclaimer ts-disclaimer--notice"
                  role="note"
                >
                  <IconInfo className="ts-disclaimer__icon" aria-hidden />
                  <p>{notice}</p>
                </aside>
              ))}

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
                      className={`ts-card ${quantity > 0 ? "is-selected" : ""}`}
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
                onClick={continueToCheckout}
              >
                <span>Continue to Checkout</span>
                <IconArrowRight className="btn__icon" />
              </button>

              <p className="ts-summary__secure">
                <IconShield className="ts-summary__lock" aria-hidden />
                Secure payment processing
              </p>

              <AcceptedPaymentMethods className="ts-summary__payments" />
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
