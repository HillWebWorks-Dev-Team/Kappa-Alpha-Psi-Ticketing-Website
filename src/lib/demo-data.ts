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

const BAKK_EVENT_ID = "preview-event-bakk-2-business";
const HALLOWEEN_EVENT_ID = "preview-event-ice-skream-halloween";

export const DEMO_EVENT_BAKK: DemoEvent = {
  id: BAKK_EVENT_ID,
  slug: "bakk-2-business-2026",
  title: "Bakk 2 Business",
  subtitle: "Risky Business Attire",
  description:
    "Legendary Entertainment presents Bakk 2 Business - a Risky Business themed party. Dress professional. Act questionable. The semester starts when we say it does. 18+ for entry. 10:00 PM until whenever.",
  venue: "96 Eaton Street",
  address: "96 Eaton Street",
  city: "Providence",
  state: "RI",
  startAt: new Date("2026-09-26T22:00:00-04:00"),
  endAt: new Date("2026-09-27T04:00:00-04:00"),
  imageUrl: "/flyer.png",
  isPublished: true,
  ticketTypes: [
    {
      id: "preview-tt-regular-women",
      eventId: BAKK_EVENT_ID,
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
      eventId: BAKK_EVENT_ID,
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
      eventId: BAKK_EVENT_ID,
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
      eventId: BAKK_EVENT_ID,
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

export const DEMO_EVENT_HALLOWEEN: DemoEvent = {
  id: HALLOWEEN_EVENT_ID,
  slug: "ice-skream-halloween-2026",
  title: "Ice Skream: A Halloween Takeover",
  subtitle: "Legendary Entertainment x Monster House Entertainment",
  description:
    "The collab you've been waiting for. Ice Skream is a Halloween takeover presented by Legendary Entertainment x Monster House Entertainment - a movie you'll have to experience yourself. Costumes mandatory. 18+ for entry, 21+ for drinks. Liquor will be sold at the event. 10:00 PM til whenever (doors close at 11:30 PM). Exact location revealed with your ticket.",
  venue: "Location revealed with ticket",
  address: "Provided with ticket confirmation",
  city: "Providence",
  state: "RI",
  startAt: new Date("2026-10-31T22:00:00-04:00"),
  endAt: new Date("2026-11-01T04:00:00-04:00"),
  imageUrl: "/halloween-poster.jpg",
  isPublished: true,
  ticketTypes: [
    {
      id: "preview-tt-halloween-women",
      eventId: HALLOWEEN_EVENT_ID,
      name: "Women",
      description: "Event admission for women. Liquor sold on-site (21+).",
      priceCents: 1000,
      capacity: 200,
      soldCount: 0,
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "preview-tt-halloween-men",
      eventId: HALLOWEEN_EVENT_ID,
      name: "Men",
      description: "Event admission for men. Liquor sold on-site (21+).",
      priceCents: 1500,
      capacity: 200,
      soldCount: 0,
      sortOrder: 2,
      isActive: true,
    },
  ],
};

/** @deprecated Prefer getDemoFeaturedEvent() - kept for preview helpers. */
export const DEMO_EVENT: DemoEvent = DEMO_EVENT_HALLOWEEN;

export function getDemoEvents(): DemoEvent[] {
  return [DEMO_EVENT_BAKK, DEMO_EVENT_HALLOWEEN];
}

export function getDemoEventBySlug(slug: string): DemoEvent | null {
  return getDemoEvents().find((event) => event.slug === slug) ?? null;
}

export function getDemoEventByTicketTypeId(
  ticketTypeId: string
): DemoEvent | null {
  return (
    getDemoEvents().find((event) =>
      event.ticketTypes.some((type) => type.id === ticketTypeId)
    ) ?? null
  );
}

/** Next upcoming published event by start time; falls back to the latest event. */
export function getDemoFeaturedEvent(): DemoEvent {
  const now = Date.now();
  const events = getDemoEvents()
    .filter((event) => event.isPublished)
    .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  const upcoming = events.find((event) => {
    const end = event.endAt?.getTime() ?? event.startAt.getTime();
    return end >= now;
  });

  return upcoming ?? events[events.length - 1] ?? DEMO_EVENT_HALLOWEEN;
}
