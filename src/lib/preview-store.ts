import { randomBytes } from "crypto";
import { DEMO_EVENT, type DemoEvent, type DemoTicketType } from "./demo-data";
import { createQrDataUrl, generateConfirmationCode, generateTicketCode } from "./qr";

export type PreviewTicket = {
  id: string;
  orderId: string;
  ticketTypeId: string;
  code: string;
  holderName: string;
  holderEmail: string;
  status: string;
  qrDataUrl: string | null;
  createdAt: Date;
  ticketType: DemoTicketType;
};

export type PreviewOrderItem = {
  id: string;
  orderId: string;
  ticketTypeId: string;
  quantity: number;
  unitPriceCents: number;
  ticketType: DemoTicketType;
};

export type PreviewOrder = {
  id: string;
  eventId: string;
  buyerName: string;
  buyerEmail: string;
  status: string;
  totalCents: number;
  currency: string;
  stripeSessionId: string | null;
  confirmationCode: string;
  emailStatus: string;
  createdAt: Date;
  event: DemoEvent;
  items: PreviewOrderItem[];
  tickets: PreviewTicket[];
};

type PreviewStore = {
  ordersById: Map<string, PreviewOrder>;
  ticketsByCode: Map<string, PreviewTicket>;
};

const globalForPreview = globalThis as unknown as {
  __kappaPreviewStore?: PreviewStore;
};

function store(): PreviewStore {
  if (!globalForPreview.__kappaPreviewStore) {
    globalForPreview.__kappaPreviewStore = {
      ordersById: new Map(),
      ticketsByCode: new Map(),
    };
  }
  return globalForPreview.__kappaPreviewStore;
}

function newId(prefix: string): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

export type PreviewCheckoutItem = {
  ticketTypeId: string;
  quantity: number;
};

export async function createPreviewCheckoutOrder(input: {
  buyerName: string;
  buyerEmail: string;
  items: PreviewCheckoutItem[];
}): Promise<PreviewOrder> {
  const event = DEMO_EVENT;
  const lineItems: PreviewOrderItem[] = [];
  let totalCents = 0;

  for (const item of input.items) {
    const type = event.ticketTypes.find((t) => t.id === item.ticketTypeId);
    if (!type || !type.isActive) {
      throw new Error("Invalid ticket type");
    }
    const remaining = type.capacity - type.soldCount;
    if (item.quantity > remaining) {
      throw new Error(`Not enough ${type.name} tickets remaining`);
    }
    lineItems.push({
      id: newId("item"),
      orderId: "",
      ticketTypeId: type.id,
      quantity: item.quantity,
      unitPriceCents: type.priceCents,
      ticketType: type,
    });
    totalCents += type.priceCents * item.quantity;
  }

  const orderId = newId("preview");
  const confirmationCode = generateConfirmationCode();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const tickets: PreviewTicket[] = [];

  for (const item of lineItems) {
    item.orderId = orderId;
    for (let i = 0; i < item.quantity; i++) {
      const code = generateTicketCode();
      const qrDataUrl = await createQrDataUrl(`${appUrl}/ticket/${code}`);
      const ticket: PreviewTicket = {
        id: newId("ticket"),
        orderId,
        ticketTypeId: item.ticketTypeId,
        code,
        holderName: input.buyerName,
        holderEmail: input.buyerEmail.toLowerCase(),
        status: "valid",
        qrDataUrl,
        createdAt: new Date(),
        ticketType: item.ticketType,
      };
      tickets.push(ticket);
    }
  }

  const order: PreviewOrder = {
    id: orderId,
    eventId: event.id,
    buyerName: input.buyerName,
    buyerEmail: input.buyerEmail.toLowerCase(),
    status: "paid",
    totalCents,
    currency: "usd",
    stripeSessionId: null,
    confirmationCode,
    emailStatus: "skipped",
    createdAt: new Date(),
    event,
    items: lineItems,
    tickets,
  };

  const s = store();
  s.ordersById.set(order.id, order);
  for (const ticket of tickets) {
    s.ticketsByCode.set(ticket.code.toUpperCase(), ticket);
  }

  return order;
}

export function getPreviewOrder(orderId: string): PreviewOrder | null {
  return store().ordersById.get(orderId) ?? null;
}

export function getPreviewTicketByCode(code: string): PreviewTicket | null {
  return store().ticketsByCode.get(code.toUpperCase()) ?? null;
}

export function listPreviewOrders(): PreviewOrder[] {
  return Array.from(store().ordersById.values()).sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
  );
}
