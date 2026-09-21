"use client";

import { FormEvent, useEffect, useState } from "react";
import { PasswordField } from "@/components/PasswordField";
import {
  clearAdminPassword,
  getAdminPassword,
  setAdminPassword,
} from "@/lib/admin-session";
import { formatCurrency } from "@/lib/format";

type PendingTicket = {
  code: string;
  typeName: string;
};

type OrderRow = {
  id: string;
  confirmationCode: string;
  buyerName: string;
  buyerEmail: string;
  status: string;
  totalCents: number;
  createdAt: string;
  ticketCount: number;
  admittedCount: number;
  pendingCount: number;
  pendingTickets: PendingTicket[];
  eventTitle: string;
};

function getOrderFlags(o: OrderRow) {
  const admitted = o.admittedCount ?? 0;
  const pending = o.pendingCount ?? o.ticketCount;
  const pendingTickets = o.pendingTickets ?? [];
  const allIn = o.ticketCount > 0 && admitted === o.ticketCount;
  const noneIn = admitted === 0;
  const canAdmit = o.status === "paid" && pendingTickets.length > 0;
  return { admitted, pending, pendingTickets, allIn, noneIn, canAdmit };
}

function CheckInStatus({
  admitted,
  ticketCount,
  pending,
  allIn,
  noneIn,
}: {
  admitted: number;
  ticketCount: number;
  pending: number;
  allIn: boolean;
  noneIn: boolean;
}) {
  return (
    <div className="admin-checkin-cell">
      <span
        className={`status-pill ${
          allIn
            ? "is-admitted"
            : noneIn
              ? "is-pending-admit"
              : "is-partial-admit"
        }`}
      >
        {admitted}/{ticketCount} admitted
      </span>
      {pending > 0 ? (
        <span className="admin-checkin-cell__note">{pending} not yet</span>
      ) : (
        <span className="admin-checkin-cell__note">All in</span>
      )}
    </div>
  );
}

