/**
 * Accepted payment methods shown in Order Summary.
 *
 * Verification (Stripe Checkout integration in `src/app/api/checkout/route.ts`):
 * - Checkout Sessions are created in `mode: "payment"` with USD line items.
 * - `payment_method_types` is omitted, so Stripe uses Dashboard dynamic methods.
 * - App copy and flow treat checkout as card payment via Stripe.
 * - Visa / Mastercard / Amex / Discover are the standard US card brands Stripe
 *   accepts for card payments.
 * - Apple Pay is a card wallet shown by Stripe Checkout when the customer's
 *   device/browser is eligible (not a separate `payment_method_types` value).
 *
 * Dashboard toggles can still hide methods; confirm Apple Pay / Discover in the
 * Stripe Dashboard if the connected account settings are customized.
 */

export type PaymentMethodId =
  | "visa"
  | "mastercard"
  | "amex"
  | "discover"
  | "apple_pay";

export type PaymentMethodMeta = {
  id: PaymentMethodId;
  label: string;
  src: string;
  /** When true, shown as accepted but may only appear at checkout when eligible. */
  conditional?: boolean;
};

export const PAYMENT_METHOD_CATALOG: Record<PaymentMethodId, PaymentMethodMeta> =
  {
    visa: {
      id: "visa",
      label: "Visa",
      src: "/payment-methods/visa.svg",
    },
    mastercard: {
      id: "mastercard",
      label: "Mastercard",
      src: "/payment-methods/mastercard.svg",
    },
    amex: {
      id: "amex",
      label: "American Express",
      src: "/payment-methods/amex.svg",
    },
    discover: {
      id: "discover",
      label: "Discover",
      src: "/payment-methods/discover.svg",
    },
    apple_pay: {
      id: "apple_pay",
      label: "Apple Pay",
      src: "/payment-methods/apple-pay.svg",
      conditional: true,
    },
  };

/** Methods verified from this project's Stripe Checkout + card flow. */
export const ACCEPTED_PAYMENT_METHOD_IDS: PaymentMethodId[] = [
  "visa",
  "mastercard",
  "amex",
  "discover",
  "apple_pay",
];

export function getAcceptedPaymentMethods(
  ids: PaymentMethodId[] = ACCEPTED_PAYMENT_METHOD_IDS
): PaymentMethodMeta[] {
  const seen = new Set<PaymentMethodId>();
  return ids
    .filter((id) => {
      if (seen.has(id)) return false;
      seen.add(id);
      return id in PAYMENT_METHOD_CATALOG;
    })
    .map((id) => PAYMENT_METHOD_CATALOG[id]);
}
