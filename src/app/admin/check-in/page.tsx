"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { PasswordField } from "@/components/PasswordField";
import {
  clearAdminPassword,
  getAdminPassword,
  setAdminPassword,
} from "@/lib/admin-session";

type TicketInfo = {
  code: string;
  status: string;
  holderName: string;
  holderEmail: string;
  typeName: string;
  confirmationCode: string;
  eventTitle: string;
  alreadyUsed: boolean;
};

type LookupState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "found"; ticket: TicketInfo; justCheckedIn?: boolean };

function extractCode(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/\/ticket\/([A-Za-z0-9_-]+)/i);
  if (match?.[1]) return match[1].toUpperCase();
  return trimmed.toUpperCase();
}

export default function CheckInPage() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [restoring, setRestoring] = useState(true);
  const [codeInput, setCodeInput] = useState("");
  const [state, setState] = useState<LookupState>({ kind: "idle" });
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<{
    detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
  } | null>(null);
  const lastScanRef = useRef<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const stopScanner = useCallback(() => {
    setScanning(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopScanner(), [stopScanner]);

  async function verifyPassword(adminPassword: string) {
    const res = await fetch("/api/admin/orders", {
      headers: { "x-admin-password": adminPassword },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Unauthorized");
    }
  }

  useEffect(() => {
    const saved = getAdminPassword();
    if (!saved) {
      setRestoring(false);
      return;
    }
    setPassword(saved);
    void verifyPassword(saved)
      .then(() => {
        setUnlocked(true);
        setTimeout(() => inputRef.current?.focus(), 50);
      })
      .catch(() => {
        clearAdminPassword();
        setPassword("");
        setUnlocked(false);
      })
      .finally(() => setRestoring(false));
  }, []);

  async function unlock(e: FormEvent) {
    e.preventDefault();
    setState({ kind: "loading" });
    try {
      await verifyPassword(password);
      setAdminPassword(password);
      setUnlocked(true);
      setState({ kind: "idle" });
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err) {
      clearAdminPassword();
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Unauthorized",
      });
    }
  }

  function signOut() {
    clearAdminPassword();
    setPassword("");
    setUnlocked(false);
    setState({ kind: "idle" });
    setCodeInput("");
    stopScanner();
  }

  const lookup = useCallback(
    async (raw: string) => {
      const code = extractCode(raw);
      if (!code) {
        setState({ kind: "error", message: "Enter a ticket code" });
        return;
      }
      setState({ kind: "loading" });
      try {
        const res = await fetch(
          `/api/admin/check-in?code=${encodeURIComponent(code)}`,
          { headers: { "x-admin-password": password } }
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Lookup failed");
        setCodeInput(data.ticket.code);
        setState({ kind: "found", ticket: data.ticket });
      } catch (err) {
        setState({
          kind: "error",
          message: err instanceof Error ? err.message : "Lookup failed",
        });
      }
    },
    [password]
  );

  async function checkIn() {
    if (state.kind !== "found" || checkingIn) return;
    setCheckingIn(true);
    try {
      const res = await fetch("/api/admin/check-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ code: state.ticket.code }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 409 && data.ticket) {
          setState({ kind: "found", ticket: data.ticket });
          return;
        }
        throw new Error(data.error || "Check-in failed");
      }
      setState({ kind: "found", ticket: data.ticket, justCheckedIn: true });
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Check-in failed",
      });
    } finally {
      setCheckingIn(false);
    }
  }

  async function startScanner() {
    setScanError(null);
    if (typeof window === "undefined") return;

    const Detector = (
      window as unknown as {
        BarcodeDetector?: new (opts: { formats: string[] }) => {
          detect: (
            source: ImageBitmapSource
          ) => Promise<Array<{ rawValue: string }>>;
        };
      }
    ).BarcodeDetector;

    if (!Detector) {
      setScanError(
        "Camera scanning isn’t supported in this browser. Use Chrome on Android, or type/paste the code below."
      );
      return;
    }

    try {
      detectorRef.current = new Detector({ formats: ["qr_code"] });
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setScanning(true);
    } catch {
      setScanError(
        "Could not access the camera. Allow camera permission, or enter the code manually."
      );
    }
  }

  useEffect(() => {
    if (!scanning) return;
    let cancelled = false;
    let raf = 0;

    async function tick() {
      if (cancelled || !videoRef.current || !detectorRef.current) return;
      try {
        const codes = await detectorRef.current.detect(videoRef.current);
        const value = codes[0]?.rawValue;
        if (value && value !== lastScanRef.current) {
          lastScanRef.current = value;
          stopScanner();
          await lookup(value);
          return;
        }
      } catch {
        // keep scanning
      }
      raf = requestAnimationFrame(tick);
    }

    raf = requestAnimationFrame(tick);
    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [scanning, lookup, stopScanner]);

  function resetForNext() {
    setState({ kind: "idle" });
    setCodeInput("");
    lastScanRef.current = "";
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  if (restoring) {
    return (
      <div className="page admin-login-page">
        <div className="admin-login">
          <div className="admin-login__card">
            <p className="section__eyebrow">Staff</p>
            <h1>Ticket check-in</h1>
            <p className="admin-login__lede">Restoring your session…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="page admin-login-page">
        <div className="admin-login">
          <div className="admin-login__card">
            <p className="section__eyebrow">Staff</p>
            <h1>Ticket check-in</h1>
            <p className="admin-login__lede">
              Enter the admin password to scan QR codes and admit guests.
            </p>

            <form onSubmit={unlock} className="admin-login__form">
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
                disabled={state.kind === "loading"}
              >
                {state.kind === "loading" ? "Unlocking…" : "Unlock check-in"}
              </button>
            </form>

            {state.kind === "error" ? (
              <p className="banner banner--error admin-login__error">
                {state.message}
              </p>
            ) : null}

            <a className="admin-login__link" href="/admin">
              Go to orders
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page checkin-page">
      <div className="container checkin">
        <header className="checkin-topbar">
          <div className="checkin-topbar__brand">
            <p className="section__eyebrow">Door staff</p>
            <h1>Ticket check-in</h1>
          </div>
          <div className="admin-head-actions">
            <a className="btn btn--secondary" href="/admin">
              View orders
            </a>
            <button
              type="button"
              className="btn btn--secondary"
              onClick={signOut}
            >
              Sign out
            </button>
          </div>
        </header>

        <p className="checkin-lede">
          Scan a guest QR code or enter the ticket code to verify admission and
          mark the ticket as used.
        </p>

        <div className="checkin-workspace">
          <section className="checkin-card">
            <div className="checkin-card__head">
              <h2>Verify guest</h2>
              <p>Type a code, paste a ticket link, or scan with the camera.</p>
            </div>

            <form
              className="checkin-form"
              onSubmit={(e) => {
                e.preventDefault();
                void lookup(codeInput);
              }}
            >
              <label htmlFor="checkin-code">Ticket code or QR link</label>
              <input
                id="checkin-code"
                ref={inputRef}
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="e.g. A1B2C3D4E5"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
              />
              <button
                className="btn btn--primary btn--block"
                type="submit"
                disabled={state.kind === "loading"}
              >
                {state.kind === "loading" ? "Looking up…" : "Look up ticket"}
              </button>
            </form>

            <div className="checkin-divider" role="separator">
              <span>or</span>
            </div>

            <button
              type="button"
              className="btn btn--secondary btn--block"
              onClick={scanning ? stopScanner : startScanner}
            >
              {scanning ? "Stop camera" : "Scan with camera"}
            </button>

            {scanError ? (
              <p className="banner banner--error">{scanError}</p>
            ) : null}

            {scanning ? (
              <div className="checkin-camera">
                <video ref={videoRef} playsInline muted />
                <p>Point the camera at the guest’s QR code</p>
              </div>
            ) : null}

            {state.kind === "error" ? (
              <p className="banner banner--error">{state.message}</p>
            ) : null}
          </section>

          {state.kind === "found" ? (
            <section
              className={`checkin-result ${
                state.justCheckedIn
                  ? "is-success"
                  : state.ticket.alreadyUsed
                    ? "is-used"
                    : "is-valid"
              }`}
            >
              <p className="checkin-result__badge">
                {state.justCheckedIn
                  ? "Checked in"
                  : state.ticket.alreadyUsed
                    ? "Already used"
                    : "Valid — ready to enter"}
              </p>
              <h2>{state.ticket.holderName}</h2>
              <dl className="checkin-result__meta">
                <div>
                  <dt>Ticket</dt>
                  <dd>{state.ticket.typeName}</dd>
                </div>
                <div>
                  <dt>Code</dt>
                  <dd>{state.ticket.code}</dd>
                </div>
                <div>
                  <dt>Event</dt>
                  <dd>{state.ticket.eventTitle}</dd>
                </div>
                <div>
                  <dt>Confirmation</dt>
                  <dd>{state.ticket.confirmationCode}</dd>
                </div>
              </dl>

              <div className="checkin-result__actions">
                {!state.ticket.alreadyUsed ? (
                  <button
                    type="button"
                    className="btn btn--primary btn--block"
                    disabled={checkingIn}
                    onClick={() => void checkIn()}
                  >
                    {checkingIn ? "Checking in…" : "Admit guest"}
                  </button>
                ) : null}
                <button
                  type="button"
                  className="btn btn--secondary btn--block"
                  onClick={resetForNext}
                >
                  Next guest
                </button>
              </div>
            </section>
          ) : (
            <aside className="checkin-idle" aria-hidden={false}>
              <p className="checkin-idle__eyebrow">Waiting</p>
              <p className="checkin-idle__title">Guest details appear here</p>
              <p className="checkin-idle__copy">
                After lookup, you’ll see ticket type, confirmation, and an Admit
                button for the door.
              </p>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
