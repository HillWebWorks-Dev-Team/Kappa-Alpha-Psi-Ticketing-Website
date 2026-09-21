import { NextRequest, NextResponse } from "next/server";
import { isUiPreview } from "@/lib/preview";
import { getPreviewOrder } from "@/lib/preview-store";
import { prisma } from "@/lib/prisma";
import { buildTicketsPdf } from "@/lib/tickets-pdf";

export const runtime = "nodejs";

type Params = { params: Promise<{ orderId: string }> };

export async function GET(req: NextRequest, { params }: Params) {
  const { orderId } = await params;
  const email = (req.nextUrl.searchParams.get("email") || "").trim().toLowerCase();

  if (isUiPreview()) {
    const order = getPreviewOrder(orderId);
    if (!order || order.status !== "paid") {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    if (email && email !== order.buyerEmail.toLowerCase()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (order.tickets.length === 0) {
      return NextResponse.json({ error: "No tickets to download" }, { status: 400 });
    }

    const pdf = await buildTicketsPdf({
      confirmationCode: order.confirmationCode,
      buyerName: order.buyerName,
      buyerEmail: order.buyerEmail,
      totalCents: order.totalCents,
      event: order.event,
      tickets: order.tickets.map((t) => ({
        code: t.code,
        status: t.status,
        typeName: t.ticketType.name,
        holderName: t.holderName,
        qrDataUrl: t.qrDataUrl,
      })),
    });

    const safeCode = order.confirmationCode.replace(/[^a-zA-Z0-9-_]/g, "");
    const filename = `Legendary-Tickets-${safeCode}.pdf`;

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      event: true,
      tickets: {
        include: { ticketType: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!order || order.status !== "paid") {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Guest access: confirmation page link + matching buyer email when provided
  if (email && email !== order.buyerEmail.toLowerCase()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (order.tickets.length === 0) {
    return NextResponse.json({ error: "No tickets to download" }, { status: 400 });
  }

  const pdf = await buildTicketsPdf({
    confirmationCode: order.confirmationCode,
    buyerName: order.buyerName,
    buyerEmail: order.buyerEmail,
    totalCents: order.totalCents,
    event: order.event,
    tickets: order.tickets.map((t) => ({
      code: t.code,
      status: t.status,
      typeName: t.ticketType.name,
      holderName: t.holderName,
      qrDataUrl: t.qrDataUrl,
    })),
  });

  const safeCode = order.confirmationCode.replace(/[^a-zA-Z0-9-_]/g, "");
  const filename = `Legendary-Tickets-${safeCode}.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
