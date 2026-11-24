/**
 * Walk-In Registration Page /walk-in
 *
 * Self-service registration for walk-in customers
 * Faster flow than the standard join queue (direct to details form)
 */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import {
  CheckIcon, ClockIcon, BarberPoleIcon,
} from "@/components/ui/VintageIcons";
import { queueService } from "@/services/queueService";
import { getErrorMessage } from "@/utils/errorHandler";
import type { ApiService } from "@/types/api";

export function WalkInRegistrationPage() {
  const navigate = useNavigate();

  // Form state
  const [name, setName]                 = useState("");
  const [phone, setPhone]              = useState("");
  const [serviceIds, setServiceIds]    = useState<number[]>([]);
  const [services, setServices]        = useState<ApiService[]>([]);

  // UI state
  const [loading, setLoading]          = useState(true);
  const [submitting, setSubmitting]    = useState(false);
  const [error, setError]              = useState<string | null>(null);
  const [fieldErrors, setFieldErrors]  = useState<Record<string, string>>({});
  const [showConfirm, setShowConfirm]  = useState(false);

  // Load services on mount
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const svcs = await queueService.getServices();
        setServices(svcs);
        setLoading(false);
      } catch (e) {
        setError(getErrorMessage(e));
        setLoading(false);
      }
    };
    void fetchServices();
  }, []);

  // Validation helpers
  const validatePhone = (p: string): string | null => {
    const digits = p.replace(/\s+/g, "");
    if (!digits) return "Phone number is required.";
    if (!/^[6-9]\d{9}$/.test(digits))
      return "Enter a valid 10-digit Indian mobile number.";
    return null;
  };

  const validateName = (n: string): string | null => {
    if (!n.trim()) return "Name is required.";
    if (n.trim().length < 2) return "Name must be at least 2 characters.";
    return null;
  };

  const validateServices = (ids: number[]): string | null => {
    if (ids.length === 0) return "Select at least one service.";
    if (ids.length > 3) return "You can select a maximum of 3 services.";
    return null;
  };

  // Service toggle
  const toggleService = (id: number) => {
    setServiceIds((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  // Validate and proceed
  const handleNext = () => {
    setFieldErrors({});
    const errors: Record<string, string> = {};

    const nameErr = validateName(name);
    if (nameErr) errors.name = nameErr;

    const phoneErr = validatePhone(phone);
    if (phoneErr) errors.phone = phoneErr;

    const svcErr = validateServices(serviceIds);
    if (svcErr) errors.services = svcErr;

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setShowConfirm(true);
  };

  // Submit
  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const result = await queueService.addWalkIn({
        customer_name: name.trim(),
        phone: phone.replace(/\D/g, ""),
        service_ids: serviceIds,
        barber_id: null, // Walk-in gets auto-assigned
      });

      // Success — navigate to customer status
      navigate(`/status/${result.token}`, { replace: true });
    } catch (e) {
      const msg = getErrorMessage(e);
      if (msg.includes("already exists") || msg.includes("already active")) {
        setError(
          "You already have an active queue entry. Please complete or cancel it first."
        );
      } else {
        setError(msg);
      }
      setShowConfirm(false);
    } finally {
      setSubmitting(false);
    }
  };

  // Computed
  const selectedServices = services.filter((s) => serviceIds.includes(s.id));
  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0);
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-olive flex items-center justify-center">
        <div className="text-center">
          <BarberPoleIcon className="w-10 h-10 text-gold/40 mx-auto mb-3 animate-bounce" />
          <p className="text-parchment/50 font-body text-sm uppercase tracking-widest">
            Loading services…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-olive text-parchment">
      {/* Header */}
      <div className="bg-brown/60 border-b border-gold/20 py-8 text-center">
        <p className="text-copper text-[11px] tracking-widest2 uppercase font-body mb-2">
          Welcome to The Sovereign Blade
        </p>
        <h1 className="font-heading text-parchment text-3xl sm:text-4xl font-bold">
          Walk-In Registration
        </h1>
        <p className="text-parchment/50 font-body text-sm mt-2">
          Quick registration — join the queue now
        </p>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Error banner */}
        {error && (
          <div
            role="alert"
            className="mb-6 bg-red-900/30 border border-red-700/40 text-red-300
                       text-sm font-body px-4 py-3"
          >
            {error}
          </div>
        )}

        {/* Form */}
        {!showConfirm ? (
          <div className="space-y-6">
            {/* Name field */}
            <div>
              <label
                htmlFor="walkin-name"
                className="block text-parchment/80 text-xs tracking-widest uppercase font-body mb-2"
              >
                Your Name <span className="text-copper" aria-hidden="true">*</span>
              </label>
              <input
                id="walkin-name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="e.g. Arjun Sharma"
                className="vintage-input w-full"
                autoComplete="name"
                aria-required="true"
              />
              {fieldErrors.name && (
                <p className="mt-1.5 text-copper text-xs font-body">{fieldErrors.name}</p>
              )}
            </div>

            {/* Phone field */}
            <div>
              <label
                htmlFor="walkin-phone"
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
                  id="walkin-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                    if (fieldErrors.phone)
                      setFieldErrors((prev) => ({ ...prev, phone: "" }));
                  }}
                  placeholder="9876543210"
                  className="vintage-input flex-1"
                  inputMode="numeric"
                  maxLength={10}
                  autoComplete="tel-national"
                  aria-required="true"
                />
              </div>
              {fieldErrors.phone && (
                <p className="mt-1.5 text-copper text-xs font-body">{fieldErrors.phone}</p>
              )}
              <p className="mt-1.5 text-parchment/30 text-xs font-body">
                10 digits, starting with 6–9. We'll text you updates.
              </p>
            </div>

            {/* Services field */}
            <div>
              <label className="block text-parchment/80 text-xs tracking-widest uppercase font-body mb-3">
                Select Services <span className="text-copper" aria-hidden="true">*</span>
              </label>
              <div className="space-y-2">
                {services.length === 0 ? (
                  <p className="text-parchment/40 text-sm font-body italic">
                    No services available.
                  </p>
                ) : (
                  services.map((svc) => {
                    const isSelected = serviceIds.includes(svc.id);
                    const isDisabled = !isSelected && serviceIds.length >= 3;
                    return (
                      <button
                        key={svc.id}
                        type="button"
                        onClick={() => !isDisabled && toggleService(svc.id)}
                        disabled={isDisabled}
                        aria-pressed={isSelected}
                        className={[
                          "w-full text-left p-4 border transition-all",
                          isSelected
                            ? "border-copper bg-copper/15"
                            : isDisabled
                            ? "border-gold/10 opacity-40 cursor-not-allowed"
                            : "border-gold/20 hover:border-gold/40 hover:bg-brown/60",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <span className="font-heading text-parchment font-semibold text-sm block">
                              {svc.name}
                            </span>
                            <p className="text-parchment/50 text-xs mt-1 leading-relaxed">
                              {svc.description}
                            </p>
                            <div className="flex items-center gap-1.5 text-parchment/40 text-xs mt-2">
                              <ClockIcon className="w-3 h-3" aria-hidden="true" />
                              {svc.duration} min
                            </div>
                          </div>
                          <div className="ml-4 text-right shrink-0">
                            <span className="font-heading font-bold text-gold text-base">
                              ₹{svc.price}
                            </span>
                            {isSelected && (
                              <div className="w-5 h-5 rounded-full bg-copper flex items-center
                                            justify-center ml-auto mt-2">
                                <CheckIcon className="w-3 h-3 text-cream" aria-hidden="true" />
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
              {fieldErrors.services && (
                <p className="mt-2 text-copper text-xs font-body">{fieldErrors.services}</p>
              )}
              {serviceIds.length === 3 && (
                <p className="mt-2 text-gold/70 text-xs font-body">
                  ✓ Maximum 3 services selected.
                </p>
              )}
            </div>

            {/* Summary */}
            {selectedServices.length > 0 && (
              <div className="border border-gold/20 bg-brown/40 p-4">
                <h3 className="font-heading text-parchment/80 text-xs tracking-widest uppercase mb-3">
                  Your Selection
                </h3>
                <div className="space-y-2 text-sm font-body">
                  {selectedServices.map((s) => (
                    <div key={s.id} className="flex justify-between text-parchment/70">
                      <span>{s.name}</span>
                      <span className="text-gold">₹{s.price}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-gold/15 flex justify-between font-heading font-bold">
                    <span className="text-parchment/70">Total</span>
                    <span className="text-gold text-lg">₹{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-parchment/60 text-xs">
                    <span>Est. Duration</span>
                    <span>{totalDuration} min</span>
                  </div>
                </div>
              </div>
            )}

            {/* Submit button */}
            <Button
              size="lg"
              variant="primary"
              onClick={handleNext}
              disabled={!name.trim() || !phone || serviceIds.length === 0}
              className="w-full"
            >
              Continue
            </Button>

            {/* Back link */}
            <div className="text-center">
              <a
                href="/"
                className="text-parchment/50 hover:text-parchment/80 text-xs font-body
                           tracking-widest uppercase border-b border-transparent hover:border-parchment/40
                           pb-0.5 transition-all"
              >
                Back to Home
              </a>
            </div>
          </div>
        ) : (
          /* Confirmation screen */
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="font-heading text-parchment text-2xl font-bold mb-2">
                Confirm Your Registration
              </h2>
              <p className="text-parchment/50 font-body text-sm">
                Review your details before joining the queue
              </p>
            </div>

            {/* Summary card */}
            <div className="border-2 border-copper bg-copper/10 p-6 space-y-4">
              <div>
                <p className="text-copper text-xs tracking-widest uppercase font-body mb-1">
                  Name
                </p>
                <p className="font-heading font-semibold text-parchment text-lg">{name}</p>
              </div>
              <div>
                <p className="text-copper text-xs tracking-widest uppercase font-body mb-1">
                  Phone
                </p>
                <p className="font-heading font-semibold text-parchment text-lg">
                  +91 {phone}
                </p>
              </div>
              <div className="pt-3 border-t border-copper/20">
                <p className="text-copper text-xs tracking-widest uppercase font-body mb-2">
                  Services ({selectedServices.length})
                </p>
                <ul className="space-y-1">
                  {selectedServices.map((s) => (
                    <li key={s.id} className="text-parchment/80 text-sm flex justify-between">
                      <span>{s.name}</span>
                      <span className="text-gold">₹{s.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="pt-3 border-t border-copper/20 flex justify-between">
                <span className="text-parchment/70 font-body text-sm uppercase tracking-widest">
                  Total
                </span>
                <span className="text-gold font-heading font-bold text-xl">₹{totalPrice}</span>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-brown/60 border border-gold/20 p-4">
              <p className="text-parchment/70 text-sm font-body leading-relaxed">
                <span className="text-gold font-semibold">What happens next?</span> You'll receive
                a unique token. Keep it handy. We'll text you when your turn is coming up,
                and display your token on the waiting room screen.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                size="lg"
                variant="ghost"
                onClick={() => setShowConfirm(false)}
                disabled={submitting}
                className="flex-1"
              >
                Go Back
              </Button>
              <Button
                size="lg"
                variant="primary"
                onClick={() => void handleSubmit()}
                loading={submitting}
                className="flex-1"
              >
                Join Queue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
