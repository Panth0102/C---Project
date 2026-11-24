/**
 * Screen 3 — Customer Status  /status/:token
 *
 * Seven distinct visual states per docs/02-screens.md and docs/03-flows-rules.md:
 *   waiting | approaching (pos=2) | called | in_service | completed | cancelled | no_show
 *
 * Polling every 8 s keeps the view fresh without a WebSocket.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import {
  BarberPoleIcon, CheckIcon, ClockIcon, ScissorsIcon, UsersIcon, XIcon,
} from "@/components/ui/VintageIcons";
import { queueService } from "@/services/queueService";
import { getErrorMessage } from "@/utils/errorHandler";
import type { QueueEntry } from "@/types/queue";
import type { QueueStatus } from "@/types/api";

const POLL_INTERVAL_MS = 8_000;

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(minutes: number): string {
  if (minutes < 1) return "Less than a minute";
  if (minutes < 60) return `${minutes} min`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diff < 1) return "just now";
  if (diff === 1) return "1 minute ago";
  return `${diff} minutes ago`;
}

// ── Ornamental token badge ─────────────────────────────────────────────────

function TokenBadge({ token, animate = false }: { token: string; animate?: boolean }) {
  return (
    <div className={`relative mx-auto w-52 h-52 ${animate ? "animate-pulse" : ""}`}>
      {/* Triple concentric rings */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" aria-hidden="true">
        <circle cx="100" cy="100" r="97" fill="none" stroke="#C39A5A" strokeWidth="1"
                strokeDasharray="3 4" opacity="0.5" />
        <circle cx="100" cy="100" r="88" fill="none" stroke="#C39A5A" strokeWidth="0.5"
                opacity="0.3" />
        <circle cx="100" cy="100" r="78" fill="none" stroke="#C39A5A" strokeWidth="1.5"
                opacity="0.6" />
        {/* Corner fleurons */}
        {[0, 90, 180, 270].map((deg) => (
          <circle key={deg}
            cx={100 + Math.sin((deg * Math.PI) / 180) * 97}
            cy={100 - Math.cos((deg * Math.PI) / 180) * 97}
            r="3" fill="#C39A5A" opacity="0.6" />
        ))}
      </svg>
      {/* Inner filled area */}
      <div className="absolute inset-6 rounded-full bg-brown border border-gold/50
                      flex flex-col items-center justify-center">
        <span className="text-gold/50 text-[9px] tracking-widest2 uppercase font-body block">
          Your Token
        </span>
        <span className="font-heading font-black text-gold text-2xl tracking-widest leading-tight
                         text-center px-2 break-all mt-1">
          {token}
        </span>
        <div className="mt-2 w-10 h-px bg-gold/40" />
        <span className="text-gold/40 text-[9px] tracking-widest uppercase font-body mt-1">
          Est. 1924
        </span>
      </div>
    </div>
  );
}

// ── Status config ─────────────────────────────────────────────────────────────

interface StatusCfg {
  bg:       string;
  border:   string;
  badge:    string;
  badgeText:string;
  icon:     React.ReactNode;
  heading:  string;
  sub:      string;
}

