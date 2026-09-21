"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";

export type SelectableTicketType = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  remaining: number;
};

type Props = {
  eventSlug: string;
  ticketTypes: SelectableTicketType[];
};

export function TicketSelector({ eventSlug, ticketTypes }: Props) {
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

  function updateQty(id: string, next: number, max: number) {
    setQty((prev) => ({
      ...prev,
      [id]: Math.max(0, Math.min(max, next)),
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
    <div className="ticket-panel">
      <h2 className="ticket-panel__title">Select Tickets</h2>
      <ul className="ticket-list">
        {ticketTypes.map((t) => {
          const soldOut = t.remaining <= 0;
          return (
            <li key={t.id} className={`ticket-row ${soldOut ? "is-soldout" : ""}`}>
              <div className="ticket-row__info">
                <h3>{t.name}</h3>
                {t.description ? <p>{t.description}</p> : null}
                <p className="ticket-row__meta">
                  {soldOut
                    ? "Sold out"
                    : `${t.remaining} remaining · ${formatCurrency(t.priceCents)}`}
                </p>
              </div>
              <div className="ticket-row__qty">
                <button
                  type="button"
                  aria-label={`Decrease ${t.name}`}
                  disabled={soldOut || (qty[t.id] || 0) === 0}
                  onClick={() => updateQty(t.id, (qty[t.id] || 0) - 1, t.remaining)}
                >
                  −
                </button>
                <span aria-live="polite">{qty[t.id] || 0}</span>
                <button
                  type="button"
                  aria-label={`Increase ${t.name}`}
                  disabled={soldOut || (qty[t.id] || 0) >= t.remaining}
                  onClick={() => updateQty(t.id, (qty[t.id] || 0) + 1, t.remaining)}
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="ticket-panel__footer">
        <div>
          <p className="ticket-panel__summary">
            {totalTickets === 0
              ? "No tickets selected"
              : `${totalTickets} ticket${totalTickets === 1 ? "" : "s"}`}
          </p>
          <p className="ticket-panel__total">{formatCurrency(totalCents)}</p>
        </div>
        <button
          type="button"
          className="btn btn--primary"
          disabled={totalTickets === 0}
          onClick={continueToCheckout}
        >
          Continue to checkout
        </button>
      </div>
    </div>
  );
}
