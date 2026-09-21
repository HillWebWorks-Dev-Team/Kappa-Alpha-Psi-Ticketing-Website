import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CheckoutProgress } from "@/components/CheckoutProgress";
import { TicketGroupAccordion } from "@/components/TicketGroupAccordion";
import {
  IconCheck,
  IconDownload,
  IconMail,
} from "@/components/Icons";
import { fulfillOrder } from "@/lib/fulfill";
import { isEmailConfigured } from "@/lib/email";
import {
  formatCurrency,
  formatEventDateTime,
} from "@/lib/format";
import { isUiPreview } from "@/lib/preview";
import { getPreviewOrder } from "@/lib/preview-store";
import { prisma } from "@/lib/prisma";
import { getStripe, isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Order confirmation" };
}

function emailCopy(status: string) {
  switch (status) {
    case "sent":
      return {
        title: "Your tickets have been sent",
        body: "A copy of your tickets has been sent to your email.",
        tone: "ok" as const,
      };
    case "failed":
      return {
        title: "We couldn’t send your ticket email",
        body: "Your tickets are still available on this page.",
        tone: "warn" as const,
      };
    case "skipped":
      return {
        title: "Email delivery is not currently configured",
        body: "Your tickets are available below. You can download them anytime.",
        tone: "info" as const,
      };
    default:
      return isEmailConfigured()
        ? {
            title: "Your ticket email is being prepared",
            body: "Tickets remain available on this page while email is processed.",
            tone: "info" as const,
          }
        : {
            title: "Email delivery is not currently configured",
            body: "Your tickets are available below. You can download them anytime.",
            tone: "info" as const,
          };
  }
}

export default async function ConfirmationPage({ params, searchParams }: Props) {
  const { orderId } = await params;
  const sp = await searchParams;
  const sessionId = typeof sp.session_id === "string" ? sp.session_id : null;

  if (isUiPreview()) {
    const preview = getPreviewOrder(orderId);
    if (!preview) notFound();

    const paid = preview.status === "paid";
    const email = emailCopy(preview.emailStatus);
    const downloadHref = `/api/orders/${preview.id}/tickets.pdf?email=${encodeURIComponent(preview.buyerEmail)}`;
    const ticketsForUi = preview.tickets.map((t) => ({
      id: t.id,
      code: t.code,
      status: t.status,
      ticketTypeId: t.ticketTypeId,
      typeName: t.ticketType.name,
    }));

    return (
      <ConfirmationView
        paid={paid}
        event={preview.event}
        confirmationCode={preview.confirmationCode}
        buyerName={preview.buyerName}
        buyerEmail={preview.buyerEmail}
        totalCents={preview.totalCents}
        ticketsForUi={ticketsForUi}
        email={email}
        downloadHref={downloadHref}
      />
    );
  }

  let order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      event: true,
      tickets: { include: { ticketType: true }, orderBy: { createdAt: "asc" } },
      items: { include: { ticketType: true } },
    },
  });

  if (!order) notFound();

  if (
    order.status !== "paid" &&
    sessionId &&
    isStripeConfigured() &&
    order.stripeSessionId === sessionId
  ) {
    try {
      const stripe = getStripe();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        await fulfillOrder(order.id);
        order = await prisma.order.findUniqueOrThrow({
          where: { id: orderId },
          include: {
            event: true,
            tickets: {
              include: { ticketType: true },
              orderBy: { createdAt: "asc" },
            },
            items: { include: { ticketType: true } },
          },
        });
      }
    } catch (err) {
      console.error("[confirmation] stripe retrieve", err);
    }
  }

  const paid = order.status === "paid";
  const email = emailCopy(order.emailStatus);
  const downloadHref = `/api/orders/${order.id}/tickets.pdf?email=${encodeURIComponent(order.buyerEmail)}`;

  const ticketsForUi = order.tickets.map((t) => ({
    id: t.id,
    code: t.code,
    status: t.status,
    ticketTypeId: t.ticketTypeId,
    typeName: t.ticketType.name,
  }));

  return (
    <ConfirmationView
      paid={paid}
      event={order.event}
      confirmationCode={order.confirmationCode}
      buyerName={order.buyerName}
      buyerEmail={order.buyerEmail}
      totalCents={order.totalCents}
      ticketsForUi={ticketsForUi}
      email={email}
      downloadHref={downloadHref}
    />
  );
}

