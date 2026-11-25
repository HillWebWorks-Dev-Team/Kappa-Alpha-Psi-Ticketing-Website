/** Set to true when this website should sell tickets again. */
export const TICKET_SALES_OPEN = true;

export const TICKET_SALES_CLOSED_TITLE = "Ticket sales are closed";

export const TICKET_SALES_CLOSED_MESSAGE =
  "Tickets can be purchased at a new website soon to be posted. This event will be on that link.";

export function answerForTicketSales(question: string, answer: string): string {
  if (TICKET_SALES_OPEN) return answer;
  if (/ticket|purchase|checkout|buy/i.test(question)) {
    return TICKET_SALES_CLOSED_MESSAGE;
  }
  return answer;
}
