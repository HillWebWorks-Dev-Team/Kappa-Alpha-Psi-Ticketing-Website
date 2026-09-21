import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { Footer, SiteHeader } from "@/components/SiteChrome";
import { isUiPreview } from "@/lib/preview";
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
    default: "Kappa Alpha Psi Ticketing",
    template: "%s · Kappa Alpha Psi Ticketing",
  },
  description:
    "Official event ticketing for Kappa Alpha Psi: view events, purchase tickets, and receive QR confirmations.",
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
    shortcut: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const preview = isUiPreview();

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
        {preview ? (
          <div
            role="status"
            style={{
              background: "#5C0A0A",
              color: "#FFF8E7",
              textAlign: "center",
              fontSize: "0.8125rem",
              fontWeight: 600,
              letterSpacing: "0.04em",
              padding: "0.55rem 1rem",
            }}
          >
            UI preview — demo data only. Database and Stripe are not connected yet.
          </div>
        ) : null}
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
