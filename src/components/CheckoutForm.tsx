"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
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

type PaymentSession = {
  clientSecret: string;
  orderId: string;
};

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "";
const stripePromise = publishableKey ? loadStripe(publishableKey) : null;

function OrderSummary({
  eventTitle,
  lines,
  totalCents,
}: {
  eventTitle: string;
  lines: Line[];
  totalCents: number;
}) {
  return (
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
  );
}

function StripePayForm({
  totalCents,
  orderId,
  onError,
}: {
  totalCents: number;
  orderId: string;
  onError: (message: string) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);

  async function onPay(e: FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || window.location.origin;

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${appUrl}/confirmation/${orderId}`,
      },
      redirect: "if_required",
    });

    if (error) {
      onError(error.message || "Payment failed. Please try again.");
      setSubmitting(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      window.location.href = `${appUrl}/confirmation/${orderId}?payment_intent=${paymentIntent.id}`;
      return;
    }

    // 3DS / bank redirect may still navigate away via return_url
    setSubmitting(false);
  }

  return (
    <>
      <form className="checkout-form checkout-form--pay" onSubmit={onPay}>
        <h2>Payment</h2>
        <p className="checkout-form__hint">
          Pay securely on this page. Your card details go directly to Stripe.
        </p>
        <div className="stripe-payment-box">
          <PaymentElement
            options={{
              layout: "tabs",
            }}
          />
        </div>
        <button
          type="submit"
          className="btn btn--primary btn--block"
          disabled={!stripe || !elements || submitting}
        >
          {submitting
            ? "Processing…"
            : `Pay ${formatCurrency(totalCents)}`}
        </button>
      </form>

      <CheckoutPreparingModal
        open={submitting}
        title="Processing payment"
        message="Please keep this window open while we confirm your payment and prepare your tickets."
        steps={[
          "Confirming payment with Stripe",
          "Creating your tickets",
          "Opening confirmation",
        ]}
      />
    </>
  );
}

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
  const [payment, setPayment] = useState<PaymentSession | null>(null);

  const dismissToast = useCallback(() => setToast(null), []);

  useEffect(() => {
    setToast({
      tone: demoMode ? "info" : "ok",
      message: demoMode
        ? "Demo mode is active (Stripe keys not set). You can complete a full purchase without a card."
        : "Enter your details, then pay with card on this page - no redirect to Stripe.",
    });
  }, [demoMode]);

  const elementsOptions = useMemo<StripeElementsOptions | null>(() => {
    if (!payment?.clientSecret) return null;
    return {
      clientSecret: payment.clientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#70110c",
          colorBackground: "#f2ebd7",
          colorText: "#242020",
          colorDanger: "#70110c",
          fontFamily: "system-ui, sans-serif",
          borderRadius: "2px",
          spacingUnit: "4px",
        },
      },
    };
  }, [payment?.clientSecret]);

  async function onSubmitBuyer(e: FormEvent) {
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

      // Demo / preview: go straight to confirmation
      if (data.url) {
        window.location.href = data.url;
        return;
      }

      if (data.clientSecret && data.orderId) {
        setPayment({
          clientSecret: data.clientSecret,
          orderId: data.orderId,
        });
        setLoading(false);
        setToast({
          tone: "ok",
          message: "Order ready - enter your card details below to finish.",
        });
        return;
      }

      throw new Error("No payment session returned");
    } catch (err) {
      setLoading(false);
      setToast({
        tone: "error",
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    }
  }

  return (
    <div
      className={
        payment ? "checkout-grid checkout-grid--pay" : "checkout-grid"
      }
    >
      {!payment ? (
        <>
          <form className="checkout-form" onSubmit={onSubmitBuyer}>
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
              Your tickets and QR codes will be sent to this email after
              payment.
            </p>

            <button
              type="submit"
              className="btn btn--primary btn--block"
              disabled={loading}
            >
              {demoMode
                ? `Complete purchase · ${formatCurrency(totalCents)}`
                : `Continue to payment · ${formatCurrency(totalCents)}`}
            </button>
          </form>

          <OrderSummary
            eventTitle={eventTitle}
            lines={lines}
            totalCents={totalCents}
          />
        </>
      ) : stripePromise && elementsOptions ? (
        <>
          <div className="checkout-pay-meta">
            <OrderSummary
              eventTitle={eventTitle}
              lines={lines}
              totalCents={totalCents}
            />
            <div className="checkout-buyer-locked">
              <h2>Buyer information</h2>
              <p>
                <strong>{name.trim()}</strong>
                <br />
                <span>{email.trim()}</span>
              </p>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={() => setPayment(null)}
              >
                Edit details
              </button>
            </div>
          </div>
          <Elements stripe={stripePromise} options={elementsOptions}>
            <StripePayForm
              totalCents={totalCents}
              orderId={payment.orderId}
              onError={(message) => setToast({ tone: "error", message })}
            />
          </Elements>
        </>
      ) : (
        <div className="checkout-form">
          <p className="banner banner--error">
            Stripe publishable key is missing. Set
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
          </p>
        </div>
      )}

      <CheckoutPreparingModal
        open={loading}
        title={demoMode ? "Completing purchase" : "Preparing checkout"}
        message={
          demoMode
            ? "Please wait while we confirm your order and create tickets…"
            : "Please wait while we secure your order…"
        }
        steps={
          demoMode
            ? ["Creating your order", "Issuing tickets", "Opening confirmation"]
            : ["Creating your order", "Starting secure payment"]
        }
      />

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
