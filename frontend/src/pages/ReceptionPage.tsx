/**
 * Screen 4 — Reception Dashboard  /reception
 *
 * Tablet-first operational interface for receptionists.
 * Polls every 10 s. All mutations hit the real FastAPI backend.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  BarberPoleIcon, ClockIcon, ScissorsIcon,
  UsersIcon, XIcon, ChevronDownIcon,
} from "@/components/ui/VintageIcons";
import { queueService } from "@/services/queueService";
import { getErrorMessage } from "@/utils/errorHandler";
import type { QueueEntry } from "@/types/queue";
import type { ApiBarber, ApiService, DashboardSummary, QueueStatus } from "@/types/api";

const POLL_MS = 10_000;

// ── Time helpers ──────────────────────────────────────────────────────────────

function minutesAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
}
function fmtWait(min: number): string {
  if (min < 1) return "<1 min";
  return `${min} min`;
}
function nowStr(): string {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

// ── Shared confirm modal ──────────────────────────────────────────────────────

function ConfirmModal({
  title, message, confirmLabel, variant = "danger",
  onConfirm, onCancel, loading,
}: {
  title: string; message: string; confirmLabel: string;
  variant?: "danger" | "primary";
  onConfirm: () => void; onCancel: () => void; loading: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 p-4 bg-olive/80 backdrop-blur-sm"
      role="dialog" aria-modal="true" aria-labelledby="modal-title"
    >
      <div className="bg-brown border border-gold/30 w-full max-w-sm p-6 shadow-2xl">
        <h3 id="modal-title" className="font-heading text-parchment text-xl font-bold mb-2">
          {title}
        </h3>
        <p className="text-parchment/60 font-body text-sm mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <Button variant="ghost" size="md" onClick={onCancel} disabled={loading} className="flex-1">
            Go Back
          </Button>
          <Button variant={variant} size="md" onClick={onConfirm} loading={loading} className="flex-1">
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Walk-in modal ─────────────────────────────────────────────────────────────

function WalkInModal({
  services, barbers, onSubmit, onClose,
}: {
  services: ApiService[];
  barbers: ApiBarber[];
  onSubmit: (payload: {
    customer_name: string; phone: string;
    service_ids: number[]; barber_id: number | null;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [selSvcs, setSelSvcs] = useState<number[]>([]);
  const [barberId, setBarberId] = useState<number | null>(null);
  const [err, setErr]         = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const toggleSvc = (id: number) => {
    setSelSvcs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setErr("Name is required."); return; }
    if (!/^[6-9]\d{9}$/.test(phone)) { setErr("Enter a valid 10-digit Indian mobile number."); return; }
    if (selSvcs.length === 0) { setErr("Select at least one service."); return; }
    setErr(null);
    setLoading(true);
    try {
      await onSubmit({ customer_name: name.trim(), phone, service_ids: selSvcs, barber_id: barberId });
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center
                 p-4 bg-olive/80 backdrop-blur-sm overflow-y-auto"
      role="dialog" aria-modal="true" aria-labelledby="walkin-title"
    >
      <div className="bg-brown border border-gold/30 w-full max-w-lg p-6 shadow-2xl my-4">
        <div className="flex items-center justify-between mb-5">
          <h3 id="walkin-title" className="font-heading text-parchment text-xl font-bold">
            Add Walk-In Customer
          </h3>
          <button onClick={onClose} aria-label="Close" className="text-parchment/40 hover:text-parchment">
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} noValidate>
          {err && (
            <div role="alert" className="mb-4 bg-red-900/30 border border-red-700/40
                                         text-red-300 text-sm font-body px-3 py-2">
              {err}
            </div>
          )}

          {/* Name */}
          <div className="mb-4">
            <label htmlFor="wi-name"
              className="block text-parchment/70 text-xs tracking-widest uppercase font-body mb-1.5">
              Customer Name *
            </label>
            <input id="wi-name" type="text" value={name}
              onChange={(e) => setName(e.target.value)}
              className="vintage-input" placeholder="Arjun Sharma"
              autoComplete="name" required />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label htmlFor="wi-phone"
              className="block text-parchment/70 text-xs tracking-widest uppercase font-body mb-1.5">
              Mobile Number *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 bg-brown border border-gold/40
                               border-r-0 text-parchment/60 text-sm font-body shrink-0">
                +91
              </span>
              <input id="wi-phone" type="tel" value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className="vintage-input flex-1" placeholder="9876543210"
                inputMode="numeric" maxLength={10} required />
            </div>
          </div>

          {/* Services */}
          <div className="mb-4">
            <span className="block text-parchment/70 text-xs tracking-widest uppercase font-body mb-2">
              Services * (up to 3)
            </span>
            <div className="grid grid-cols-2 gap-2">
              {services.map((svc) => {
                const on = selSvcs.includes(svc.id);
                const disabled = !on && selSvcs.length >= 3;
                return (
                  <button key={svc.id} type="button"
                    onClick={() => toggleSvc(svc.id)}
                    disabled={disabled}
                    aria-pressed={on}
                    className={[
                      "text-left p-3 border text-xs font-body transition-all",
                      on ? "border-copper bg-copper/15 text-parchment"
                         : disabled ? "border-gold/10 opacity-40 cursor-not-allowed text-parchment/40"
                                    : "border-gold/20 hover:border-gold/40 text-parchment/70",
                    ].join(" ")}>
                    <span className="font-semibold block">{svc.name}</span>
                    <span className="text-gold">₹{svc.price}</span>
                    <span className="text-parchment/40 ml-2">{svc.duration}m</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Barber */}
          <div className="mb-6">
            <label htmlFor="wi-barber"
              className="block text-parchment/70 text-xs tracking-widest uppercase font-body mb-1.5">
              Preferred Barber
            </label>
            <div className="relative">
              <select id="wi-barber"
                value={barberId ?? ""}
                onChange={(e) => setBarberId(e.target.value ? Number(e.target.value) : null)}
                className="vintage-input appearance-none pr-8 cursor-pointer">
                <option value="">Any Available Barber</option>
                {barbers.map((b) => (
                  <option key={b.id} value={b.id} disabled={b.status === "on_break"}>
                    {b.name}{b.status === "on_break" ? " (On Break)" : ""}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4
                                          text-parchment/40 pointer-events-none" />
            </div>
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="ghost" size="md" onClick={onClose}
              disabled={loading} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={loading} className="flex-1">
              Add to Queue
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: QueueStatus }) {
  const cfg: Record<QueueStatus, { cls: string; label: string }> = {
    waiting:    { cls: "bg-copper/20 text-copper border-copper/40",   label: "Waiting"     },
    called:     { cls: "bg-gold/20 text-gold border-gold/50",         label: "Called"      },
    in_service: { cls: "bg-parchment/15 text-parchment border-parchment/30", label: "In Chair" },
    completed:  { cls: "bg-green-900/30 text-green-400 border-green-700/40", label: "Done"   },
    cancelled:  { cls: "bg-red-900/30 text-red-400 border-red-700/40",  label: "Cancelled" },
    no_show:    { cls: "bg-red-900/30 text-red-400 border-red-700/40",  label: "No-Show"   },
  };
  const { cls, label } = cfg[status] ?? { cls: "", label: status };
  return (
    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-body tracking-widest
                      uppercase border ${cls}`}>
      {label}
    </span>
  );
}

// ── Barber card ───────────────────────────────────────────────────────────────

function BarberCard({
  barber,
  currentEntry,
  onCallNext,
  onToggleBreak,
  actionLoading,
}: {
  barber: ApiBarber;
  currentEntry: QueueEntry | undefined;
  onCallNext: (barberId: number) => void;
  onToggleBreak: (barber: ApiBarber) => void;
  actionLoading: boolean;
}) {
  const isOnBreak = barber.status === "on_break";
  const elapsed = currentEntry?.started_at
    ? minutesAgo(currentEntry.started_at)
    : null;

  return (
    <div className={`border p-4 flex flex-col gap-3
                     ${isOnBreak ? "border-gold/10 bg-brown/20 opacity-60"
                                 : "border-gold/20 bg-brown/60"}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center
                         font-heading font-bold text-sm shrink-0
                         ${isOnBreak ? "border-parchment/20 text-parchment/40"
                                     : "border-gold/50 text-gold"}`}>
          {barber.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-heading text-parchment font-semibold text-sm truncate">
            {barber.name}
          </p>
          <p className="text-parchment/50 text-xs font-body italic truncate">{barber.specialty}</p>
        </div>
        <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0
                          ${isOnBreak ? "bg-amber-500" : "bg-green-500"}`}
              aria-label={barber.status} />
      </div>

      {/* Current customer */}
      {currentEntry ? (
        <div className="bg-olive/60 border border-gold/15 p-3 text-xs font-body">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-parchment/50 uppercase tracking-widest">Token</span>
            <span className="text-gold font-heading font-bold">{currentEntry.token}</span>
          </div>
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-parchment/50 uppercase tracking-widest">Customer</span>
            <span className="text-parchment/80 truncate max-w-[120px]">
              {currentEntry.customer_name}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-parchment/50 uppercase tracking-widest">Services</span>
            <span className="text-parchment/70 truncate max-w-[120px]">
              {currentEntry.services.map((s) => s.name).join(", ")}
            </span>
          </div>
          {elapsed !== null && (
            <div className="flex justify-between items-baseline mt-1">
              <span className="text-parchment/50 uppercase tracking-widest">Elapsed</span>
              <span className="text-copper">{elapsed} min</span>
            </div>
          )}
        </div>
      ) : (
        <p className="text-parchment/30 text-xs font-body italic text-center py-2">
          No active customer
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto">
        {!isOnBreak && (
          <Button size="sm" variant="primary" disabled={actionLoading}
            onClick={() => onCallNext(barber.id)} className="flex-1 text-xs">
            Call Next
          </Button>
        )}
        <Button size="sm"
          variant={isOnBreak ? "secondary" : "ghost"}
          disabled={actionLoading}
          onClick={() => onToggleBreak(barber)}
          className="flex-1 text-xs">
          {isOnBreak ? "Resume" : "Break"}
        </Button>
      </div>
    </div>
  );
}

// ── Queue table row ───────────────────────────────────────────────────────────

function QueueRow({
  entry, onAction, loading,
}: {
  entry: QueueEntry;
  onAction: (entry: QueueEntry, action: "call" | "in_service" | "complete" | "no_show" | "cancel") => void;
  loading: boolean;
}) {
  const waited = minutesAgo(entry.created_at);

  return (
    <tr className="border-t border-gold/10 hover:bg-gold/5 transition-colors">
      <td className="px-3 py-3 text-xs font-heading font-bold text-gold whitespace-nowrap">
        {entry.token}
      </td>
      <td className="px-3 py-3 text-sm font-body text-parchment/80 max-w-[120px] truncate">
        {entry.customer_name}
      </td>
      <td className="px-3 py-3 text-xs font-body text-parchment/50 whitespace-nowrap hidden sm:table-cell">
        {entry.phone}
      </td>
      <td className="px-3 py-3 text-xs font-body text-parchment/70 max-w-[150px] hidden md:table-cell">
        {entry.services.map((s) => s.name).join(", ")}
      </td>
      <td className="px-3 py-3 text-xs font-body text-parchment/60 whitespace-nowrap hidden lg:table-cell">
        {entry.barber ? entry.barber.name : <span className="text-parchment/30">Auto</span>}
      </td>
      <td className="px-3 py-3 text-xs font-body text-parchment/50 whitespace-nowrap hidden sm:table-cell">
        {fmtWait(waited)}
      </td>
      <td className="px-3 py-3">
        <StatusBadge status={entry.status} />
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex gap-1.5">
          {entry.status === "waiting" && (
            <button
              onClick={() => onAction(entry, "call")}
              disabled={loading}
              aria-label={`Call ${entry.token}`}
              className="text-gold hover:text-parchment transition-colors disabled:opacity-40
                         text-xs font-body tracking-widest uppercase border border-gold/30
                         hover:border-gold px-2.5 py-1">
              Call
            </button>
          )}
          {entry.status === "called" && (
            <button
              onClick={() => onAction(entry, "in_service")}
              disabled={loading}
              aria-label={`Start service for ${entry.token}`}
              className="text-copper hover:text-parchment transition-colors disabled:opacity-40
                         text-xs font-body tracking-widest uppercase border border-copper/30
                         hover:border-copper px-2.5 py-1">
              Start
            </button>
          )}
          {entry.status === "in_service" && (
            <button
              onClick={() => onAction(entry, "complete")}
              disabled={loading}
              aria-label={`Mark ${entry.token} done`}
              className="text-green-400 hover:text-parchment transition-colors disabled:opacity-40
                         text-xs font-body tracking-widest uppercase border border-green-700/30
                         hover:border-green-500 px-2.5 py-1">
              Done
            </button>
          )}
          {["waiting", "called"].includes(entry.status) && (
            <>
              <button
                onClick={() => onAction(entry, "no_show")}
                disabled={loading}
                aria-label={`Mark ${entry.token} no-show`}
                className="text-amber-500 hover:text-parchment transition-colors disabled:opacity-40
                           text-xs font-body tracking-widest uppercase border border-amber-700/30
                           hover:border-amber-500 px-2.5 py-1">
                No-Show
              </button>
              <button
                onClick={() => onAction(entry, "cancel")}
                disabled={loading}
                aria-label={`Cancel ${entry.token}`}
                className="text-red-400 hover:text-parchment transition-colors disabled:opacity-40
                           text-xs font-body tracking-widest uppercase border border-red-700/30
                           hover:border-red-500 px-2.5 py-1">
                Cancel
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ── Main page component ───────────────────────────────────────────────────────

type Confirm = { entry: QueueEntry; action: "call" | "in_service" | "complete" | "no_show" | "cancel" } | null;
type BreakConfirm = { barber: ApiBarber } | null;

export function ReceptionPage() {
  const [queue,    setQueue]    = useState<QueueEntry[]>([]);
  const [barbers,  setBarbers]  = useState<ApiBarber[]>([]);
  const [services, setServices] = useState<ApiService[]>([]);
  const [summary,  setSummary]  = useState<DashboardSummary | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState<string | null>(null);
  const [clock,    setClock]    = useState(nowStr());
  const [showWalkIn, setShowWalkIn] = useState(false);
  const [confirm,    setConfirm]   = useState<Confirm>(null);
  const [breakConfirm, setBreakConfirm] = useState<BreakConfirm>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [q, b, s, sum] = await Promise.all([
        queueService.getActiveQueue(),
        queueService.getBarbers(),
        queueService.getServices(),
        queueService.getDashboardSummary(),
      ]);
      setQueue(q);
      setBarbers(b);
      setServices(s);
      setSummary(sum);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAll();
    intervalRef.current = setInterval(() => void fetchAll(), POLL_MS);
    clockRef.current    = setInterval(() => setClock(nowStr()), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (clockRef.current)    clearInterval(clockRef.current);
    };
  }, [fetchAll]);

  // ── Action helpers ─────────────────────────────────────────────────────────
  const statusForAction = (action: NonNullable<Confirm>["action"]): string => ({
    call:       "called",
    in_service: "in_service",
    complete:   "completed",
    no_show:    "no_show",
    cancel:     "cancelled",
  }[action]);

  const executeConfirmed = async () => {
    if (!confirm) return;
    setActionLoading(true);
    try {
      const updated = await queueService.updateStatus(
        confirm.entry.id, statusForAction(confirm.action)
      );
      setQueue((prev) => prev.map((e) => (e.id === updated.id ? updated : e))
                             .filter((e) => !["completed","cancelled","no_show"].includes(e.status)));
      await fetchAll();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const executeBreak = async () => {
    if (!breakConfirm) return;
    setActionLoading(true);
    try {
      const { barber } = breakConfirm;
      const newStatus = barber.status === "on_break" ? "available" : "on_break";
      const updated = await queueService.updateBarberStatus(barber.id, newStatus);
      setBarbers((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading(false);
      setBreakConfirm(null);
    }
  };

  const handleCallNext = async (barberId: number) => {
    // Find the next waiting entry for this barber (or any if unmatched)
    const next = queue.find(
      (e) => e.status === "waiting" &&
             (e.barber?.id === barberId || (!e.barber_locked && !e.barber))
    );
    if (!next) { setError("No waiting customers for this barber."); return; }
    setConfirm({ entry: next, action: "call" });
  };

  const handleWalkIn = async (payload: Parameters<typeof queueService.addWalkIn>[0]) => {
    const created = await queueService.addWalkIn(payload);
    setQueue((prev) => [...prev, created]);
    await fetchAll();
    setShowWalkIn(false);
  };

  // ── Layout ─────────────────────────────────────────────────────────────────
  const waitingQueue = queue.filter((e) =>
    ["waiting", "called", "in_service"].includes(e.status)
  );

  const getBarberCurrent = (barberId: number): QueueEntry | undefined =>
    queue.find(
      (e) => e.barber?.id === barberId &&
             ["called", "in_service"].includes(e.status)
    );

  if (loading) {
    return (
      <div className="min-h-screen bg-olive flex items-center justify-center">
        <div className="text-center">
          <BarberPoleIcon className="w-10 h-10 text-gold/40 mx-auto mb-3 animate-bounce" />
          <p className="text-parchment/50 text-sm font-body tracking-widest uppercase">
            Loading dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-olive text-parchment">

      {/* ── Top bar ──────────────────────────────────────────────────────────── */}
      <div className="bg-brown border-b border-gold/20 sticky top-0 z-40">
        <div className="mx-auto max-w-screen-xl px-4 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-full border border-gold/50 flex items-center justify-center">
              <ScissorsIcon className="w-3.5 h-3.5 text-gold" aria-hidden="true" />
            </div>
            <span className="font-heading text-parchment font-bold text-sm hidden sm:block">
              Reception
            </span>
          </div>

          {/* Centre stats */}
          {summary && (
            <div className="flex items-center gap-4 text-xs font-body">
              <TopStat
                icon={<UsersIcon className="w-3.5 h-3.5" />}
                label="Waiting" value={summary.total_waiting} />
              <div className="h-4 w-px bg-gold/20 hidden sm:block" />
              <TopStat
                icon={<ClockIcon className="w-3.5 h-3.5" />}
                label="Avg Wait" value={`${summary.average_wait_minutes}m`} />
              <div className="h-4 w-px bg-gold/20 hidden sm:block" />
              <span className={`px-2 py-0.5 text-[10px] tracking-widest uppercase font-body
                               border ${summary.queue_open
                                 ? "border-green-700/50 text-green-400 bg-green-900/20"
                                 : "border-red-700/50 text-red-400 bg-red-900/20"}`}>
                {summary.queue_open ? "Open" : "Closed"}
              </span>
            </div>
          )}

          {/* Right: clock + add button */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-parchment/40 text-xs font-body hidden sm:block">{clock}</span>
            <Button size="sm" variant="primary"
              onClick={() => setShowWalkIn(true)}>
              + Walk-In
            </Button>
          </div>
        </div>
      </div>

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      {error && (
        <div role="alert"
          className="bg-red-900/30 border-b border-red-700/40 text-red-300
                     text-sm font-body px-4 py-2 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} aria-label="Dismiss error">
            <XIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="mx-auto max-w-screen-xl px-4 py-6 space-y-8">

        {/* ── Barber cards ──────────────────────────────────────────────────── */}
        <section aria-label="Barber stations">
          <div className="ornament-line mb-4">
            <ScissorsIcon className="w-3.5 h-3.5 text-gold/40 rotate-180 shrink-0" />
            <span className="text-gold/50 text-[10px] tracking-widest2 uppercase font-body shrink-0 px-2">
              Barber Stations
            </span>
            <ScissorsIcon className="w-3.5 h-3.5 text-gold/40 shrink-0" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {barbers.map((b) => (
              <BarberCard key={b.id}
                barber={b}
                currentEntry={getBarberCurrent(b.id)}
                onCallNext={handleCallNext}
                onToggleBreak={(barber) => setBreakConfirm({ barber })}
                actionLoading={actionLoading}
              />
            ))}
            {barbers.length === 0 && (
              <p className="col-span-4 text-parchment/30 text-sm font-body italic text-center py-6">
                No barbers configured. Add barbers in the admin panel.
              </p>
            )}
          </div>
        </section>

        {/* ── Waiting queue table ───────────────────────────────────────────── */}
        <section aria-label="Waiting queue">
          <div className="ornament-line mb-4">
            <ScissorsIcon className="w-3.5 h-3.5 text-gold/40 rotate-180 shrink-0" />
            <span className="text-gold/50 text-[10px] tracking-widest2 uppercase font-body shrink-0 px-2">
              Queue — {waitingQueue.length} Active
            </span>
            <ScissorsIcon className="w-3.5 h-3.5 text-gold/40 shrink-0" />
          </div>

          {waitingQueue.length === 0 ? (
            <div className="border border-gold/15 bg-brown/30 py-16 text-center">
              <BarberPoleIcon className="w-10 h-10 text-gold/20 mx-auto mb-3" />
              <p className="text-parchment/30 font-body text-sm">Queue is empty.</p>
            </div>
          ) : (
            <div className="border border-gold/15 overflow-x-auto">
              <table className="w-full text-sm" aria-label="Active queue entries">
                <thead>
                  <tr className="bg-brown/80 border-b border-gold/20 text-left">
                    {["Token","Customer","Phone","Services","Barber","Waiting","Status","Actions"]
                      .map((h) => (
                        <th key={h}
                          className="px-3 py-2.5 text-parchment/50 text-[10px] font-body
                                     tracking-widest uppercase whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {waitingQueue.map((e) => (
                    <QueueRow key={e.id} entry={e}
                      onAction={(entry, action) => setConfirm({ entry, action })}
                      loading={actionLoading} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-2 text-parchment/25 text-xs font-body text-right">
            Auto-refreshes every {POLL_MS / 1000}s
          </p>
        </section>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showWalkIn && (
        <WalkInModal
          services={services}
          barbers={barbers}
          onSubmit={async (p) => { await handleWalkIn(p); }}
          onClose={() => setShowWalkIn(false)}
        />
      )}

      {confirm && (
        <ConfirmModal
          title={
            confirm.action === "cancel" ? "Cancel This Entry?" :
            confirm.action === "no_show" ? "Mark as No-Show?" :
            confirm.action === "call" ? "Call This Customer?" :
            confirm.action === "in_service" ? "Start Service?" :
            "Mark as Complete?"
          }
          message={
            confirm.action === "cancel"
              ? `Remove token ${confirm.entry.token} (${confirm.entry.customer_name}) from the queue?`
              : confirm.action === "no_show"
              ? `Mark ${confirm.entry.token} as a no-show? They will be removed from the queue.`
              : confirm.action === "call"
              ? `Announce token ${confirm.entry.token} for ${confirm.entry.customer_name}?`
              : confirm.action === "in_service"
              ? `Start service for ${confirm.entry.customer_name}?`
              : `Mark ${confirm.entry.customer_name}'s service as complete?`
          }
          confirmLabel={
            confirm.action === "cancel" ? "Remove" :
            confirm.action === "no_show" ? "Mark No-Show" :
            confirm.action === "call" ? "Call Now" :
            confirm.action === "in_service" ? "Start" :
            "Mark Done"
          }
          variant={["cancel","no_show"].includes(confirm.action) ? "danger" : "primary"}
          onConfirm={() => void executeConfirmed()}
          onCancel={() => setConfirm(null)}
          loading={actionLoading}
        />
      )}

      {breakConfirm && (
        <ConfirmModal
          title={breakConfirm.barber.status === "on_break"
            ? `Resume ${breakConfirm.barber.name}?`
            : `Put ${breakConfirm.barber.name} on Break?`}
          message={breakConfirm.barber.status === "on_break"
            ? "Barber will become available to receive new customers."
            : "Barber will not receive new customers while on break."}
          confirmLabel={breakConfirm.barber.status === "on_break" ? "Resume" : "Take Break"}
          variant="primary"
          onConfirm={() => void executeBreak()}
          onCancel={() => setBreakConfirm(null)}
          loading={actionLoading}
        />
      )}
    </div>
  );
}

function TopStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-1.5 text-parchment/70">
      {icon}
      <span className="text-parchment/40">{label}</span>
      <span className="text-parchment font-heading font-bold">{value}</span>
    </div>
  );
}
