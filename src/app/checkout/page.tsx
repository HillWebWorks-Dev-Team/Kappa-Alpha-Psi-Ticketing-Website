import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckoutPageClient } from "@/components/CheckoutPageClient";
import { SalesClosedNotice } from "@/components/SalesClosedNotice";
import {
  getEventBySlug,
  getFeaturedEvent,
  isEventUpcoming,
} from "@/lib/catalog";
import { isUiPreview } from "@/lib/preview";
import { isStripeConfigured } from "@/lib/stripe";
import { TICKET_SALES_OPEN } from "@/lib/ticket-sales";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your Legendary Entertainment ticket purchase.",
};

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function parseTicketParams(
  raw: string | string[] | undefined
): { ticketTypeId: string; quantity: number }[] {
  const values = Array.isArray(raw) ? raw : raw ? [raw] : [];
  const items: { ticketTypeId: string; quantity: number }[] = [];

  for (const value of values) {
    const [ticketTypeId, qtyRaw] = value.split(":");
    const quantity = Number.parseInt(qtyRaw || "", 10);
    if (!ticketTypeId || !Number.isFinite(quantity) || quantity < 1) continue;
    items.push({ ticketTypeId, quantity });
  }

  return items;
}

export default async function CheckoutPage({ searchParams }: Props) {
  if (!TICKET_SALES_OPEN) {
    return (
      <div className="page checkout-page-shell">
        <section className="tickets-page-section">
          <div className="container">
            <SalesClosedNotice />
          </div>
        </section>
      </div>
    );
  }

  const sp = await searchParams;
  const requestedSlug =
    typeof sp.event === "string" && sp.event.trim() ? sp.event.trim() : null;

  const event = requestedSlug
    ? await getEventBySlug(requestedSlug)
    : await getFeaturedEvent();

  if (!event) redirect("/events");

  if (!isEventUpcoming(event)) {
    redirect(`/events/${event.slug}`);
  }

  const requested = parseTicketParams(sp.t);
  if (requested.length === 0) {
    redirect(`/events/${event.slug}/tickets`);
  }

  const lines = [];
  for (const item of requested) {
    const type = event.ticketTypes.find((t) => t.id === item.ticketTypeId);
    if (!type || !type.isActive) {
      redirect(`/events/${event.slug}/tickets`);
    }
    const remaining = Math.max(0, type.capacity - type.soldCount);
    if (item.quantity > remaining) {
      redirect(`/events/${event.slug}/tickets`);
    }
    lines.push({
      ticketTypeId: type.id,
      name: type.name,
      quantity: item.quantity,
      unitPriceCents: type.priceCents,
    });
  }

  if (lines.length === 0) {
    redirect(`/events/${event.slug}/tickets`);
  }

  const totalCents = lines.reduce(
    (sum, line) => sum + line.unitPriceCents * line.quantity,
    0
  );
  const demoMode = isUiPreview() || !isStripeConfigured();

  return (
    <div className="page checkout-page-shell">
      <div className="container checkout-page-shell__crumb">
        <Link href={`/events/${event.slug}`} className="text-link">
          ← Back to {event.title}
        </Link>
      </div>
      <CheckoutPageClient
        eventSlug={event.slug}
        eventTitle={event.title}
        lines={lines}
        totalCents={totalCents}
        demoMode={demoMode}
      />
    </div>
  );
}