function ConfirmationView({
  paid,
  event,
  confirmationCode,
  buyerName,
  buyerEmail,
  totalCents,
  ticketsForUi,
  email,
  downloadHref,
}: {
  paid: boolean;
  event: {
    title: string;
    startAt: Date;
    endAt: Date | null;
    venue: string;
    address: string;
    city: string;
    state: string;
  };
  confirmationCode: string;
  buyerName: string;
  buyerEmail: string;
  totalCents: number;
  ticketsForUi: {
    id: string;
    code: string;
    status: string;
    ticketTypeId: string;
    typeName: string;
  }[];
  email: ReturnType<typeof emailCopy>;
  downloadHref: string;
}) {
  return (
    <div className="page confirm-page">
      <div className="tickets-progress-wrap">
        <div className="container">
          <CheckoutProgress current={4} />
        </div>
      </div>
      <div className="container confirm-page__inner">
        <header className="confirm-head">
          <span className={`confirm-head__badge ${paid ? "is-paid" : ""}`}>
            <IconCheck className="confirm-head__badge-icon" />
            {paid ? "Payment confirmed" : "Processing"}
          </span>
          <h1 className="confirm-head__title">
            {paid ? "You’re All Set!" : "Confirming your order"}
          </h1>
          <p className="confirm-head__lede">
            {paid
              ? "Your purchase is confirmed. Your tickets are ready below."
              : "If you just paid, refresh in a moment while we finalize your tickets."}
          </p>
        </header>

        <section className="confirm-order" aria-label="Order information">
          <div>
            <p className="confirm-order__label">Event</p>
            <h2 className="confirm-order__event">{event.title}</h2>
            <p className="confirm-order__meta">
              {formatEventDateTime(event.startAt, event.endAt)}
            </p>
            <p className="confirm-order__meta">
              {event.venue}
              <br />
              {event.address}, {event.city}, {event.state}
            </p>
          </div>
          <div className="confirm-order__purchase">
            <p className="confirm-order__label">Purchase</p>
            <dl className="confirm-order__dl">
              <div>
                <dt>Confirmation</dt>
                <dd>{confirmationCode}</dd>
              </div>
              <div>
                <dt>Buyer</dt>
                <dd>{buyerName}</dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd className="confirm-order__email">{buyerEmail}</dd>
              </div>
              <div>
                <dt>Total paid</dt>
                <dd>{formatCurrency(totalCents)}</dd>
              </div>
            </dl>
          </div>
        </section>

        {paid && ticketsForUi.length > 0 ? (
          <section className="confirm-tickets" aria-label="Your tickets">
            <div className="confirm-tickets__head">
              <div>
                <h2 className="confirm-tickets__title">Your Tickets</h2>
                <p className="confirm-tickets__lede">
                  Select a ticket category to view your individual tickets and QR
                  codes.
                </p>
              </div>
              <p className="confirm-tickets__count">
                {ticketsForUi.length} TICKET
                {ticketsForUi.length === 1 ? "" : "S"}
              </p>
            </div>

            <TicketGroupAccordion tickets={ticketsForUi} />

            <div className={`confirm-email confirm-email--${email.tone}`}>
              <IconMail className="confirm-email__icon" />
              <div>
                <p className="confirm-email__title">{email.title}</p>
                <p className="confirm-email__body">{email.body}</p>
              </div>
            </div>

            <div className="confirm-actions">
              <a className="btn btn--primary" href={downloadHref}>
                <IconDownload className="btn__icon" />
                <span>Download All Tickets</span>
              </a>
              <Link className="btn btn--secondary" href="/">
                Back to Home
              </Link>
            </div>
          </section>
        ) : paid ? (
          <p className="empty-state">Tickets are being prepared. Please refresh shortly.</p>
        ) : null}
      </div>
    </div>
  );
}
