import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { IconDownload } from "@/components/Icons";
import { formatEventDateTime } from "@/lib/format";
import { isUiPreview } from "@/lib/preview";
import { getPreviewOrder, getPreviewTicketByCode } from "@/lib/preview-store";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ code: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return { title: `Ticket ${code}` };
}

export default async function TicketPage({ params }: Props) {
  const { code } = await params;

  if (isUiPreview()) {
    const ticket = getPreviewTicketByCode(code);
    if (!ticket) notFound();
    const order = getPreviewOrder(ticket.orderId);
    if (!order || order.status !== "paid") notFound();

    const event = order.event;
    const downloadHref = `/api/orders/${order.id}/tickets.pdf?email=${encodeURIComponent(order.buyerEmail)}`;

    return (
      <TicketView
        event={event}
        typeName={ticket.ticketType.name}
        status={ticket.status}
        qrDataUrl={ticket.qrDataUrl}
        code={ticket.code}
        holderName={ticket.holderName}
        confirmationCode={order.confirmationCode}
        orderId={order.id}
        downloadHref={downloadHref}
      />
    );
  }

  const ticket = await prisma.ticket.findUnique({
    where: { code: code.toUpperCase() },
    include: {
      ticketType: true,
      order: { include: { event: true } },
    },
  });

  if (!ticket || ticket.order.status !== "paid") notFound();

  const order = ticket.order;
  const event = order.event;
  const downloadHref = `/api/orders/${order.id}/tickets.pdf?email=${encodeURIComponent(order.buyerEmail)}`;

  return (
    <TicketView
      event={event}
      typeName={ticket.ticketType.name}
      status={ticket.status}
      qrDataUrl={ticket.qrDataUrl}
      code={ticket.code}
      holderName={ticket.holderName}
      confirmationCode={order.confirmationCode}
      orderId={order.id}
      downloadHref={downloadHref}
    />
  );
}

function TicketView({
  event,
  typeName,
  status,
  qrDataUrl,
  code,
  holderName,
  confirmationCode,
  orderId,
  downloadHref,
}: {
  event: {
    title: string;
    startAt: Date;
    endAt: Date | null;
    venue: string;
    address: string;
    city: string;
    state: string;
  };
  typeName: string;
  status: string;
  qrDataUrl: string | null;
  code: string;
  holderName: string;
  confirmationCode: string;
  orderId: string;
  downloadHref: string;
}) {
  return (
    <div className="page">
      <div className="container ticket-view">
        <article className="ticket-view__card">
          <p className="section__eyebrow">Admission ticket</p>
          <h1 className="section__title" style={{ margin: "0 0 0.5rem" }}>
            {event.title}
          </h1>
          <p className="section__lede" style={{ marginBottom: "1.25rem" }}>
            {typeName} · Status: {status.toUpperCase()}
          </p>

          <div className="ticket-view__qr">
            {qrDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={qrDataUrl}
                alt={`QR code for ${code}`}
                width={240}
                height={240}
              />
            ) : (
              <p>QR code unavailable</p>
            )}
          </div>

          <p className="ticket-card__code" style={{ fontSize: "1.2rem" }}>
            {code}
          </p>
          <p className="ticket-view__hint">Present this QR code at check-in.</p>

          <div className="meta-list" style={{ borderTop: "1px solid var(--line)", marginTop: "1rem" }}>
            <div>
              <strong>Guest</strong>
              <span>{holderName}</span>
            </div>
            <div>
              <strong>When</strong>
              <span>{formatEventDateTime(event.startAt, event.endAt)}</span>
            </div>
            <div>
              <strong>Where</strong>
              <span>
                {event.venue}
                <br />
                {event.address}, {event.city}, {event.state}
              </span>
            </div>
            <div>
              <strong>Confirmation</strong>
              <span>{confirmationCode}</span>
            </div>
          </div>

          <div className="ticket-view__actions">
            <a className="btn btn--primary" href={downloadHref}>
              <IconDownload className="btn__icon" />
              <span>Download All Tickets</span>
            </a>
            <Link className="btn btn--secondary" href={`/confirmation/${orderId}`}>
              Back to My Tickets
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
