import type { ReactNode } from "react";
import Link from "next/link";

type IconProps = {
  className?: string;
  title?: string;
};

export function IconCalendar({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <rect x="3" y="5" width="18" height="16" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 9.5h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconMapPin({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path
        d="M12 21s6.5-5.2 6.5-10.2A6.5 6.5 0 0 0 5.5 10.8C5.5 15.8 12 21 12 21Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="10.5" r="2.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export function IconUsers({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="17" cy="8.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14.8 19c.4-2.4 2.2-4.2 4.7-4.2.7 0 1.4.1 2 .4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconGraduation({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path d="M2.5 9.5 12 4.5l9.5 5L12 14.5 2.5 9.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M6.5 12v4.2c0 .8 2.4 2.8 5.5 2.8s5.5-2 5.5-2.8V12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M21.5 9.5V15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconHeart({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path
        d="M12 20s-7-4.3-7-9.2A4.2 4.2 0 0 1 12 7.2a4.2 4.2 0 0 1 7 3.6C19 15.7 12 20 12 20Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconLandmark({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path d="M4 20h16M6.5 20V10M12 20V10M17.5 20V10M3.5 10h17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M12 4 3.5 9h17L12 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export function IconArrowRight({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconTicket({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path
        d="M4 8.5A1.5 1.5 0 0 0 5.5 10 1.5 1.5 0 0 1 4 11.5v3A1.5 1.5 0 0 0 5.5 16h13A1.5 1.5 0 0 0 20 14.5v-3A1.5 1.5 0 0 1 18.5 10 1.5 1.5 0 0 0 20 8.5V7a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v1.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M12 7v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2.2 2.4" />
    </svg>
  );
}

export function IconStar({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path
        d="M12 3.8 14.1 9l5.5.5-4.2 3.6 1.3 5.3L12 15.8 7.3 18.4l1.3-5.3L4.4 9.5 9.9 9 12 3.8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconUtensils({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path d="M7 4v7M5 4v4.5a2 2 0 0 0 4 0V4M7 11v9M15 4v7a2 2 0 0 0 2 2v7M17 4v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconPlus({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconMinus({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path d="M5 12h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconShield({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path
        d="M12 3.5 5 6.2v5.3c0 4.2 2.8 7.8 7 9 4.2-1.2 7-4.8 7-9V6.2L12 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M9.2 12.1 11 13.9l3.8-3.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconMail({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <rect x="3.5" y="6" width="17" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4.5 7.5 7.5 6 7.5-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconPhone({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path
        d="M8.2 4.8h2.1l1 4.2-1.6 1a10.5 10.5 0 0 0 4.3 4.3l1-1.6 4.2 1v2.1c0 .7-.5 1.3-1.2 1.4A14.7 14.7 0 0 1 5.4 6c.1-.7.7-1.2 1.4-1.2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function IconClock({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 7.8V12l3 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconInfo({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="M12 10.5V16M12 7.8v.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconPerson({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 19a6.5 6.5 0 0 1 13 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function IconChevron({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconDownload({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <path d="M12 4v10M8 10l4 4 4-4M5 18h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconCheck({ className, title }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden={!title} role={title ? "img" : undefined}>
      {title ? <title>{title}</title> : null}
      <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.6" />
      <path d="m8.5 12.2 2.4 2.4 4.6-4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={className} aria-hidden>
      ΚΑΨ
    </span>
  );
}

export function TicketsCta({
  href,
  variant = "primary",
  children = "Get Tickets",
  className = "",
}: {
  href: string;
  variant?: "primary" | "cream" | "outline";
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Link href={href} className={`btn btn--${variant} ${className}`.trim()}>
      <span>{children}</span>
      <IconArrowRight className="btn__icon" />
    </Link>
  );
}
