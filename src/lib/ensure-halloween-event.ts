import { prisma } from "./prisma";

const SLUG = "ice-skream-halloween-2026";

const EVENT = {
  slug: SLUG,
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
};

const TICKET_TYPES = [
  {
    name: "Women",
    description: "Event admission for women. Liquor sold on-site (21+).",
    priceCents: 1000,
    capacity: 200,
    sortOrder: 1,
  },
  {
    name: "Men",
    description: "Event admission for men. Liquor sold on-site (21+).",
    priceCents: 1500,
    capacity: 200,
    sortOrder: 2,
  },
] as const;

/**
 * Upsert Ice Skream into the DB without deleting orders or other events.
 */
export async function ensureHalloweenEvent() {
  const existing = await prisma.event.findUnique({
    where: { slug: SLUG },
    include: { ticketTypes: true },
  });

  if (!existing) {
    const created = await prisma.event.create({
      data: {
        ...EVENT,
        ticketTypes: {
          create: TICKET_TYPES.map((t) => ({
            name: t.name,
            description: t.description,
            priceCents: t.priceCents,
            capacity: t.capacity,
            sortOrder: t.sortOrder,
          })),
        },
      },
      include: { ticketTypes: true },
    });

    return {
      action: "created" as const,
      slug: created.slug,
      ticketTypes: created.ticketTypes.map((t) => t.name),
    };
  }

  const updated = await prisma.event.update({
    where: { slug: SLUG },
    data: {
      title: EVENT.title,
      subtitle: EVENT.subtitle,
      description: EVENT.description,
      venue: EVENT.venue,
      address: EVENT.address,
      city: EVENT.city,
      state: EVENT.state,
      startAt: EVENT.startAt,
      endAt: EVENT.endAt,
      imageUrl: EVENT.imageUrl,
      isPublished: EVENT.isPublished,
    },
  });

  for (const ticket of TICKET_TYPES) {
    const match = existing.ticketTypes.find((t) => t.name === ticket.name);
    if (match) {
      await prisma.ticketType.update({
        where: { id: match.id },
        data: {
          description: ticket.description,
          priceCents: ticket.priceCents,
          capacity: ticket.capacity,
          sortOrder: ticket.sortOrder,
          isActive: true,
        },
      });
    } else {
      await prisma.ticketType.create({
        data: {
          eventId: existing.id,
          name: ticket.name,
          description: ticket.description,
          priceCents: ticket.priceCents,
          capacity: ticket.capacity,
          sortOrder: ticket.sortOrder,
        },
      });
    }
  }

  const refreshed = await prisma.event.findUnique({
    where: { slug: SLUG },
    include: { ticketTypes: { where: { isActive: true }, orderBy: { sortOrder: "asc" } } },
  });

  return {
    action: "updated" as const,
    slug: updated.slug,
    ticketTypes: refreshed?.ticketTypes.map((t) => t.name) ?? [],
  };
}
