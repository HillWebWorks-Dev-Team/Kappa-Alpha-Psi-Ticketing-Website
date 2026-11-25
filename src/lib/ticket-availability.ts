/**
 * Optional per-event sale windows by ticket type name.
 * When no window is defined for a slug, all active ticket types stay on sale.
 */

export type TicketSaleWindow = {
  name: string;
  /** Inclusive start of availability. */
  availableFrom?: Date;
  /** Exclusive end of availability. */
  availableUntil?: Date;
};

/** Early bird ends end-of-day Dec 1, 2026 (America/New_York). */
const KRISTMAS_EARLY_BIRD_ENDS = new Date("2026-12-02T00:00:00-05:00");

const SALE_WINDOWS: Record<string, TicketSaleWindow[]> = {
  "kristmas-konfessions-2026": [
    {
      name: "Early Bird",
      availableUntil: KRISTMAS_EARLY_BIRD_ENDS,
    },
    {
      name: "Women",
      availableFrom: KRISTMAS_EARLY_BIRD_ENDS,
    },
    {
      name: "Men",
      availableFrom: KRISTMAS_EARLY_BIRD_ENDS,
    },
  ],
};

export function isTicketTypeOnSale(
  eventSlug: string,
  ticketTypeName: string,
  now = new Date()
): boolean {
  const windows = SALE_WINDOWS[eventSlug];
  if (!windows) return true;

  const window = windows.find((entry) => entry.name === ticketTypeName);
  if (!window) return true;

  if (window.availableFrom && now < window.availableFrom) return false;
  if (window.availableUntil && now >= window.availableUntil) return false;
  return true;
}

export function filterOnSaleTicketTypes<T extends { name: string; isActive: boolean }>(
  eventSlug: string,
  ticketTypes: T[],
  options?: { activeOnly?: boolean; now?: Date }
): T[] {
  const activeOnly = options?.activeOnly ?? true;
  const now = options?.now ?? new Date();

  return ticketTypes.filter((ticket) => {
    if (activeOnly && !ticket.isActive) return false;
    return isTicketTypeOnSale(eventSlug, ticket.name, now);
  });
}
