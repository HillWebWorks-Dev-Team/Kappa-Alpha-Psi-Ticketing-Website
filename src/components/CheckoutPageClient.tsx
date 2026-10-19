"use client";

import Link from "next/link";
import { CheckoutForm } from "@/components/CheckoutForm";
import { CheckoutProgress } from "@/components/CheckoutProgress";

export type CheckoutLine = {
  ticketTypeId: string;
  name: string;
  quantity: number;
  unitPriceCents: number;
};

type Props = {
  eventSlug: string;
  eventTitle: string;
  lines: CheckoutLine[];
  totalCents: number;
  demoMode: boolean;
};

export function CheckoutPageClient({
  eventSlug,
  eventTitle,
  lines,
  totalCents,
  demoMode,
}: Props) {
  const editHref = `/events/${eventSlug}/tickets`;

  return (
    <>
      <div className="tickets-progress-wrap">
        <div className="container">
          <CheckoutProgress current={3} />
        </div>
      </div>

      <section className="tickets-page-section checkout-page">
        <div className="container">
          <div className="checkout-step">
            <div className="ts-panel__head checkout-step__head">
              <div>
                <h1 className="ts-panel__title">
                  Checkout
                  <span className="ts-panel__title-rule" aria-hidden />
                </h1>
              </div>
              <p className="ts-panel__note">
                Enter your details to complete your purchase for {eventTitle}{" "}
                and receive QR tickets.
              </p>
            </div>

            <CheckoutForm
              eventSlug={eventSlug}
              eventTitle={eventTitle}
              lines={lines}
              totalCents={totalCents}
              demoMode={demoMode}
            />

            <Link
              href={editHref}
              className="btn btn--secondary checkout-step__back"
            >
              Edit tickets
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
