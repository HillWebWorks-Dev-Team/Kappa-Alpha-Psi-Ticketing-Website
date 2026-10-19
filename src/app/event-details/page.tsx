import { redirect } from "next/navigation";
import { getFeaturedEvent } from "@/lib/catalog";

export const dynamic = "force-dynamic";

/** Legacy single-event details URL - send visitors to the featured event. */
export default async function EventDetailsPage() {
  const featured = await getFeaturedEvent();
  if (!featured) redirect("/events");
  redirect(`/events/${featured.slug}`);
}
