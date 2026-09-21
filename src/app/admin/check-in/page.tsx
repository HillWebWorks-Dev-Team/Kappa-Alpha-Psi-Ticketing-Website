"use client";

import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

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
  const [unlocked, setUnlocked] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [state, setState] = useState<LookupState>({ kind: "idle" });
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<{ detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>> } | null>(null);
  const lastScanRef = useRef<string>("");
  const inputRef = useRef<HTMLInputElement>(null);

  const stopScanner = useCallback(() => {
    setScanning(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  useEffect(() => () => stopScanner(), [stopScanner]);

  async function unlock(e: FormEvent) {
    e.preventDefault();
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/admin/orders", {
        headers: { "x-admin-password": password },
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unauthorized");
      }
      setUnlocked(true);
      setState({ kind: "idle" });
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Unauthorized",
      });
    }
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
          detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue: string }>>;
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
      setScanError("Could not access the camera. Allow camera permission, or enter the code manually.");
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

  return (
    <div className="page">
      <div className="container checkin">
        <div className="page-head">
          <p className="section__eyebrow">Door staff</p>
          <h1>Ticket check-in</h1>
          <p>
            Scan a guest QR code or enter the ticket code to verify admission and
            mark the ticket as used.
          </p>
        </div>

        {!unlocked ? (
          <div className="admin-panel checkin-panel">
            <form onSubmit={unlock} className="checkin-form">
              <label>
                Admin password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </label>
              <button className="btn btn--primary" type="submit">
                Unlock check-in
              </button>
            </form>
            {state.kind === "error" ? (
              <p className="banner banner--error">{state.message}</p>
            ) : null}
          </div>
        ) : (
          <div className="admin-panel checkin-panel">
            <div className="checkin-toolbar">
              <a className="btn btn--secondary" href="/admin">
                View orders
              </a>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={scanning ? stopScanner : startScanner}
              >
                {scanning ? "Stop camera" : "Scan with camera"}
              </button>
            </div>

            {scanError ? <p className="banner banner--error">{scanError}</p> : null}

            {scanning ? (
              <div className="checkin-camera">
                <video ref={videoRef} playsInline muted />
                <p>Point the camera at the guest’s QR code</p>
              </div>
            ) : null}

            <form
              className="checkin-form"
              onSubmit={(e) => {
                e.preventDefault();
                void lookup(codeInput);
              }}
            >
              <label>
                Ticket code or QR link
                <input
                  ref={inputRef}
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value)}
                  placeholder="e.g. A1B2C3D4E5"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                />
              </label>
              <button
                className="btn btn--primary"
                type="submit"
                disabled={state.kind === "loading"}
              >
                {state.kind === "loading" ? "Looking up…" : "Look up ticket"}
              </button>
            </form>

            {state.kind === "error" ? (
              <p className="banner banner--error">{state.message}</p>
            ) : null}

            {state.kind === "found" ? (
              <div
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
                    ? "CHECKED IN"
                    : state.ticket.alreadyUsed
                      ? "ALREADY USED"
                      : "VALID - READY TO ENTER"}
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
                      className="btn btn--primary"
                      disabled={checkingIn}
                      onClick={() => void checkIn()}
                    >
                      {checkingIn ? "Checking in…" : "Admit guest"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="btn btn--secondary"
                    onClick={resetForNext}
                  >
                    Next guest
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
