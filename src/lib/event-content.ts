/**
 * Per-event presentation content.
 * Date/venue/pricing still come from the catalog (Prisma / demo-data).
 * Items marked NEEDS_CONFIRMATION should be verified with organizers before launch.
 */

export type EventPresentation = {
  dressCode: string;
  dressCodeNote: string;
  aboutHeading: string;
  aboutParagraphs: string[];
  heroLede: string;
  liquorSold?: boolean;
  notices?: string[];
  /** When true, skip Google Maps directions (location revealed with ticket). */
  hideDirections?: boolean;
  gallery: {
    primary: { src: string; alt: string };
    thumbs: { src: string; alt: string }[];
  };
  expectations: {
    title: string;
    description: string;
    icon: "star" | "users" | "utensils" | "heart";
  }[];
  faqs: { question: string; answer: string }[];
};

export type TicketsPresentation = {
  heroLede: string;
  optionsIntro: string;
  doorCheckDisclaimer: string;
  supportEmail: string;
  benefits: {
    title: string;
    description: string;
    icon: "shield" | "ticket" | "mail" | "heart";
  }[];
  faqs: { question: string; answer: string }[];
};

const BAKK_PRESENTATION: EventPresentation = {
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
      icon: "star",
    },
    {
      title: "Late Night Party",
      description: "Doors vibe starts at 10:00 PM and runs until whenever.",
      icon: "users",
    },
    {
      title: "18+ Entry",
      description: "Bring a valid ID. Entry is 18 and older.",
      icon: "utensils",
    },
    {
      title: "Legendary Nights",
      description:
        "Presented by Legendary Entertainment - be there or hear about it.",
      icon: "heart",
    },
  ],
  faqs: [
    {
      question: "What is the dress code?",
      answer:
        "Risky Business attire. Dress professional and lean into the theme.",
    },
    {
      question: "Where is the venue?",
      answer: "96 Eaton Street, Providence, Rhode Island.",
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

const HALLOWEEN_PRESENTATION: EventPresentation = {
  dressCode: "Costumes Mandatory",
  dressCodeNote: "Come dressed for a Halloween takeover.",
  aboutHeading: "A Movie You'll Have To Experience Yourself",
  aboutParagraphs: [
    "Legendary Entertainment x Monster House Entertainment present Ice Skream: A Halloween Takeover - the collab you've been waiting for.",
    "Costumes are mandatory. 18+ for entry, 21+ for drinks. Liquor will be sold at the event. 10:00 PM til whenever, and doors close at 11:30 PM. Exact location is revealed with your ticket.",
  ],
  heroLede:
    "On Halloween night · 10:00 PM til whenever · Costumes mandatory · Liquor sold on-site.",
  liquorSold: true,
  notices: [
    "Liquor will be sold at this event. You must be 21+ with a valid ID to purchase drinks.",
    "Doors close at 11:30 PM. Arrive early.",
  ],
  hideDirections: true,
  gallery: {
    primary: {
      src: "/halloween-poster.jpg",
      alt: "Ice Skream Halloween Takeover poster by Legendary Entertainment",
    },
    thumbs: [
      {
        src: "/halloween-flyer.jpg",
        alt: "Ice Skream Halloween party flyer",
      },
    ],
  },
  expectations: [
    {
      title: "Costumes Mandatory",
      description: "Dress for Halloween. Costumes are required for entry.",
      icon: "star",
    },
    {
      title: "Late Night Takeover",
      description: "10:00 PM til whenever. Doors close at 11:30 PM.",
      icon: "users",
    },
    {
      title: "18+ Entry · Liquor Sold",
      description: "18+ to enter. 21+ to purchase drinks. Valid ID required.",
      icon: "utensils",
    },
    {
      title: "The Collab",
      description:
        "Presented by Legendary Entertainment x Monster House Entertainment.",
      icon: "heart",
    },
  ],
  faqs: [
    {
      question: "What is the dress code?",
      answer: "Costumes are mandatory for Ice Skream.",
    },
    {
      question: "Where is the venue?",
      answer:
        "The exact address is revealed with your ticket purchase and confirmation.",
    },
    {
      question: "Will liquor be sold?",
      answer:
        "Yes. Liquor will be sold at the event. You must be 21+ with a valid ID to purchase drinks. Entry is 18+.",
    },
    {
      question: "What are the ticket prices?",
      answer: "Women $10. Men $15.",
    },
    {
      question: "When do doors close?",
      answer: "Doors close at 11:30 PM.",
    },
    {
      question: "Are refunds available?",
      answer:
        "Refund and transfer policies will be stated at checkout and in your confirmation once finalized by Legendary Entertainment.", // NEEDS_CONFIRMATION
    },
  ],
};

const EVENT_PRESENTATIONS: Record<string, EventPresentation> = {
  "bakk-2-business-2026": BAKK_PRESENTATION,
  "ice-skream-halloween-2026": HALLOWEEN_PRESENTATION,
};

const DEFAULT_PRESENTATION: EventPresentation = {
  dressCode: "See event details",
  dressCodeNote: "Follow the dress code listed for this party.",
  aboutHeading: "About This Event",
  aboutParagraphs: [
    "Presented by Legendary Entertainment. Be there or hear about it.",
  ],
  heroLede: "Legendary Entertainment presents another night to remember.",
  gallery: {
    primary: {
      src: "/legendary-hero-v2.png",
      alt: "Legendary Entertainment event",
    },
    thumbs: [],
  },
  expectations: [
    {
      title: "Legendary Nights",
      description: "Presented by Legendary Entertainment.",
      icon: "heart",
    },
  ],
  faqs: [
    {
      question: "How do I get tickets?",
      answer: "Select your ticket type on this page and continue to checkout.",
    },
  ],
};

/** @deprecated Prefer getEventPresentation(slug) */
export const eventPresentation = BAKK_PRESENTATION;

export function getEventPresentation(slug: string): EventPresentation {
  return EVENT_PRESENTATIONS[slug] ?? DEFAULT_PRESENTATION;
}

const SHARED_TICKET_BENEFITS: TicketsPresentation["benefits"] = [
  {
    title: "Secure Payment",
    description:
      "Your payment is processed securely through Stripe when configured.",
    icon: "shield",
  },
  {
    title: "Instant Confirmation",
    description:
      "View your tickets online after successful payment; email delivery when configured.",
    icon: "ticket",
  },
  {
    title: "Easy Access",
    description: "Present your unique QR e-ticket at check-in.",
    icon: "mail",
  },
];

const BAKK_TICKETS: TicketsPresentation = {
  heroLede:
    "Get your tickets for Bakk 2 Business - Risky Business attire, Saturday night energy, and Legendary Entertainment vibes.",
  optionsIntro:
    "Pick Regular admission or add an Adult Capri Sun. Women’s and men’s pricing are listed on each option.",
  doorCheckDisclaimer:
    "Tickets will be checked at the door. Please purchase the correct ticket type for each guest - Women’s and Men’s tickets are not interchangeable.",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
  benefits: [
    ...SHARED_TICKET_BENEFITS,
    {
      title: "Party Ready",
      description:
        "Show up in Risky Business attire and be ready for 10PM until whenever.",
      icon: "heart",
    },
  ],
  faqs: BAKK_PRESENTATION.faqs,
};

const HALLOWEEN_TICKETS: TicketsPresentation = {
  heroLede:
    "Get your tickets for Ice Skream: A Halloween Takeover. Costumes mandatory. Liquor sold on-site.",
  optionsIntro: "Two ticket types: Women $10 and Men $15.",
  doorCheckDisclaimer:
    "Tickets will be checked at the door. Purchase the correct ticket type for each guest - Women’s and Men’s tickets are not interchangeable. Liquor is sold on-site (21+).",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
  benefits: [
    ...SHARED_TICKET_BENEFITS,
    {
      title: "Halloween Ready",
      description: "Costumes mandatory. Show up ready for a takeover.",
      icon: "heart",
    },
  ],
  faqs: HALLOWEEN_PRESENTATION.faqs,
};

const TICKETS_PRESENTATIONS: Record<string, TicketsPresentation> = {
  "bakk-2-business-2026": BAKK_TICKETS,
  "ice-skream-halloween-2026": HALLOWEEN_TICKETS,
};

const DEFAULT_TICKETS: TicketsPresentation = {
  heroLede: "Select your tickets and continue to secure checkout.",
  optionsIntro: "Choose a ticket type and quantity to continue.",
  doorCheckDisclaimer:
    "Tickets will be checked at the door. Please purchase the correct ticket type for each guest.",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
  benefits: SHARED_TICKET_BENEFITS,
  faqs: [],
};

/** @deprecated Prefer getTicketsPresentation(slug) */
export const ticketsPresentation = BAKK_TICKETS;

export function getTicketsPresentation(slug: string): TicketsPresentation {
  return TICKETS_PRESENTATIONS[slug] ?? DEFAULT_TICKETS;
}

export function mapsUrl(address: string, city: string, state: string): string {
  const q = encodeURIComponent(`${address}, ${city}, ${state}`);
  return `https://www.google.com/maps/search/?api=1&query=${q}`;
}

export function mapsEmbedUrl(
  address: string,
  city: string,
  state: string
): string {
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
        "Open an upcoming event, choose your ticket type and quantity, then continue to secure checkout. After payment, your tickets and QR codes appear on the confirmation page.",
    },
    {
      question: "What ticket options are available?",
      answer:
        "Options vary by event. Open the event page for current ticket types and pricing.",
    },
    {
      question: "What is the dress code?",
      answer:
        "Dress code depends on the event. Check the event details page for that party’s attire requirements.",
    },
  ],
};
