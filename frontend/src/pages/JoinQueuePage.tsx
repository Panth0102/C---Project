/**
 * Screen 2 — Join Queue / Customer Registration
 * Three-step stepper: Select Services → Choose Barber → Confirm & Submit
 *
 * Uses real API data for services and barbers so IDs are integers and
 * match what the backend QueueCreate schema expects.
 */

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import {
  BarberPoleIcon,
  CheckIcon,
  ClockIcon,
  ScissorsIcon,
  XIcon,
} from "@/components/ui/VintageIcons";
import { queueService } from "@/services/queueService";
import { getErrorMessage } from "@/utils/errorHandler";
import type { ApiBarber, ApiService } from "@/types/api";

// ── Constants ─────────────────────────────────────────────────────────────
const MAX_SERVICES = 3;
const STEPS = ["Select Services", "Choose Barber", "Your Details"] as const;
type Step = 0 | 1 | 2;

// ── Validation helpers ────────────────────────────────────────────────────
function validatePhone(phone: string): string | null {
  const stripped = phone.replace(/\s+/g, "");
  if (!stripped) return "Mobile number is required.";
  if (!/^[6-9]\d{9}$/.test(stripped))
    return "Enter a valid 10-digit Indian mobile number (starting 6–9).";
  return null;
}

function validateName(name: string): string | null {
  if (!name.trim()) return "Name is required.";
  if (name.trim().length < 2) return "Name must be at least 2 characters.";
  return null;
}

// ── Shared section header ─────────────────────────────────────────────────
function StepHeader({
  step,
  title,
  subtitle,
}: {
  step: number;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-8">
      <p className="text-copper text-[10px] tracking-widest2 uppercase font-body mb-1">
        Step {step} of {STEPS.length}
      </p>
      <h2 className="font-heading text-parchment text-2xl sm:text-3xl font-bold">{title}</h2>
      {subtitle && (
        <p className="text-parchment/50 text-sm font-body mt-1">{subtitle}</p>
      )}
    </div>
  );
}