function OrderActions({
  canAdmit,
  allIn,
  pendingTickets,
  admittingCode,
  onAdmit,
}: {
  canAdmit: boolean;
  allIn: boolean;
  pendingTickets: PendingTicket[];
  admittingCode: string | null;
  onAdmit: (code: string) => void;
}) {
  if (canAdmit) {
    return (
      <div className="admin-actions">
        {pendingTickets.map((t) => (
          <button
            key={t.code}
            type="button"
            className="btn btn--secondary admin-actions__btn"
            disabled={admittingCode !== null}
            onClick={() => onAdmit(t.code)}
          >
            {admittingCode === t.code ? "Admitting…" : `Admit · ${t.typeName}`}
          </button>
        ))}
      </div>
    );
  }

  return (
    <span className="admin-actions__done">{allIn ? "Done" : "—"}</span>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [admittingCode, setAdmittingCode] = useState<string | null>(null);

  async function loadOrders(adminPassword: string) {
    const res = await fetch("/api/admin/orders", {
      headers: { "x-admin-password": adminPassword },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Unauthorized");
    setOrders(data.orders);
  }

  useEffect(() => {
    const saved = getAdminPassword();
    if (!saved) {
      setRestoring(false);
      return;
    }
    setPassword(saved);
    void loadOrders(saved)
      .catch(() => {
        clearAdminPassword();
        setPassword("");
        setOrders(null);
      })
      .finally(() => setRestoring(false));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setActionError(null);
    try {
      await loadOrders(password);
      setAdminPassword(password);
    } catch (err) {
      setOrders(null);
      clearAdminPassword();
      setError(err instanceof Error ? err.message : "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  function signOut() {
    clearAdminPassword();
    setPassword("");
    setOrders(null);
    setActionError(null);
    setError(null);
  }

  async function admitTicket(code: string) {
    setAdmittingCode(code);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not admit ticket");
      await loadOrders(password);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Could not admit ticket"
      );
    } finally {
      setAdmittingCode(null);
    }
  }

  if (restoring) {
    return (
      <div className="page admin-login-page">
        <div className="admin-login">
          <div className="admin-login__card">
            <p className="section__eyebrow">Staff</p>
            <h1>Orders</h1>
            <p className="admin-login__lede">Restoring your session…</p>
          </div>
        </div>
      </div>
    );
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
                <PasswordField
                  value={password}
                  onChange={setPassword}
                  showPassword={showPassword}
                  onToggleShow={() => setShowPassword((v) => !v)}
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
            <p>Look up purchases and who has been admitted at the door.</p>
          </div>
          <div className="admin-head-actions">
            <a className="btn btn--secondary" href="/admin/check-in">
              Open door check-in
            </a>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        </div>

        {actionError ? (
          <p className="banner banner--error" style={{ marginBottom: "1rem" }}>
            {actionError}
          </p>
        ) : null}

        <div className="admin-panel">
          {orders.length === 0 ? (
            <p className="empty-state">No orders yet.</p>
          ) : (
            <>
              <div className="admin-order-cards" aria-label="Orders">
                {orders.map((o) => {
                  const flags = getOrderFlags(o);
                  return (
                    <article key={o.id} className="admin-order-card">
                      <div className="admin-order-card__top">
                        <div>
                          <p className="admin-order-card__buyer">
                            {o.buyerName}
                          </p>
                          <p className="admin-order-card__email">
                            {o.buyerEmail}
                          </p>
                        </div>
                        <span
                          className={`status-pill ${
                            o.status === "paid" ? "is-paid" : ""
                          }`}
                        >
                          {o.status}
                        </span>
                      </div>

                      <p className="admin-order-card__event">{o.eventTitle}</p>

                      <div className="admin-order-card__meta">
                        <a href={`/confirmation/${o.id}`}>
                          {o.confirmationCode}
                        </a>
                        <span>{new Date(o.createdAt).toLocaleString()}</span>
                      </div>

                      <div className="admin-order-card__stats">
                        <div>
                          <span className="admin-order-card__label">
                            Tickets
                          </span>
                          <span>{o.ticketCount}</span>
                        </div>
                        <div>
                          <span className="admin-order-card__label">Total</span>
                          <span>{formatCurrency(o.totalCents)}</span>
                        </div>
                        <div>
                          <span className="admin-order-card__label">
                            Check-in
                          </span>
                          <CheckInStatus
                            admitted={flags.admitted}
                            ticketCount={o.ticketCount}
                            pending={flags.pending}
                            allIn={flags.allIn}
                            noneIn={flags.noneIn}
                          />
                        </div>
                      </div>

                      <div className="admin-order-card__actions">
                        <OrderActions
                          canAdmit={flags.canAdmit}
                          allIn={flags.allIn}
                          pendingTickets={flags.pendingTickets}
                          admittingCode={admittingCode}
                          onAdmit={(code) => void admitTicket(code)}
                        />
                      </div>
                    </article>
                  );
                })}
              </div>

              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Event</th>
                      <th>Buyer</th>
                      <th>Code</th>
                      <th>Tickets</th>
                      <th>Check-in</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => {
                      const flags = getOrderFlags(o);
                      return (
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
                            <a href={`/confirmation/${o.id}`}>
                              {o.confirmationCode}
                            </a>
                          </td>
                          <td>{o.ticketCount}</td>
                          <td>
                            <CheckInStatus
                              admitted={flags.admitted}
                              ticketCount={o.ticketCount}
                              pending={flags.pending}
                              allIn={flags.allIn}
                              noneIn={flags.noneIn}
                            />
                          </td>
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
                          <td>
                            <OrderActions
                              canAdmit={flags.canAdmit}
                              allIn={flags.allIn}
                              pendingTickets={flags.pendingTickets}
                              admittingCode={admittingCode}
                              onAdmit={(code) => void admitTicket(code)}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
