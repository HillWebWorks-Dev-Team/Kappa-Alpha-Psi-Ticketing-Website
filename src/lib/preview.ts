/**
 * UI preview mode: static event catalog + ephemeral in-memory orders.
 * Use on Vercel before Postgres / Stripe are wired so stakeholders can review the UI.
 */
export function isUiPreview(): boolean {
  const flag = process.env.UI_PREVIEW?.trim().toLowerCase();
  if (flag === "true" || flag === "1" || flag === "yes") return true;

  // SQLite file URLs are not durable on Vercel's serverless filesystem.
  if (process.env.VERCEL && process.env.DATABASE_URL?.startsWith("file:")) {
    return true;
  }

  return false;
}
