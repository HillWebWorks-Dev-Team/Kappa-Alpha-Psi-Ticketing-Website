import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getEventBySlug } from "@/lib/catalog";
import { formatEventDateTime } from "@/lib/format";
import { TicketSelector } from "@/components/TicketSelector";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug, { activeTicketsOnly: false });
  if (!event) return { title: "Event not found" };
  return {
    title: event.title,
    description: event.subtitle || event.description.slice(0, 140),
  };
}

export default async function EventPage({ params }: Props) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event || !event.isPublished) notFound();

  const selectable = event.ticketTypes.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    priceCents: t.priceCents,
    remaining: Math.max(0, t.capacity - t.soldCount),
  }));

  return (
    <div className="page">
      <div className="container event-layout">
        <div className="event-copy">
          <p className="eyebrow">Event</p>
          <h1>{event.title}</h1>
          {event.subtitle ? <p className="event-copy__lede">{event.subtitle}</p> : null}
          <p className="event-copy__lede">{event.description}</p>

          <div className="meta-list">
            <div>
              <strong>When</strong>
              <span>{formatEventDateTime(event.startAt, event.endAt)}</span>
            </div>
            <div>
              <strong>Where</strong>
              <span>
                {event.venue}
                <br />
                {event.address}
                <br />
                {event.city}, {event.state}
              </span>
            </div>
          </div>
        </div>

        <TicketSelector eventSlug={event.slug} ticketTypes={selectable} />
      </div>
    </div>
  );
}
