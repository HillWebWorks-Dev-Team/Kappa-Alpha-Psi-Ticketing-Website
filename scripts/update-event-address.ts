/**
 * Safely update a published event venue/address without wiping orders.
 * Usage:
 *   npx tsx scripts/update-event-address.ts
 *   npx tsx scripts/update-event-address.ts ice-skream-halloween-2026
 * Requires DATABASE_URL in the environment.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const slug = process.argv[2] || "ice-skream-halloween-2026";

  const result = await prisma.event.updateMany({
    where: { slug },
    data: {
      venue: "Location revealed with ticket",
      address: "Provided with ticket confirmation",
      city: "Providence",
      state: "RI",
    },
  });

  if (result.count === 0) {
    console.error(`No event found with slug ${slug}`);
    process.exit(1);
  }

  console.log(`Updated ${result.count} event(s) for slug ${slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
