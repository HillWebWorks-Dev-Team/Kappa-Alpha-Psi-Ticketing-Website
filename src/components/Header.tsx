"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { TicketsCta } from "@/components/Icons";

type HeaderProps = {
  ticketsHref?: string;
  salesOpen?: boolean;
};

function isActive(pathname: string, match: string) {
  if (match === "/") return pathname === "/";
  if (match === "/events") {
    return pathname === "/events" || pathname.startsWith("/events/");
  }
  if (match === "/contact") {
    return pathname === "/contact" || pathname.startsWith("/contact/");
  }
  return pathname === match || pathname.startsWith(`${match}/`);
}

export function Header({
  ticketsHref = "/events",
  salesOpen = true,
}: HeaderProps) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const pathname = usePathname();

  const nav = useMemo(
    () => [
      { label: "Home", href: "/", match: "/" },
      { label: "Events", href: "/events", match: "/events" },
      { label: "Contact", href: "/contact", match: "/contact" },
    ],
    []
  );

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href="/" className="brand" onClick={() => setOpen(false)}>
          <Image
            src="/logo.jpg"
            alt="Legendary Entertainment logo"
            width={48}
            height={48}
            className="brand__logo"
            priority
          />
          <span className="brand__text">
            <span className="brand__name">Legendary Entertainment</span>
            <span className="brand__tag">Ticketing</span>
          </span>
        </Link>

        <nav className="site-nav" aria-label="Primary">
          {nav.map((item) => {
            const active = isActive(pathname, item.match);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="site-header__actions">
          {salesOpen ? (
            <TicketsCta href={ticketsHref} variant="cream" className="site-header__cta" />
          ) : null}
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={open ? "menu-toggle__bar is-open" : "menu-toggle__bar"} />
            <span className={open ? "menu-toggle__bar is-open" : "menu-toggle__bar"} />
            <span className={open ? "menu-toggle__bar is-open" : "menu-toggle__bar"} />
          </button>
        </div>
      </div>

      <div
        id={menuId}
        className={open ? "mobile-nav is-open" : "mobile-nav"}
        hidden={!open}
      >
        <nav aria-label="Mobile">
          {nav.map((item) => {
            const active = isActive(pathname, item.match);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
          {salesOpen ? (
            <TicketsCta
              href={ticketsHref}
              variant="cream"
              className="mobile-nav__cta"
            />
          ) : null}
        </nav>
      </div>
    </header>
  );
}
