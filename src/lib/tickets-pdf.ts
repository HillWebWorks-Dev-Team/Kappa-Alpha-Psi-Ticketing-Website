import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";
import { formatCurrency, formatEventDateTime } from "@/lib/format";

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
    venue: string;
    address: string;
    city: string;
    state: string;
    startAt: Date;
    endAt: Date | null;
  };
  tickets: PdfTicket[];
};

const CRIMSON = "#70110C";
const CRIMSON_DEEP = "#4A100E";
const BURGUNDY = "#2B100F";
const CREAM = "#F2EBD7";
const IVORY = "#FAF7F1";
const INK = "#242020";
const MUTED = "#625C59";
const GOLD = "#D6B887";
const LINE = "#E6DDD3";

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

function drawHeaderBar(doc: PDFKit.PDFDocument) {
  const w = doc.page.width;
  doc.save();
  doc.rect(0, 0, w, 72).fill(CRIMSON);
  doc.rect(0, 72, w, 4).fill(GOLD);
  doc.restore();
}

function drawFooterBar(doc: PDFKit.PDFDocument, pageLabel: string) {
  const w = doc.page.width;
  const h = doc.page.height;
  doc.save();
  doc.rect(0, h - 46, w, 46).fill(BURGUNDY);
  doc
    .fillColor(CREAM)
    .font("Times-Roman")
    .fontSize(8)
    .text("Achievement in Every Field of Human Endeavor", 48, h - 30, {
      width: w - 160,
      align: "left",
    });
  doc
    .fillColor(GOLD)
    .fontSize(8)
    .text(pageLabel, w - 120, h - 30, { width: 72, align: "right" });
  doc.restore();
}

function drawRule(doc: PDFKit.PDFDocument, x: number, y: number, width: number) {
  doc.save();
  doc.moveTo(x, y).lineTo(x + width, y).lineWidth(1).strokeColor(GOLD).stroke();
  doc.restore();
}

