import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isValidAdminPassword } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

const bodySchema = z.object({
  slug: z.string().min(1).optional(),
  venue: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password") || "";

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let parsed: z.infer<typeof bodySchema> = {};
  try {
    const json = await req.json();
    const result = bodySchema.safeParse(json);
    if (!result.success) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }
    parsed = result.data;
  } catch {
    // Empty body is allowed; falls back to defaults below.
  }

  const slug = parsed.slug || "ice-skream-halloween-2026";
  const data = {
    venue: parsed.venue || "Location revealed with ticket",
    address: parsed.address || "Provided with ticket confirmation",
    city: parsed.city || "Providence",
    state: parsed.state || "RI",
  };

  const result = await prisma.event.updateMany({
    where: { slug },
    data,
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({
    updated: result.count,
    slug,
    location: data,
  });
}
