const EVENT_TZ = process.env.NEXT_PUBLIC_EVENT_TZ || "America/New_York";

export function formatCurrency(cents: number, currency = "usd"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function partsInTz(date: Date, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat("en-US", { timeZone: EVENT_TZ, ...options }).format(date);
}

export function formatEventDate(date: Date): string {
  return partsInTz(date, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export function formatEventTime(date: Date): string {
  return partsInTz(date, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function formatEventDateTime(start: Date, end?: Date | null): string {
  const datePart = formatEventDate(start);
  const startTime = formatEventTime(start);
  if (!end) return `${datePart} · ${startTime}`;
  return `${datePart} · ${startTime} - ${formatEventTime(end)}`;
}

/** Compact uppercase date for the landing info bar, e.g. "SAT OCT 18, 2026" */
export function formatEventDateCompact(date: Date): string {
  return partsInTz(date, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();
}

export function formatEventTimeRange(start: Date, end?: Date | null): string {
  const startTime = formatEventTime(start).toUpperCase();
  if (!end) return startTime;
  return `${startTime} - ${formatEventTime(end).toUpperCase()}`;
}
