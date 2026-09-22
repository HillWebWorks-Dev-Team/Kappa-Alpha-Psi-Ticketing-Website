import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  CONTACT_SUBJECTS,
} from "@/lib/event-content";
import {
  isEmailConfigured,
  sanitizeEmailHeader,
  sendContactNotification,
} from "@/lib/email";
import { getFeaturedEvent } from "@/lib/catalog";
import { isUiPreview } from "@/lib/preview";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

const bodySchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name.").max(120),
  email: z.string().trim().email("Please enter a valid email address.").max(200),
  subject: z
    .string()
    .refine(
      (value): value is (typeof CONTACT_SUBJECTS)[number] =>
        (CONTACT_SUBJECTS as readonly string[]).includes(value),
      { message: "Please select a topic." }
    ),
  message: z
    .string()
    .trim()
    .min(10, "Please enter a message of at least 10 characters.")
    .max(4000, "Message must be 4,000 characters or fewer."),
  /** Honeypot - bots fill this; humans leave it empty. */
  company: z.string().optional().default(""),
});

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return req.headers.get("x-real-ip") || "unknown";
}

function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!origin) {
    // Same-origin navigations / some clients may omit Origin; allow with Referer check.
    const referer = req.headers.get("referer");
    if (!referer) return true;
    try {
      const refHost = new URL(referer).host;
      const appHost = appUrl ? new URL(appUrl).host : req.nextUrl.host;
      return refHost === appHost || refHost === req.nextUrl.host;
    } catch {
      return false;
    }
  }

  try {
    const originHost = new URL(origin).host;
    const appHost = appUrl ? new URL(appUrl).host : req.nextUrl.host;
    return originHost === appHost || originHost === req.nextUrl.host;
  } catch {
    return false;
  }
}

function organizerEmail(): string | null {
  const candidates = [process.env.CONTACT_TO_EMAIL];
  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed && !trimmed.includes("replace_me") && trimmed.includes("@")) {
      return trimmed;
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    if (!isSameOrigin(req)) {
      return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
    }

    const ip = clientIp(req);
    const limited = rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 });
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many requests. Please try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(limited.retryAfterSec) },
        }
      );
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === "string" && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      return NextResponse.json(
        { error: "Please correct the highlighted fields.", fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, subject, message, company } = parsed.data;

    // Honeypot tripped - pretend success without storing.
    if (company.trim()) {
      return NextResponse.json({
        ok: true,
        message: "Thank you for contacting us. Your message has been received.",
      });
    }

    const safeName = sanitizeEmailHeader(name);
    const safeEmail = sanitizeEmailHeader(email).toLowerCase();
    const safeSubject = sanitizeEmailHeader(subject);

    const preview = isUiPreview();
    let inquiryId: string | null = null;

    if (!preview) {
      const inquiry = await prisma.contactInquiry.create({
        data: {
          name: safeName,
          email: safeEmail,
          subject: safeSubject,
          message,
          status: "new",
          emailStatus: "pending",
        },
      });
      inquiryId = inquiry.id;
    }

    const event = await getFeaturedEvent();

    const to = organizerEmail();
    let emailStatus: "sent" | "skipped" | "failed" = "skipped";
    let emailDelivered = false;

    if (!isEmailConfigured() || !to) {
      emailStatus = "skipped";
      if (!isEmailConfigured()) {
        console.warn(
          preview
            ? "[contact] UI preview - inquiry accepted without email or database"
            : "[contact] Email not configured - inquiry stored without notification"
        );
      } else if (!to) {
        console.warn("[contact] No organizer email configured - inquiry stored without notification");
      }
    } else {
      try {
        emailDelivered = await sendContactNotification({
          to,
          replyTo: safeEmail,
          name: safeName,
          email: safeEmail,
          subject: safeSubject,
          message,
          eventTitle: event?.title,
        });
        emailStatus = emailDelivered ? "sent" : "failed";
      } catch (err) {
        console.error("[contact] Notification email failed", err);
        emailStatus = "failed";
      }
    }

    if (inquiryId) {
      await prisma.contactInquiry.update({
        where: { id: inquiryId },
        data: { emailStatus },
      });
    }

    if (emailStatus === "failed") {
      return NextResponse.json({
        ok: true,
        emailDelivered: false,
        message:
          "Thank you for contacting us. Your message has been received. Notification delivery was delayed, but your inquiry is saved.",
      });
    }

    return NextResponse.json({
      ok: true,
      emailDelivered,
      preview,
      message: "Thank you for contacting us. Your message has been received.",
    });
  } catch (err) {
    console.error("[contact] Submission failed", err);
    return NextResponse.json(
      { error: "We couldn't submit your message. Please try again." },
      { status: 500 }
    );
  }
}
