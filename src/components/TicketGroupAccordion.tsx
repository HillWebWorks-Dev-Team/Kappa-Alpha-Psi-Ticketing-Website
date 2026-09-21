"use client";

import Link from "next/link";
import { useId, useState } from "react";
import {
  IconChevron,
  IconPerson,
  IconStar,
  IconTicket,
  IconUsers,
} from "@/components/Icons";

export type ConfirmTicket = {
  id: string;
  code: string;
  status: string;
  ticketTypeId: string;
  typeName: string;
};

type Group = {
  ticketTypeId: string;
  typeName: string;
  tickets: ConfirmTicket[];
  unitLabel: string;
};

function iconFor(name: string) {
  const n = name.toLowerCase();
  if (n.includes("capri") || n.includes("pouch") || n.includes("bag")) return IconTicket;
  if (n.includes("vip")) return IconStar;
  if (n.includes("table") || n.includes("sponsor")) return IconUsers;
  return IconPerson;
}

function unitLabel(name: string, count: number) {
  const n = name.toLowerCase();
  if (n.includes("table") || n.includes("sponsor")) {
    return count === 1 ? "Reservation" : "Reservations";
  }
  return count === 1 ? "Ticket" : "Tickets";
}

export function TicketGroupAccordion({ tickets }: { tickets: ConfirmTicket[] }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const baseId = useId();

  const groupsMap = new Map<string, Group>();
  for (const ticket of tickets) {
    const existing = groupsMap.get(ticket.ticketTypeId);
    if (existing) {
      existing.tickets.push(ticket);
    } else {
      groupsMap.set(ticket.ticketTypeId, {
        ticketTypeId: ticket.ticketTypeId,
        typeName: ticket.typeName,
        tickets: [ticket],
        unitLabel: "",
      });
    }
  }

  const groups = Array.from(groupsMap.values()).map((g) => ({
    ...g,
    unitLabel: unitLabel(g.typeName, g.tickets.length),
  }));

  return (
    <div className="tg-list">
      {groups.map((group) => {
        const isOpen = Boolean(open[group.ticketTypeId]);
        const panelId = `${baseId}-${group.ticketTypeId}`;
        const buttonId = `${panelId}-btn`;
        const Icon = iconFor(group.typeName);

        return (
          <div
            key={group.ticketTypeId}
            className={`tg-group ${isOpen ? "is-open" : ""}`}
          >
            <h3 className="tg-group__heading">
              <button
                id={buttonId}
                type="button"
                className="tg-group__trigger"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() =>
                  setOpen((prev) => ({
                    ...prev,
                    [group.ticketTypeId]: !prev[group.ticketTypeId],
                  }))
                }
              >
                <span className="tg-group__icon" aria-hidden>
                  <Icon />
                </span>
                <span className="tg-group__meta">
                  <span className="tg-group__name">{group.typeName}</span>
                  <span className="tg-group__count">
                    {group.tickets.length} {group.unitLabel}
                  </span>
                </span>
                <IconChevron className="tg-group__chevron" />
              </button>
            </h3>

            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              hidden={!isOpen}
              className="tg-group__panel"
            >
              <ul className="tg-rows">
                {group.tickets.map((ticket, index) => (
                  <li key={ticket.id} className="tg-row">
                    <div>
                      <p className="tg-row__label">
                        {group.unitLabel.replace(/s$/, "")} {index + 1}
                      </p>
                      <p className="tg-row__code">Ticket #{ticket.code}</p>
                      <p className="tg-row__status">
                        Status: {ticket.status.toUpperCase()}
                      </p>
                    </div>
                    <Link
                      className="btn btn--primary tg-row__btn"
                      href={`/ticket/${ticket.code}`}
                    >
                      View Ticket →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
