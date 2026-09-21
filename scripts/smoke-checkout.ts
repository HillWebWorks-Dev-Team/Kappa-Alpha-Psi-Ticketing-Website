import { PrismaClient } from "@prisma/client";

async function main() {
  const p = new PrismaClient();
  const t = await p.ticketType.findFirst({ orderBy: { sortOrder: "asc" } });
  if (!t) throw new Error("No ticket types");

  const res = await fetch("http://localhost:3000/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      eventSlug: "bakk-2-business-2026",
      buyerName: "Test Buyer",
      buyerEmail: "test@example.com",
      items: [{ ticketTypeId: t.id, quantity: 2 }],
    }),
  });

  const data = await res.json();
  console.log("status", res.status);
  console.log(data);

  if (data.url) {
    const page = await fetch(data.url);
    const html = await page.text();
    console.log("confirmStatus", page.status);
    console.log("hasConfirmed", html.includes("Payment confirmed"));
    console.log("hasTickets", html.includes("Your tickets"));
  }

  await p.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
