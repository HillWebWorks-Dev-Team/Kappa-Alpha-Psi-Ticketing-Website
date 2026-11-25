import { prisma } from "./prisma";

const SLUG = "kristmas-konfessions-2026";

const EVENT = {
  slug: SLUG,
  title: "Kristmas Konfessions",
  subtitle: "White Lies Edition · Overly Saturdays x Legendary Ent",
  description:
    "Overly Saturdays x Legendary Ent present Kristmas Konfessions: White Lies Edition. Saturday, December 12th at Gold Lounge, 727 Cranston St, Providence, RI. Music by DJ ZK, DJ KRAZ, and DJ JG. White Lie attire recommended. Early bird $10 through December 1st, then general admission $15 women / $20 men. VIP info: 347-259-4225.",
  venue: "Gold Lounge",
  address: "727 Cranston St",
  city: "Providence",
  state: "RI",
  startAt: new Date("2026-12-12T22:00:00-05:00"),
  endAt: new Date("2026-12-13T04:00:00-05:00"),
  imageUrl: "/kristmas-konfessions.jpg",
  isPublished: true,
};

const TICKET_TYPES = [
  {
    name: "Early Bird",
    description:
      "Presale admission: $10 through December 1st. Valid for any guest.",
    priceCents: 1000,
    capacity: 300,
    sortOrder: 1,
  },
  {
    name: "Women",
    description:
      "General admission for women. Available after early bird ends December 1st.",
    priceCents: 1500,
    capacity: 200,
    sortOrder: 2,
  },
  {
    name: "Men",
    description:
      "General admission for men. Available after early bird ends December 1st.",
    priceCents: 2000,
    capacity: 200,
    sortOrder: 3,
  },
] as const;

/**
 * Upsert Kristmas Konfessions into the DB without deleting orders or other events.
 */
export async function ensureKristmasEvent() {
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
    include: {
      ticketTypes: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  return {
    action: "updated" as const,
    slug: updated.slug,
    ticketTypes: refreshed?.ticketTypes.map((t) => t.name) ?? [],
  };
}
