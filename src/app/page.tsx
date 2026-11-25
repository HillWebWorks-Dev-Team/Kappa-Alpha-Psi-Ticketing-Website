import Image from "next/image";
import Link from "next/link";
import { FinalCta } from "@/components/FinalCta";
import {
  IconCalendar,
  IconMapPin,
  IconStar,
  IconUsers,
  TicketsCta,
} from "@/components/Icons";
import {
  getFeaturedEvent,
  listPublishedEvents,
  partitionEventsByTiming,
} from "@/lib/catalog";
import { getEventPresentation } from "@/lib/event-content";
import {
  formatCurrency,
  formatEventDateCompact,
  formatEventTimeRange,
} from "@/lib/format";
import {
  TICKET_SALES_CLOSED_MESSAGE,
  TICKET_SALES_CLOSED_TITLE,
  TICKET_SALES_OPEN,
} from "@/lib/ticket-sales";

export const dynamic = "force-dynamic";

const HIGHLIGHT_ICONS = {
  star: IconStar,
  users: IconUsers,
  utensils: IconCalendar,
  heart: IconMapPin,
} as const;

const DEFAULT_FEATURED_HIGHLIGHTS = [
  { label: "Legendary Nights", Icon: IconStar },
  { label: "Providence", Icon: IconMapPin },
  { label: "Late Night Energy", Icon: IconCalendar },
  { label: "Be There", Icon: IconUsers },
] as const;

