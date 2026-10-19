import { NextRequest, NextResponse } from "next/server";
import { isValidAdminPassword } from "@/lib/admin-auth";
import { ensureHalloweenEvent } from "@/lib/ensure-halloween-event";
import { isUiPreview } from "@/lib/preview";

/**
 * Upsert Ice Skream into the production catalog without wiping orders.
 * POST with header: x-admin-password
 */
export async function POST(req: NextRequest) {
  const password = req.headers.get("x-admin-password") || "";

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isUiPreview()) {
    return NextResponse.json({
      ok: true,
      mode: "preview",
      message:
        "UI_PREVIEW is on - catalog comes from demo-data (Halloween is already included). No database write.",
    });
  }

  try {
    const result = await ensureHalloweenEvent();
    return NextResponse.json({ ok: true, mode: "database", ...result });
  } catch (error) {
    console.error("ensure-events failed", error);
    return NextResponse.json(
      { error: "Failed to ensure Halloween event" },
      { status: 500 }
    );
  }
}