// ── Step 1: Service selection ─────────────────────────────────────────────
function ServiceStep({
  services,
  selected,
  onToggle,
}: {
  services: ApiService[];
  selected: number[];
  onToggle: (id: number) => void;
}) {
  return (
    <div>
      <StepHeader
        step={1}
        title="Select Services"
        subtitle={`Choose up to ${MAX_SERVICES} services. Select at least one to continue.`}
      />

      {selected.length === MAX_SERVICES && (
        <div
          role="status"
          className="mb-5 flex items-center gap-2 bg-copper/15 border border-copper/40
                     text-copper text-sm font-body px-4 py-3"
        >
          <span className="text-base" aria-hidden="true">⚠</span>
          Maximum {MAX_SERVICES} services selected. Deselect one to change.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {services.map((svc) => {
          const isSelected = selected.includes(svc.id);
          const isDisabled = !isSelected && selected.length >= MAX_SERVICES;
          return (
            <button
              key={svc.id}
              type="button"
              onClick={() => !isDisabled && onToggle(svc.id)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={[
                "relative text-left p-5 border transition-all duration-150",
                "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-olive",
                isSelected
                  ? "border-copper bg-copper/15 focus:ring-copper/60"
                  : isDisabled
                  ? "border-gold/10 bg-brown/20 opacity-40 cursor-not-allowed"
                  : "border-gold/20 bg-brown/40 hover:border-gold/50 hover:bg-brown/60 focus:ring-gold/40",
              ].join(" ")}
            >
              {isSelected && (
                <span
                  className="absolute top-3 right-3 w-5 h-5 rounded-full bg-copper
                               flex items-center justify-center"
                >
                  <CheckIcon className="w-3 h-3 text-cream" aria-hidden="true" />
                </span>
              )}
              <div className="flex items-start gap-3">
                <span className="text-xl mt-0.5" role="img" aria-hidden="true">
                  {svc.icon ?? "✂️"}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-heading text-parchment font-semibold text-base">
                      {svc.name}
                    </span>
                    <span className="text-gold font-heading font-bold text-base shrink-0">
                      ₹{svc.price}
                    </span>
                  </div>
                  {svc.description && (
                    <p className="text-parchment/50 text-xs font-body mt-0.5 leading-relaxed">
                      {svc.description}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1.5 text-parchment/40 text-xs font-body">
                    <ClockIcon className="w-3 h-3" aria-hidden="true" />
                    {svc.duration} min
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Step 2: Barber selection ───────────────────────────────────────────────
function BarberStep({
  barbers,
  selectedBarberId,
  onSelect,
  avgQueueLoad,
}: {
  barbers: ApiBarber[];
  selectedBarberId: number | null; // null = any
  onSelect: (id: number | null) => void;
  avgQueueLoad: number;
}) {
  return (
    <div>
      <StepHeader
        step={2}
        title="Choose Your Barber"
        subtitle="Select a preferred barber or let us assign the next available one."
      />

      <div className="space-y-3">
        {/* Any available option */}
        <BarberOption
          id={null}
          name="Any Available Barber"
          specialty="We'll assign the next barber ready to serve you."
          available={true}
          initials="⚜"
          queueLabel={avgQueueLoad === 0 ? "Ready" : `~${avgQueueLoad} ahead`}
          selected={selectedBarberId === null}
          onSelect={onSelect}
        />

        <div className="ornament-line my-4">
          <span className="text-parchment/30 text-[10px] tracking-widest uppercase font-body px-2">
            or choose a specific barber
          </span>
        </div>

        {barbers.map((b) => {
          const available = b.status === "available";
          return (
            <BarberOption
              key={b.id}
              id={b.id}
              name={b.name}
              specialty={b.specialty ?? "Master Barber"}
              available={available}
              initials={b.initials}
              queueLabel={available ? "Available" : "On Break"}
              selected={selectedBarberId === b.id}
              onSelect={onSelect}
            />
          );
        })}
      </div>
    </div>
  );
}

function BarberOption({
  id,
  name,
  specialty,
  available,
  initials,
  queueLabel,
  selected,
  onSelect,
}: {
  id: number | null;
  name: string;
  specialty: string;
  available: boolean;
  initials: string;
  queueLabel: string;
  selected: boolean;
  onSelect: (id: number | null) => void;
}) {
  const disabled = !available;
  return (
    <button
      type="button"
      onClick={() => !disabled && onSelect(id)}
      disabled={disabled}
      aria-pressed={selected}
      className={[
        "w-full text-left flex items-center gap-4 p-4 border transition-all",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-olive",
        selected
          ? "border-copper bg-copper/15 focus:ring-copper/60"
          : disabled
          ? "border-gold/10 bg-brown/20 opacity-40 cursor-not-allowed"
          : "border-gold/20 bg-brown/40 hover:border-gold/40 hover:bg-brown/60 focus:ring-gold/40",
      ].join(" ")}
    >
      <div
        className={`w-12 h-12 rounded-full border-2 flex items-center justify-center shrink-0
                    font-heading font-bold text-sm
                    ${selected ? "border-gold text-gold" : "border-gold/40 text-gold/70"}`}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-heading text-parchment font-semibold text-sm block">{name}</span>
        <span className="text-parchment/50 text-xs font-body italic">{specialty}</span>
      </div>
      <div className="shrink-0 text-right">
        {available ? (
          <>
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5" aria-hidden="true" />
            <span className="text-gold text-xs font-body tracking-wide">{queueLabel}</span>
          </>
        ) : (
          <span className="text-parchment/30 text-xs font-body">On Break</span>
        )}
      </div>
      {selected && (
        <span className="ml-2 w-5 h-5 rounded-full bg-copper flex items-center justify-center shrink-0">
          <CheckIcon className="w-3 h-3 text-cream" aria-hidden="true" />
        </span>
      )}
    </button>
  );
}

// ── Step 3: Customer details ───────────────────────────────────────────────
function DetailsStep({
  name,
  phone,
  nameError,
  phoneError,
  onChange,
}: {
  name: string;
  phone: string;
  nameError: string | null;
  phoneError: string | null;
  onChange: (field: "customerName" | "phone", value: string) => void;
}) {
  return (
    <div>
      <StepHeader
        step={3}
        title="Your Details"
        subtitle="We use your mobile number to send queue updates."
      />
      <div className="space-y-6">
        <div>
          <label
            htmlFor="customer-name"
            className="block text-parchment/80 text-xs tracking-widest uppercase font-body mb-2"
          >
            Full Name <span className="text-copper" aria-hidden="true">*</span>
          </label>
          <input
            id="customer-name"
            type="text"
            value={name}
            onChange={(e) => onChange("customerName", e.target.value)}
            placeholder="e.g. Arjun Sharma"
            className="vintage-input"
            autoComplete="name"
            aria-required="true"
            aria-invalid={!!nameError}
            aria-describedby={nameError ? "name-error" : undefined}
          />
          {nameError && (
            <p id="name-error" role="alert" className="mt-1.5 text-copper text-xs font-body">
              {nameError}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-parchment/80 text-xs tracking-widest uppercase font-body mb-2"
          >
            Mobile Number <span className="text-copper" aria-hidden="true">*</span>
          </label>
          <div className="flex">
            <span
              className="inline-flex items-center px-3 bg-brown border border-gold/40 border-r-0
                         text-parchment/60 text-sm font-body shrink-0"
              aria-label="Country code India +91"
            >
              🇮🇳 +91
            </span>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) =>
                onChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))
              }
              placeholder="9876543210"
              className="vintage-input flex-1"
              inputMode="numeric"
              maxLength={10}
              autoComplete="tel-national"
              aria-required="true"
              aria-invalid={!!phoneError}
              aria-describedby={phoneError ? "phone-error" : undefined}
            />
          </div>
          {phoneError && (
            <p id="phone-error" role="alert" className="mt-1.5 text-copper text-xs font-body">
              {phoneError}
            </p>
          )}
          <p className="mt-1.5 text-parchment/30 text-xs font-body">
            10 digits, starting with 6, 7, 8, or 9. No spaces needed.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Order Summary sidebar ─────────────────────────────────────────────────
function OrderSummary({
  selectedServices,
  barberName,
  totalPrice,
  totalDuration,
  estimatedWait,
}: {
  selectedServices: ApiService[];
  barberName: string;
  totalPrice: number;
  totalDuration: number;
  estimatedWait: number;
}) {
  return (
    <aside
      className="bg-brown border border-gold/20 p-6 h-fit sticky top-24"
      aria-label="Order summary"
    >
      <div className="mb-5 pb-4 border-b border-gold/20">
        <div className="ornament-line">
          <ScissorsIcon className="w-3.5 h-3.5 text-gold/50 rotate-180" aria-hidden="true" />
          <span className="text-gold/50 text-[9px] tracking-widest2 uppercase font-body px-2">
            Your Order
          </span>
          <ScissorsIcon className="w-3.5 h-3.5 text-gold/50" aria-hidden="true" />
        </div>
      </div>

      {selectedServices.length === 0 ? (
        <p className="text-parchment/30 text-xs font-body italic text-center py-4">
          No services selected yet.
        </p>
      ) : (
        <ul className="space-y-3 mb-5">
          {selectedServices.map((svc) => (
            <li key={svc.id} className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <span className="text-parchment text-sm font-body block leading-tight">
                  {svc.name}
                </span>
                <span className="text-parchment/40 text-xs font-body flex items-center gap-1 mt-0.5">
                  <ClockIcon className="w-3 h-3" aria-hidden="true" />
                  {svc.duration} min
                </span>
              </div>
              <span className="text-gold font-heading font-semibold text-sm shrink-0">
                ₹{svc.price}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-gold/20 pt-4 space-y-2">
        <div className="flex justify-between text-xs font-body text-parchment/50">
          <span className="uppercase tracking-wider">Service Duration</span>
          <span className="text-parchment">{totalDuration} min</span>
        </div>
        <div className="flex justify-between text-xs font-body text-parchment/50">
          <span className="uppercase tracking-wider">Est. Queue Wait</span>
          <span className="text-parchment">{estimatedWait} min</span>
        </div>
        <div className="flex justify-between text-xs font-body text-parchment/50">
          <span className="uppercase tracking-wider">Total Time</span>
          <span className="text-parchment">{totalDuration + estimatedWait} min</span>
        </div>
        <div className="flex justify-between pt-2 border-t border-gold/20">
          <span className="text-parchment/70 text-sm font-body uppercase tracking-widest">
            Total
          </span>
          <span className="text-gold font-heading font-bold text-xl">₹{totalPrice}</span>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-gold/20">
        <p className="text-parchment/50 text-[10px] tracking-widest uppercase font-body mb-2">
          Barber
        </p>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-full border border-gold/50 flex items-center
                        justify-center font-heading text-gold text-xs font-bold"
          >
            ⚜
          </div>
          <span className="text-parchment text-sm font-body">{barberName}</span>
        </div>
      </div>
    </aside>
  );
}

// ── Stepper indicator ─────────────────────────────────────────────────────
function StepIndicator({ current }: { current: Step }) {
  return (
    <nav aria-label="Progress" className="mb-10">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map((label, idx) => {
          const done   = idx < current;
          const active = idx === current;
          return (
            <li key={label} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={[
                    "w-9 h-9 rounded-full border-2 flex items-center justify-center",
                    "font-heading font-bold text-sm transition-colors",
                    done
                      ? "border-gold bg-gold text-olive"
                      : active
                      ? "border-copper bg-copper/20 text-copper"
                      : "border-gold/20 bg-transparent text-parchment/30",
                  ].join(" ")}
                  aria-current={active ? "step" : undefined}
                >
                  {done ? <CheckIcon className="w-4 h-4" aria-hidden="true" /> : idx + 1}
                </div>
                <span
                  className={`text-[10px] tracking-widest uppercase font-body hidden sm:block
                              ${active ? "text-copper" : done ? "text-gold" : "text-parchment/30"}`}
                >
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`w-16 sm:w-24 h-px mx-2 mt-[-18px]
                              ${idx < current ? "bg-gold" : "bg-gold/20"}`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// ── Confirmation modal ────────────────────────────────────────────────────
function ConfirmModal({
  services,
  barberName,
  customerName,
  phone,
  totalPrice,
  totalDuration,
  onConfirm,
  onCancel,
  submitting,
}: {
  services: ApiService[];
  barberName: string;
  customerName: string;
  phone: string;
  totalPrice: number;
  totalDuration: number;
  onConfirm: () => void;
  onCancel: () => void;
  submitting: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-olive/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="bg-brown border border-gold/30 w-full max-w-md p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 id="confirm-title" className="font-heading text-parchment text-xl font-bold">
            Confirm Your Booking
          </h3>
          <button
            onClick={onCancel}
            aria-label="Close"
            className="text-parchment/40 hover:text-parchment transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-sm font-body mb-6">
          <Row label="Name"   value={customerName} />
          <Row label="Mobile" value={`+91 ${phone}`} />
          <Row label="Barber" value={barberName} />
          <div className="pt-2 border-t border-gold/20">
            <span className="text-parchment/50 text-xs uppercase tracking-widest block mb-2">
              Services
            </span>
            {services.map((s) => (
              <div key={s.id} className="flex justify-between text-parchment/80 py-1">
                <span>{s.name}</span>
                <span className="text-gold">₹{s.price}</span>
              </div>
            ))}
          </div>
          <div className="pt-2 border-t border-gold/20 flex justify-between">
            <span className="text-parchment/50 uppercase tracking-widest text-xs">Duration</span>
            <span className="text-parchment">{totalDuration} min</span>
          </div>
          <div className="flex justify-between font-bold">
            <span className="text-parchment/70 uppercase tracking-widest text-xs">Total</span>
            <span className="text-gold font-heading text-lg">₹{totalPrice}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="ghost"
            size="md"
            onClick={onCancel}
            className="flex-1"
            disabled={submitting}
          >
            Go Back
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onConfirm}
            loading={submitting}
            className="flex-1"
          >
            Confirm & Join
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-parchment/50 uppercase tracking-widest text-xs">{label}</span>
      <span className="text-parchment">{value}</span>
    </div>
  );
}

// ── Main Page Component ───────────────────────────────────────────────────
export function JoinQueuePage() {
  const navigate = useNavigate();

  // ── API data ───────────────────────────────────────────────
  const [services, setServices]   = useState<ApiService[]>([]);
  const [barbers, setBarbers]     = useState<ApiBarber[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([queueService.getServices(), queueService.getBarbers()])
      .then(([svcs, brbs]) => {
        setServices(svcs);
        setBarbers(brbs);
      })
      .catch((err) => setDataError(getErrorMessage(err)))
      .finally(() => setDataLoading(false));
  }, []);

  // ── Form state ─────────────────────────────────────────────
  const [step, setStep]                   = useState<Step>(0);
  const [selectedServiceIds, setSelected] = useState<number[]>([]);
  const [barberId, setBarberId]           = useState<number | null>(null); // null = any
  const [customerName, setCustomerName]   = useState("");
  const [phone, setPhone]                 = useState("");
  const [nameError, setNameError]         = useState<string | null>(null);
  const [phoneError, setPhoneError]       = useState<string | null>(null);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [submitError, setSubmitError]     = useState<string | null>(null);

  // ── Derived values ─────────────────────────────────────────
  const selectedServices = useMemo(
    () => services.filter((s) => selectedServiceIds.includes(s.id)),
    [services, selectedServiceIds],
  );
  const totalPrice    = selectedServices.reduce((sum, s) => sum + s.price,    0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  // ETA: sum durations of tokens ahead (use backend data once joined;
  // for preview show a rough estimate based on barber queue length)
  const estimatedWait = useMemo(() => {
    if (barberId === null) {
      // Pick the least-loaded available barber's load * average service (8 min)
      return Math.min(...barbers.filter((b) => b.status === "available").map(() => 0), 0) * 8;
    }
    return 0; // backend calculates accurately after join
  }, [barberId, barbers]);

  const selectedBarber = barbers.find((b) => b.id === barberId) ?? null;
  const barberDisplayName = selectedBarber ? selectedBarber.name : "Any Available";

  // Average load across available barbers (for "any" option display)
  const avgQueueLoad = 0; // live load comes from backend; show 0 as placeholder

  // ── Service toggle ─────────────────────────────────────────
  const toggleService = (id: number) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length < MAX_SERVICES
        ? [...prev, id]
        : prev,
    );
  };

  // ── Field change ───────────────────────────────────────────
  const handleFieldChange = (field: "customerName" | "phone", value: string) => {
    if (field === "customerName") {
      setCustomerName(value);
      if (nameError) setNameError(null);
    } else {
      setPhone(value);
      if (phoneError) setPhoneError(null);
    }
  };

  // ── Navigation ─────────────────────────────────────────────
  const goNext = () => {
    if (step === 0 && selectedServiceIds.length === 0) return;
    if (step === 2) {
      const ne = validateName(customerName);
      const pe = validatePhone(phone);
      setNameError(ne);
      setPhoneError(pe);
      if (ne || pe) return;
      setShowConfirm(true);
    } else {
      setStep((s) => (s + 1) as Step);
    }
  };
  const goBack = () => setStep((s) => (s - 1) as Step);

  // ── Submit — sends integer IDs to the real API ─────────────
  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const entry = await queueService.joinQueue({
        customer_name: customerName.trim(),
        phone,
        service_ids: selectedServiceIds,       // already number[] from API data
        barber_id:   barberId,                 // number | null
      });
      // Success: close modal then navigate (keep modal open during the await)
      setShowConfirm(false);
      navigate(`/status/${entry.token}`, { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err);
      setSubmitError(
        msg === "Request failed with status code 409"
          ? "A queue entry with this phone number is already active."
          : msg.includes("timeout") || msg.includes("Network")
          ? "Could not reach the server. Please check your connection and try again."
          : msg,
      );
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Loading / error states for catalogue fetch ─────────────
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-olive flex items-center justify-center">
        <div className="text-center">
          <BarberPoleIcon className="w-10 h-10 text-gold/40 mx-auto mb-4 animate-bounce"
                          aria-hidden="true" />
          <p className="text-parchment/50 font-body text-sm tracking-widest uppercase">
            Loading services…
          </p>
        </div>
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="min-h-screen bg-olive flex flex-col items-center justify-center
                      text-center px-4 py-16">
        <ScissorsIcon className="w-14 h-14 text-gold/30 mx-auto mb-6" aria-hidden="true" />
        <h1 className="font-heading text-parchment text-2xl font-bold mb-2">
          Could not load services
        </h1>
        <p className="text-parchment/50 font-body text-sm max-w-sm leading-relaxed mb-8">
          {dataError}
        </p>
        <Button variant="primary" onClick={() => window.location.reload()}>
          Retry
        </Button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-olive grain-overlay">
      <div className="bg-brown/60 border-b border-gold/20 py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-copper text-[11px] tracking-widest2 uppercase font-body mb-1">
            The Sovereign Blade
          </p>
          <h1 className="font-heading text-parchment text-3xl sm:text-4xl font-bold">
            Join the Queue
          </h1>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
        <StepIndicator current={step} />

        {submitError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 bg-red-900/30 border border-red-700/50
                       text-red-200 text-sm font-body px-4 py-3"
          >
            <span className="text-lg shrink-0" aria-hidden="true">⚠</span>
            <div>
              <p className="font-semibold">Could not join queue</p>
              <p className="mt-0.5 text-red-300/80">{submitError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-brown/40 border border-gold/15 p-6 sm:p-8">
            {step === 0 && (
              <ServiceStep
                services={services}
                selected={selectedServiceIds}
                onToggle={toggleService}
              />
            )}
            {step === 1 && (
              <BarberStep
                barbers={barbers}
                selectedBarberId={barberId}
                onSelect={setBarberId}
                avgQueueLoad={avgQueueLoad}
              />
            )}
            {step === 2 && (
              <DetailsStep
                name={customerName}
                phone={phone}
                nameError={nameError}
                phoneError={phoneError}
                onChange={handleFieldChange}
              />
            )}

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gold/15">
              <div>
                {step > 0 && (
                  <Button variant="ghost" size="md" onClick={goBack} disabled={submitting}>
                    ← Back
                  </Button>
                )}
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={goNext}
                disabled={submitting || (step === 0 && selectedServiceIds.length === 0)}
              >
                {step === 2 ? "Review Order →" : "Continue →"}
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <OrderSummary
              selectedServices={selectedServices}
              barberName={barberDisplayName}
              totalPrice={totalPrice}
              totalDuration={totalDuration}
              estimatedWait={estimatedWait}
            />
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          services={selectedServices}
          barberName={barberDisplayName}
          customerName={customerName}
          phone={phone}
          totalPrice={totalPrice}
          totalDuration={totalDuration}
          onConfirm={() => void handleSubmit()}
          onCancel={() => setShowConfirm(false)}
          submitting={submitting}
        />
      )}
    </div>
  );
}
