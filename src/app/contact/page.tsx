import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ContactForm } from "@/components/ContactForm";
import { FaqAccordion } from "@/components/FaqAccordion";
import { FinalCta } from "@/components/FinalCta";
import {
  IconArrowRight,
  IconClock,
  IconMail,
  IconMapPin,
  IconPhone,
} from "@/components/Icons";
import {
  contactPresentation,
  mapsEmbedUrl,
  mapsUrl,
} from "@/lib/event-content";
import {
  formatEventDate,
  formatEventTimeRange,
} from "@/lib/format";
import { getFeaturedEvent } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Have questions about tickets, event details, or entry? Contact Legendary Entertainment for assistance.",
};

function SocialIcon({ platform }: { platform: "instagram" | "facebook" | "x" | "linkedin" }) {
  if (platform === "instagram") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="4" y="4" width="16" height="16" rx="4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="3.4" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="16.6" cy="7.4" r="0.9" fill="currentColor" />
      </svg>
    );
  }
  if (platform === "facebook") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M14 8.5h2.2V5.8H14c-2.1 0-3.5 1.3-3.5 3.6V11H8.5v2.8H10.5V19h3v-5.2H15.8l.5-2.8h-2.8V9.6c0-.6.3-1.1 1.5-1.1Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (platform === "x") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M7 6.5h2.4l3.1 4.2L15.8 6.5H18l-4.1 5.2L18.2 17.5h-2.4l-3.4-4.5-3.6 4.5H6.5l4.4-5.5L7 6.5Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7.5 9.2V17H5V9.2h2.5ZM6.2 5.5a1.45 1.45 0 1 1 0 2.9 1.45 1.45 0 0 1 0-2.9ZM19 17h-2.5v-3.8c0-1.1-.4-1.9-1.5-1.9-.8 0-1.3.5-1.5 1.1-.1.2-.1.5-.1.8V17H11V9.2h2.4v1.1c.4-.7 1.2-1.3 2.5-1.3 1.8 0 3.1 1.2 3.1 3.7V17Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default async function ContactPage() {
  const event = await getFeaturedEvent();

  if (!event) notFound();

  const content = contactPresentation;
  const directionsUrl = mapsUrl(event.address, event.city, event.state);
  const embedUrl = mapsEmbedUrl(event.address, event.city, event.state);
  const fullAddress = `${event.address}, ${event.city}, ${event.state}`;
  const hasVenue = Boolean(event.venue && event.address && event.city && event.state);

  const socialLinks = (
    [
      { key: "instagram" as const, label: "Instagram", href: content.social.instagram },
      { key: "facebook" as const, label: "Facebook", href: content.social.facebook },
      { key: "x" as const, label: "X", href: content.social.x },
      { key: "linkedin" as const, label: "LinkedIn", href: content.social.linkedin },
    ] as const
  ).filter((item) => item.href.startsWith("http"));

  const phoneDigits = content.supportPhone.replace(/[^\d+]/g, "");

  return (
    <>
      <section className="ed-hero contact-hero" aria-label="Contact">
        <div className="ed-hero__media" aria-hidden>
          <Image
            src="/hero-banner.png"
            alt=""
            fill
            priority
            sizes="100vw"
            className="ed-hero__image contact-hero__image"
          />
          <div className="ed-hero__overlay" />
        </div>
        <div className="ed-hero__content">
          <div className="ed-hero__inner">
            <p className="ed-hero__eyebrow">Get in Touch</p>
            <h1 className="ed-hero__title">We&apos;re Here to Help</h1>
            <p className="ed-hero__lede">{content.heroLede(event.title)}</p>
          </div>
        </div>
      </section>

      <section className="contact-main" aria-label="Contact form and information">
        <div className="container contact-main__grid">
          <div className="contact-panel contact-panel--form">
            <ContactForm />
          </div>

          <aside className="contact-panel contact-panel--info" aria-label="Contact information">
            <h2 className="contact-panel__title">
              Contact Information
              <span className="contact-panel__rule" aria-hidden />
            </h2>

            <ul className="contact-info-list">
              {content.supportEmail ? (
                <li className="contact-info-item">
                  <span className="contact-info-item__icon" aria-hidden>
                    <IconMail />
                  </span>
                  <div>
                    <p className="contact-info-item__label">Email</p>
                    <a
                      className="contact-info-item__value contact-info-item__value--link"
                      href={`mailto:${content.supportEmail}`}
                    >
                      {content.supportEmail}
                    </a>
                    <p className="contact-info-item__note">
                      Send us your questions or concerns.
                    </p>
                  </div>
                </li>
              ) : null}

              {content.supportPhone && phoneDigits ? (
                <li className="contact-info-item">
                  <span className="contact-info-item__icon" aria-hidden>
                    <IconPhone />
                  </span>
                  <div>
                    <p className="contact-info-item__label">Phone</p>
                    <a
                      className="contact-info-item__value contact-info-item__value--link"
                      href={`tel:${phoneDigits}`}
                    >
                      {content.supportPhone}
                    </a>
                  </div>
                </li>
              ) : null}

              {hasVenue ? (
                <li className="contact-info-item">
                  <span className="contact-info-item__icon" aria-hidden>
                    <IconMapPin />
                  </span>
                  <div>
                    <p className="contact-info-item__label">Event Venue</p>
                    <p className="contact-info-item__value">{event.venue}</p>
                    <p className="contact-info-item__note">{fullAddress}</p>
                  </div>
                </li>
              ) : null}

              <li className="contact-info-item">
                <span className="contact-info-item__icon" aria-hidden>
                  <IconClock />
                </span>
                <div>
                  <p className="contact-info-item__label">Event Date</p>
                  <p className="contact-info-item__value">
                    {formatEventDate(event.startAt)}
                  </p>
                  <p className="contact-info-item__note">
                    {formatEventTimeRange(event.startAt, event.endAt)}
                  </p>
                </div>
              </li>
            </ul>

            {socialLinks.length > 0 ? (
              <div className="contact-social">
                <p className="contact-social__title">Follow Us</p>
                <p className="contact-social__note">
                  Stay connected for updates and announcements.
                </p>
                <ul className="contact-social__list">
                  {socialLinks.map((item) => (
                    <li key={item.key}>
                      <a
                        href={item.href}
                        className="contact-social__link"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={item.label}
                      >
                        <SocialIcon platform={item.key} />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <section className="contact-location" aria-label="Event location">
        <div className="container">
          <div className="contact-location__card">
            <div className="contact-location__copy">
              <h2 className="contact-panel__title">
                Event Location
                <span className="contact-panel__rule" aria-hidden />
              </h2>
              {hasVenue ? (
                <>
                  <p className="contact-location__venue">{event.venue}</p>
                  <p className="contact-location__address">{fullAddress}</p>
                  <a
                    className="btn btn--outline contact-location__directions"
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>Get Directions</span>
                    <IconArrowRight className="btn__icon" />
                  </a>
                </>
              ) : (
                <p className="contact-location__address">
                  Venue location will be announced.
                </p>
              )}
            </div>
            <div className="contact-location__map">
              {hasVenue ? (
                <iframe
                  title={`Map showing ${event.venue}`}
                  src={embedUrl}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              ) : (
                <div className="contact-location__map-fallback" role="status">
                  Venue map will appear once the location is confirmed.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="contact-faq" aria-label="Frequently asked questions">
        <div className="container">
          <div className="contact-faq__card">
            <div className="contact-faq__header">
              <h2 className="contact-panel__title">
                Frequently Asked Questions
                <span className="contact-panel__rule" aria-hidden />
              </h2>
              <Link
                href={`/events/${event.slug}#faq`}
                className="contact-faq__all"
              >
                View All FAQs
                <IconArrowRight className="btn__icon" />
              </Link>
            </div>
            <FaqAccordion items={content.faqs} />
          </div>
        </div>
      </section>

      <FinalCta
        ticketsHref={`/events/${event.slug}/tickets`}
        ctaHref="#contact-form"
        ctaLabel="Send Us a Message"
        eyebrow="Be part of something greater"
        title="Have More Questions?"
        lede="We're here to help. Reach out and let's make this an unforgettable evening together."
        ariaLabel="Contact us again"
      />
    </>
  );
}
