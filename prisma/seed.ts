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
      slug: "bakk-2-business-2026",
      title: "Bakk 2 Business",
      subtitle: "Risky Business Attire",
      description:
        "Legendary Entertainment presents Bakk 2 Business - a Risky Business themed party. Dress professional. Act questionable. The semester starts when we say it does. 18+ for entry. 10:00 PM until whenever.",
      venue: "Venue TBA",
      address: "Location announced with ticket confirmation",
      city: "Rhode Island",
      state: "RI",
      startAt: new Date("2026-09-26T22:00:00-04:00"),
      endAt: new Date("2026-09-27T04:00:00-04:00"),
      imageUrl: "/flyer.png",
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
