/**
 * Presentation content for Event Details.
 * Event date/venue/pricing still come from the database (Prisma).
 * Items marked NEEDS_CONFIRMATION should be verified with organizers before launch.
 */
export const eventPresentation = {
  dressCode: "Formal Attire", // NEEDS_CONFIRMATION
  dressCodeNote: "A night to remember", // NEEDS_CONFIRMATION
  aboutHeading: "A Night with Purpose",
  aboutParagraphs: [
    "Join the brothers of Kappa Alpha Psi for an elegant evening dedicated to community, scholarship, and service. This signature event brings together leaders, supporters, and friends for a memorable experience with meaningful impact.",
    "Guests will enjoy an evening of fine dining, networking, special remarks, and entertainment while supporting the mission and initiatives of Kappa Alpha Psi Fraternity, Incorporated.",
  ],
  heroLede:
    "An evening of fellowship, purpose, and impact. Join us for a signature event celebrating brotherhood, community, scholarship, and service.",
  gallery: {
    primary: {
      src: "/event-venue.png",
      alt: "Evening entrance of the event venue",
    },
    thumbs: [
      {
        src: "/event-gallery-1.png",
        alt: "Formal table setting with crimson florals and candlelight",
      },
      {
        src: "/event-gallery-2.png",
        alt: "Ballroom stage with Kappa Alpha Psi branding",
      },
      {
        src: "/event-gallery-3.png",
        alt: "Elegant ballroom dining floor",
      },
    ],
  },
  expectations: [
    {
      title: "Meaningful Connections",
      description: "Network with brothers, supporters, and community leaders.",
      icon: "users" as const,
    },
    {
      title: "Inspiring Remarks",
      description: "Hear from distinguished guests and keynote speakers.",
      icon: "star" as const,
    },
    {
      title: "An Elegant Experience",
      description: "Enjoy a premium dining and entertainment experience.",
      icon: "utensils" as const,
    },
    {
      title: "A Greater Impact",
      description: "Support scholarship, community, and service initiatives.",
      icon: "heart" as const,
    },
  ],
  /** Answers are draft until organizers confirm policies. */
  faqs: [
    {
      question: "What is the dress code?",
      answer:
        "Formal attire is requested for this evening. Final dress guidance will be confirmed by the event organizers closer to the date.", // NEEDS_CONFIRMATION
    },
    {
      question: "Is parking available at the venue?",
      answer:
        "Parking details are being finalized with the venue. Guests will receive updated arrival information with their ticket confirmation when available.", // NEEDS_CONFIRMATION
    },
    {
      question: "Can I purchase tickets at the door?",
      answer:
        "Advance online purchase is recommended to guarantee entry. Door sales, if offered, will be announced by organizers closer to the event.", // NEEDS_CONFIRMATION
    },
    {
      question: "Will there be assigned seating?",
      answer:
        "Seating arrangements depend on ticket type. VIP and table-sponsor purchases include reserved seating; general admission details will be shared before the event.", // NEEDS_CONFIRMATION
    },
    {
      question: "Are refunds available?",
      answer:
        "Refund and transfer policies will be stated at checkout and in your confirmation email once finalized by the organizing chapter.", // NEEDS_CONFIRMATION
    },
  ],
};