export async function buildTicketsPdf(order: PdfOrder): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margin: 0,
      info: {
        Title: `Kappa Alpha Psi Tickets - ${order.confirmationCode}`,
        Author: "Kappa Alpha Psi Ticketing",
      },
    });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const when = formatEventDateTime(order.event.startAt, order.event.endAt);
    const location = `${order.event.venue}\n${order.event.address}, ${order.event.city}, ${order.event.state}`;
    const logo = loadLogo();
    const contentW = doc.page.width - 96;
    const left = 48;
    const totalPages = order.tickets.length + 1;

    // ── Cover page ──────────────────────────────────────────
    drawHeaderBar(doc);

    if (logo) {
      doc.image(logo, left, 92, { fit: [56, 56] });
    }

    doc
      .fillColor(CRIMSON)
      .font("Times-Bold")
      .fontSize(11)
      .text("KAPPA ALPHA PSI®", logo ? left + 68 : left, logo ? 100 : 96);
    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(8)
      .text("FRATERNITY, INCORPORATED®", logo ? left + 68 : left, logo ? 116 : 112);
    doc
      .fillColor(GOLD)
      .font("Helvetica")
      .fontSize(8)
      .text("OFFICIAL EVENT TICKETS", logo ? left + 68 : left, logo ? 132 : 128);

    doc
      .fillColor(CRIMSON_DEEP)
      .font("Times-Bold")
      .fontSize(28)
      .text(order.event.title, left, 180, { width: contentW });

    drawRule(doc, left, doc.y + 8, 72);

    doc
      .moveDown(1.2)
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(11)
      .text(when, left, doc.y, { width: contentW });
    doc
      .moveDown(0.35)
      .fillColor(MUTED)
      .fontSize(10)
      .text(location, { width: contentW });

    // Order summary card
    const cardY = Math.max(doc.y + 28, 320);
    doc.save();
    doc.roundedRect(left, cardY, contentW, 168, 2).fill(IVORY);
    doc.roundedRect(left, cardY, contentW, 168, 2).lineWidth(1).strokeColor(LINE).stroke();
    doc.rect(left, cardY, 4, 168).fill(CRIMSON);
    doc.restore();

    const cardPadX = left + 20;
    let cy = cardY + 18;
    doc
      .fillColor(CRIMSON)
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
        .fillColor(MUTED)
        .font("Helvetica")
        .fontSize(8)
        .text(label.toUpperCase(), cardPadX, cy, { width: 110, continued: false });
      doc
        .fillColor(INK)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(value, cardPadX + 120, cy, { width: contentW - 150 });
      cy += 22;
    }

    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text(
        "Present each ticket’s QR code at check-in. Every code is unique and valid only for its listed ticket. Keep this file for your records.",
        left,
        cardY + 188,
        { width: contentW, align: "left", lineGap: 2 }
      );

    drawFooterBar(doc, `1 / ${totalPages}`);

    // ── Individual ticket pages ─────────────────────────────
    order.tickets.forEach((ticket, index) => {
      doc.addPage();
      drawHeaderBar(doc);

      doc
        .fillColor(CREAM)
        .font("Helvetica")
        .fontSize(8)
        .text("ADMISSION TICKET", left, 28, { characterSpacing: 1.5 });

      if (logo) {
        doc.image(logo, doc.page.width - 48 - 36, 18, {
          fit: [36, 36],
        });
      }

      // Event block
      doc
        .fillColor(CRIMSON_DEEP)
        .font("Times-Bold")
        .fontSize(22)
        .text(order.event.title, left, 100, { width: contentW });
      drawRule(doc, left, doc.y + 6, 56);
      doc.moveDown(1);
      doc
        .fillColor(MUTED)
        .font("Helvetica")
        .fontSize(10)
        .text(when, { width: contentW });
      doc
        .moveDown(0.25)
        .text(`${order.event.venue}  ·  ${order.event.city}, ${order.event.state}`, {
          width: contentW,
        });

      // Ticket type banner
      const bannerY = doc.y + 22;
      doc.save();
      doc.roundedRect(left, bannerY, contentW, 54, 2).fill(CRIMSON);
      doc.restore();
      doc
        .fillColor(CREAM)
        .font("Times-Bold")
        .fontSize(16)
        .text(ticket.typeName, left + 16, bannerY + 12, { width: contentW - 32 });
      doc
        .fillColor(GOLD)
        .font("Helvetica")
        .fontSize(9)
        .text(`Status: ${ticket.status.toUpperCase()}`, left + 16, bannerY + 34);

      // Details grid
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
          .fillColor(MUTED)
          .font("Helvetica")
          .fontSize(7.5)
          .text(label.toUpperCase(), x, y, { characterSpacing: 0.8 });
        doc
          .fillColor(INK)
          .font("Helvetica-Bold")
          .fontSize(10)
          .text(value, x, y + 12, { width: colW });
      });

      // QR panel: white for scan reliability
      const qrSize = 200;
      const qrPanelW = qrSize + 40;
      const qrPanelH = qrSize + 56;
      const qrPanelX = (doc.page.width - qrPanelW) / 2;
      const qrPanelY = 430;

      doc.save();
      doc
        .roundedRect(qrPanelX, qrPanelY, qrPanelW, qrPanelH, 2)
        .lineWidth(1.25)
        .strokeColor(CRIMSON)
        .stroke();
      doc
        .roundedRect(qrPanelX + 3, qrPanelY + 3, qrPanelW - 6, qrPanelH - 6, 1)
        .lineWidth(0.5)
        .strokeColor(GOLD)
        .stroke();
      doc.restore();

      doc
        .fillColor(CRIMSON)
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
        .fillColor(MUTED)
        .font("Helvetica")
        .fontSize(8)
        .text(ticket.code, qrPanelX, qrPanelY + qrPanelH - 18, {
          width: qrPanelW,
          align: "center",
        });

      drawFooterBar(doc, `${index + 2} / ${totalPages}`);
    });

    doc.end();
  });
}
