import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.ticket.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.ticketType.deleteMany();
  await prisma.event.deleteMany();

  const bakk = await prisma.event.create({
    data: {
      slug: "bakk-2-business-2026",
      title: "Bakk 2 Business",
      subtitle: "Risky Business Attire",
      description:
        "Legendary Entertainment presents Bakk 2 Business - a Risky Business themed party. Dress professional. Act questionable. The semester starts when we say it does. 18+ for entry. 10:00 PM until whenever.",
      venue: "96 Eaton Street",
      address: "96 Eaton Street",
      city: "Providence",
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

  const halloween = await prisma.event.create({
    data: {
      slug: "ice-skream-halloween-2026",
      title: "Ice Skream: A Halloween Takeover",
      subtitle: "Legendary Entertainment x Monster House Entertainment",
      description:
        "The collab you've been waiting for. Ice Skream is a Halloween takeover presented by Legendary Entertainment x Monster House Entertainment - a movie you'll have to experience yourself. Costumes mandatory. 18+ for entry, 21+ for drinks. Liquor will be sold at the event. 10:00 PM til whenever (doors close at 11:30 PM). Exact location revealed with your ticket.",
      venue: "Location revealed with ticket",
      address: "Provided with ticket confirmation",
      city: "Providence",
      state: "RI",
      startAt: new Date("2026-10-31T22:00:00-04:00"),
      endAt: new Date("2026-11-01T04:00:00-04:00"),
      imageUrl: "/halloween-poster.jpg",
      isPublished: true,
      ticketTypes: {
        create: [
          {
            name: "Women",
            description: "Event admission for women. Liquor sold on-site (21+).",
            priceCents: 1000,
            capacity: 200,
            sortOrder: 1,
          },
          {
            name: "Men",
            description: "Event admission for men. Liquor sold on-site (21+).",
            priceCents: 1500,
            capacity: 200,
            sortOrder: 2,
          },
        ],
      },
    },
    include: { ticketTypes: true },
  });

  console.log(`Seeded event: ${bakk.title} (${bakk.slug})`);
  console.log(`Ticket types: ${bakk.ticketTypes.map((t) => t.name).join(", ")}`);
  console.log(`Seeded event: ${halloween.title} (${halloween.slug})`);
  console.log(
    `Ticket types: ${halloween.ticketTypes.map((t) => t.name).join(", ")}`
  );

  const kristmas = await prisma.event.create({
    data: {
      slug: "kristmas-konfessions-2026",
      title: "Kristmas Konfessions",
      subtitle: "White Lies Edition · Overly Saturdays x Legendary Ent",
      description:
        "Overly Saturdays x Legendary Ent present Kristmas Konfessions: White Lies Edition. Saturday, December 12th at Gold Lounge, 727 Cranston St, Providence, RI. Music by DJ ZK, DJ KRAZ, and DJ JG. White Lie attire recommended. Early bird $10 through December 1st, then general admission $15 women / $20 men. VIP info: 347-259-4225.",
      venue: "Gold Lounge",
      address: "727 Cranston St",
      city: "Providence",
      state: "RI",
      startAt: new Date("2026-12-12T22:00:00-05:00"),
      endAt: new Date("2026-12-13T04:00:00-05:00"),
      imageUrl: "/kristmas-konfessions.jpg",
      isPublished: true,
      ticketTypes: {
        create: [
          {
            name: "Early Bird",
            description:
              "Presale admission: $10 through December 1st. Valid for any guest.",
            priceCents: 1000,
            capacity: 300,
            sortOrder: 1,
          },
          {
            name: "Women",
            description:
              "General admission for women. Available after early bird ends December 1st.",
            priceCents: 1500,
            capacity: 200,
            sortOrder: 2,
          },
          {
            name: "Men",
            description:
              "General admission for men. Available after early bird ends December 1st.",
            priceCents: 2000,
            capacity: 200,
            sortOrder: 3,
          },
        ],
      },
    },
    include: { ticketTypes: true },
  });

  console.log(`Seeded event: ${kristmas.title} (${kristmas.slug})`);
  console.log(
    `Ticket types: ${kristmas.ticketTypes.map((t) => t.name).join(", ")}`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
