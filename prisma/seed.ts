import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.ticket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.event.deleteMany();

  const event = await prisma.event.create({
    data: {
      slug: "crimson-cream-gala-2026",
      title: "Crimson & Cream Gala",
      subtitle: "An evening of fellowship, excellence, and celebration",
      description:
        "Join Kappa Alpha Psi for an elegant evening celebrating achievement, brotherhood, and community. Enjoy dinner, live entertainment, and a night to remember with Nupes and friends.",
      venue: "Grand Ballroom at The Madison",
      address: "1200 Achievement Drive",
      city: "Atlanta",
      state: "GA",
      startAt: new Date("2026-10-18T19:00:00-04:00"),
      endAt: new Date("2026-10-18T23:30:00-04:00"),
      imageUrl: "/hero.png",
      isPublished: true,
      ticketTypes: {
        create: [
          {
            name: "Regular - Women",
            description: "Event admission for women.",
            priceCents: 1000,
            capacity: 200,
            sortOrder: 1,
          },
          {
            name: "Regular - Men",
            description: "Event admission for men.",
            priceCents: 1500,
            capacity: 200,
            sortOrder: 2,
          },
          {
            name: "Ticket + Adult Capri Sun - Women",
            description: "Event admission plus an Adult Capri Sun.",
            priceCents: 1500,
            capacity: 150,
            sortOrder: 3,
          },
          {
            name: "Ticket + Adult Capri Sun - Men",
            description: "Event admission plus an Adult Capri Sun.",
            priceCents: 2000,
            capacity: 150,
            sortOrder: 4,
          },
        ],
      },
    },
    include: { ticketTypes: true },
  });

  console.log(`Seeded event: ${event.title} (${event.slug})`);
  console.log(`Ticket types: ${event.ticketTypes.map((t) => t.name).join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
