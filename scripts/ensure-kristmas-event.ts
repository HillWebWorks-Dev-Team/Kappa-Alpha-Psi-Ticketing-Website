/**
 * Safely upsert Kristmas Konfessions into Postgres without wiping orders.
 * Usage: npx tsx scripts/ensure-kristmas-event.ts
 * Requires DATABASE_URL (and DIRECT_URL if your Prisma schema needs it).
 */
import "dotenv/config";
import { ensureKristmasEvent } from "../src/lib/ensure-kristmas-event";
import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await ensureKristmasEvent();
  console.log(JSON.stringify(result, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
