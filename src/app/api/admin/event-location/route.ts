import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const LOCATION = {
  venue: "96 Eaton Street",
  address: "96 Eaton Street",
  city: "Providence",
  state: "RI",
} as const;

export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password") || "";
  const expected = process.env.ADMIN_PASSWORD || "";

  if (!expected || password !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await prisma.event.updateMany({
    where: { slug: "bakk-2-business-2026" },
    data: LOCATION,
  });

  if (result.count === 0) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json({
    updated: result.count,
    location: LOCATION,
  });
}
