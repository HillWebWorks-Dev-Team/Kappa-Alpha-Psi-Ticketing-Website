import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EventLookbook } from "@/components/EventLookbook";
import { FaqAccordion } from "@/components/FaqAccordion";
import {
  IconCalendar,
  IconHeart,
  IconMapPin,
  IconStar,
  IconTicket,
  IconUsers,
  IconUtensils,
  TicketsCta,
} from "@/components/Icons";
import {
  getEventBySlug,
  isEventUpcoming,
} from "@/lib/catalog";
import {
  getEventPresentation,
  mapsUrl,
} from "@/lib/event-content";
import {
  formatCurrency,
  formatEventDate,
  formatEventTimeRange,
} from "@/lib/format";
import {
  answerForTicketSales,
  TICKET_SALES_CLOSED_MESSAGE,
  TICKET_SALES_OPEN,
} from "@/lib/ticket-sales";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

const EXPECTATION_ICONS = {
  users: IconUsers,
  star: IconStar,
  utensils: IconUtensils,
  heart: IconHeart,
} as const;

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
  const event = await getEventBySlug(slug, { activeTicketsOnly: false });

  if (!event || !event.isPublished) notFound();

  const content = getEventPresentation(event.slug);
  const upcoming = isEventUpcoming(event);
  const ticketsHref = `/events/${event.slug}/tickets`;
  const posterSrc =
    event.imageUrl || content.gallery.primary.src || "/legendary-hero-v2.png";
  const directionsUrl = mapsUrl(event.address, event.city, event.state);
  const activeTickets = event.ticketTypes.filter((t) => t.isActive);
  const remaining = activeTickets.reduce(
    (sum, t) => sum + Math.max(0, t.capacity - t.soldCount),
    0
  );
  const fromPrice =
    activeTickets.length > 0
      ? Math.min(...activeTickets.map((t) => t.priceCents))
      : null;
  const canBuy =
    TICKET_SALES_OPEN && upcoming && activeTickets.length > 0 && remaining > 0;

  return (
    <div className="evd">
      <div className="evd-top">
        <div className="container evd-top__inner">
          <nav className="evd-crumb" aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden>/</span>
            <Link href="/events">Events</Link>
            <span aria-hidden>/</span>
            <span aria-current="page">{event.title}</span>
          </nav>
          <span
            className={
              upcoming ? "evd-badge" : "evd-badge evd-badge--past"
            }
          >
            {upcoming ? "Upcoming" : "Past event"}
          </span>
        </div>
      </div>

      <section className="evd-masthead" aria-label={event.title}>
        <div className="container evd-masthead__grid">
          <figure className="evd-poster">
            <Image
              src={posterSrc}
              alt={`${event.title} artwork`}
              fill
              priority
              sizes="(max-width: 900px) 100vw, 46vw"
              className="evd-poster__image"
            />
          </figure>

          <div className="evd-sheet">
            <p className="evd-sheet__eyebrow">Event details</p>
            <h1 className="evd-sheet__title">{event.title}</h1>
            {event.subtitle ? (
              <p className="evd-sheet__subtitle">{event.subtitle}</p>
            ) : null}

            <dl className="evd-facts">
              <div>
                <dt>
                  <IconCalendar className="evd-facts__icon" aria-hidden />
                  When
                </dt>
                <dd>
                  <strong>{formatEventDate(event.startAt)}</strong>
                  <span>
                    {formatEventTimeRange(event.startAt, event.endAt)}
                  </span>
                </dd>
              </div>
              <div>
                <dt>
                  <IconMapPin className="evd-facts__icon" aria-hidden />
                  Where
                </dt>
                <dd>
                  <strong>{event.venue}</strong>
                  <span>
                    {event.city}, {event.state}
                  </span>
                </dd>
              </div>
              <div>
                <dt>
                  <IconUsers className="evd-facts__icon" aria-hidden />
                  Attire
                </dt>
                <dd>
                  <strong>{content.dressCode}</strong>
                  <span>{content.dressCodeNote}</span>
                </dd>
              </div>
              <div>
                <dt>
                  <IconTicket className="evd-facts__icon" aria-hidden />
                  Tickets
                </dt>
                <dd>
                  <strong>
                    {!TICKET_SALES_OPEN || !upcoming
                      ? "Sales closed"
                      : remaining > 0
                        ? "On sale"
                        : "Sold out"}
                  </strong>
                  <span>
                    {!TICKET_SALES_OPEN
                      ? TICKET_SALES_CLOSED_MESSAGE
                      : upcoming && fromPrice != null
                        ? `From ${formatCurrency(fromPrice)} · ${activeTickets.length} options`
                        : upcoming
                          ? `${activeTickets.length} options`
                          : "This night has ended"}
                  </span>
                </dd>
              </div>
            </dl>

            {content.notices && content.notices.length > 0 ? (
              <div className="evd-notices" role="region" aria-label="Event notices">
                {content.notices.map((notice) => (
                  <p
                    key={notice}
                    className={
                      content.liquorSold &&
                      notice.toLowerCase().includes("liquor")
                        ? "evd-notices__item evd-notices__item--alert"
                        : "evd-notices__item"
                    }
                  >
                    {notice}
                  </p>
                ))}
              </div>
            ) : null}

            <div className="evd-sheet__actions">
              {canBuy ? (
                <TicketsCta href={ticketsHref} variant="primary" />
              ) : TICKET_SALES_OPEN ? (
                <Link className="btn btn--outline" href="/events">
                  Browse events
                </Link>
              ) : null}
              <Link className="btn btn--ghost evd-sheet__ghost" href="/events">
                All events
              </Link>
            </div>

            <p className="evd-sheet__location-note">
              {content.hideDirections ? (
                <>Exact address is revealed with your ticket confirmation.</>
              ) : (
                <>
                  {event.address}, {event.city}, {event.state}
                  {" · "}
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-link"
                  >
                    Directions
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      <section className="evd-story" id="about" aria-labelledby="evd-story-heading">
        <div className="container evd-story__grid">
          <div className="evd-story__copy">
            <p className="evd-kicker">The night</p>
            <h2 id="evd-story-heading" className="evd-story__heading">
              {content.aboutHeading}
            </h2>
            {content.aboutParagraphs.map((p) => (
              <p key={p.slice(0, 40)} className="evd-story__body">
                {p}
              </p>
            ))}
          </div>
          <blockquote className="evd-pull">
            <p>{content.heroLede}</p>
          </blockquote>
        </div>
      </section>

      {content.gallery.thumbs.length > 0 || content.gallery.primary ? (
        <EventLookbook
          shots={[content.gallery.primary, ...content.gallery.thumbs]}
        />
      ) : null}

      <section className="evd-expect" aria-labelledby="evd-expect-heading">
        <div className="container">
          <div className="evd-expect__head">
            <p className="evd-kicker">What to expect</p>
            <h2 id="evd-expect-heading" className="evd-expect__heading">
              Come ready for the night
            </h2>
          </div>
          <ol className="evd-expect__list">
            {content.expectations.map((item, index) => {
              const Icon = EXPECTATION_ICONS[item.icon];
              return (
                <li key={item.title} className="evd-expect__item">
                  <span className="evd-expect__index" aria-hidden>
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="evd-expect__icon" aria-hidden>
                    <Icon />
                  </span>
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <section className="evd-faq" id="faq" aria-labelledby="evd-faq-heading">
        <div className="container evd-faq__grid">
          <div className="evd-faq__intro">
            <p className="evd-kicker evd-kicker--on-dark">Questions</p>
            <h2 id="evd-faq-heading" className="evd-faq__heading">
              Before you roll up
            </h2>
            <p className="evd-faq__lede">
              Quick answers about attire, entry, and how the night works.
            </p>
            {canBuy ? (
              <TicketsCta href={ticketsHref} variant="cream" />
            ) : null}
          </div>
          <div className="evd-faq__panel">
            <FaqAccordion
              items={content.faqs.map((item) => ({
                ...item,
                answer: answerForTicketSales(item.question, item.answer),
              }))}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
