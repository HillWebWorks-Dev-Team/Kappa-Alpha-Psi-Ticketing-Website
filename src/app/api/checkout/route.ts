import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getEventBySlug } from "@/lib/catalog";
import { fulfillOrder } from "@/lib/fulfill";
import { isUiPreview } from "@/lib/preview";
import { createPreviewCheckoutOrder } from "@/lib/preview-store";
import { prisma } from "@/lib/prisma";
import { generateConfirmationCode } from "@/lib/qr";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

const bodySchema = z.object({
  eventSlug: z.string().min(1),
  buyerName: z.string().min(2).max(120),
  buyerEmail: z.string().email().max(200),
  items: z
    .array(
      z.object({
        ticketTypeId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1)
    .max(10),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid checkout request" },
        { status: 400 }
      );
    }

    const { eventSlug, buyerName, buyerEmail, items } = parsed.data;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || req.nextUrl.origin;

    if (isUiPreview()) {
      const event = await getEventBySlug(eventSlug, { activeTicketsOnly: false });
      if (!event || !event.isPublished) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      try {
        const order = await createPreviewCheckoutOrder({
          buyerName,
          buyerEmail,
          items,
        });
        return NextResponse.json({
          url: `${appUrl}/confirmation/${order.id}`,
          demo: true,
          preview: true,
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to start checkout";
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    const event = await prisma.event.findUnique({
      where: { slug: eventSlug },
      include: { ticketTypes: true },
    });

    if (!event || !event.isPublished) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const lineItems = [];
    let totalCents = 0;

    for (const item of items) {
      const type = event.ticketTypes.find((t) => t.id === item.ticketTypeId);
      if (!type || !type.isActive) {
        return NextResponse.json(
          { error: "Invalid ticket type" },
          { status: 400 }
        );
      }
      lineItems.push({
        ticketTypeId: type.id,
        quantity: item.quantity,
        unitPriceCents: type.priceCents,
        name: type.name,
      });
      totalCents += type.priceCents * item.quantity;
    }

    const confirmationCode = generateConfirmationCode();

    const order = await prisma.order.create({
      data: {
        eventId: event.id,
        buyerName,
        buyerEmail: buyerEmail.toLowerCase(),
        status: "pending",
        totalCents,
        confirmationCode,
        items: {
          create: lineItems.map((l) => ({
            ticketTypeId: l.ticketTypeId,
            quantity: l.quantity,
            unitPriceCents: l.unitPriceCents,
          })),
        },
      },
    });

    // Demo checkout when Stripe is not configured
    if (!isStripeConfigured()) {
      await fulfillOrder(order.id);
      return NextResponse.json({
        url: `${appUrl}/confirmation/${order.id}`,
        demo: true,
      });
    }

    const stripe = getStripe();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalCents,
      currency: "usd",
      receipt_email: buyerEmail.toLowerCase(),
      metadata: {
        orderId: order.id,
        confirmationCode,
        eventSlug,
      },
      automatic_payment_methods: { enabled: true },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripePaymentIntentId: paymentIntent.id },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      orderId: order.id,
    });
  } catch (err) {
    console.error("[checkout]", err);
    const raw = err instanceof Error ? err.message : "Unable to start checkout";
    const safe = raw
      .replace(/sk_(live|test)_[a-zA-Z0-9]+/g, "sk_***")
      .replace(/whsec_[a-zA-Z0-9]+/g, "whsec_***");
    return NextResponse.json(
      { error: safe || "Unable to start checkout" },
      { status: 500 }
    );
  }
}
