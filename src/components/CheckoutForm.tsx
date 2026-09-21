"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { CheckoutPreparingModal } from "@/components/CheckoutPreparingModal";
import { Toast, type ToastTone } from "@/components/Toast";
import { formatCurrency } from "@/lib/format";

type Line = {
  ticketTypeId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
};

type Props = {
  eventSlug: string;
  eventTitle: string;
  lines: Line[];
  totalCents: number;
  demoMode: boolean;
};

type ToastState = {
  message: string;
  tone: ToastTone;
} | null;

export function CheckoutForm({
  eventSlug,
  eventTitle,
  lines,
  totalCents,
  demoMode,
}: Props) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    setToast({
      tone: demoMode ? "info" : "ok",
      message: demoMode
        ? "Demo mode is active (Stripe keys not set). You can complete a full purchase without a card."
        : "Secure payment via Stripe. You will be redirected to complete your card payment.",
    });
  }, [demoMode]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setToast(null);
    setLoading(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventSlug,
          buyerName: name.trim(),
          buyerEmail: email.trim(),
          items: lines.map((l) => ({
            ticketTypeId: l.ticketTypeId,
            quantity: l.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
        return;
      }

      throw new Error("No checkout URL returned");
    } catch (err) {
      setLoading(false);
      setToast({
        tone: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }

  return (
    <div className="checkout-grid">
      <form className="checkout-form" onSubmit={onSubmit}>
        <h2>Buyer information</h2>
        <label>
          Full name
          <input
            required
            name="name"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan Ellis"
            disabled={loading}
          />
        </label>
        <label>
          Email
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@email.com"
            disabled={loading}
          />
        </label>
        <p className="checkout-form__hint">
          Your tickets and QR codes will be sent to this email after payment.
        </p>

        <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
          {demoMode
            ? `Complete purchase · ${formatCurrency(totalCents)}`
            : `Pay ${formatCurrency(totalCents)}`}
        </button>
      </form>

      <aside className="order-summary">
        <h2>Order summary</h2>
        <p className="order-summary__event">{eventTitle}</p>
        <ul>
          {lines.map((l) => (
            <li key={l.ticketTypeId}>
              <span>
                {l.quantity}× {l.name}
              </span>
              <span>{formatCurrency(l.unitPriceCents * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="order-summary__total">
          <span>Total</span>
          <span>{formatCurrency(totalCents)}</span>
        </div>
      </aside>

      <CheckoutPreparingModal open={loading} />

      {toast ? (
        <Toast
          message={toast.message}
          tone={toast.tone}
          onDismiss={dismissToast}
        />
      ) : null}
    </div>
  );
}
