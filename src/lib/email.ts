import { Resend } from "resend";
import { formatCurrency, formatEventDateTime } from "./format";
import { resolveTicketTheme } from "./ticket-theme";

const DEFAULT_FROM =
  "Legendary Entertainment <tickets@legendaryentertainmentticketing.com>";

const FONT_STACK =
  "'Cormorant Garamond', Georgia, 'Times New Roman', serif";
const BODY_STACK = "Georgia, 'Times New Roman', serif";

type TicketEmailPayload = {
  to: string;
  buyerName: string;
  eventTitle: string;
  eventSlug?: string;
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
  theme: ReturnType<typeof resolveTicketTheme>;
  preheader: string;
  title: string;
  eyebrow?: string;
  bodyHtml: string;
  footerNote?: string;
}): string {
  const brand = options.theme.email;
  const eyebrow = options.eyebrow ?? "Legendary Entertainment";
  const footer =
    options.footerNote ??
    "Questions? Reply to this email or visit the event site.";
  const accentBar =
    options.theme.id === "halloween"
      ? `linear-gradient(90deg, ${brand.accent}, ${brand.gold}, ${brand.accent})`
      : `linear-gradient(90deg, ${brand.gold}, #f2ebd7, ${brand.gold})`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="${options.theme.id === "halloween" ? "dark" : "light"}" />
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
<body style="margin:0;padding:0;background:${brand.pageBg};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${escapeHtml(options.preheader)}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${brand.pageBg};padding:40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:${brand.cardBg};border:1px solid ${brand.line};">
          <tr>
            <td style="height:4px;background:${accentBar};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background:${brand.headerBg};padding:36px 40px 32px;text-align:left;border-bottom:3px solid ${brand.accent};">
              <p style="margin:0 0 10px;font-family:${BODY_STACK};font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:${brand.gold};">
                ${escapeHtml(eyebrow)}
              </p>
              <h1 style="margin:0;font-family:${FONT_STACK};font-size:34px;font-weight:600;line-height:1.15;color:${brand.headerText};">
                ${escapeHtml(options.title)}
              </h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px 28px;font-family:${BODY_STACK};color:${brand.ink};">
              ${options.bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="background:${brand.footerBg};padding:24px 40px;border-top:1px solid ${brand.line};">
              <p style="margin:0 0 6px;font-family:${FONT_STACK};font-size:18px;color:${brand.headerText};">
                Legendary Entertainment
              </p>
              <p style="margin:0;font-family:${BODY_STACK};font-size:12px;line-height:1.55;color:${brand.footerText};">
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

function detailRow(
  brand: ReturnType<typeof resolveTicketTheme>["email"],
  label: string,
  value: string
): string {
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

function ctaButton(
  brand: ReturnType<typeof resolveTicketTheme>["email"],
  href: string,
  label: string
): string {
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0;">
    <tr>
      <td style="background:${brand.accent};border-radius:2px;">
        <a href="${href}" style="display:inline-block;padding:14px 28px;font-family:${BODY_STACK};font-size:14px;letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;color:${brand.headerText};">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`;
}

/** Gmail and most clients block data: URLs - embed QR PNGs as CID attachments instead. */
function dataUrlToPngBuffer(dataUrl: string): Buffer | null {
  const match = /^data:image\/\w+;base64,(.+)$/.exec(dataUrl);
  if (!match?.[1]) return null;
  return Buffer.from(match[1], "base64");
}

export async function sendTicketEmail(payload: TicketEmailPayload): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn("[email] Resend not configured - skipping ticket email");
    return false;
  }

  const theme = resolveTicketTheme(payload.eventSlug);
  const brand = theme.email;
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

  const qrAttachments: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
    contentId: string;
  }> = [];

  const ticketCards = payload.tickets
    .map((t, index) => {
      const typeName = escapeHtml(t.typeName);
      const code = escapeHtml(t.code);
      const contentId = `ticket-qr-${index}`;
      const png = t.qrDataUrl ? dataUrlToPngBuffer(t.qrDataUrl) : null;

      let qr: string;
      if (png) {
        qrAttachments.push({
          filename: `ticket-${index + 1}.png`,
          content: png,
          contentType: "image/png",
          contentId,
        });
        qr = `<img src="cid:${contentId}" alt="QR code for ${code}" width="148" height="148" style="display:block;width:148px;height:148px;border:1px solid ${brand.line};background:#ffffff;" />`;
      } else {
        qr = `<div style="width:148px;height:148px;border:1px dashed ${brand.line};background:${brand.ticketCardBg};"></div>`;
      }

      return `
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 ${index < payload.tickets.length - 1 ? "16" : "0"}px;background:${brand.ticketCardBg};border:1px solid ${brand.line};">
        <tr>
          <td style="padding:20px;vertical-align:top;width:168px;">
            ${qr}
          </td>
          <td style="padding:20px 20px 20px 0;vertical-align:middle;">
            <p style="margin:0 0 6px;font-family:${BODY_STACK};font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:${brand.muted};">
              Ticket ${index + 1} of ${ticketCount}
            </p>
            <p style="margin:0 0 10px;font-family:${FONT_STACK};font-size:22px;font-weight:600;color:${brand.accent};line-height:1.2;">
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
      Show a QR code below at check-in - screenshots work fine.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 28px;">
      ${detailRow(brand, "Event", eventTitle)}
      ${detailRow(brand, "When", escapeHtml(when))}
      ${detailRow(brand, "Where", `${eventVenue}<br /><span style="color:${brand.muted};font-size:13px;">${eventAddress}</span>`)}
      ${detailRow(brand, "Order", confirmationCode)}
      ${detailRow(brand, "Total", `<strong style="color:${brand.accent};">${total}</strong>`)}
    </table>

    <p style="margin:0 0 14px;font-family:${BODY_STACK};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${brand.gold};">
      Your tickets
    </p>
    ${ticketCards}

    <div style="margin:32px 0 0;padding-top:28px;border-top:1px solid ${brand.line};">
      ${ctaButton(brand, confirmationUrl, "View tickets online")}
      <p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:${brand.muted};">
        Keep this email handy. You can also open your tickets anytime from the confirmation page.
      </p>
    </div>`;

  const html = emailShell({
    theme,
    preheader: `Your ${eventTitle} tickets are confirmed - confirmation ${confirmationCode}`,
    title:
      theme.id === "halloween"
        ? "Your Ice Skream tickets"
        : "Your tickets are confirmed",
    eyebrow:
      theme.id === "halloween"
        ? "Legendary × Monster House"
        : "Legendary Entertainment",
    bodyHtml,
    footerNote:
      theme.id === "halloween"
        ? "Present your QR at the door. Costumes mandatory. Liquor sold 21+. 18+ entry."
        : "Present your QR code at the door. 18+ event. Have a legendary night.",
  });

  const { data, error } = await resend.emails.send({
    from,
    to: payload.to,
    subject: `Your tickets - ${payload.eventTitle} (${payload.confirmationCode})`,
    html,
    attachments: qrAttachments,
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

  const theme = resolveTicketTheme(null);
  const brand = theme.email;
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
      ${eventTitle ? detailRow(brand, "Event", eventTitle) : ""}
      ${detailRow(brand, "From", safeName)}
      ${detailRow(brand, "Email", `<a href="mailto:${safeEmail}" style="color:${brand.accent};text-decoration:none;">${safeEmail}</a>`)}
      ${detailRow(brand, "Topic", safeSubject)}
    </table>

    <p style="margin:0 0 10px;font-family:${BODY_STACK};font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${brand.gold};">
      Message
    </p>
    <div style="padding:20px 22px;background:${brand.ticketCardBg};border:1px solid ${brand.line};border-left:3px solid ${brand.accent};font-size:15px;line-height:1.65;color:${brand.ink};">
      ${safeMessage}
    </div>`;

  const html = emailShell({
    theme,
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
      `[Contact] ${payload.subject} - ${payload.name}`
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
