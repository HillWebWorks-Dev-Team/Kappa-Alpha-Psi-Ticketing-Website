import { Resend } from "resend";
import { formatCurrency, formatEventDateTime } from "./format";

const DEFAULT_FROM =
  "Legendary Entertainment <tickets@legendaryentertainmentticketing.com>";

/** Brand tokens — keep in sync with globals.css */
const brand = {
  crimson: "#70110c",
  crimsonDeep: "#4a100e",
  burgundy: "#2b100f",
  cream: "#f2ebd7",
  ivory: "#faf7f1",
  white: "#ffffff",
  ink: "#242020",
  muted: "#625c59",
  line: "#e6ddd3",
  gold: "#d6b887",
} as const;

const FONT_STACK =
  "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const BODY_STACK = "Georgia, 'Times New Roman', serif";

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

let resendClient: Resend | null = null;

function getResend(): Resend | null {
  if (!isEmailConfigured()) return null;
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

function fromAddress(): string {
  const raw = process.env.EMAIL_FROM?.trim();
  if (!raw || raw.includes("example.com") || raw.includes("replace_me")) {
    return DEFAULT_FROM;
  }
  return raw;
}

export function isEmailConfigured(): boolean {
  const key = process.env.RESEND_API_KEY?.trim();
  return Boolean(key && !key.includes("replace_me") && key.startsWith("re_"));
}

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

function emailShell(options: {
  preheader: string;
  title: string;
  eyebrow?: string;
  bodyHtml: string;
  footerNote?: string;
}): string {
  const eyebrow = options.eyebrow ?? "Legendary Entertainment";
  const footer =
    options.footerNote ??
    "Questions? Reply to this email or visit the event site.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <title>${escapeHtml(options.title)}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td { font-family: Georgia, serif !important; }
  </style>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background:${brand.ivory};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(options.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${brand.ivory};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${brand.white};border:1px solid ${brand.line};">
          <!-- Gold accent bar -->
          <tr>
            <td style="height:4px;background:linear-gradient(90deg, ${brand.gold}, ${brand.cream}, ${brand.gold});font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="background:${brand.crimson};padding:36px 40px 32px;text-align:left;">
              <p style="margin:0 0 10px;font-family:${BODY_STACK};font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${brand.gold};">
                ${escapeHtml(eyebrow)}
              </p>
              <h1 style="margin:0;font-family:${FONT_STACK};font-size:34px;font-weight:600;line-height:1.15;color:${brand.cream};">
                ${escapeHtml(options.title)}
              </h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;font-family:${BODY_STACK};color:${brand.ink};">
              ${options.bodyHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:${brand.burgundy};padding:24px 40px;border-top:1px solid ${brand.crimsonDeep};">
              <p style="margin:0 0 6px;font-family:${FONT_STACK};font-size:18px;color:${brand.cream};">
                Legendary Entertainment
              </p>
              <p style="margin:0;font-family:${BODY_STACK};font-size:12px;line-height:1.55;color:${brand.gold};">
                ${escapeHtml(footer)}
              </p>
            </td>
          </tr>
        </table>
        <p style="margin:20px 0 0;font-family:${BODY_STACK};font-size:11px;color:${brand.muted};">
          Ticketing powered by Legendary Entertainment
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function detailRow(label: string, value: string): string {
  return `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid ${brand.line};width:110px;vertical-align:top;">
      <span style="font-family:${BODY_STACK};font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:${brand.muted};">${label}</span>
    </td>
    <td style="padding:10px 0;border-bottom:1px solid ${brand.line};vertical-align:top;">
      <span style="font-family:${BODY_STACK};font-size:15px;line-height:1.45;color:${brand.ink};">${value}</span>
    </td>
  </tr>`;
}

function ctaButton(href: string, label: string): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0;">
    <tr>
      <td style="background:${brand.crimson};border-radius:2px;">
        <a href="${href}" style="display:inline-block;padding:14px 28px;font-family:${BODY_STACK};font-size:14px;letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;color:${brand.cream};">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`;
}

export async function sendTicketEmail(payload: TicketEmailPayload): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] Resend not configured - skipping ticket email");
    return false;
  }

  const from = fromAddress();
  const when = formatEventDateTime(payload.startAt, payload.endAt);
  const buyerName = escapeHtml(payload.buyerName);
  const eventTitle = escapeHtml(payload.eventTitle);
  const eventVenue = escapeHtml(payload.eventVenue);
  const eventAddress = escapeHtml(payload.eventAddress);
  const confirmationCode = escapeHtml(payload.confirmationCode);
  const confirmationUrl = escapeHtml(payload.confirmationUrl);
  const total = escapeHtml(formatCurrency(payload.totalCents));
  const ticketCount = payload.tickets.length;

  const ticketCards = payload.tickets
    .map((t, index) => {
      const typeName = escapeHtml(t.typeName);
      const code = escapeHtml(t.code);
      const qr = t.qrDataUrl
        ? `<img src="${t.qrDataUrl}" alt="QR code for ${code}" width="148" height="148" style="display:block;width:148px;height:148px;border:1px solid ${brand.line};background:${brand.white};" />`
        : `<div style="width:148px;height:148px;border:1px dashed ${brand.line};background:${brand.ivory};"></div>`;

      return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 ${index < payload.tickets.length - 1 ? "16" : "0"}px;background:${brand.ivory};border:1px solid ${brand.line};">
        <tr>
          <td style="padding:20px;vertical-align:top;width:168px;">
            ${qr}
          </td>
          <td style="padding:20px 20px 20px 0;vertical-align:middle;">
            <p style="margin:0 0 6px;font-family:${BODY_STACK};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${brand.muted};">
              Ticket ${index + 1} of ${ticketCount}
            </p>
            <p style="margin:0 0 10px;font-family:${FONT_STACK};font-size:22px;font-weight:600;color:${brand.crimson};line-height:1.2;">
              ${typeName}
            </p>
            <p style="margin:0 0 4px;font-family:${BODY_STACK};font-size:11px;letter-spacing:0.12em;text-transform:uppercase;color:${brand.muted};">
              Ticket code
            </p>
            <p style="margin:0;font-family:'Courier New',Courier,monospace;font-size:15px;letter-spacing:0.08em;color:${brand.ink};">
              ${code}
            </p>
          </td>
        </tr>
      </table>`;
    })
    .join("");

  const bodyHtml = `
    <p style="margin:0 0 18px;font-family:${FONT_STACK};font-size:22px;color:${brand.ink};">
      Hi ${buyerName},
    </p>
    <p style="margin:0 0 28px;font-size:15px;line-height:1.65;color:${brand.muted};">
      Thank you for your purchase. Your tickets for <strong style="color:${brand.ink};">${eventTitle}</strong> are confirmed.
      Show a QR code below at check-in — screenshots work fine.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      ${detailRow("Event", eventTitle)}
      ${detailRow("When", escapeHtml(when))}
      ${detailRow("Where", `${eventVenue}<br /><span style="color:${brand.muted};font-size:13px;">${eventAddress}</span>`)}
      ${detailRow("Order", confirmationCode)}
      ${detailRow("Total", `<strong style="color:${brand.crimson};">${total}</strong>`)}
    </table>

    <p style="margin:0 0 14px;font-family:${BODY_STACK};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${brand.gold};">
      Your tickets
    </p>
    ${ticketCards}

    <div style="margin:32px 0 0;padding-top:28px;border-top:1px solid ${brand.line};">
      ${ctaButton(confirmationUrl, "View tickets online")}
      <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:${brand.muted};">
        Keep this email handy. You can also open your tickets anytime from the confirmation page.
      </p>
    </div>`;

  const html = emailShell({
    preheader: `Your ${eventTitle} tickets are confirmed — confirmation ${confirmationCode}`,
    title: "Your tickets are confirmed",
    bodyHtml,
    footerNote:
      "Present your QR code at the door. 18+ event. Have a legendary night.",
  });

  const { data, error } = await resend.emails.send({
    from,
    to: payload.to,
    subject: `Your tickets — ${payload.eventTitle} (${payload.confirmationCode})`,
    html,
  });

  if (error) {
    throw new Error(`[email] Resend ticket send failed: ${error.message}`);
  }

  console.info("[email] Ticket email sent", { id: data?.id, to: payload.to });
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

export async function sendContactNotification(
  payload: ContactEmailPayload
): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] Resend not configured - skipping contact notification");
    return false;
  }

  const from = fromAddress();
  const safeName = escapeHtml(sanitizeEmailHeader(payload.name));
  const safeEmail = escapeHtml(sanitizeEmailHeader(payload.email));
  const safeSubject = escapeHtml(sanitizeEmailHeader(payload.subject));
  const safeMessage = escapeHtml(payload.message).replace(/\n/g, "<br />");
  const eventTitle = payload.eventTitle
    ? escapeHtml(payload.eventTitle)
    : null;

  const bodyHtml = `
    <p style="margin:0 0 24px;font-size:15px;line-height:1.65;color:${brand.muted};">
      A new inquiry arrived through the ticketing site. Reply directly to this email to respond to the guest.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      ${eventTitle ? detailRow("Event", eventTitle) : ""}
      ${detailRow("From", safeName)}
      ${detailRow("Email", `<a href="mailto:${safeEmail}" style="color:${brand.crimson};text-decoration:none;">${safeEmail}</a>`)}
      ${detailRow("Topic", safeSubject)}
    </table>

    <p style="margin:0 0 10px;font-family:${BODY_STACK};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${brand.gold};">
      Message
    </p>
    <div style="padding:20px 22px;background:${brand.ivory};border:1px solid ${brand.line};border-left:3px solid ${brand.crimson};font-size:15px;line-height:1.65;color:${brand.ink};">
      ${safeMessage}
    </div>`;

  const html = emailShell({
    preheader: `New inquiry from ${safeName}: ${safeSubject}`,
    title: "New contact inquiry",
    bodyHtml,
    footerNote: "Reply to this email to continue the conversation with the guest.",
  });

  const { data, error } = await resend.emails.send({
    from,
    to: payload.to,
    replyTo: sanitizeEmailHeader(payload.replyTo),
    subject: sanitizeEmailHeader(
      `[Contact] ${payload.subject} — ${payload.name}`
    ),
    html,
  });

  if (error) {
    throw new Error(`[email] Resend contact send failed: ${error.message}`);
  }

  console.info("[email] Contact notification sent", {
    id: data?.id,
    to: payload.to,
  });
  return true;
}
