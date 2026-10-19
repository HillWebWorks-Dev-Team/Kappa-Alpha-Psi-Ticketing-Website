export type TicketThemeId = "default" | "halloween";

export type TicketTheme = {
  id: TicketThemeId;
  /** PDF / print hex colors */
  header: string;
  headerAccent: string;
  pageBg: string;
  cardBg: string;
  ink: string;
  muted: string;
  cream: string;
  accent: string;
  line: string;
  banner: string;
  footer: string;
  footerTagline: string;
  brandLabel: string;
  brandSub: string;
  email: {
    pageBg: string;
    cardBg: string;
    headerBg: string;
    headerText: string;
    accent: string;
    gold: string;
    ink: string;
    muted: string;
    line: string;
    footerBg: string;
    footerText: string;
    ticketCardBg: string;
  };
};

const DEFAULT_THEME: TicketTheme = {
  id: "default",
  header: "#70110C",
  headerAccent: "#D6B887",
  pageBg: "#FAF7F1",
  cardBg: "#FAF7F1",
  ink: "#242020",
  muted: "#625C59",
  cream: "#F2EBD7",
  accent: "#D6B887",
  line: "#E6DDD3",
  banner: "#70110C",
  footer: "#2B100F",
  footerTagline: "Be there or hear about it",
  brandLabel: "LEGENDARY ENTERTAINMENT",
  brandSub: "OFFICIAL EVENT TICKETS",
  email: {
    pageBg: "#faf7f1",
    cardBg: "#ffffff",
    headerBg: "#70110c",
    headerText: "#f2ebd7",
    accent: "#70110c",
    gold: "#d6b887",
    ink: "#242020",
    muted: "#625c59",
    line: "#e6ddd3",
    footerBg: "#2b100f",
    footerText: "#d6b887",
    ticketCardBg: "#faf7f1",
  },
};

const HALLOWEEN_THEME: TicketTheme = {
  id: "halloween",
  header: "#0A0404",
  headerAccent: "#C41E1E",
  pageBg: "#140808",
  cardBg: "#1C0C0C",
  ink: "#F2EBD7",
  muted: "#C4B8A8",
  cream: "#F2EBD7",
  accent: "#E8C47A",
  line: "#4A1A1A",
  banner: "#9B1C1C",
  footer: "#0A0404",
  footerTagline: "Costumes mandatory · Liquor sold 21+ · Doors close 11:30 PM",
  brandLabel: "LEGENDARY × MONSTER HOUSE",
  brandSub: "ICE SKREAM ADMISSION",
  email: {
    pageBg: "#0a0404",
    cardBg: "#140808",
    headerBg: "#0a0404",
    headerText: "#f2ebd7",
    accent: "#c41e1e",
    gold: "#e8c47a",
    ink: "#f2ebd7",
    muted: "#c4b8a8",
    line: "#4a1a1a",
    footerBg: "#000000",
    footerText: "#e8c47a",
    ticketCardBg: "#1c0c0c",
  },
};

export function resolveTicketTheme(slug?: string | null): TicketTheme {
  const value = (slug || "").toLowerCase();
  if (
    value.includes("halloween") ||
    value.includes("ice-skream") ||
    value.includes("iceskream")
  ) {
    return HALLOWEEN_THEME;
  }
  return DEFAULT_THEME;
}
