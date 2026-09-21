"use client";

import { FormEvent, useState } from "react";
import { formatCurrency } from "@/lib/format";

type OrderRow = {
  id: string;
  confirmationCode: string;
  buyerName: string;
  buyerEmail: string;
  status: string;
  totalCents: number;
  createdAt: string;
  ticketCount: number;
  eventTitle: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-password": password },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unauthorized");
      setOrders(data.orders);
    } catch (err) {
      setOrders(null);
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-head">
          <p className="section__eyebrow">Staff</p>
          <h1>Orders</h1>
          <p>Look up purchases and ticket counts for check-in support.</p>
        </div>

        <div className="admin-panel">
          <form onSubmit={onSubmit} style={{ display: "grid", gap: "0.75rem", maxWidth: 360 }}>
            <label style={{ display: "grid", gap: "0.35rem", fontWeight: 600 }}>
              Admin password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <button className="btn btn--primary" type="submit" disabled={loading}>
              {loading ? "Loading…" : "View orders"}
            </button>
          </form>

          {error ? <p className="banner banner--error" style={{ marginTop: "1rem" }}>{error}</p> : null}

          {orders ? (
            <div style={{ marginTop: "1.5rem", overflowX: "auto" }}>
              {orders.length === 0 ? (
                <p className="empty-state">No orders yet.</p>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Event</th>
                      <th>Buyer</th>
                      <th>Code</th>
                      <th>Tickets</th>
                      <th>Total</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>{new Date(o.createdAt).toLocaleString()}</td>
                        <td>{o.eventTitle}</td>
                        <td>
                          {o.buyerName}
                          <br />
                          <span style={{ color: "var(--ink-muted)" }}>{o.buyerEmail}</span>
                        </td>
                        <td>
                          <a href={`/confirmation/${o.id}`}>{o.confirmationCode}</a>
                        </td>
                        <td>{o.ticketCount}</td>
                        <td>{formatCurrency(o.totalCents)}</td>
                        <td>
                          <span className={`status-pill ${o.status === "paid" ? "is-paid" : ""}`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
