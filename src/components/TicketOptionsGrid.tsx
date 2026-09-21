"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AcceptedPaymentMethods } from "@/components/AcceptedPaymentMethods";
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

const MAX_PER_ORDER = 20;
const LOW_STOCK = 20;

function iconForTicket(name: string, index: number) {
  const n = name.toLowerCase();
  if (n.includes("capri") || n.includes("pouch") || n.includes("bag")) return IconTicket;
  if (n.includes("vip")) return IconStar;
  if (n.includes("table") || n.includes("sponsor")) return IconUsers;
  if (n.includes("couple") || n.includes("pair")) return IconUsers;
  if (n.includes("women") || index === 0) return IconPerson;
  return IconUsers;
}

type Props = {
  eventSlug: string;
  ticketTypes: SelectableTicketType[];
  supportEmail?: string;
};

export function TicketOptionsGrid({
  eventSlug,
  ticketTypes,
  supportEmail = "",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
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

  function maxFor(t: SelectableTicketType) {
    return Math.min(MAX_PER_ORDER, Math.max(0, t.remaining));
  }

  function updateQty(id: string, next: number, max: number) {
    setQty((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(max, next)),
    }));
  }

  function continueToCheckout() {
    if (selected.length === 0 || pending) return;
    const params = new URLSearchParams({ event: eventSlug });
    selected.forEach((t) => {
      params.append("t", `${t.id}:${t.quantity}`);
    });
    startTransition(() => {
      router.push(`/checkout?${params.toString()}`);
    });
  }

  return (
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

        <ul className="ts-list">
          {ticketTypes.map((t, index) => {
            const soldOut = t.remaining <= 0;
            const quantity = qty[t.id] || 0;
            const max = maxFor(t);
            const Icon = iconForTicket(t.name, index);
            const low = !soldOut && t.remaining <= LOW_STOCK;

            return (
              <li
                key={t.id}
                className={`ts-card ${soldOut ? "is-soldout" : ""} ${
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
                  <p className="ts-card__price">{formatCurrency(t.priceCents)}</p>
                  <p className={`ts-card__stock ${low ? "is-low" : ""}`}>
                    {soldOut ? (
                      "Sold out"
                    ) : (
                      <>
                        <span className="ts-card__dot" aria-hidden />
                        {t.remaining} remaining
                      </>
                    )}
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
                    disabled={soldOut || quantity === 0}
                    onClick={() => updateQty(t.id, quantity - 1, max)}
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
                    disabled={soldOut || quantity >= max}
                    onClick={() => updateQty(t.id, quantity + 1, max)}
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
                  <a className="text-link" href={`mailto:${supportEmail}`}>
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
            <IconTicket className="ts-summary__empty-icon" aria-hidden />
            <p className="ts-summary__empty-title">No tickets selected yet.</p>
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
                <span>{formatCurrency(t.priceCents * t.quantity)}</span>
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
          disabled={totalTickets === 0 || pending}
          onClick={continueToCheckout}
        >
          <span>{pending ? "Continuing…" : "Continue to Checkout"}</span>
          {!pending ? <IconArrowRight className="btn__icon" /> : null}
        </button>

        <p className="ts-summary__secure">
          <IconShield className="ts-summary__lock" aria-hidden />
          Secure payment processing
        </p>

        <AcceptedPaymentMethods className="ts-summary__payments" />
      </aside>
    </div>
  );
}
