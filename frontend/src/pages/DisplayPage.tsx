/**
 * Screen 6 — Waiting Area Display  /display
 * Public TV/monitor screen showing queue tokens.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { BarberPoleIcon, ScissorsIcon } from "@/components/ui/VintageIcons";
import { queueService } from "@/services/queueService";
import type { QueueEntry } from "@/types/queue";

const POLL_MS = 5_000;

export function DisplayPage() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [clock, setClock] = useState(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const clockRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const data = await queueService.getActiveQueue();
      setQueue(data);
    } catch {
      // silent — display continues showing last known state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
    intervalRef.current = setInterval(() => void fetchData(), POLL_MS);
    clockRef.current    = setInterval(() => setClock(
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    ), 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (clockRef.current)    clearInterval(clockRef.current);
    };
  }, [fetchData]);

  const nowServing = queue.find((e) => e.status === "called" || e.status === "in_service");
  const waiting    = queue.filter((e) => e.status === "waiting").slice(0, 10);

  if (loading) {
    return (
      <div className="min-h-screen bg-olive flex items-center justify-center">
        <BarberPoleIcon className="w-16 h-16 text-gold/30 animate-bounce" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-olive text-parchment flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-brown border-b border-gold/30 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-gold/50 flex items-center justify-center">
            <ScissorsIcon className="w-5 h-5 text-gold" />
          </div>
          <div>
            <span className="font-heading text-parchment font-bold text-lg block leading-none">
              The Sovereign Blade
            </span>
            <span className="text-parchment/40 text-xs font-body tracking-widest">
              Queue Display
            </span>
          </div>
        </div>
        <span className="font-heading text-gold text-2xl font-bold">{clock}</span>
      </div>

      {/* Now Serving */}
      <div className="bg-gold/10 border-b border-gold/30 px-8 py-8 text-center">
        <p className="text-gold/60 text-xs tracking-widest uppercase font-body mb-2">
          Now Serving
        </p>
        {nowServing ? (
          <div>
            <span className="font-heading font-black text-gold text-7xl sm:text-9xl tracking-widest
                             drop-shadow-[0_0_40px_rgba(195,154,90,0.4)]">
              {nowServing.token}
            </span>
            {nowServing.barber && (
              <p className="text-parchment/60 font-body text-lg mt-3">
                with <span className="text-gold font-heading">{nowServing.barber.name}</span>
              </p>
            )}
          </div>
        ) : (
          <div>
            <BarberPoleIcon className="w-16 h-16 text-gold/20 mx-auto mb-3" />
            <p className="text-parchment/30 font-body text-xl">No customer in service</p>
          </div>
        )}
      </div>

      {/* Waiting list */}
      <div className="flex-1 px-8 py-6">
        <p className="text-parchment/40 text-[10px] tracking-widest uppercase font-body mb-6 text-center">
          Up Next — {waiting.length} Waiting
        </p>
        {waiting.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20">
            <BarberPoleIcon className="w-20 h-20 text-gold/15 mb-4" />
            <p className="text-parchment/20 font-heading text-2xl">Welcome — Queue is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {waiting.map((e, i) => (
              <div key={e.id}
                className="border border-gold/20 bg-brown/60 p-4 text-center
                           animate-in fade-in duration-500">
                <span className="text-parchment/30 text-xs font-body block mb-1">#{i + 1}</span>
                <span className="font-heading font-bold text-gold text-xl block">{e.token}</span>
                <span className="text-parchment/50 text-xs font-body block mt-1 truncate">
                  {e.customer_name}
                </span>
                {e.barber && (
                  <span className="text-parchment/30 text-[10px] font-body block mt-0.5">
                    → {e.barber.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-brown/60 border-t border-gold/20 px-8 py-3 text-center">
        <div className="flex items-center justify-center gap-6">
          <ScissorsIcon className="w-3 h-3 text-gold/30 rotate-180" />
          <p className="text-parchment/30 text-xs font-body tracking-widest">
            12 Barber Lane, Navrangpura · Ahmedabad
          </p>
          <ScissorsIcon className="w-3 h-3 text-gold/30" />
        </div>
      </div>
    </div>
  );
}