function getStatusConfig(status: QueueStatus, position: number | null): StatusCfg {
  const isApproaching = status === "waiting" && position === 2;

  if (isApproaching) return {
    bg: "bg-brown/80", border: "border-gold/50",
    badge: "bg-gold/20 text-gold border border-gold/50",
    badgeText: "Almost Your Turn",
    icon: <ClockIcon className="w-8 h-8 text-gold" />,
    heading: "Get Ready — You're Next!",
    sub: "One customer ahead of you. Please make your way to the shop.",
  };

  const cfg: Record<QueueStatus, StatusCfg> = {
    waiting: {
      bg: "bg-brown/60", border: "border-gold/20",
      badge: "bg-copper/20 text-copper border border-copper/50",
      badgeText: "Waiting",
      icon: <UsersIcon className="w-8 h-8 text-copper" />,
      heading: "You're in the Queue",
      sub: "Relax — we'll keep this page updated as the queue moves.",
    },
    called: {
      bg: "bg-gold/10", border: "border-gold",
      badge: "bg-gold text-olive border border-gold",
      badgeText: "It's Your Turn!",
      icon: <BarberPoleIcon className="w-8 h-8 text-gold" />,
      heading: "IT'S YOUR TURN!",
      sub: "Please proceed to your barber's chair immediately.",
    },
    in_service: {
      bg: "bg-brown/70", border: "border-copper/40",
      badge: "bg-copper/20 text-copper border border-copper/40",
      badgeText: "In the Chair",
      icon: <ScissorsIcon className="w-8 h-8 text-copper" />,
      heading: "You're Being Served",
      sub: "Sit back and enjoy your experience.",
    },
    completed: {
      bg: "bg-brown/50", border: "border-parchment/20",
      badge: "bg-parchment/20 text-parchment/70 border border-parchment/20",
      badgeText: "Completed",
      icon: <CheckIcon className="w-8 h-8 text-parchment/60" />,
      heading: "Thank You for Visiting!",
      sub: "We hope you enjoyed your time at The Sovereign Blade.",
    },
    cancelled: {
      bg: "bg-brown/50", border: "border-red-800/30",
      badge: "bg-red-900/30 text-red-300 border border-red-800/40",
      badgeText: "Cancelled",
      icon: <XIcon className="w-8 h-8 text-red-400" />,
      heading: "Queue Spot Cancelled",
      sub: "Your spot has been released. Join the queue again anytime.",
    },
    no_show: {
      bg: "bg-brown/50", border: "border-red-800/30",
      badge: "bg-red-900/30 text-red-300 border border-red-800/40",
      badgeText: "No-Show",
      icon: <XIcon className="w-8 h-8 text-red-400" />,
      heading: "Marked as No-Show",
      sub: "Your token was called but you didn't arrive in time. Please join the queue again.",
    },
  };

  return cfg[status];
}

// ── CALLED full-screen state ──────────────────────────────────────────────────

