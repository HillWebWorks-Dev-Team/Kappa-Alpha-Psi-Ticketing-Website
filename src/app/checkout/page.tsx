import { redirect } from "next/navigation";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Checkout now lives on /tickets as step 3 of the purchase flow. */
export default async function CheckoutPage({ searchParams }: Props) {
  const sp = await searchParams;
  const eventSlug = typeof sp.event === "string" ? sp.event : "";
  const params = new URLSearchParams();
  if (eventSlug) params.set("event", eventSlug);
  if (sp.cancelled) params.set("cancelled", "1");
  const qs = params.toString();
  redirect(qs ? `/tickets?${qs}` : "/tickets");
}
