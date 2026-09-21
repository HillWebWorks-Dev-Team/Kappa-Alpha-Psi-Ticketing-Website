import Image from "next/image";
import { TicketsCta } from "@/components/Icons";

type Props = {
  ticketsHref: string;
  /** When true (on /tickets), CTA scrolls to ticket options instead of navigating. */
  scrollToOptions?: boolean;
  /** Override button label (e.g. View Event Details on tickets page). */
  ctaLabel?: string;
  eyebrow?: string;
  title?: string;
  lede?: string;
  /** Override destination (e.g. #contact-form on the Contact page). */
  ctaHref?: string;
  ariaLabel?: string;
};

export function FinalCta({
  ticketsHref,
  scrollToOptions = false,
  ctaLabel = "Get Tickets",
  eyebrow = "Be part of something greater",
  title = "Secure Your Place Today.",
  lede,
  ctaHref,
  ariaLabel = "Secure your place",
}: Props) {
  const href = ctaHref ?? (scrollToOptions ? "#ticket-options" : ticketsHref);

  return (
    <section className="final-cta" aria-label={ariaLabel}>
      <div className="final-cta__media" aria-hidden>
        <Image
          src="/footer.png"
          alt=""
          fill
          sizes="100vw"
          className="final-cta__image"
          priority={false}
        />
        <div className="final-cta__scrim" />
      </div>
      <div className="container final-cta__inner">
        <p className="final-cta__eyebrow">{eyebrow}</p>
        <h2 className="final-cta__title">{title}</h2>
        {lede ? <p className="final-cta__lede">{lede}</p> : null}
        <TicketsCta href={href} variant="cream">
          {ctaLabel}
        </TicketsCta>
      </div>
    </section>
  );
}