function CalledOverlay({ entry }: { entry: QueueEntry }) {
  return (
    <div className="fixed inset-0 z-50 bg-olive flex flex-col items-center justify-center
                    text-center px-6 overflow-hidden">
      {/* Animated gold pulse rings */}
      <div className="absolute w-96 h-96 rounded-full border-2 border-gold/20 animate-ping"
           aria-hidden="true" />
      <div className="absolute w-72 h-72 rounded-full border border-gold/30 animate-pulse"
           aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-lg">
        <div className="ornament-line w-full">
          <span className="text-gold/50 text-xs tracking-widest2 font-body">
            The Sovereign Blade
          </span>
        </div>

        <p className="text-gold/70 font-body text-sm tracking-widest2 uppercase">
          Token
        </p>
        <span className="font-heading font-black text-gold text-5xl sm:text-6xl tracking-widest
                         drop-shadow-[0_0_30px_rgba(195,154,90,0.5)]">
          {entry.token}
        </span>

        <h1 className="font-heading font-black text-parchment text-4xl sm:text-6xl leading-tight
                       uppercase tracking-wide">
          It's Your
          <br />
          <span className="text-gold italic">Turn!</span>
        </h1>

        {entry.barber && (
          <p className="text-parchment/70 font-body text-lg">
            Please proceed to{" "}
            <strong className="text-gold font-heading">{entry.barber.name}</strong>
          </p>
        )}

        <div className="flex items-center gap-4 text-parchment/40" aria-hidden="true">
          <ScissorsIcon className="w-5 h-5 rotate-180" />
          <div className="h-px w-10 bg-gold/30" />
          <span className="text-xs">✦</span>
          <div className="h-px w-10 bg-gold/30" />
          <ScissorsIcon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

// ── Cancel confirmation modal ─────────────────────────────────────────────────

function CancelModal({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 p-4 bg-olive/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-title"
    >
      <div className="bg-brown border border-gold/30 w-full max-w-sm p-6">
        <h3 id="cancel-title" className="font-heading text-parchment text-xl font-bold mb-2">
          Cancel Your Spot?
        </h3>
        <p className="text-parchment/60 font-body text-sm mb-6 leading-relaxed">
          Cancelling will remove you from the queue. This cannot be undone.
          You are welcome to rejoin anytime.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" size="md" onClick={onCancel} disabled={loading} className="flex-1">
            Keep My Spot
          </Button>
          <Button variant="danger" size="md" onClick={onConfirm} loading={loading} className="flex-1">
            Yes, Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function CustomerStatusPage() {
  const { token = "" } = useParams<{ token: string }>();

  const [entry, setEntry]             = useState<QueueEntry | null>(null);
  const [fetchError, setFetchError]   = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [showCancel, setShowCancel]   = useState(false);
  const [cancelling, setCancelling]   = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchEntry = useCallback(async () => {
    try {
      const data = await queueService.getStatusByToken(token);
      setEntry(data);
      setFetchError(null);
      // Stop polling once in a terminal state
      if (["completed", "cancelled", "no_show"].includes(data.status)) {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    } catch (err) {
      setFetchError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchEntry();
    intervalRef.current = setInterval(() => void fetchEntry(), POLL_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchEntry]);

  const handleCancel = async () => {
    if (!entry) return;
    setCancelling(true);
    setCancelError(null);
    try {
      const updated = await queueService.cancelMySpot(entry.id);
      setEntry(updated);
      setShowCancel(false);
    } catch (err) {
      setCancelError(getErrorMessage(err));
    } finally {
      setCancelling(false);
    }
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-olive flex items-center justify-center">
        <div className="text-center">
          <BarberPoleIcon className="w-10 h-10 text-gold/40 mx-auto mb-4 animate-bounce"
                          aria-hidden="true" />
          <p className="text-parchment/50 font-body text-sm tracking-widest uppercase">
            Looking up your token…
          </p>
        </div>
      </div>
    );
  }

  // ── 404 ───────────────────────────────────────────────────────────────────
  if (fetchError || !entry) {
    return (
      <div className="min-h-screen bg-olive flex flex-col items-center justify-center
                      text-center px-4 py-16">
        <ScissorsIcon className="w-14 h-14 text-gold/30 mx-auto mb-6" aria-hidden="true" />
        <h1 className="font-heading text-parchment text-2xl font-bold mb-2">Token Not Found</h1>
        <p className="text-parchment/50 font-body text-sm max-w-sm leading-relaxed mb-8">
          {fetchError ?? `We couldn't find a queue entry for token "${token}".`}
        </p>
        <Link to="/join">
          <Button variant="primary">Join the Queue</Button>
        </Link>
      </div>
    );
  }

  // ── Called: full-screen takeover ──────────────────────────────────────────
  if (entry.status === "called") {
    return <CalledOverlay entry={entry} />;
  }

  const cfg         = getStatusConfig(entry.status, entry.position);
  const isApproaching = entry.status === "waiting" && entry.position === 2;
  const isTerminal    = ["completed", "cancelled", "no_show"].includes(entry.status);
  const canCancel     = entry.status === "waiting";

  return (
    <div className={`min-h-screen bg-olive grain-overlay`}>
      {/* Page header strip */}
      <div className="bg-brown/60 border-b border-gold/20 py-6">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <p className="text-copper text-[11px] tracking-widest2 uppercase font-body">
            The Sovereign Blade — Queue Status
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* ── Status card ───────────────────────────────────────────────────── */}
        <div className={`border ${cfg.border} ${cfg.bg} p-6 sm:p-8`}>
          {/* Status badge */}
          <div className="flex justify-center mb-6">
            <span className={`inline-flex items-center gap-2 px-4 py-1.5 text-xs
                             font-body tracking-widest uppercase ${cfg.badge}`}>
              {cfg.icon}
              {cfg.badgeText}
            </span>
          </div>

          {/* Token badge — the visual centrepiece */}
          <TokenBadge token={entry.token} animate={isApproaching} />

          {/* Status heading */}
          <div className="text-center mt-8 mb-6">
            <h1 className={`font-heading font-bold text-2xl sm:text-3xl leading-tight
                            text-parchment`}>
              {cfg.heading}
            </h1>
            <p className="text-parchment/60 font-body text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              {cfg.sub}
            </p>
          </div>

          {/* ── Live stats (waiting / in-service only) ─────────────────────── */}
          {(entry.status === "waiting" || entry.status === "in_service") && (
            <div className="border-t border-gold/20 pt-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-center">
              {entry.status === "waiting" && entry.position !== null && (
                <StatBox
                  icon={<UsersIcon className="w-5 h-5 text-gold mx-auto mb-1" />}
                  label="Position"
                  value={entry.position === 0 ? "Next!" : `#${entry.position}`}
                />
              )}
              {entry.status === "waiting" && entry.position !== null && entry.position > 0 && (
                <StatBox
                  icon={<UsersIcon className="w-5 h-5 text-parchment/40 mx-auto mb-1" />}
                  label="Ahead of You"
                  value={String(entry.position - 1)}
                />
              )}
              {entry.estimated_wait_minutes > 0 && (
                <StatBox
                  icon={<ClockIcon className="w-5 h-5 text-gold mx-auto mb-1" />}
                  label="Est. Wait"
                  value={fmt(entry.estimated_wait_minutes)}
                />
              )}
            </div>
          )}

          {/* ── Approaching-turn prominent reminder ────────────────────────── */}
          {isApproaching && (
            <div className="mt-5 bg-gold/10 border border-gold/40 p-4 text-center">
              <p className="text-gold font-heading text-lg font-semibold">
                🔔 Head to the shop now — you're next!
              </p>
            </div>
          )}
        </div>

        {/* ── Booking details card ───────────────────────────────────────────── */}
        <div className="mt-5 border border-gold/15 bg-brown/40 p-6">
          <h2 className="font-heading text-parchment/80 text-sm tracking-widest uppercase mb-4">
            Booking Details
          </h2>

          <div className="space-y-3 text-sm font-body">
            <DetailRow label="Customer" value={entry.customer_name} />
            {entry.barber && (
              <DetailRow label="Barber" value={entry.barber.name} />
            )}
            <DetailRow label="Joined" value={timeAgo(entry.created_at)} />

            {/* Services */}
            <div className="pt-2 border-t border-gold/15">
              <span className="text-parchment/40 text-xs uppercase tracking-widest block mb-2">
                Services
              </span>
              {entry.services.map((svc) => (
                <div key={svc.id} className="flex justify-between text-parchment/70 py-1">
                  <span className="flex items-center gap-2">
                    <ClockIcon className="w-3 h-3 text-parchment/30" aria-hidden="true" />
                    {svc.name} ({svc.duration} min)
                  </span>
                  <span className="text-gold font-heading">₹{svc.price}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="flex justify-between pt-2 border-t border-gold/15">
              <span className="text-parchment/50 uppercase tracking-widest text-xs">
                Total
              </span>
              <span className="text-gold font-heading font-bold text-lg">
                ₹{entry.total_price}
              </span>
            </div>
          </div>
        </div>

        {/* ── Error banner ───────────────────────────────────────────────────── */}
        {cancelError && (
          <div role="alert" className="mt-4 bg-red-900/30 border border-red-700/40
                                       text-red-300 text-sm font-body px-4 py-3">
            {cancelError}
          </div>
        )}

        {/* ── Actions ───────────────────────────────────────────────────────── */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          {canCancel && (
            <Button
              variant="danger"
              size="md"
              onClick={() => setShowCancel(true)}
              className="flex-1"
            >
              <XIcon className="w-4 h-4" aria-hidden="true" />
              Cancel My Spot
            </Button>
          )}
          {!isTerminal && (
            <Button
              variant="ghost"
              size="md"
              onClick={() => void fetchEntry()}
              className="flex-1"
            >
              Refresh Status
            </Button>
          )}
          {isTerminal && (
            <Link to="/join" className="flex-1">
              <Button variant="primary" size="md" className="w-full">
                Join Again
              </Button>
            </Link>
          )}
        </div>

        {/* Auto-refresh note */}
        {!isTerminal && (
          <p className="mt-4 text-center text-parchment/30 text-xs font-body">
            Updates automatically every {POLL_INTERVAL_MS / 1000} seconds.
          </p>
        )}

        {/* Salon info */}
        <div className="mt-10 pt-6 border-t border-gold/15 text-center text-parchment/40
                        text-xs font-body space-y-1">
          <p>12 Barber Lane, Navrangpura · Ahmedabad, Gujarat 380009</p>
          <p>Mon–Fri: 9AM–8PM · Sat: 8AM–9PM · Sun: 10AM–6PM</p>
        </div>
      </div>

      {/* Cancel modal */}
      {showCancel && (
        <CancelModal
          onConfirm={() => void handleCancel()}
          onCancel={() => setShowCancel(false)}
          loading={cancelling}
        />
      )}
    </div>
  );
}

function StatBox({
  icon, label, value,
}: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-olive/60 border border-gold/15 py-4 px-3">
      {icon}
      <span className="text-parchment/40 text-[10px] tracking-widest uppercase font-body block">
        {label}
      </span>
      <span className="text-parchment font-heading font-bold text-xl block leading-tight mt-0.5">
        {value}
      </span>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline">
      <span className="text-parchment/40 text-xs uppercase tracking-widest shrink-0 mr-4">
        {label}
      </span>
      <span className="text-parchment/80 text-right">{value}</span>
    </div>
  );
}
