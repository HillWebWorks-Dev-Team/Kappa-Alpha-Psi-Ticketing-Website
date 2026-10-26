import {
  TICKET_SALES_CLOSED_MESSAGE,
  TICKET_SALES_CLOSED_TITLE,
  TICKET_SALES_OPEN,
} from "@/lib/ticket-sales";

export function SalesClosedBanner() {
  if (TICKET_SALES_OPEN) return null;

  return (
    <div className="sales-closed-banner" role="status">
      <p>
        <strong>{TICKET_SALES_CLOSED_TITLE}.</strong> {TICKET_SALES_CLOSED_MESSAGE}
      </p>
    </div>
  );
}

export function SalesClosedNotice() {
  if (TICKET_SALES_OPEN) return null;

  return (
    <div className="event-sales-closed">
      <h2>{TICKET_SALES_CLOSED_TITLE}</h2>
      <p>{TICKET_SALES_CLOSED_MESSAGE}</p>
    </div>
  );
}
