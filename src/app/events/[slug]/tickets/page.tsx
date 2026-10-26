import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { SalesClosedNotice } from "@/components/SalesClosedNotice";
import { TicketsCheckoutFlow } from "@/components/TicketsCheckoutFlow";
import {
  getEventBySlug,
  isEventUpcoming,
} from "@/lib/catalog";
import {
  getEventPresentation,
  getTicketsPresentation,
} from "@/lib/event-content";
import { formatEventDateCompact, formatEventTimeRange } from "@/lib/format";
import { isUiPreview } from "@/lib/preview";
import { isStripeConfigured } from "@/lib/stripe";
import { TICKET_SALES_OPEN } from "@/lib/ticket-sales";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug, { activeTicketsOnly: false });
  if (!event) return { title: "Tickets" };
  return {
    title: `Tickets · ${event.title}`,
    description: `Get tickets for ${event.title}.`,
  };
}

export default async function EventTicketsPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug, { activeTicketsOnly: false });

  if (!event || !event.isPublished) notFound();

  const content = getEventPresentation(event.slug);
  const ticketsContent = getTicketsPresentation(event.slug);
  const upcoming = isEventUpcoming(event);
  const demoMode = isUiPreview() || !isStripeConfigured();

  const selectable = event.ticketTypes
    .filter((t) => t.isActive)
    .map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      priceCents: t.priceCents,
      remaining: Math.max(0, t.capacity - t.soldCount),
    }));

  const heroImage = event.imageUrl || content.gallery.primary.src;

  return (
    <>
      <section className="ed-hero tickets-hero" aria-label="Tickets">
        <div className="ed-hero__media" aria-hidden>
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="ed-hero__image"
          />
          <div className="ed-hero__overlay" />
        </div>
        <div className="ed-hero__content">
          <div className="ed-hero__inner">
            <p className="ed-hero__eyebrow">Tickets</p>
            <h1 className="ed-hero__title">{event.title}</h1>
            <p className="ed-hero__lede">
              {formatEventDateCompact(event.startAt)} ·{" "}
              {formatEventTimeRange(event.startAt, event.endAt)}
              {event.subtitle ? ` · ${event.subtitle}` : ""}
            </p>
            <Link href={`/events/${event.slug}`} className="btn btn--ghost">
              Event details
            </Link>
          </div>
        </div>
      </section>

      {TICKET_SALES_OPEN && upcoming && selectable.length > 0 ? (
        <TicketsCheckoutFlow
          eventSlug={event.slug}
          eventTitle={event.title}
          ticketTypes={selectable}
          supportEmail={ticketsContent.supportEmail}
          doorCheckDisclaimer={ticketsContent.doorCheckDisclaimer}
          eventNotices={content.notices}
          demoMode={demoMode}
        />
      ) : (
        <section className="tickets-page-section">
          <div className="container">
            {TICKET_SALES_OPEN ? (
              <div className="event-sales-closed">
                <h2>Ticket sales closed</h2>
                <p>
                  {upcoming
                    ? "Tickets are not available for this event right now."
                    : "This event has ended. Browse upcoming parties to get tickets."}
                </p>
                <Link className="btn btn--primary" href="/events">
                  View all events
                </Link>
              </div>
            ) : (
              <SalesClosedNotice />
            )}
          </div>
        </section>
      )}
    </>
  );
}
