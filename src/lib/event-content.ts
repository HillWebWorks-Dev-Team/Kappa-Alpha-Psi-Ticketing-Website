/**
 * Presentation content for Event Details.
 * Event date/venue/pricing still come from the database (Prisma).
 * Items marked NEEDS_CONFIRMATION should be verified with organizers before launch.
 */
export const eventPresentation = {
  dressCode: "Risky Business Attire",
  dressCodeNote: "Dress professional. Act questionable.",
  aboutHeading: "Consider This Your Orientation",
  aboutParagraphs: [
    "Legendary Entertainment presents Bakk 2 Business - a night built for Risky Business vibes. Show up sharp, keep it questionable, and let the night run until whenever.",
    "Expect a high-energy party atmosphere, iconic dress code energy, and the kind of night you’ll hear about if you miss it. 18+ for entry.",
  ],
  heroLede:
    "Risky Business attire. Saturday night energy. Legendary Entertainment's Bakk 2 Business party - 10:00 PM until whenever.",
  gallery: {
    primary: {
      src: "/event1.png",
      alt: "VIP entrance for Bakk 2 Business by Legendary Entertainment",
    },
    thumbs: [
      {
        src: "/event2.png",
        alt: "Bakk 2 Business table setting with Legendary Entertainment branding",
      },
      {
        src: "/event3.png",
        alt: "Ballroom atmosphere at a Legendary Entertainment event",
      },
      {
        src: "/event4.png",
        alt: "Guests on the Bakk 2 Business photo backdrop",
      },
    ],
  },
  expectations: [
    {
      title: "Risky Business Energy",
      description: "Dress professional. Act questionable. Match the theme.",
      icon: "star" as const,
    },
    {
      title: "Late Night Party",
      description: "Doors vibe starts at 10:00 PM and runs until whenever.",
      icon: "users" as const,
    },
    {
      title: "18+ Entry",
      description: "Bring a valid ID. Entry is 18 and older.",
      icon: "utensils" as const,
    },
    {
      title: "Legendary Nights",
      description: "Presented by Legendary Entertainment - be there or hear about it.",
      icon: "heart" as const,
    },
  ],
  /** Answers are draft until organizers confirm policies. */
  faqs: [
    {
      question: "What is the dress code?",
      answer:
        "Risky Business attire. Dress professional and lean into the theme.",
    },
    {
      question: "Where is the venue?",
      answer:
        "96 Eaton Street, Providence, Rhode Island.",
    },
    {
      question: "What is the age requirement?",
      answer: "18+ for entry. Bring a valid ID.",
    },
    {
      question: "Can I purchase tickets at the door?",
      answer:
        "Advance online purchase is recommended. Door sales, if offered, will be announced by organizers closer to the event.", // NEEDS_CONFIRMATION
    },
    {
      question: "Are refunds available?",
      answer:
        "Refund and transfer policies will be stated at checkout and in your confirmation once finalized by Legendary Entertainment.", // NEEDS_CONFIRMATION
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
  "Event Information",
  "Other",
] as const;

export type ContactSubject = (typeof CONTACT_SUBJECTS)[number];

/** Contact page presentation. Venue/date still come from the database. */
export const contactPresentation = {
  heroLede: (eventTitle: string) =>
    `Have questions about ${eventTitle}? Reach Legendary Entertainment for tickets, entry details, and event info.`,
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
  supportPhone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
  social: {
    instagram:
      process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ||
      "https://www.instagram.com/legendaryent2/",
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
      question: "What ticket options are available?",
      answer:
        "You can purchase a Regular ticket or a Ticket + Adult Capri Sun. Pricing differs for women and men; see the Tickets page for current options.",
    },
    {
      question: "What is the dress code?",
      answer: `${eventPresentation.dressCode}. ${eventPresentation.dressCodeNote}`,
    },
  ],
};

/** Tickets page presentation copy. Ticket types/prices still come from the database. */
export const ticketsPresentation = {
  heroLede:
    "Get your tickets for Bakk 2 Business - Risky Business attire, Saturday night energy, and Legendary Entertainment vibes.",
  optionsIntro:
    "Pick Regular admission or add an Adult Capri Sun. Women’s and men’s pricing are listed on each option.",
  doorCheckDisclaimer:
    "Tickets will be checked at the door. Please purchase the correct ticket type for each guest - Women’s and Men’s tickets are not interchangeable.",
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
      title: "Party Ready",
      description: "Show up in Risky Business attire and be ready for 10PM until whenever.",
      icon: "heart" as const,
    },
  ],
  beforePurchase: [
    {
      title: "Ticket Sales",
      description:
        "Tickets are available online while inventory remains. Purchase early to secure your spot.",
      icon: "calendar" as const,
    },
    {
      title: "Ticket Options",
      description:
        "Choose Regular admission or Ticket + Adult Capri Sun. Women’s and men’s pricing are listed on each option.",
      icon: "users" as const,
    },
    {
      title: "Age & Attire",
      description:
        "18+ for entry. Risky Business attire - dress professional, act questionable.",
      icon: "info" as const,
    },
  ],
  faqs: [
    {
      question: "What is included in my ticket?",
      answer:
        "Regular tickets include event admission. Ticket + Adult Capri Sun includes admission plus an Adult Capri Sun. Details match the description shown at purchase.",
    },
    {
      question: "Can I purchase tickets at the door?",
      answer:
        "Advance online purchase is recommended. Door sales, if offered, will be announced by organizers closer to the event.", // NEEDS_CONFIRMATION
    },
    {
      question: "How does check-in work?",
      answer:
        "After purchase you receive a unique QR code. Present it at the door; staff will scan it to verify your ticket and mark it as used.",
    },
    {
      question: "Is there a dress code?",
      answer: "Yes - Risky Business attire. Dress professional and lean into the theme.",
    },
    {
      question: "Are refunds available?",
      answer:
        "Refund policies will be stated at checkout and in your confirmation once finalized by Legendary Entertainment.", // NEEDS_CONFIRMATION
    },
    {
      question: "How will I receive my ticket?",
      answer:
        "After successful payment, tickets with QR codes appear on your confirmation page and are emailed when email delivery is configured.",
    },
  ],
};
