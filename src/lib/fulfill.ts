import { prisma } from "./prisma";
import { createQrDataUrl, generateTicketCode } from "./qr";
import { sendTicketEmail } from "./email";

export async function fulfillOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      event: true,
      items: { include: { ticketType: true } },
      tickets: true,
    },
  });

  if (!order) throw new Error(`Order ${orderId} not found`);
  if (order.status === "paid" && order.tickets.length > 0) {
    return order;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const createdTickets = [];

  for (const item of order.items) {
    for (let i = 0; i < item.quantity; i++) {
      const code = generateTicketCode();
      const verifyUrl = `${appUrl}/ticket/${code}`;
      const qrDataUrl = await createQrDataUrl(verifyUrl);

      const ticket = await prisma.ticket.create({
        data: {
          orderId: order.id,
          ticketTypeId: item.ticketTypeId,
          code,
          holderName: order.buyerName,
          holderEmail: order.buyerEmail,
          qrDataUrl,
          status: "valid",
        },
        include: { ticketType: true },
      });

      createdTickets.push(ticket);
    }

    await prisma.ticketType.update({
      where: { id: item.ticketTypeId },
      data: { soldCount: { increment: item.quantity } },
    });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { status: "paid" },
    include: {
      event: true,
      items: { include: { ticketType: true } },
      tickets: { include: { ticketType: true } },
    },
  });

  let emailStatus: "sent" | "skipped" | "failed" = "skipped";
  try {
    const emailed = await sendTicketEmail({
      to: updated.buyerEmail,
      buyerName: updated.buyerName,
      eventTitle: updated.event.title,
      eventSlug: updated.event.slug,
      eventVenue: updated.event.venue,
      eventAddress: `${updated.event.address}, ${updated.event.city}, ${updated.event.state}`,
      startAt: updated.event.startAt,
      endAt: updated.event.endAt,
      confirmationCode: updated.confirmationCode,
      totalCents: updated.totalCents,
      confirmationUrl: `${appUrl}/confirmation/${updated.id}`,
      tickets: updated.tickets.map((t) => ({
        code: t.code,
        typeName: t.ticketType.name,
        qrDataUrl: t.qrDataUrl,
      })),
    });
    emailStatus = emailed ? "sent" : "skipped";
  } catch (err) {
    console.error("[fulfill] email", err);
    emailStatus = "failed";
  }

  return prisma.order.update({
    where: { id: updated.id },
    data: { emailStatus },
    include: {
      event: true,
      items: { include: { ticketType: true } },
      tickets: { include: { ticketType: true } },
    },
  });
}