export function mapsUrl(address: string, city: string, state: string): string {
  const q = encodeURIComponent(`${address}, ${city}, ${state}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function mapsEmbedUrl(address: string, city: string, state: string): string {
  const q = encodeURIComponent(`${address}, ${city}, ${state}`);
  return `https://maps.google.com/maps?q=${q}&z=15&output=embed`;
}

export const CONTACT_SUBJECTS = [
  "General Inquiry",
  "Ticket Purchase Assistance",
  "Payment or Order Concern",
  "Sponsorship Inquiry",
  "Event Information",
  "Other",
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

/** Contact page presentation. Venue/date still come from the database. */
export const contactPresentation = {
  heroLede: (eventTitle: string) =>
    `Have questions about the ${eventTitle}? We'd love to hear from you. Our team is ready to assist with tickets, sponsorships, event details, and more.`,
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
  social: {
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM || "",
    facebook: process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK || "",
    x: process.env.NEXT_PUBLIC_SOCIAL_X || "",
    linkedin: process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN || "",
  },
  faqs: [
    {
      question: "How do I purchase tickets?",
      answer:
        "Visit the Tickets page to choose your ticket type and quantity, then continue to secure checkout. After payment, your tickets and QR codes appear on the confirmation page.",
    },
    {
      question: "Can I purchase a table for my organization?",
      answer:
        "Yes. The Table Sponsor option reserves a table for eight guests and includes recognition in the evening program when available. Select Table Sponsor on the Tickets page to purchase.",
    },
    {
      question: "What is the dress code?",
      answer: `${eventPresentation.dressCode} is requested for this evening. ${eventPresentation.dressCodeNote}.`,
    },
  ],
};

/** Tickets page presentation copy. Ticket types/prices still come from the database. */
export const ticketsPresentation = {
  heroLede:
    "Join us for an unforgettable evening of fellowship, purpose, and impact. Select your tickets below and be part of something greater.",
  optionsIntro:
    "Whether you're attending as an individual, with a guest, or as a group, there's a place for you at this special event.",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "", // NEEDS_CONFIRMATION if empty
  benefits: [
    {
      title: "Secure Payment",
      description: "Your payment is processed securely through Stripe when configured.",
      icon: "shield" as const,
    },
    {
      title: "Instant Confirmation",
      description: "View your tickets online after successful payment; email delivery when configured.",
      icon: "ticket" as const,
    },
    {
      title: "Easy Access",
      description: "Present your unique QR e-ticket at check-in.",
      icon: "mail" as const,
    },
    {
      title: "Support a Greater Cause",
      description: "Your attendance helps support scholarship, community, and service.",
      icon: "heart" as const,
    },
  ],
  beforePurchase: [
    {
      title: "Ticket Sales",
      description:
        "Tickets are available online while inventory remains. Purchase early to secure your preferred option.", // NEEDS_CONFIRMATION for hard deadline
      icon: "calendar" as const,
    },
    {
      title: "Seating",
      description:
        "Seating depends on ticket type. Table sponsors and VIP options include reserved seating; other arrangements will be shared before the event.", // NEEDS_CONFIRMATION
      icon: "users" as const,
    },
    {
      title: "Refund Policy",
      description:
        "Refund and transfer terms will be confirmed by organizers and shown at checkout.", // NEEDS_CONFIRMATION
      icon: "info" as const,
    },
  ],
  faqs: [
    {
      question: "What is included in my ticket?",
      answer:
        "Inclusions vary by ticket type and are listed on each ticket option. Exact inclusions will match the description shown at purchase.", // NEEDS_CONFIRMATION
    },
    {
      question: "Can I purchase tickets at the door?",
      answer:
        "Advance online purchase is recommended. Door sales, if offered, will be announced by organizers closer to the event.", // NEEDS_CONFIRMATION
    },
    {
      question: "Will there be assigned seating?",
      answer:
        "Reserved seating applies to VIP and table-sponsor purchases. Other seating details will be shared prior to the event.", // NEEDS_CONFIRMATION
    },
    {
      question: "Is there a dress code?",
      answer:
        "Formal attire is requested. Final dress guidance will be confirmed by the event organizers.", // NEEDS_CONFIRMATION
    },
    {
      question: "Are refunds available?",
      answer:
        "Refund policies will be stated at checkout and in your confirmation once finalized by the organizing chapter.", // NEEDS_CONFIRMATION
    },
    {
      question: "How will I receive my ticket?",
      answer:
        "After successful payment, tickets with QR codes appear on your confirmation page and are emailed when email delivery is configured.",
    },
  ],
};
