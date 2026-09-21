import { NextRequest, NextResponse } from "next/server";
import { isUiPreview } from "@/lib/preview";
import {
  getPreviewOrder,
  getPreviewTicketByCode,
  markPreviewTicketUsed,
} from "@/lib/preview-store";
import { prisma } from "@/lib/prisma";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function assertAdmin(req: NextRequest) {
  const password = req.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";
  return Boolean(expected && password === expected);
}

function normalizeCode(raw: string): string {
  const trimmed = raw.trim();
  try {
    if (trimmed.includes("/ticket/")) {
      const url = new URL(trimmed);
      const parts = url.pathname.split("/").filter(Boolean);
      const idx = parts.indexOf("ticket");
      if (idx >= 0 && parts[idx + 1]) {
        return parts[idx + 1].toUpperCase();
      }
    }
  } catch {
    // not a URL — treat as raw code
  }
  const match = trimmed.match(/\/ticket\/([A-Za-z0-9_-]+)/i);
  if (match?.[1]) return match[1].toUpperCase();
  return trimmed.toUpperCase();
}

type TicketPayload = {
  code: string;
  status: string;
  holderName: string;
  holderEmail: string;
  typeName: string;
  confirmationCode: string;
  eventTitle: string;
  alreadyUsed: boolean;
};

async function lookupTicket(codeRaw: string): Promise<
  | { ok: true; ticket: TicketPayload }
  | { ok: false; error: string; status: number }
> {
  const code = normalizeCode(codeRaw);
  if (!code) {
    return { ok: false, error: "Enter a ticket code", status: 400 };
  }

  if (isUiPreview()) {
    const ticket = getPreviewTicketByCode(code);
    if (!ticket) {
      return { ok: false, error: "Ticket not found", status: 404 };
    }
    const order = getPreviewOrder(ticket.orderId);
    if (!order || order.status !== "paid") {
      return { ok: false, error: "Ticket is not valid for entry", status: 400 };
    }
    return {
      ok: true,
      ticket: {
        code: ticket.code,
        status: ticket.status,
        holderName: ticket.holderName,
        holderEmail: ticket.holderEmail,
        typeName: ticket.ticketType.name,
        confirmationCode: order.confirmationCode,
        eventTitle: order.event.title,
        alreadyUsed: ticket.status === "used",
      },
    };
  }

  const ticket = await prisma.ticket.findUnique({
    where: { code },
    include: {
      ticketType: true,
      order: { include: { event: true } },
    },
  });

  if (!ticket) {
    return { ok: false, error: "Ticket not found", status: 404 };
  }
  if (ticket.order.status !== "paid") {
    return { ok: false, error: "Ticket is not valid for entry", status: 400 };
  }
  if (ticket.status === "cancelled") {
    return { ok: false, error: "Ticket has been cancelled", status: 400 };
  }

  return {
    ok: true,
    ticket: {
      code: ticket.code,
      status: ticket.status,
      holderName: ticket.holderName,
      holderEmail: ticket.holderEmail,
      typeName: ticket.ticketType.name,
      confirmationCode: ticket.order.confirmationCode,
      eventTitle: ticket.order.event.title,
      alreadyUsed: ticket.status === "used",
    },
  };
}

export async function GET(req: NextRequest) {
  if (!assertAdmin(req)) return unauthorized();

  const code = req.nextUrl.searchParams.get("code") || "";
  const result = await lookupTicket(code);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ ticket: result.ticket });
}

export async function POST(req: NextRequest) {
  if (!assertAdmin(req)) return unauthorized();

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const result = await lookupTicket(body.code || "");
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }

  if (result.ticket.alreadyUsed) {
    return NextResponse.json(
      {
        error: "Ticket already checked in",
        ticket: result.ticket,
      },
      { status: 409 }
    );
  }

  if (isUiPreview()) {
    const updated = markPreviewTicketUsed(result.ticket.code);
    if (!updated) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }
    return NextResponse.json({
      ok: true,
      ticket: { ...result.ticket, status: "used", alreadyUsed: true },
    });
  }

  const updated = await prisma.ticket.update({
    where: { code: result.ticket.code },
    data: { status: "used" },
  });

  return NextResponse.json({
    ok: true,
    ticket: {
      ...result.ticket,
      status: updated.status,
      alreadyUsed: true,
    },
  });
}
