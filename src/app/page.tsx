import Image from "next/image";
import Link from "next/link";
import { listPublishedEvents } from "@/lib/catalog";
import { FinalCta } from "@/components/FinalCta";
import {
  IconCalendar,
  IconMapPin,
  IconStar,
  IconUsers,
  TicketsCta,
} from "@/components/Icons";
import {
  formatCurrency,
  formatEventDateCompact,
  formatEventTimeRange,
} from "@/lib/format";

export const dynamic = "force-dynamic";

const HIGHLIGHTS = [
  { label: "Risky Business Attire", Icon: IconStar },
  { label: "18+ Entry", Icon: IconUsers },
  { label: "10PM Until Whenever", Icon: IconCalendar },
  { label: "96 Eaton St, Providence", Icon: IconMapPin },
] as const;

export default async function HomePage() {
  const events = await listPublishedEvents();
  const featured = events[0] ?? null;
  const ticketsHref = "/tickets";

  return (
    <>
      <section id="top" className="hero" aria-label="Welcome">
        <div className="hero__media" aria-hidden>
          <Image
            src="/legendary-hero-v2.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero__image"
          />
          <div className="hero__overlay" />
        </div>

        <div className="hero__content">
          <div className="hero__content-inner">
            <p className="hero__eyebrow">
              Legendary Entertainment&nbsp;|&nbsp;Be There or Hear About It
            </p>
            <h1 className="hero__title">
              <span className="hero__title-line">Bakk 2 Business.</span>
              <span className="hero__title-accent">Risky Business Attire.</span>
            </h1>
            <div className="hero__rule" aria-hidden />
            <p className="hero__lede">
              {featured?.subtitle
                ? `Saturday September 26th · 10:00 PM until whenever · ${featured.subtitle}`
                : "Join us for an unforgettable night. 10:00 PM until whenever."}
            </p>
            <TicketsCta href={ticketsHref} variant="primary" />
          </div>
        </div>
      </section>

      {featured ? (
        <div className="info-bar-wrap">
          <div className="info-bar container" role="region" aria-label="Event information">
            <div className="info-bar__item">
              <IconCalendar className="info-bar__icon" />
              <div>
                <p className="info-bar__title">{formatEventDateCompact(featured.startAt)}</p>
                <p className="info-bar__sub">
                  {formatEventTimeRange(featured.startAt, featured.endAt)}
                </p>
              </div>
            </div>
            <div className="info-bar__item">
              <IconMapPin className="info-bar__icon" />
              <div>
                <p className="info-bar__title">{featured.venue.toUpperCase()}</p>
                <p className="info-bar__sub">
                  {featured.city.toUpperCase()}, {featured.state.toUpperCase()}
                </p>
              </div>
            </div>
            <div className="info-bar__item">
              <IconUsers className="info-bar__icon" />
              <div>
                <p className="info-bar__title">{featured.title.toUpperCase()}</p>
                <p className="info-bar__sub">Risky Business theme</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section id="event-details" className="intro-section">
        <div className="container intro-grid">
          <div id="about" className="intro-copy">
            <p className="eyebrow-line">
              <span className="eyebrow-line__rule" aria-hidden />
              The Event
            </p>
            <h2 className="display-heading">Consider This Your Orientation</h2>
            <p className="intro-copy__body">
              {featured?.description ??
                "Legendary Entertainment presents Bakk 2 Business - a Risky Business themed party. Dress professional. Act questionable."}
            </p>
            {featured ? (
              <p className="intro-copy__meta">
                {`From ${formatCurrency(
                  Math.min(...featured.ticketTypes.map((t) => t.priceCents))
                )} · ${featured.ticketTypes.length} ticket${
                  featured.ticketTypes.length === 1 ? "" : "s"
                } available`}
              </p>
            ) : null}
          </div>

          <figure className="intro-media">
            <Image
              src="/flyer.png"
              alt="Bakk 2 Business party flyer from Legendary Entertainment"
              width={960}
              height={600}
              sizes="(max-width: 860px) 100vw, 48vw"
              className="intro-media__image"
            />
            <figcaption className="intro-media__caption">
              Dress professional.
              <br />
              Act questionable.
            </figcaption>
          </figure>
        </div>
      </section>

      <section className="highlights" aria-label="Event highlights">
        <div className="container highlights__grid">
          {HIGHLIGHTS.map(({ label, Icon }) => (
            <div key={label} className="highlight">
              <span className="highlight__icon" aria-hidden>
                <Icon />
              </span>
              <p className="highlight__label">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="tickets" className="tickets-section">
        <div className="container">
          <div className="section-head section-head--center">
            <p className="eyebrow-line eyebrow-line--center">
              <span className="eyebrow-line__rule" aria-hidden />
              Tickets
              <span className="eyebrow-line__rule" aria-hidden />
            </p>
            <h2 className="display-heading">Get Your Tickets</h2>
            <p className="section-lede">
              Choose your ticket type and continue to secure checkout. Inventory
              and pricing are validated on the server.
            </p>
          </div>

          {featured ? (
            <div className="tickets-section__cta">
              <TicketsCta href={ticketsHref} variant="primary" />
            </div>
          ) : events.length > 0 ? (
            <div className="event-list">
              {events.map((event) => (
                <article key={event.id} className="event-list__item">
                  <div>
                    <h3>{event.title}</h3>
                    <p>
                      {formatEventDateCompact(event.startAt)} · {event.venue}
                    </p>
                  </div>
                  <Link className="btn btn--primary" href={`/events/${event.slug}`}>
                    View tickets
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <p className="empty-state">No published events are available yet.</p>
          )}
        </div>
      </section>

      <FinalCta ticketsHref={ticketsHref} />
    </>
  );
}
