/**
 * Safely upsert Ice Skream into Postgres without wiping orders.
 * Usage: npx tsx scripts/ensure-halloween-event.ts
 * Requires DATABASE_URL (and DIRECT_URL if your Prisma schema needs it).
 */
import "dotenv/config";
import { ensureHalloweenEvent } from "../src/lib/ensure-halloween-event";
import { prisma } from "../src/lib/prisma";

async function main() {
  const result = await ensureHalloweenEvent();
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
