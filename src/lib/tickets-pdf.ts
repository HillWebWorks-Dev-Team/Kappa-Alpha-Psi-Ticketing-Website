import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { formatCurrency, formatEventDateTime } from "@/lib/format";
import { resolveTicketTheme, type TicketTheme } from "@/lib/ticket-theme";

export type PdfTicket = {
  code: string;
  status: string;
  typeName: string;
  holderName: string;
  qrDataUrl: string | null;
};

export type PdfOrder = {
  confirmationCode: string;
  buyerName: string;
  buyerEmail: string;
  totalCents: number;
  event: {
    title: string;
    slug?: string;
    venue: string;
    address: string;
    city: string;
    state: string;
    startAt: Date;
    endAt: Date | null;
  };
  tickets: PdfTicket[];
};

function dataUrlToBuffer(dataUrl: string): Buffer | null {
  const match = /^data:image\/\w+;base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return Buffer.from(match[1], "base64");
}

function loadLogo(): Buffer | null {
  try {
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) return fs.readFileSync(logoPath);
  } catch {
    /* ignore */
  }
  return null;
}

function loadHalloweenArt(): Buffer | null {
  try {
    const artPath = path.join(process.cwd(), "public", "halloween-flyer.jpg");
    if (fs.existsSync(artPath)) return fs.readFileSync(artPath);
  } catch {
    /* ignore */
  }
  return null;
}

function drawHeaderBar(doc: PDFKit.PDFDocument, theme: TicketTheme) {
  const w = doc.page.width;
  doc.save();
  doc.rect(0, 0, w, 72).fill(theme.header);
  doc.rect(0, 72, w, 4).fill(theme.headerAccent);
  doc.restore();
}

function drawFooterBar(
  doc: PDFKit.PDFDocument,
  theme: TicketTheme,
  pageLabel: string
) {
  const w = doc.page.width;
  const h = doc.page.height;
  doc.save();
  doc.rect(0, h - 46, w, 46).fill(theme.footer);
  doc
    .fillColor(theme.cream)
    .font("Helvetica")
    .fontSize(7.5)
    .text(theme.footerTagline, 48, h - 30, {
      width: w - 160,
      align: "left",
    });
  doc
    .fillColor(theme.accent)
    .fontSize(8)
    .text(pageLabel, w - 120, h - 30, { width: 72, align: "right" });
  doc.restore();
}

function drawRule(
  doc: PDFKit.PDFDocument,
  theme: TicketTheme,
  x: number,
  y: number,
  width: number
) {
  doc.save();
  doc
    .moveTo(x, y)
    .lineTo(x + width, y)
    .lineWidth(1)
    .strokeColor(theme.accent)
    .stroke();
  doc.restore();
}

function paintPageBackground(doc: PDFKit.PDFDocument, theme: TicketTheme) {
  if (theme.id !== "halloween") return;
  doc.save();
  doc.rect(0, 0, doc.page.width, doc.page.height).fill(theme.pageBg);
  doc.restore();
}

