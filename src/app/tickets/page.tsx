import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { FinalCta } from "@/components/FinalCta";
import {
  IconHeart,
  IconMail,
  IconShield,
  IconTicket,
} from "@/components/Icons";
import { TicketsCheckoutFlow } from "@/components/TicketsCheckoutFlow";
import { getFeaturedEvent } from "@/lib/catalog";
import { ticketsPresentation } from "@/lib/event-content";
import { isUiPreview } from "@/lib/preview";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tickets",
  description:
    "Select Bakk 2 Business tickets from Legendary Entertainment and continue to secure checkout.",
};

const BENEFIT_ICONS = {
  shield: IconShield,
  ticket: IconTicket,
  mail: IconMail,
  heart: IconHeart,
} as const;

export default async function TicketsPage() {
  const event = await getFeaturedEvent();

  if (!event || event.ticketTypes.length === 0) notFound();

  const selectable = event.ticketTypes.map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    priceCents: t.priceCents,
    remaining: Math.max(0, t.capacity - t.soldCount),
  }));

  const content = ticketsPresentation;
  const demoMode = isUiPreview() || !isStripeConfigured();

  return (
    <>
      <section className="ed-hero tickets-hero" aria-label="Tickets">
        <div className="ed-hero__media" aria-hidden>
          <Image
            src="/hero-banner.png"
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
            <h1 className="ed-hero__title">Select Your Experience</h1>
            <p className="ed-hero__lede">
              Choose your ticket type and quantity to secure your place at an
              evening of fellowship, purpose, and impact.
            </p>
          </div>
        </div>
      </section>

      <TicketsCheckoutFlow
        eventSlug={event.slug}
        eventTitle={event.title}
        ticketTypes={selectable}
        supportEmail={content.supportEmail}
        doorCheckDisclaimer={content.doorCheckDisclaimer}
        demoMode={demoMode}
      />

      <section className="ticket-benefits" aria-label="Purchase benefits">
        <div className="container ticket-benefits__grid">
          {content.benefits.map((item) => {
            const Icon = BENEFIT_ICONS[item.icon];
            return (
              <div key={item.title} className="ticket-benefit">
                <Icon className="ticket-benefit__icon" />
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <FinalCta
        ticketsHref="/event-details"
        ctaLabel="View Event Details"
      />
    </>
  );
}
