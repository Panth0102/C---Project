/**
 * Screen 7 — Owner / Admin Settings  /admin
 * Service and barber management.
 */

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ScissorsIcon, XIcon, ClockIcon } from "@/components/ui/VintageIcons";
import { queueService } from "@/services/queueService";
import { getErrorMessage } from "@/utils/errorHandler";
import type { ApiBarber, ApiService, DashboardSummary } from "@/types/api";

type Tab = "services" | "barbers" | "stats";

export function AdminPage() {
  const [tab, setTab]           = useState<Tab>("services");
  const [services, setServices] = useState<ApiService[]>([]);
  const [barbers, setBarbers]   = useState<ApiBarber[]>([]);
  const [summary, setSummary]   = useState<DashboardSummary | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      const [svcs, brbs, sum] = await Promise.all([
        queueService.getServices(),
        queueService.getBarbers(),
        queueService.getDashboardSummary(),
      ]);
      setServices(svcs);
      setBarbers(brbs);
      setSummary(sum);
      setError(null);
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchAll(); }, [fetchAll]);

  const TABS: { id: Tab; label: string }[] = [
    { id: "services", label: "Services" },
    { id: "barbers",  label: "Barbers"  },
    { id: "stats",    label: "Statistics" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-olive flex items-center justify-center">
        <div className="text-center">
          <ScissorsIcon className="w-10 h-10 text-gold/40 mx-auto mb-3 animate-spin" />
          <p className="text-parchment/50 text-sm font-body tracking-widest uppercase">Loading admin…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-olive text-parchment">
      {/* Header */}
      <div className="bg-brown border-b border-gold/20 py-6">
        <div className="mx-auto max-w-5xl px-4">
          <p className="text-copper text-[11px] tracking-widest uppercase font-body mb-1">
            The Sovereign Blade
          </p>
          <h1 className="font-heading text-parchment text-3xl font-bold">Admin Settings</h1>
        </div>
      </div>

      {error && (
        <div role="alert" className="bg-red-900/30 border-b border-red-700/40 text-red-300
                                      text-sm font-body px-4 py-2 flex justify-between">
          <span>{error}</span>
          <button onClick={() => setError(null)}><XIcon className="w-4 h-4" /></button>
        </div>
      )}

      <div className="mx-auto max-w-5xl px-4 py-8">
        {/* Tab nav */}
        <nav className="flex gap-1 mb-8 border-b border-gold/20" aria-label="Admin sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              aria-selected={tab === t.id}
              className={[
                "px-5 py-2.5 text-xs font-body tracking-widest uppercase border-b-2 -mb-px transition-colors",
                tab === t.id
                  ? "border-gold text-gold"
                  : "border-transparent text-parchment/40 hover:text-parchment/60",
              ].join(" ")}>
              {t.label}
            </button>
          ))}
        </nav>

        {/* Services tab */}
        {tab === "services" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-parchment text-xl font-semibold">Services</h2>
              <span className="text-parchment/30 text-xs font-body italic">
                Read-only view — manage services via backend admin
              </span>
            </div>
            {services.length === 0 ? (
              <EmptyState message="No services configured. Add services via the backend." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((svc) => (
                  <div key={svc.id} className="border border-gold/20 bg-brown/60 p-5">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xl" role="img" aria-hidden="true">
                        {svc.icon ?? "✂️"}
                      </span>
                      <span className="font-heading text-gold font-bold">₹{svc.price}</span>
                    </div>
                    <h3 className="font-heading text-parchment font-semibold mb-1">{svc.name}</h3>
                    {svc.description && (
                      <p className="text-parchment/50 text-xs font-body mb-2">{svc.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 text-parchment/40 text-xs font-body">
                      <ClockIcon className="w-3 h-3" />
                      {svc.duration} min
                    </div>
                    <span className={`mt-2 inline-block px-2 py-0.5 text-[10px] font-body
                                     tracking-widest uppercase border
                                     ${svc.is_active
                                       ? "border-green-700/40 text-green-400"
                                       : "border-red-700/40 text-red-400"}`}>
                      {svc.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Barbers tab */}
        {tab === "barbers" && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-parchment text-xl font-semibold">Barbers</h2>
              <span className="text-parchment/30 text-xs font-body italic">
                Status can be updated from Reception Dashboard
              </span>
            </div>
            {barbers.length === 0 ? (
              <EmptyState message="No barbers configured." />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {barbers.map((b) => (
                  <div key={b.id} className="border border-gold/20 bg-brown/60 p-5">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-full border border-gold/40 flex items-center
                                      justify-center font-heading text-gold font-bold">
                        {b.initials}
                      </div>
                      <div>
                        <h3 className="font-heading text-parchment font-semibold">{b.name}</h3>
                        <p className="text-parchment/50 text-xs font-body italic">
                          {b.specialty ?? "Master Barber"}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-block px-2 py-0.5 text-[10px] font-body
                                     tracking-widest uppercase border
                                     ${b.status === "available"
                                       ? "border-green-700/40 text-green-400"
                                       : b.status === "on_break"
                                       ? "border-amber-700/40 text-amber-500"
                                       : "border-parchment/20 text-parchment/40"}`}>
                      {b.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Stats tab */}
        {tab === "stats" && summary && (
          <div>
            <h2 className="font-heading text-parchment text-xl font-semibold mb-5">
              Today's Statistics
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              <StatCard label="Waiting"       value={summary.total_waiting} />
              <StatCard label="In Service"    value={summary.total_in_service} />
              <StatCard label="Called"        value={summary.total_called} />
              <StatCard label="Avg Wait"      value={`${summary.average_wait_minutes}m`} />
            </div>
            <div className="border border-gold/15 bg-brown/40 p-5">
              <div className="flex items-center justify-between">
                <span className="text-parchment/60 font-body text-sm">Queue Status</span>
                <span className={`px-3 py-1 text-xs font-body tracking-widest uppercase border
                                  ${summary.queue_open
                                    ? "border-green-700/40 text-green-400 bg-green-900/20"
                                    : "border-red-700/40 text-red-400 bg-red-900/20"}`}>
                  {summary.queue_open ? "Open" : "Closed"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Suppress unused import warning — Button is used in the component tree conceptually;
// keeping import in case future inline actions are added.
void Button;

function EmptyState({ message }: { message: string }) {
  return (
    <div className="border border-gold/15 bg-brown/30 py-16 text-center">
      <ScissorsIcon className="w-10 h-10 text-gold/20 mx-auto mb-3" />
      <p className="text-parchment/30 font-body text-sm">{message}</p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-gold/15 bg-brown/40 p-5 text-center">
      <span className="text-parchment/40 text-[10px] tracking-widest uppercase font-body block mb-2">
        {label}
      </span>
      <span className="font-heading text-parchment font-bold text-3xl">{value}</span>
    </div>
  );
}