export async function buildTicketsPdf(order: PdfOrder): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const theme = resolveTicketTheme(order.event.slug);
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 0,
      info: {
        Title: `Legendary Entertainment Tickets - ${order.confirmationCode}`,
        Author: "Legendary Entertainment Ticketing",
      },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const when = formatEventDateTime(order.event.startAt, order.event.endAt);
    const location = `${order.event.venue}\n${order.event.address}, ${order.event.city}, ${order.event.state}`;
    const logo = loadLogo();
    const halloweenArt = theme.id === "halloween" ? loadHalloweenArt() : null;
    const contentW = doc.page.width - 96;
    const left = 48;
    const totalPages = order.tickets.length + 1;

    // ── Cover page ──────────────────────────────────────────
    paintPageBackground(doc, theme);
    drawHeaderBar(doc, theme);

    if (logo) {
      doc.image(logo, left, 92, { fit: [56, 56] });
    }

    doc
      .fillColor(theme.id === "halloween" ? theme.cream : theme.header)
      .font("Helvetica-Bold")
      .fontSize(10)
      .text(theme.brandLabel, logo ? left + 68 : left, logo ? 100 : 96);
    doc
      .fillColor(theme.muted)
      .font("Helvetica")
      .fontSize(8)
      .text("TICKETING", logo ? left + 68 : left, logo ? 116 : 112);
    doc
      .fillColor(theme.accent)
      .font("Helvetica")
      .fontSize(8)
      .text(theme.brandSub, logo ? left + 68 : left, logo ? 132 : 128);

    doc
      .fillColor(theme.id === "halloween" ? theme.cream : "#4A100E")
      .font("Times-Bold")
      .fontSize(theme.id === "halloween" ? 26 : 28)
      .text(order.event.title, left, 180, { width: contentW * 0.62 });

    drawRule(doc, theme, left, doc.y + 8, 72);

    doc
      .moveDown(1.2)
      .fillColor(theme.muted)
      .font("Helvetica")
      .fontSize(11)
      .text(when, left, doc.y, { width: contentW * 0.62 });
    doc
      .moveDown(0.35)
      .fillColor(theme.muted)
      .fontSize(10)
      .text(location, { width: contentW * 0.62 });

    if (halloweenArt) {
      doc.image(halloweenArt, left + contentW * 0.66, 170, {
        fit: [170, 220],
      });
    }

    const cardY = Math.max(doc.y + 28, 360);
    doc.save();
    doc.roundedRect(left, cardY, contentW, 168, 2).fill(theme.cardBg);
    doc
      .roundedRect(left, cardY, contentW, 168, 2)
      .lineWidth(1)
      .strokeColor(theme.line)
      .stroke();
    doc.rect(left, cardY, 4, 168).fill(theme.banner);
    doc.restore();

    const cardPadX = left + 20;
    let cy = cardY + 18;
    doc
      .fillColor(theme.id === "halloween" ? theme.accent : theme.header)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("ORDER CONFIRMATION", cardPadX, cy);
    cy += 22;

    const rows: Array<[string, string]> = [
      ["Confirmation", order.confirmationCode],
      ["Purchaser", order.buyerName],
      ["Email", order.buyerEmail],
      ["Tickets", String(order.tickets.length)],
      ["Total paid", formatCurrency(order.totalCents)],
    ];

    for (const [label, value] of rows) {
      doc
        .fillColor(theme.muted)
        .font("Helvetica")
        .fontSize(8)
        .text(label.toUpperCase(), cardPadX, cy, {
          width: 110,
          continued: false,
        });
      doc
        .fillColor(theme.ink)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(value, cardPadX + 120, cy, { width: contentW - 150 });
      cy += 22;
    }

    doc
      .fillColor(theme.muted)
      .font("Helvetica")
      .fontSize(9)
      .text(
        "Present each ticket’s QR code at check-in. Every code is unique and valid only for its listed ticket. Keep this file for your records.",
        left,
        cardY + 188,
        { width: contentW, align: "left", lineGap: 2 }
      );

    drawFooterBar(doc, theme, `1 / ${totalPages}`);

    // ── Individual ticket pages ─────────────────────────────
    order.tickets.forEach((ticket, index) => {
      doc.addPage();
      paintPageBackground(doc, theme);
      drawHeaderBar(doc, theme);

      doc
        .fillColor(theme.cream)
        .font("Helvetica")
        .fontSize(8)
        .text("ADMISSION TICKET", left, 28, { characterSpacing: 1.5 });

      if (logo) {
        doc.image(logo, doc.page.width - 48 - 36, 18, {
          fit: [36, 36],
        });
      }

      doc
        .fillColor(theme.id === "halloween" ? theme.cream : "#4A100E")
        .font("Times-Bold")
        .fontSize(22)
        .text(order.event.title, left, 100, { width: contentW });
      drawRule(doc, theme, left, doc.y + 6, 56);
      doc.moveDown(1);
      doc
        .fillColor(theme.muted)
        .font("Helvetica")
        .fontSize(10)
        .text(when, { width: contentW });
      doc
        .moveDown(0.25)
        .text(
          `${order.event.venue}  ·  ${order.event.city}, ${order.event.state}`,
          {
            width: contentW,
          }
        );

      const bannerY = doc.y + 22;
      doc.save();
      doc.roundedRect(left, bannerY, contentW, 54, 2).fill(theme.banner);
      doc.restore();
      doc
        .fillColor(theme.cream)
        .font("Times-Bold")
        .fontSize(16)
        .text(ticket.typeName, left + 16, bannerY + 12, {
          width: contentW - 32,
        });
      doc
        .fillColor(theme.accent)
        .font("Helvetica")
        .fontSize(9)
        .text(`Status: ${ticket.status.toUpperCase()}`, left + 16, bannerY + 34);

      const detailY = bannerY + 72;
      const colW = (contentW - 16) / 2;
      const details: Array<[string, string]> = [
        ["Guest", ticket.holderName],
        ["Ticket #", ticket.code],
        ["Confirmation", order.confirmationCode],
        ["Venue", order.event.venue],
      ];

      details.forEach(([label, value], i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = left + col * (colW + 16);
        const y = detailY + row * 42;
        doc
          .fillColor(theme.muted)
          .font("Helvetica")
          .fontSize(7.5)
          .text(label.toUpperCase(), x, y, { characterSpacing: 0.8 });
        doc
          .fillColor(theme.ink)
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(value, x, y + 12, { width: colW });
      });

      // QR stays on white for scan reliability
      const qrSize = 200;
      const qrPanelW = qrSize + 40;
      const qrPanelH = qrSize + 56;
      const qrPanelX = (doc.page.width - qrPanelW) / 2;
      const qrPanelY = 430;

      doc.save();
      doc.roundedRect(qrPanelX, qrPanelY, qrPanelW, qrPanelH, 2).fill("#FFFFFF");
      doc
        .roundedRect(qrPanelX, qrPanelY, qrPanelW, qrPanelH, 2)
        .lineWidth(1.25)
        .strokeColor(theme.banner)
        .stroke();
      doc
        .roundedRect(qrPanelX + 3, qrPanelY + 3, qrPanelW - 6, qrPanelH - 6, 1)
        .lineWidth(0.5)
        .strokeColor(theme.accent)
        .stroke();
      doc.restore();

      doc
        .fillColor(theme.banner)
        .font("Helvetica")
        .fontSize(8)
        .text("SCAN AT CHECK-IN", qrPanelX, qrPanelY + 12, {
          width: qrPanelW,
          align: "center",
          characterSpacing: 1.2,
        });

      if (ticket.qrDataUrl) {
        const buf = dataUrlToBuffer(ticket.qrDataUrl);
        if (buf) {
          doc.image(buf, qrPanelX + 20, qrPanelY + 28, {
            width: qrSize,
            height: qrSize,
          });
        }
      }

      doc
        .fillColor("#625C59")
        .font("Helvetica")
        .fontSize(8)
        .text(ticket.code, qrPanelX, qrPanelY + qrPanelH - 18, {
          width: qrPanelW,
          align: "center",
        });

      drawFooterBar(doc, theme, `${index + 2} / ${totalPages}`);
    });

    doc.end();
  });
}
