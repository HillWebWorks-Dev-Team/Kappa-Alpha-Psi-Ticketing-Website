import { NextRequest, NextResponse } from "next/server";
import { isValidAdminPassword } from "@/lib/admin-auth";
import { getDemoEvents } from "@/lib/demo-data";
import { isUiPreview } from "@/lib/preview";
import { listPreviewOrders } from "@/lib/preview-store";
import { prisma } from "@/lib/prisma";

type EventTiming = {
  id: string;
  startAt: Date;
  endAt: Date | null;
};

function defaultEventId(events: EventTiming[]): string | null {
  const now = Date.now();
  const byStart = [...events].sort(
    (a, b) => a.startAt.getTime() - b.startAt.getTime()
  );
  const upcoming = byStart.find((event) => {
    const end = event.endAt?.getTime() ?? event.startAt.getTime();
    return end >= now;
  });
  if (upcoming) return upcoming.id;

  const latest = [...events].sort(
    (a, b) => b.startAt.getTime() - a.startAt.getTime()
  )[0];
  return latest?.id ?? null;
}

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password") || "";

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const eventId = req.nextUrl.searchParams.get("eventId")?.trim() || "";

  if (isUiPreview()) {
    const demoEvents = getDemoEvents().filter((event) => event.isPublished);
    const allOrders = listPreviewOrders();
    const orders = (
      eventId ? allOrders.filter((order) => order.eventId === eventId) : allOrders
    ).slice(0, 500);

    const events = [...demoEvents]
      .sort((a, b) => b.startAt.getTime() - a.startAt.getTime())
      .map((event) => ({
        id: event.id,
        slug: event.slug,
        title: event.title,
        startAt: event.startAt.toISOString(),
        endAt: event.endAt?.toISOString() ?? null,
        orderCount: allOrders.filter((order) => order.eventId === event.id).length,
      }));

    return NextResponse.json({
      preview: true,
      defaultEventId: defaultEventId(demoEvents),
      events,
      orders: orders.map((o) => {
        const admittedCount = o.tickets.filter((t) => t.status === "used").length;
        const pendingTickets = o.tickets
          .filter((t) => t.status === "valid")
          .map((t) => ({
            code: t.code,
            typeName: t.ticketType.name,
          }));
        return {
          id: o.id,
          confirmationCode: o.confirmationCode,
          buyerName: o.buyerName,
          buyerEmail: o.buyerEmail,
          status: o.status,
          totalCents: o.totalCents,
          createdAt: o.createdAt.toISOString(),
          ticketCount: o.tickets.length,
          admittedCount,
          pendingCount: pendingTickets.length,
          pendingTickets,
          eventId: o.eventId,
          eventSlug: o.event.slug,
          eventTitle: o.event.title,
          eventStartAt: o.event.startAt.toISOString(),
        };
      }),
    });
  }

  const dbEvents = await prisma.event.findMany({
    orderBy: { startAt: "desc" },
    include: {
      _count: { select: { orders: true } },
    },
  });

  const orders = await prisma.order.findMany({
    where: eventId ? { eventId } : undefined,
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      event: true,
      tickets: {
        include: { ticketType: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json({
    defaultEventId: defaultEventId(dbEvents),
    events: dbEvents.map((event) => ({
      id: event.id,
      slug: event.slug,
      title: event.title,
      startAt: event.startAt.toISOString(),
      endAt: event.endAt?.toISOString() ?? null,
      orderCount: event._count.orders,
    })),
    orders: orders.map((o) => {
      const admittedCount = o.tickets.filter((t) => t.status === "used").length;
      const pendingTickets = o.tickets
        .filter((t) => t.status === "valid")
        .map((t) => ({
          code: t.code,
          typeName: t.ticketType.name,
        }));
      return {
        id: o.id,
        confirmationCode: o.confirmationCode,
        buyerName: o.buyerName,
        buyerEmail: o.buyerEmail,
        status: o.status,
        totalCents: o.totalCents,
        createdAt: o.createdAt.toISOString(),
        ticketCount: o.tickets.length,
        admittedCount,
        pendingCount: pendingTickets.length,
        pendingTickets,
        eventId: o.eventId,
        eventSlug: o.event.slug,
        eventTitle: o.event.title,
        eventStartAt: o.event.startAt.toISOString(),
      };
    }),
  });
}
