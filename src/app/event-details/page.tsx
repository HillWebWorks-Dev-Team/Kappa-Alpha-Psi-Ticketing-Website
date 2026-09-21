import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FinalCta } from "@/components/FinalCta";
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
import { eventPresentation, mapsUrl } from "@/lib/event-content";
import {
  formatCurrency,
  formatEventDate,
  formatEventTimeRange,
} from "@/lib/format";
import { getFeaturedEvent } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Event Details",
  description:
    "Event details for Kappa Alpha Psi: date, venue, what to expect, and ticket information.",
};

const EXPECTATION_ICONS = {
  users: IconUsers,
  star: IconStar,
  utensils: IconUtensils,
  heart: IconHeart,
} as const;

export default async function EventDetailsPage() {
  const event = await getFeaturedEvent();

  if (!event) notFound();

  const ticketsHref = "/tickets";
  const directionsUrl = mapsUrl(event.address, event.city, event.state);
  const remaining = event.ticketTypes.reduce(
    (sum, t) => sum + Math.max(0, t.capacity - t.soldCount),
    0
  );
  const fromPrice = Math.min(...event.ticketTypes.map((t) => t.priceCents));
  const content = eventPresentation;

  return (
    <>
      <section className="ed-hero" aria-label="Event details">
        <div className="ed-hero__media" aria-hidden>
          <Image
            src="/hero-event.png"
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
            <p className="ed-hero__eyebrow">The Event</p>
            <h1 className="ed-hero__title">Event Details</h1>
            <p className="ed-hero__lede">
              {event.subtitle ? `${event.subtitle}. ` : ""}
              {content.heroLede}
            </p>
          </div>
        </div>
      </section>

      <div className="info-bar-wrap ed-info-wrap">
        <div
          className="info-bar info-bar--four container"
          role="region"
          aria-label="Event information"
        >
          <div className="info-bar__item">
            <IconCalendar className="info-bar__icon" />
            <div>
              <p className="info-bar__label">Date</p>
              <p className="info-bar__title">{formatEventDate(event.startAt)}</p>
              <p className="info-bar__sub">
                {formatEventTimeRange(event.startAt, event.endAt)}
              </p>
            </div>
          </div>
          <div className="info-bar__item">
            <IconMapPin className="info-bar__icon" />
            <div>
              <p className="info-bar__label">Venue</p>
              <p className="info-bar__title">{event.venue}</p>
              <p className="info-bar__sub">
                {event.city}, {event.state}
              </p>
            </div>
          </div>
          <div className="info-bar__item">
            <IconUsers className="info-bar__icon" />
            <div>
              <p className="info-bar__label">Attire</p>
              <p className="info-bar__title">{content.dressCode}</p>
              <p className="info-bar__sub">{content.dressCodeNote}</p>
            </div>
          </div>
          <div className="info-bar__item">
            <IconTicket className="info-bar__icon" />
            <div>
              <p className="info-bar__label">Tickets</p>
              <p className="info-bar__title">
                {remaining > 0 ? "Available" : "Sold out"}
              </p>
              <p className="info-bar__sub">
                {event.ticketTypes.length} options
                {Number.isFinite(fromPrice)
                  ? ` · from ${formatCurrency(fromPrice)}`
                  : ""}
              </p>
              <Link className="info-bar__link" href={ticketsHref}>
                Get tickets →
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="ed-about" id="about">
        <div className="container ed-about__grid">
          <div className="ed-about__copy">
            <p className="eyebrow-line">
              <span className="eyebrow-line__rule" aria-hidden />
              About the Event
            </p>
            <h2 className="display-heading">{content.aboutHeading}</h2>
            {content.aboutParagraphs.map((p) => (
              <p key={p.slice(0, 32)} className="ed-about__body">
                {p}
              </p>
            ))}
            <p className="ed-about__body ed-about__body--db">{event.description}</p>
            <TicketsCta href={ticketsHref} variant="primary" />
          </div>

          <div className="ed-gallery">
            <figure className="ed-gallery__primary">
              <Image
                src={content.gallery.primary.src}
                alt={content.gallery.primary.alt}
                width={960}
                height={620}
                sizes="(max-width: 900px) 100vw, 58vw"
                className="ed-gallery__image"
                priority
              />
              <div className="ed-gallery__card">
                <IconMapPin className="ed-gallery__card-icon" />
                <div>
                  <p className="ed-gallery__card-title">{event.venue}</p>
                  <p className="ed-gallery__card-sub">
                    {event.address}
                    <br />
                    {event.city}, {event.state}
                  </p>
                  <a
                    className="ed-gallery__card-link"
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Get Directions →
                  </a>
                </div>
              </div>
            </figure>
            <div className="ed-gallery__thumbs">
              {content.gallery.thumbs.map((thumb) => (
                <div key={thumb.src} className="ed-gallery__thumb">
                  <Image
                    src={thumb.src}
                    alt={thumb.alt}
                    width={320}
                    height={220}
                    sizes="(max-width: 900px) 33vw, 18vw"
                    className="ed-gallery__image"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="ed-expect-faq">
        <div className="container ed-expect-faq__grid">
          <div>
            <p className="eyebrow-line">
              <span className="eyebrow-line__rule" aria-hidden />
              What to Expect
            </p>
            <ul className="expect-list">
              {content.expectations.map((item) => {
                const Icon = EXPECTATION_ICONS[item.icon];
                return (
                  <li key={item.title} className="expect-item">
                    <span className="expect-item__icon" aria-hidden>
                      <Icon />
                    </span>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.description}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div id="faq">
            <p className="eyebrow-line">
              <span className="eyebrow-line__rule" aria-hidden />
              Frequently Asked Questions
            </p>
            <FaqAccordion items={content.faqs} />
          </div>
        </div>
      </section>

      <FinalCta ticketsHref={ticketsHref} />
    </>
  );
}
