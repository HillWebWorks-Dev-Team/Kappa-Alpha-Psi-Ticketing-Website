import {
  DEMO_EVENT,
  getDemoEventBySlug,
  getDemoEvents,
  getDemoFeaturedEvent,
  type DemoEvent,
} from "./demo-data";
import { isUiPreview } from "./preview";
import { prisma } from "./prisma";

export type CatalogTicketType = {
  id: string;
  name: string;
  description: string | null;
  priceCents: number;
  capacity: number;
  soldCount: number;
  sortOrder: number;
  isActive: boolean;
};

export type CatalogEvent = {
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
  ticketTypes: CatalogTicketType[];
};

function fromDemo(event: DemoEvent): CatalogEvent {
  return {
    ...event,
    ticketTypes: event.ticketTypes.map((t) => ({ ...t })),
  };
}

export async function listPublishedEvents(): Promise<CatalogEvent[]> {
  if (isUiPreview()) {
    return getDemoEvents().map(fromDemo);
  }

  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { startAt: "asc" },
    include: {
      ticketTypes: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  return events.map((event) => ({
    id: event.id,
    slug: event.slug,
    title: event.title,
    subtitle: event.subtitle,
    description: event.description,
    venue: event.venue,
    address: event.address,
    city: event.city,
    state: event.state,
    startAt: event.startAt,
    endAt: event.endAt,
    imageUrl: event.imageUrl,
    isPublished: event.isPublished,
    ticketTypes: event.ticketTypes.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      priceCents: t.priceCents,
      capacity: t.capacity,
      soldCount: t.soldCount,
      sortOrder: t.sortOrder,
      isActive: t.isActive,
    })),
  }));
}

export async function getFeaturedEvent(): Promise<CatalogEvent | null> {
  if (isUiPreview()) {
    return fromDemo(getDemoFeaturedEvent());
  }

  const events = await listPublishedEvents();
  return events[0] ?? null;
}

export async function getEventBySlug(
  slug: string,
  options?: { activeTicketsOnly?: boolean }
): Promise<CatalogEvent | null> {
  const activeOnly = options?.activeTicketsOnly ?? true;

  if (isUiPreview()) {
    const demo = getDemoEventBySlug(slug);
    if (!demo || !demo.isPublished) return null;
    const event = fromDemo(demo);
    if (activeOnly) {
      event.ticketTypes = event.ticketTypes.filter((t) => t.isActive);
    }
    return event;
  }

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      ticketTypes: {
        where: activeOnly ? { isActive: true } : undefined,
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  if (!event) return null;

  return {
    id: event.id,
    slug: event.slug,
    title: event.title,
    subtitle: event.subtitle,
    description: event.description,
    venue: event.venue,
    address: event.address,
    city: event.city,
    state: event.state,
    startAt: event.startAt,
    endAt: event.endAt,
    imageUrl: event.imageUrl,
    isPublished: event.isPublished,
    ticketTypes: event.ticketTypes.map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      priceCents: t.priceCents,
      capacity: t.capacity,
      soldCount: t.soldCount,
      sortOrder: t.sortOrder,
      isActive: t.isActive,
    })),
  };
}

export function demoEventId(): string {
  return DEMO_EVENT.id;
}
