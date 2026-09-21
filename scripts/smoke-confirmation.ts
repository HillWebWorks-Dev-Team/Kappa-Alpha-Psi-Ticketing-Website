import { PrismaClient } from "@prisma/client";

async function main() {
  const p = new PrismaClient();
  const types = await p.ticketType.findMany({ orderBy: { sortOrder: "asc" } });
  if (types.length < 2) throw new Error("Need at least 2 ticket types");

  const res = await fetch("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventSlug: "bakk-2-business-2026",
      buyerName: "Confirm Tester",
      buyerEmail: "confirm-test@example.com",
      items: [
        { ticketTypeId: types[0].id, quantity: 2 },
        { ticketTypeId: types[1].id, quantity: 1 },
      ],
    }),
  });
  const data = await res.json();
  console.log("checkout", res.status, data.url);

  const page = await fetch(data.url);
  const html = await page.text();
  console.log("confirm", page.status);
  console.log("grouped", html.includes("Your Tickets") && html.includes("View Ticket"));
  console.log("noInlineQrGrid", !html.includes("tickets-grid"));
  console.log("downloadBtn", html.includes("Download All Tickets"));

  const orderId = String(data.url).split("/confirmation/")[1];
  const pdf = await fetch(
    `http://localhost:3000/api/orders/${orderId}/tickets.pdf?email=${encodeURIComponent("confirm-test@example.com")}`
  );
  const buf = Buffer.from(await pdf.arrayBuffer());
  console.log("pdf", pdf.status, pdf.headers.get("content-type"), buf.length, buf.slice(0, 4).toString());

  const denied = await fetch(
    `http://localhost:3000/api/orders/${orderId}/tickets.pdf?email=other@example.com`
  );
  console.log("denied", denied.status);

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
