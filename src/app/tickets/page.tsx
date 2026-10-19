import { redirect } from "next/navigation";
import { getEventBySlug, getFeaturedEvent } from "@/lib/catalog";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Convenience redirect to the featured (or requested) event tickets page. */
export default async function TicketsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const requested =
    typeof sp.event === "string" && sp.event.trim() ? sp.event.trim() : null;

  const event = requested
    ? await getEventBySlug(requested, { activeTicketsOnly: false })
    : await getFeaturedEvent();

  if (!event) {
    redirect("/events");
  }

  redirect(`/events/${event.slug}/tickets`);
}
