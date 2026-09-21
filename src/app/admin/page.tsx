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

  if (orders === null) {
    return (
      <div className="page admin-login-page">
        <div className="admin-login">
          <div className="admin-login__card">
            <p className="section__eyebrow">Staff</p>
            <h1>Orders</h1>
            <p className="admin-login__lede">
              Enter the admin password to view purchases and ticket counts.
            </p>

            <form onSubmit={onSubmit} className="admin-login__form">
              <label>
                Admin password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  autoFocus
                />
              </label>
              <button
                className="btn btn--primary btn--block"
                type="submit"
                disabled={loading}
              >
                {loading ? "Signing in…" : "View orders"}
              </button>
            </form>

            {error ? (
              <p className="banner banner--error admin-login__error">{error}</p>
            ) : null}

            <a className="admin-login__link" href="/admin/check-in">
              Go to door check-in
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="page-head page-head--row">
          <div>
            <p className="section__eyebrow">Staff</p>
            <h1>Orders</h1>
            <p>Look up purchases and ticket counts for check-in support.</p>
          </div>
          <a className="btn btn--secondary" href="/admin/check-in">
            Open door check-in
          </a>
        </div>

        <div className="admin-panel">
          {orders.length === 0 ? (
            <p className="empty-state">No orders yet.</p>
          ) : (
            <div className="admin-table-wrap">
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
                        <span style={{ color: "var(--ink-muted)" }}>
                          {o.buyerEmail}
                        </span>
                      </td>
                      <td>
                        <a href={`/confirmation/${o.id}`}>{o.confirmationCode}</a>
                      </td>
                      <td>{o.ticketCount}</td>
                      <td>{formatCurrency(o.totalCents)}</td>
                      <td>
                        <span
                          className={`status-pill ${
                            o.status === "paid" ? "is-paid" : ""
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
