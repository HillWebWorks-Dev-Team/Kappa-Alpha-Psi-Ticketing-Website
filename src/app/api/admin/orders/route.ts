import { NextRequest, NextResponse } from "next/server";
import { isUiPreview } from "@/lib/preview";
import { listPreviewOrders } from "@/lib/preview-store";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const password = req.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected || password !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isUiPreview()) {
    const orders = listPreviewOrders().slice(0, 100);
    return NextResponse.json({
      preview: true,
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
          eventTitle: o.event.title,
        };
      }),
    });
  }

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      event: true,
      tickets: {
        include: { ticketType: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json({
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
        eventTitle: o.event.title,
      };
    }),
  });
}
