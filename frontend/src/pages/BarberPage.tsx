/**
 * Screen 5 — Barber View  /barber/:name
 * Individual barber queue management dashboard.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import {
  BarberPoleIcon, CheckIcon, ClockIcon, ScissorsIcon, XIcon,
} from "@/components/ui/VintageIcons";
import { queueService } from "@/services/queueService";
import { getErrorMessage } from "@/utils/errorHandler";
import type { QueueEntry } from "@/types/queue";
import type { ApiBarber } from "@/types/api";

const POLL_MS = 8_000;

function minutesAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
}

export function BarberPage() {
  const { name = "" } = useParams<{ name: string }>();
  const [queue, setQueue]       = useState<QueueEntry[]>([]);
  const [barber, setBarber]     = useState<ApiBarber | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [allBarbers, allQueue] = await Promise.all([
        queueService.getBarbers(),
        queueService.getActiveQueue(),
      ]);
      const matched = allBarbers.find(
        (b) => b.name.toLowerCase() === decodeURIComponent(name).toLowerCase()
      );
      setBarber(matched ?? null);
      if (matched) {
        const myQueue = allQueue.filter(
          (e) => e.barber?.id === matched.id &&
                 ["waiting", "called", "in_service"].includes(e.status)
        );
        setQueue(myQueue);
      }
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [name]);

  useEffect(() => {
    void fetchData();
    intervalRef.current = setInterval(() => void fetchData(), POLL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchData]);

  const handleAction = async (entry: QueueEntry, action: "in_service" | "completed") => {
    setActionLoading(true);
    try {
      await queueService.updateStatus(entry.id, action);
      await fetchData();
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  const handleBreakToggle = async () => {
    if (!barber) return;
    setActionLoading(true);
    try {
      const newStatus = barber.status === "on_break" ? "available" : "on_break";
      await queueService.updateBarberStatus(barber.id, newStatus);
      await fetchData();
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-olive flex items-center justify-center">
        <div className="text-center">
          <BarberPoleIcon className="w-10 h-10 text-gold/40 mx-auto mb-3 animate-bounce" />
          <p className="text-parchment/50 text-sm font-body tracking-widest uppercase">
            Loading barber view…
          </p>
        </div>
      </div>
    );
  }

  if (!barber) {
    return (
      <div className="min-h-screen bg-olive flex flex-col items-center justify-center text-center px-4">
        <ScissorsIcon className="w-14 h-14 text-gold/30 mx-auto mb-6" />
        <h1 className="font-heading text-parchment text-2xl font-bold mb-2">Barber Not Found</h1>
        <p className="text-parchment/50 font-body text-sm max-w-sm">
          No barber named "{decodeURIComponent(name)}" found in the system.
        </p>
      </div>
    );
  }

  const isOnBreak = barber.status === "on_break";
  const inServiceEntry = queue.find((e) => e.status === "in_service" || e.status === "called");
  const waitingEntries = queue.filter((e) => e.status === "waiting");
  const completedToday = 0; // Would need a separate API endpoint for history

  return (
    <div className="min-h-screen bg-olive text-parchment">
      {/* Header */}
      <div className="bg-brown border-b border-gold/20 py-6">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center
                               font-heading font-bold text-lg
                               ${isOnBreak ? "border-parchment/20 text-parchment/40"
                                           : "border-gold text-gold"}`}>
                {barber.initials}
              </div>
              <div>
                <h1 className="font-heading text-parchment text-2xl font-bold">{barber.name}</h1>
                <p className="text-parchment/50 font-body text-sm italic">{barber.specialty ?? "Master Barber"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 text-xs font-body tracking-widest uppercase border
                               ${isOnBreak
                                 ? "border-amber-700/40 text-amber-500 bg-amber-900/20"
                                 : "border-green-700/40 text-green-400 bg-green-900/20"}`}>
                {isOnBreak ? "On Break" : "Available"}
              </span>
              <Button
                size="sm"
                variant={isOnBreak ? "primary" : "ghost"}
                onClick={handleBreakToggle}
                loading={actionLoading}
              >
                {isOnBreak ? "Resume" : "Take Break"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="bg-red-900/30 border-b border-red-700/40 text-red-300
                                      text-sm font-body px-4 py-2 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><XIcon className="w-4 h-4" /></button>
        </div>
      )}

      <div className="mx-auto max-w-4xl px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Current customer */}
        <div className="lg:col-span-2 space-y-4">
          <div className="ornament-line">
            <ScissorsIcon className="w-3.5 h-3.5 text-gold/40 rotate-180 shrink-0" />
            <span className="text-gold/50 text-[10px] tracking-widest uppercase font-body px-2">
              Current Customer
            </span>
            <ScissorsIcon className="w-3.5 h-3.5 text-gold/40 shrink-0" />
          </div>

          {inServiceEntry ? (
            <div className="border border-gold/30 bg-brown/60 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-heading text-gold font-bold text-xl">{inServiceEntry.token}</span>
                <span className={`px-2 py-0.5 text-[10px] font-body tracking-widest uppercase border
                                  ${inServiceEntry.status === "in_service"
                                    ? "border-copper/40 text-copper bg-copper/10"
                                    : "border-gold/40 text-gold bg-gold/10"}`}>
                  {inServiceEntry.status === "in_service" ? "In Chair" : "Called"}
                </span>
              </div>
              <p className="font-body text-parchment text-lg mb-1">{inServiceEntry.customer_name}</p>
              <p className="text-parchment/40 text-xs font-body mb-3">{inServiceEntry.phone}</p>
              <div className="text-xs font-body text-parchment/60 mb-4">
                Services: {inServiceEntry.services.map((s) => s.name).join(", ")}
              </div>
              {inServiceEntry.started_at && (
                <div className="flex items-center gap-1.5 text-copper text-xs font-body mb-4">
                  <ClockIcon className="w-3.5 h-3.5" />
                  {minutesAgo(inServiceEntry.started_at)} min elapsed
                </div>
              )}
              <div className="flex gap-3">
                {inServiceEntry.status === "called" && (
                  <Button variant="primary" size="md"
                    onClick={() => void handleAction(inServiceEntry, "in_service")}
                    loading={actionLoading} className="flex-1">
                    <ScissorsIcon className="w-4 h-4" />
                    Start Service
                  </Button>
                )}
                {inServiceEntry.status === "in_service" && (
                  <Button variant="primary" size="md"
                    onClick={() => void handleAction(inServiceEntry, "completed")}
                    loading={actionLoading} className="flex-1">
                    <CheckIcon className="w-4 h-4" />
                    Mark Done
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="border border-gold/15 bg-brown/30 py-12 text-center">
              <BarberPoleIcon className="w-10 h-10 text-gold/20 mx-auto mb-3" />
              <p className="text-parchment/30 font-body text-sm">No active customer.</p>
            </div>
          )}

          {/* Waiting list */}
          <div className="ornament-line mt-6">
            <ScissorsIcon className="w-3.5 h-3.5 text-gold/40 rotate-180 shrink-0" />
            <span className="text-gold/50 text-[10px] tracking-widest uppercase font-body px-2">
              Up Next — {waitingEntries.length} Waiting
            </span>
            <ScissorsIcon className="w-3.5 h-3.5 text-gold/40 shrink-0" />
          </div>
          {waitingEntries.length === 0 ? (
            <p className="text-parchment/30 font-body text-sm text-center py-6">No customers waiting.</p>
          ) : (
            <div className="space-y-2">
              {waitingEntries.map((e, i) => (
                <div key={e.id} className="border border-gold/15 bg-brown/40 px-4 py-3
                                           flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-parchment/30 font-heading font-bold w-5 text-sm">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-heading text-gold text-sm font-bold block">{e.token}</span>
                      <span className="text-parchment/60 text-xs font-body">{e.customer_name}</span>
                    </div>
                  </div>
                  <div className="text-parchment/40 text-xs font-body flex items-center gap-1">
                    <ClockIcon className="w-3 h-3" />
                    {e.estimated_wait_minutes}m wait
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats sidebar */}
        <div className="space-y-4">
          <div className="ornament-line">
            <ScissorsIcon className="w-3.5 h-3.5 text-gold/40 rotate-180 shrink-0" />
            <span className="text-gold/50 text-[10px] tracking-widest uppercase font-body px-2">
              Today's Stats
            </span>
            <ScissorsIcon className="w-3.5 h-3.5 text-gold/40 shrink-0" />
          </div>
          <div className="border border-gold/15 bg-brown/40 p-5 space-y-4">
            <StatCard label="In Queue" value={queue.length} />
            <StatCard label="Completed" value={completedToday} />
            <StatCard label="Status" value={isOnBreak ? "On Break" : "Available"} />
          </div>
          <p className="text-parchment/25 text-xs font-body text-right">
            Auto-refreshes every {POLL_MS / 1000}s
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-center py-2">
      <span className="text-parchment/40 text-[10px] tracking-widest uppercase font-body block mb-1">
        {label}
      </span>
      <span className="font-heading text-parchment font-bold text-2xl">{value}</span>
    </div>
  );
}
