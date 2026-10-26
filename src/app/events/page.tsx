import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  listPublishedEvents,
  partitionEventsByTiming,
  type CatalogEvent,
} from "@/lib/catalog";
import {
  formatCurrency,
  formatEventDateCompact,
  formatEventTimeRange,
} from "@/lib/format";
import {
  TICKET_SALES_CLOSED_MESSAGE,
  TICKET_SALES_OPEN,
} from "@/lib/ticket-sales";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Upcoming and past events from Legendary Entertainment. Ticket sales on this site are closed.",
};

function lowestPrice(event: CatalogEvent): number | null {
  if (event.ticketTypes.length === 0) return null;
  return Math.min(...event.ticketTypes.map((t) => t.priceCents));
}

function EventRow({
  event,
  variant,
}: {
  event: CatalogEvent;
  variant: "upcoming" | "past";
}) {
  const fromPrice = lowestPrice(event);
  const href = `/events/${event.slug}`;
  const imageSrc = event.imageUrl || "/flyer.png";

  return (
    <article className={`events-row events-row--${variant}`}>
      <Link href={href} className="events-row__media">
        <Image
          src={imageSrc}
          alt={`${event.title} flyer`}
          fill
          sizes="(max-width: 720px) 100vw, 280px"
          className="events-row__image"
        />
      </Link>

      <div className="events-row__body">
        <div className="events-row__meta">
          <p className="events-row__status">
            {variant === "upcoming" ? "Upcoming" : "Past event"}
          </p>
          <h2 className="events-row__title">
            <Link href={href}>{event.title}</Link>
          </h2>
          {event.subtitle ? (
            <p className="events-row__subtitle">{event.subtitle}</p>
          ) : null}
          <p className="events-row__when">
            {formatEventDateCompact(event.startAt)}
            {" · "}
            {formatEventTimeRange(event.startAt, event.endAt)}
          </p>
          <p className="events-row__where">
            {event.venue}
            {" · "}
            {event.city}, {event.state}
          </p>
          {TICKET_SALES_OPEN && fromPrice != null && variant === "upcoming" ? (
            <p className="events-row__price">From {formatCurrency(fromPrice)}</p>
          ) : null}
        </div>

        <div className="events-row__actions">
          {variant === "upcoming" && TICKET_SALES_OPEN ? (
            <Link className="btn btn--primary" href={`${href}/tickets`}>
              View &amp; buy tickets
            </Link>
          ) : variant === "upcoming" ? (
            <Link className="btn btn--secondary" href={href}>
              View event
            </Link>
          ) : (
            <Link className="btn btn--secondary" href={href}>
              View event
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

export default async function EventsPage() {
  const events = await listPublishedEvents();
  const { upcoming, past } = partitionEventsByTiming(events);

  return (
    <div className="page events-page">
      <header className="events-masthead" aria-label="Events">
        <div className="container events-masthead__inner">
          <div className="events-masthead__copy">
            <p className="events-masthead__eyebrow">Legendary Entertainment</p>
            <h1 className="events-masthead__title">Events</h1>
            <p className="events-masthead__lede">
              Browse upcoming parties and look back at nights that already went
              down.
              {TICKET_SALES_OPEN
                ? upcoming.length > 0
                  ? " Pick an event for details and tickets."
                  : " Pick an event for details."
                : ` ${TICKET_SALES_CLOSED_MESSAGE}`}
            </p>
          </div>
          <dl className="events-masthead__stats">
            <div>
              <dt>Upcoming</dt>
              <dd>{upcoming.length}</dd>
            </div>
            <div>
              <dt>Past</dt>
              <dd>{past.length}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="container events-page__body">
        <section className="events-section" aria-labelledby="upcoming-heading">
          <div className="events-section__head">
            <h2 id="upcoming-heading" className="events-section__title">
              Upcoming
            </h2>
            <p className="events-section__lede">
              {TICKET_SALES_OPEN
                ? "Get tickets for the next Legendary Entertainment night."
                : TICKET_SALES_CLOSED_MESSAGE}
            </p>
          </div>

          {upcoming.length > 0 ? (
            <div className="events-stack">
              {upcoming.map((event) => (
                <EventRow key={event.id} event={event} variant="upcoming" />
              ))}
            </div>
          ) : (
            <p className="empty-state">No upcoming events right now. Check back soon.</p>
          )}
        </section>

        <section
          className="events-section events-section--past"
          aria-labelledby="past-heading"
        >
          <div className="events-section__head">
            <h2 id="past-heading" className="events-section__title">
              Past Events
            </h2>
            <p className="events-section__lede">
              Previous parties - view only, ticket sales are closed.
            </p>
          </div>

          {past.length > 0 ? (
            <div className="events-stack">
              {past.map((event) => (
                <EventRow key={event.id} event={event} variant="past" />
              ))}
            </div>
          ) : (
            <p className="empty-state">No past events listed yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
