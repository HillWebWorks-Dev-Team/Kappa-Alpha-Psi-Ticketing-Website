/**
 * Clear test data from Supabase (Postgres via Prisma).
 *
 * Default: delete orders, tickets, order items, contact inquiries;
 * reset ticketType.soldCount to 0. Keeps events + ticket types.
 *
 * Full wipe (also deletes events/ticket types; re-seed after):
 *   npx tsx scripts/clear-db.ts --all
 *
 * Usage:
 *   npx tsx scripts/clear-db.ts
 *   npx tsx scripts/clear-db.ts --all
 *   npx tsx scripts/clear-db.ts --yes   # skip confirmation prompt
 */
import "dotenv/config";
import { createInterface } from "readline";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const wipeAll = process.argv.includes("--all");
const skipConfirm = process.argv.includes("--yes");

async function confirm(message: string): Promise<boolean> {
  if (skipConfirm) return true;
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await new Promise<string>((resolve) => {
    rl.question(`${message} (y/N) `, resolve);
  });
  rl.close();
  return ["y", "yes"].includes(answer.trim().toLowerCase());
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Load .env before running.");
  }

  const label = wipeAll
    ? "ALL tables (events, ticket types, orders, tickets, inquiries)"
    : "test transactions (orders, tickets, order items, contact inquiries) and reset sold counts";

  console.log(`About to clear: ${label}`);
  console.log(
    `Database host hint: ${process.env.DATABASE_URL.replace(/:[^:@/]+@/, ":****@").slice(0, 80)}…`
  );

  const ok = await confirm("Continue?");
  if (!ok) {
    console.log("Aborted.");
    return;
  }

  const tickets = await prisma.ticket.deleteMany();
  const orderItems = await prisma.orderItem.deleteMany();
  const orders = await prisma.order.deleteMany();
  const inquiries = await prisma.contactInquiry.deleteMany();

  let ticketTypes = { count: 0 };
  let events = { count: 0 };

  if (wipeAll) {
    ticketTypes = await prisma.ticketType.deleteMany();
    events = await prisma.event.deleteMany();
  } else {
    const reset = await prisma.ticketType.updateMany({
      data: { soldCount: 0 },
    });
    ticketTypes = { count: reset.count };
  }

  console.log("Cleared:");
  console.log(`  tickets:          ${tickets.count}`);
  console.log(`  order items:      ${orderItems.count}`);
  console.log(`  orders:           ${orders.count}`);
  console.log(`  contact inquiries:${inquiries.count}`);
  if (wipeAll) {
    console.log(`  ticket types:     ${ticketTypes.count}`);
    console.log(`  events:           ${events.count}`);
    console.log("\nNext: npm run db:seed");
  } else {
    console.log(`  soldCount reset:  ${ticketTypes.count} ticket type(s)`);
  }
}

main()
  .catch((err) => {
    console.error("Clear failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
