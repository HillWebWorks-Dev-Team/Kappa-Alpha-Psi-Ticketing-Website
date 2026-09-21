import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";

export async function SiteHeader() {
  return <Header ticketsHref="/tickets" />;
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <div className="site-footer__brand-block">
          <Link href="/" className="footer-brand">
            <Image
              src="/logo.jpg"
              alt="Legendary Entertainment logo"
              width={48}
              height={48}
              className="footer-brand__logo"
            />
            <span>
              <span className="footer-brand__name">Legendary Entertainment</span>
              <span className="footer-brand__tag">Ticketing</span>
            </span>
          </Link>
        </div>

        <nav className="site-footer__nav" aria-label="Footer">
          <Link href="/">Home</Link>
          <Link href="/event-details">Event Details</Link>
          <Link href="/tickets">Tickets</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/admin">Admin</Link>
        </nav>

        <div className="site-footer__meta">
          <p className="site-footer__copy">
            © {year} Legendary Entertainment. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
