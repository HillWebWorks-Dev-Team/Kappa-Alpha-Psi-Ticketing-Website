/**
 * Static catalog used when UI_PREVIEW is enabled (no database).
 * Keep in sync with prisma/seed.ts until the real DB is connected.
 */

export type DemoTicketType = {
  id: string;
  eventId: string;
  name: string;
  description: string | null;
  priceCents: number;
  capacity: number;
  soldCount: number;
  sortOrder: number;
  isActive: boolean;
};

export type DemoEvent = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string;
  venue: string;
  address: string;
  city: string;
  state: string;
  startAt: Date;
  endAt: Date | null;
  imageUrl: string | null;
  isPublished: boolean;
  ticketTypes: DemoTicketType[];
};

const EVENT_ID = "preview-event-crimson-cream-gala";

export const DEMO_EVENT: DemoEvent = {
  id: EVENT_ID,
  slug: "crimson-cream-gala-2026",
  title: "Crimson & Cream Gala",
  subtitle: "An evening of fellowship, excellence, and celebration",
  description:
    "Join Kappa Alpha Psi for an elegant evening celebrating achievement, brotherhood, and community. Enjoy dinner, live entertainment, and a night to remember with Nupes and friends.",
  venue: "Grand Ballroom at The Madison",
  address: "1200 Achievement Drive",
  city: "Atlanta",
  state: "GA",
  startAt: new Date("2026-10-18T19:00:00-04:00"),
  endAt: new Date("2026-10-18T23:30:00-04:00"),
  imageUrl: "/hero.png",
  isPublished: true,
  ticketTypes: [
    {
      id: "preview-tt-general",
      eventId: EVENT_ID,
      name: "General Admission",
      description: "Access to the gala, dinner service, and entertainment.",
      priceCents: 7500,
      capacity: 200,
      soldCount: 0,
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "preview-tt-vip",
      eventId: EVENT_ID,
      name: "VIP",
      description:
        "Priority seating, complimentary drink ticket, and VIP lounge access.",
      priceCents: 12500,
      capacity: 50,
      soldCount: 0,
      sortOrder: 2,
      isActive: true,
    },
    {
      id: "preview-tt-table",
      eventId: EVENT_ID,
      name: "Table Sponsor (8 seats)",
      description:
        "Reserved table for eight guests with recognition in the evening program.",
      priceCents: 80000,
      capacity: 15,
      soldCount: 0,
      sortOrder: 3,
      isActive: true,
    },
  ],
};

export function getDemoEvents(): DemoEvent[] {
  return [DEMO_EVENT];
}

export function getDemoEventBySlug(slug: string): DemoEvent | null {
  return DEMO_EVENT.slug === slug ? DEMO_EVENT : null;
}

export function getDemoFeaturedEvent(): DemoEvent {
  return DEMO_EVENT;
}
