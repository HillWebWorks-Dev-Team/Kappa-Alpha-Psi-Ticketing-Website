/**
 * Safely update the published event venue/address without wiping orders.
 * Usage: npx tsx scripts/update-event-address.ts
 * Requires DATABASE_URL in the environment.
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const result = await prisma.event.updateMany({
    where: { slug: "bakk-2-business-2026" },
    data: {
      venue: "96 Eaton Street",
      address: "96 Eaton Street",
      city: "Providence",
      state: "RI",
    },
  });

  if (result.count === 0) {
    console.error("No event found with slug bakk-2-business-2026");
    process.exit(1);
  }

  console.log(`Updated ${result.count} event(s) to 96 Eaton Street, Providence, RI`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
