import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { SalesClosedBanner } from "@/components/SalesClosedNotice";
import { Footer, SiteHeader } from "@/components/SiteChrome";
import { ORG_NAME } from "@/lib/brand";
import "./globals.css";

const display = Cormorant_Garamond({
  variable: "--font-display-loaded",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const body = Inter({
  variable: "--font-body-loaded",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: ORG_NAME,
    template: `%s · ${ORG_NAME}`,
  },
  description:
    "Legendary Entertainment Ticketing. Ticket sales on this site are closed. Tickets will be available on a new website soon to be posted.",
  icons: {
    icon: [{ url: "/logo.jpg", type: "image/jpeg" }],
    apple: [{ url: "/logo.jpg", type: "image/jpeg" }],
    shortcut: "/logo.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body
        className="min-h-full flex flex-col antialiased"
        style={
          {
            ["--font-display" as string]:
              "var(--font-display-loaded), Georgia, 'Times New Roman', serif",
            ["--font-body" as string]:
              "var(--font-body-loaded), 'Segoe UI', sans-serif",
          } as React.CSSProperties
        }
      >
        <SiteHeader />
        <SalesClosedBanner />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