export default async function HomePage() {
  const [featured, allEvents] = await Promise.all([
    getFeaturedEvent(),
    listPublishedEvents(),
  ]);
  const { upcoming, past } = partitionEventsByTiming(allEvents);
  const ticketsHref = featured
    ? `/events/${featured.slug}/tickets`
    : "/events";
  const featuredPresentation = featured
    ? getEventPresentation(featured.slug)
    : null;
  const isKristmas = featured?.slug === "kristmas-konfessions-2026";
  const isHalloween = featured?.slug === "ice-skream-halloween-2026";
  const heroImage = isHalloween
    ? "/halloween-hero.jpg"
    : isKristmas
      ? "/kristmas-konfessions-hero.jpg"
      : featured?.imageUrl || "/legendary-hero-v2.png";
  const flyerImage = isHalloween
    ? "/halloween-featured.jpg"
    : featured?.imageUrl || "/flyer.png";
  const showFeaturedCaption = !isHalloween;
  const heroClassName = isHalloween
    ? "hero hero--halloween"
    : isKristmas
      ? "hero hero--kristmas"
      : "hero";
  const featuredHighlights = featuredPresentation
    ? featuredPresentation.expectations.slice(0, 4).map((item) => ({
        label: item.title,
        Icon: HIGHLIGHT_ICONS[item.icon],
      }))
    : DEFAULT_FEATURED_HIGHLIGHTS;
  const fromPrice =
    featured && featured.ticketTypes.length > 0
      ? Math.min(...featured.ticketTypes.map((t) => t.priceCents))
      : null;

  const titleParts = featured?.title.split(":") ?? [];
  const titleMain = titleParts[0]?.trim() || featured?.title || "Legendary Entertainment";
  const titleAccent =
    titleParts.slice(1).join(":").trim() ||
    featured?.subtitle ||
    "Be There or Hear About It";

  return (
    <>
      <section
        id="top"
        className={heroClassName}
        aria-label="Welcome"
      >
        <div className="hero__media" aria-hidden>
          <Image
            src={heroImage}
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
              <span className="hero__title-line">{titleMain}.</span>
              <span className="hero__title-accent">{titleAccent}</span>
            </h1>
            <div className="hero__rule" aria-hidden />
            <p className="hero__lede">
              {featured
                ? `${formatEventDateCompact(featured.startAt)} · ${formatEventTimeRange(
                    featured.startAt,
                    featured.endAt
                  )}${featured.subtitle ? ` · ${featured.subtitle}` : ""}`
                : "Join us for the next Legendary Entertainment night."}
            </p>
            <div className="hero__actions">
              {TICKET_SALES_OPEN ? (
                <TicketsCta href={ticketsHref} variant="primary" />
              ) : (
                <p className="hero__notice">{TICKET_SALES_CLOSED_MESSAGE}</p>
              )}
              <Link className="btn btn--ghost hero__events-link" href="/events">
                All events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {featured ? (
        <div className="info-bar-wrap">
          <div className="info-bar container" role="region" aria-label="Event information">
            <div className="info-bar__item">
              <IconCalendar className="info-bar__icon" />
              <div>
                <p className="info-bar__title">
                  {formatEventDateCompact(featured.startAt)}
                </p>
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
                <p className="info-bar__sub">
                  {featured.subtitle || "Featured event"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <section id="featured" className="intro-section">
        <div className="container intro-grid">
          <div id="about" className="intro-copy">
            <p className="eyebrow-line">
              <span className="eyebrow-line__rule" aria-hidden />
              Featured Event
            </p>
            <h2 className="display-heading">
              {featured?.title ?? "Upcoming Night"}
            </h2>
            <p className="intro-copy__body">
              {featured?.description ??
                "Legendary Entertainment presents unforgettable nights. Check back for the next party."}
            </p>
            {TICKET_SALES_OPEN && fromPrice != null ? (
              <p className="intro-copy__meta">{`From ${formatCurrency(fromPrice)}`}</p>
            ) : null}
            {featured && TICKET_SALES_OPEN ? (
              <p className="intro-copy__cta-wrap">
                <Link className="btn btn--primary" href={ticketsHref}>
                  Get Tickets
                </Link>
              </p>
            ) : featured ? (
              <p className="intro-copy__body">{TICKET_SALES_CLOSED_MESSAGE}</p>
            ) : null}
          </div>

          <figure
            className={
              featured?.slug === "ice-skream-halloween-2026"
                ? "intro-media intro-media--featured-banner"
                : "intro-media"
            }
          >
            {featured ? (
              <Link
                href={TICKET_SALES_OPEN ? ticketsHref : `/events/${featured.slug}`}
                className="intro-media__link"
                aria-label={
                  TICKET_SALES_OPEN
                    ? `Get tickets for ${featured.title}`
                    : `View ${featured.title}`
                }
              >
                <Image
                  src={flyerImage}
                  alt={`${featured.title} flyer from Legendary Entertainment`}
                  width={1600}
                  height={900}
                  sizes="(max-width: 860px) 100vw, 48vw"
                  className="intro-media__image"
                  priority
                />
              </Link>
            ) : (
              <Image
                src={flyerImage}
                alt="Legendary Entertainment event flyer"
                width={1600}
                height={900}
                sizes="(max-width: 860px) 100vw, 48vw"
                className="intro-media__image"
                priority
              />
            )}
            {showFeaturedCaption ? (
              <figcaption className="intro-media__caption">
                {featured?.subtitle || "Be there or hear about it."}
              </figcaption>
            ) : null}
          </figure>
        </div>
      </section>

      <section className="highlights" aria-label="Event highlights">
        <div className="container highlights__grid">
          {featuredHighlights.map(({ label, Icon }) => (
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
              Upcoming
              <span className="eyebrow-line__rule" aria-hidden />
            </p>
            <h2 className="display-heading">
              {TICKET_SALES_OPEN ? "Get Your Tickets" : TICKET_SALES_CLOSED_TITLE}
            </h2>
            <p className="section-lede">
              {TICKET_SALES_OPEN
                ? "Choose an upcoming event, pick your ticket type, and continue to secure checkout."
                : TICKET_SALES_CLOSED_MESSAGE}
            </p>
          </div>

          {upcoming.length > 0 ? (
            <div className="event-list home-event-list">
              {upcoming.map((event) => {
                const price =
                  event.ticketTypes.length > 0
                    ? Math.min(...event.ticketTypes.map((t) => t.priceCents))
                    : null;
                return (
                  <article key={event.id} className="event-list__item">
                    <div>
                      <h3>{event.title}</h3>
                      <p>
                        {formatEventDateCompact(event.startAt)} · {event.venue}
                        {TICKET_SALES_OPEN && price != null
                          ? ` · From ${formatCurrency(price)}`
                          : ""}
                      </p>
                    </div>
                    <Link
                      className="btn btn--primary"
                      href={
                        TICKET_SALES_OPEN
                          ? `/events/${event.slug}/tickets`
                          : `/events/${event.slug}`
                      }
                    >
                      {TICKET_SALES_OPEN ? "View tickets" : "View event"}
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <p className="empty-state">No upcoming events are available yet.</p>
          )}

          <div className="tickets-section__cta home-events-links">
            {featured && TICKET_SALES_OPEN ? (
              <TicketsCta href={ticketsHref} variant="primary" />
            ) : null}
            <Link className="btn btn--secondary" href="/events">
              {past.length > 0
                ? `Browse all events (${past.length} past)`
                : "Browse all events"}
            </Link>
          </div>
        </div>
      </section>

      <FinalCta
        ticketsHref={ticketsHref}
        eyebrow="Be there or hear about it"
        title={
          !TICKET_SALES_OPEN
            ? `${TICKET_SALES_CLOSED_TITLE}.`
            : featured
              ? `Get tickets for ${featured.title}.`
              : "Secure Your Place Today."
        }
        lede={
          !TICKET_SALES_OPEN
            ? TICKET_SALES_CLOSED_MESSAGE
            : featured
              ? `${formatEventDateCompact(featured.startAt)} · ${formatEventTimeRange(
                  featured.startAt,
                  featured.endAt
                )}`
              : undefined
        }
        hideCta={!TICKET_SALES_OPEN}
      />
    </>
  );
}
