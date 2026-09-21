import { Resend } from "resend";
import { formatCurrency, formatEventDateTime } from "./format";

type TicketEmailPayload = {
  to: string;
  buyerName: string;
  eventTitle: string;
  eventVenue: string;
  eventAddress: string;
  startAt: Date;
  endAt?: Date | null;
  confirmationCode: string;
  totalCents: number;
  confirmationUrl: string;
  tickets: Array<{
    code: string;
    typeName: string;
    qrDataUrl: string | null;
  }>;
};

export function isEmailConfigured(): boolean {
  const key = process.env.RESEND_API_KEY;
  return Boolean(key && !key.includes("replace_me"));
}

export async function sendTicketEmail(payload: TicketEmailPayload): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn("[email] Resend not configured - skipping ticket email");
    return false;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || "tickets@example.com";
  const when = formatEventDateTime(payload.startAt, payload.endAt);

  const ticketBlocks = payload.tickets
    .map(
      (t) => `
      <tr>
        <td style="padding:16px;border-bottom:1px solid #e8dfd0;">
          <p style="margin:0 0 4px;font-weight:700;color:#8B0000;">${t.typeName}</p>
          <p style="margin:0 0 12px;font-family:monospace;letter-spacing:1px;">${t.code}</p>
          ${
            t.qrDataUrl
              ? `<img src="${t.qrDataUrl}" alt="QR code for ${t.code}" width="160" height="160" style="display:block;border:1px solid #e8dfd0;" />`
              : ""
          }
        </td>
      </tr>`
    )
    .join("");

  const html = `
  <div style="font-family:Georgia,serif;background:#FFF8E7;padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8dfd0;">
      <div style="background:#8B0000;color:#FFF8E7;padding:24px 28px;">
        <p style="margin:0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.85;">Legendary Entertainment</p>
        <h1 style="margin:8px 0 0;font-size:26px;font-weight:400;">Your Tickets Are Confirmed</h1>
      </div>
      <div style="padding:28px;">
        <p style="margin:0 0 16px;color:#2a1a1a;">Hi ${payload.buyerName},</p>
        <p style="margin:0 0 20px;color:#2a1a1a;line-height:1.5;">
          Thank you for your purchase. Your tickets for <strong>${payload.eventTitle}</strong> are below.
          Present the QR code at check-in.
        </p>
        <p style="margin:0 0 4px;color:#5c4a3a;font-size:14px;"><strong>When:</strong> ${when}</p>
        <p style="margin:0 0 4px;color:#5c4a3a;font-size:14px;"><strong>Where:</strong> ${payload.eventVenue}</p>
        <p style="margin:0 0 20px;color:#5c4a3a;font-size:14px;">${payload.eventAddress}</p>
        <p style="margin:0 0 8px;color:#5c4a3a;font-size:14px;"><strong>Confirmation:</strong> ${payload.confirmationCode}</p>
        <p style="margin:0 0 24px;color:#5c4a3a;font-size:14px;"><strong>Total:</strong> ${formatCurrency(payload.totalCents)}</p>
        <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #8B0000;">
          ${ticketBlocks}
        </table>
        <p style="margin:24px 0 0;">
          <a href="${payload.confirmationUrl}" style="display:inline-block;background:#8B0000;color:#FFF8E7;text-decoration:none;padding:12px 20px;font-size:14px;">
            View tickets online
          </a>
        </p>
      </div>
    </div>
  </div>`;

  await resend.emails.send({
    from,
    to: payload.to,
    subject: `Your tickets - ${payload.eventTitle} (${payload.confirmationCode})`,
    html,
  });

  return true;
}

type ContactEmailPayload = {
  to: string;
  replyTo: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  eventTitle?: string;
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Strip CR/LF that could inject email headers. */
export function sanitizeEmailHeader(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function sendContactNotification(
  payload: ContactEmailPayload
): Promise<boolean> {
  if (!isEmailConfigured()) {
    console.warn("[email] Resend not configured - skipping contact notification");
    return false;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.EMAIL_FROM || "tickets@example.com";
  const safeName = escapeHtml(sanitizeEmailHeader(payload.name));
  const safeEmail = escapeHtml(sanitizeEmailHeader(payload.email));
  const safeSubject = escapeHtml(sanitizeEmailHeader(payload.subject));
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, "<br />");
  const eventLine = payload.eventTitle
    ? `<p style="margin:0 0 12px;color:#5c4a3a;font-size:14px;"><strong>Event:</strong> ${escapeHtml(payload.eventTitle)}</p>`
    : "";

  const html = `
  <div style="font-family:Georgia,serif;background:#FFF8E7;padding:32px 16px;">
    <div style="max-width:560px;margin:0 auto;background:#fff;border:1px solid #e8dfd0;">
      <div style="background:#8B0000;color:#FFF8E7;padding:24px 28px;">
        <p style="margin:0;font-size:12px;letter-spacing:0.2em;text-transform:uppercase;opacity:0.85;">Legendary Entertainment</p>
        <h1 style="margin:8px 0 0;font-size:26px;font-weight:400;">New Contact Inquiry</h1>
      </div>
      <div style="padding:28px;">
        ${eventLine}
        <p style="margin:0 0 8px;color:#5c4a3a;font-size:14px;"><strong>From:</strong> ${safeName}</p>
        <p style="margin:0 0 8px;color:#5c4a3a;font-size:14px;"><strong>Email:</strong> ${safeEmail}</p>
        <p style="margin:0 0 16px;color:#5c4a3a;font-size:14px;"><strong>Subject:</strong> ${safeSubject}</p>
        <div style="border-top:2px solid #8B0000;padding-top:16px;color:#2a1a1a;line-height:1.55;">
          ${safeMessage}
        </div>
      </div>
    </div>
  </div>`;

  await resend.emails.send({
    from,
    to: payload.to,
    replyTo: sanitizeEmailHeader(payload.replyTo),
    subject: sanitizeEmailHeader(
      `[Contact] ${payload.subject} - ${payload.name}`
    ),
    html,
  });

  return true;
}
