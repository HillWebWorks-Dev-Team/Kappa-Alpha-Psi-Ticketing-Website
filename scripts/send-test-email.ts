import "dotenv/config";
import QRCode from "qrcode";
import { sendTicketEmail } from "../src/lib/email";

async function main() {
  const to = process.argv[2] || process.env.TEST_EMAIL_TO;
  if (!to) {
    console.error(
      "Usage: npx tsx scripts/send-test-email.ts you@example.com\nOr set TEST_EMAIL_TO in the environment."
    );
    process.exit(1);
  }

  const qr1 = await QRCode.toDataURL(
    "https://www.legendaryentertainmentticketing.com/ticket/TEST-DEMO-001",
    { margin: 1, width: 296 }
  );
  const qr2 = await QRCode.toDataURL(
    "https://www.legendaryentertainmentticketing.com/ticket/TEST-DEMO-002",
    { margin: 1, width: 296 }
  );

  const ok = await sendTicketEmail({
    to,
    buyerName: "Guest",
    eventTitle: "Bakk 2 Business",
    eventVenue: "96 Eaton Street",
    eventAddress: "96 Eaton Street, Providence, RI",
    startAt: new Date("2026-09-26T22:00:00-04:00"),
    endAt: new Date("2026-09-27T04:00:00-04:00"),
    confirmationCode: "TEST-EMAIL-001",
    totalCents: 2500,
    confirmationUrl: "https://www.legendaryentertainmentticketing.com",
    tickets: [
      {
        code: "TEST-DEMO-001",
        typeName: "Regular - Women",
        qrDataUrl: qr1,
      },
      {
        code: "TEST-DEMO-002",
        typeName: "Ticket + Adult Capri Sun - Men",
        qrDataUrl: qr2,
      },
    ],
  });

  console.log(ok ? "TEST_EMAIL_SENT" : "TEST_EMAIL_SKIPPED");
}

main().catch((err) => {
  console.error("TEST_EMAIL_FAILED", err);
  process.exit(1);
});
