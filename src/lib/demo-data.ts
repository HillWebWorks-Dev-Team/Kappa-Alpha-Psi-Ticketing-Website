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

const EVENT_ID = "preview-event-bakk-2-business";

export const DEMO_EVENT: DemoEvent = {
  id: EVENT_ID,
  slug: "bakk-2-business-2026",
  title: "Bakk 2 Business",
  subtitle: "Risky Business Attire",
  description:
    "Legendary Entertainment presents Bakk 2 Business - a Risky Business themed party. Dress professional. Act questionable. The semester starts when we say it does. 18+ for entry. 10:00 PM until whenever.",
  venue: "Venue TBA",
  address: "Location announced with ticket confirmation",
  city: "Rhode Island",
  state: "RI",
  startAt: new Date("2026-09-26T22:00:00-04:00"),
  endAt: new Date("2026-09-27T04:00:00-04:00"),
  imageUrl: "/flyer.png",
  isPublished: true,
  ticketTypes: [
    {
      id: "preview-tt-regular-women",
      eventId: EVENT_ID,
      name: "Regular - Women",
      description: "Event admission for women.",
      priceCents: 1000,
      capacity: 200,
      soldCount: 0,
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "preview-tt-regular-men",
      eventId: EVENT_ID,
      name: "Regular - Men",
      description: "Event admission for men.",
      priceCents: 1500,
      capacity: 200,
      soldCount: 0,
      sortOrder: 2,
      isActive: true,
    },
    {
      id: "preview-tt-bag-women",
      eventId: EVENT_ID,
      name: "Ticket + Adult Capri Sun - Women",
      description: "Event admission plus an Adult Capri Sun.",
      priceCents: 1500,
      capacity: 150,
      soldCount: 0,
      sortOrder: 3,
      isActive: true,
    },
    {
      id: "preview-tt-bag-men",
      eventId: EVENT_ID,
      name: "Ticket + Adult Capri Sun - Men",
      description: "Event admission plus an Adult Capri Sun.",
      priceCents: 2000,
      capacity: 150,
      soldCount: 0,
      sortOrder: 4,
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
