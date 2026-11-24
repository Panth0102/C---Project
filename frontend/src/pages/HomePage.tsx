/**
 * Screen 1 — Home / Landing Page
 * Vintage barbershop landing: hero, live queue status, services, barbers, hours.
 */

import { Link } from "react-router-dom";
import {
  ScissorsIcon,
  RazorIcon,
  BarberPoleIcon,
  CrownIcon,
  ClockIcon,
  UsersIcon,
} from "@/components/ui/VintageIcons";
import { Button } from "@/components/ui/Button";
import { BARBERS, OPENING_HOURS, QUEUE_SNAPSHOT, SERVICES } from "@/data/salon";

// ── Decorative helpers ─────────────────────────────────────────────────────

function OrnamentDivider({ label }: { label?: string }) {
  return (
    <div className="ornament-line my-10" role="presentation">
      <ScissorsIcon className="w-4 h-4 text-gold/40 shrink-0 rotate-180" aria-hidden="true" />
      {label && (
        <span className="text-gold/50 text-[10px] tracking-widest2 uppercase font-body shrink-0 px-2">
          {label}
        </span>
      )}
      <ScissorsIcon className="w-4 h-4 text-gold/40 shrink-0" aria-hidden="true" />
    </div>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="text-center mb-10">
      <p className="text-copper text-[11px] tracking-widest2 uppercase font-body mb-2">{eyebrow}</p>
      <h2 className="font-heading text-parchment text-3xl sm:text-4xl font-bold leading-tight">
        {title}
      </h2>
      <div className="mt-4 flex justify-center">
        <div className="h-px w-16 bg-gold/40" />
        <div className="mx-2 text-gold/50 text-xs">✦</div>
        <div className="h-px w-16 bg-gold/40" />
      </div>
    </div>
  );
}

// ── Hero emblem SVG ────────────────────────────────────────────────────────

function HeroEmblem() {
  return (
    <div className="relative mx-auto w-44 h-44 sm:w-56 sm:h-56" aria-hidden="true">
      {/* Outer ring */}
      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full text-gold/60">
        <circle cx="100" cy="100" r="95" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 3" />
        <circle cx="100" cy="100" r="85" fill="none" stroke="currentColor" strokeWidth="0.5" />
      </svg>
      {/* Inner filled circle */}
      <div className="absolute inset-6 rounded-full bg-brown border border-gold/40
                      flex flex-col items-center justify-center gap-1">
        <ScissorsIcon className="w-8 h-8 text-gold" />
        <span className="font-heading text-gold text-xs tracking-widest uppercase leading-none">
          Sovereign
        </span>
        <div className="w-8 h-px bg-gold/40" />
        <span className="font-body text-parchment/60 text-[9px] tracking-widest2 uppercase">
          Est. 1924
        </span>
      </div>
      {/* Cardinal dots */}
      {[0, 90, 180, 270].map((deg) => (
        <div
          key={deg}
          className="absolute w-2 h-2 rounded-full bg-gold/50"
          style={{
            top:  `calc(50% + ${Math.cos((deg * Math.PI) / 180) * 92}px - 4px)`,
            left: `calc(50% + ${Math.sin((deg * Math.PI) / 180) * 92}px - 4px)`,
          }}
        />
      ))}
    </div>
  );
}

// ── Live Queue Status Bar ──────────────────────────────────────────────────

function QueueStatusBar() {
  const { waiting, estimatedWaitMinutes, nextAvailableIn } = QUEUE_SNAPSHOT;
  return (
    <div
      className="bg-brown/80 border border-gold/20 px-6 py-4
                 flex flex-wrap gap-6 justify-center items-center"
      aria-label="Live queue status"
    >
      <div className="flex items-center gap-2 text-parchment/90">
        {/* Pulsing live dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-copper opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-copper" />
        </span>
        <span className="text-xs font-body tracking-widest uppercase text-copper">Live</span>
      </div>

      <Stat icon={<UsersIcon className="w-4 h-4 text-gold" />} label="Waiting" value={waiting} />
      <div className="hidden sm:block h-6 w-px bg-gold/20" />
      <Stat icon={<ClockIcon className="w-4 h-4 text-gold" />} label="Est. Wait" value={`${estimatedWaitMinutes} min`} />
      <div className="hidden sm:block h-6 w-px bg-gold/20" />
      <Stat icon={<ClockIcon className="w-4 h-4 text-gold" />} label="Next Slot" value={`${nextAvailableIn} min`} />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <div>
        <span className="text-parchment/50 text-[10px] tracking-widest uppercase font-body block leading-none">
          {label}
        </span>
        <span className="text-parchment font-heading font-bold text-base leading-tight">
          {value}
        </span>
      </div>
    </div>
  );
}

// ── Services section ───────────────────────────────────────────────────────

function ServicesSection() {
  return (
    <section id="services" className="py-20 bg-brown/40 grain-overlay">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Our Craft" title="Services & Pricing" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((svc) => (
            <article
              key={svc.id}
              className="bg-olive border border-gold/20 hover:border-gold/50 transition-colors p-6 group"
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl" role="img" aria-hidden="true">{svc.icon}</span>
                <span className="font-heading text-gold font-bold text-xl">
                  ₹{svc.price}
                </span>
              </div>
              <h3 className="font-heading text-parchment font-semibold text-lg mb-1 group-hover:text-gold transition-colors">
                {svc.name}
              </h3>
              <p className="text-parchment/50 text-sm font-body leading-relaxed mb-3">
                {svc.description}
              </p>
              <div className="flex items-center gap-1.5 text-parchment/40 text-xs font-body tracking-wide">
                <ClockIcon className="w-3.5 h-3.5" aria-hidden="true" />
                {svc.duration} minutes
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Barbers section ────────────────────────────────────────────────────────

function BarbersSection() {
  return (
    <section id="barbers" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Meet the Masters" title="Our Barbers" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {BARBERS.map((barber) => (
            <article
              key={barber.id}
              className="bg-brown/60 border border-gold/20 p-6 text-center
                         hover:border-gold/50 transition-colors group"
            >
              {/* Avatar with brass frame */}
              <div className="relative mx-auto mb-4 w-20 h-20">
                <div className="w-full h-full rounded-full border-2 border-gold/50
                                bg-olive flex items-center justify-center group-hover:border-gold
                                transition-colors">
                  <span className="font-heading text-gold font-bold text-xl tracking-wide">
                    {barber.avatarInitials}
                  </span>
                </div>
                {/* Availability dot */}
                <span
                  className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-brown
                               ${barber.available ? "bg-green-500" : "bg-parchment/30"}`}
                  aria-label={barber.available ? "Available" : "Unavailable"}
                />
              </div>
              <h3 className="font-heading text-parchment font-semibold text-base mb-0.5">
                {barber.name}
              </h3>
              <p className="text-parchment/50 text-xs font-body italic mb-3">
                {barber.specialty}
              </p>
              {barber.available ? (
                <div className="flex items-center justify-center gap-1.5">
                  <span className="inline-block w-2 h-2 rounded-full bg-gold" aria-hidden="true" />
                  <span className="text-gold text-xs font-body tracking-wide uppercase">
                    {barber.currentQueue === 0 ? "Ready Now" : `${barber.currentQueue} ahead`}
                  </span>
                </div>
              ) : (
                <span className="text-parchment/30 text-xs font-body tracking-wide uppercase">
                  On Break
                </span>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Hours section ──────────────────────────────────────────────────────────

function HoursSection() {
  return (
    <section id="about" className="py-20 bg-brown/40">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
        <SectionHeading eyebrow="When We're Open" title="Opening Hours" />
        <div className="border border-gold/20 divide-y divide-gold/10">
          {OPENING_HOURS.map(({ day, hours }) => (
            <div
              key={day}
              className="flex justify-between items-center px-6 py-4
                         hover:bg-olive/50 transition-colors"
            >
              <span className="text-parchment/70 text-sm font-body tracking-wide">{day}</span>
              <span className="text-gold font-heading font-semibold text-sm">{hours}</span>
            </div>
          ))}
        </div>
        <p className="mt-6 text-parchment/40 text-xs font-body italic">
          Walk-ins welcome. Online queue recommended to avoid waiting.
        </p>
      </div>
    </section>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────

export function HomePage() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════
          HERO SECTION
          Dark olive bg with photographic atmosphere via CSS gradient,
          centred emblem, large display heading.
      ══════════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden"
        aria-label="Hero"
      >
        {/* Background: dark olive with radial vignette */}
        <div
          className="absolute inset-0 bg-olive grain-overlay"
          aria-hidden="true"
        >
          {/* Atmospheric gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(52,41,31,0.55)_0%,rgba(41,41,31,0.9)_100%)]" />
          {/* Atmospheric side shadows */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-olive to-transparent opacity-80" />
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-olive to-transparent opacity-80" />
          {/* Subtle warm light center */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_50%_30%,rgba(195,154,90,0.08)_0%,transparent_70%)]" />
        </div>

        {/* Top decorative rule */}
        <div className="absolute top-8 left-0 right-0 flex justify-center" aria-hidden="true">
          <div className="flex items-center gap-4 opacity-30">
            <div className="h-px w-24 sm:w-40 bg-gold" />
            <span className="text-gold text-xs">✦</span>
            <div className="h-px w-24 sm:w-40 bg-gold" />
          </div>
        </div>

        {/* Centre content */}
        <div className="relative z-10 flex flex-col items-center text-center px-4 py-16">
          {/* Eyebrow */}
          <p className="text-copper text-[11px] sm:text-xs tracking-widest2 uppercase font-body mb-6">
            Premium Grooming · Est. 1924 · Ahmedabad
          </p>

          {/* Circular emblem */}
          <HeroEmblem />

          {/* Main title */}
          <h1 className="mt-6 font-heading font-black text-parchment leading-none tracking-tight
                         text-5xl sm:text-7xl lg:text-8xl">
            The Sovereign
            <br />
            <span className="text-gold italic">Blade</span>
          </h1>

          {/* Tagline */}
          <p className="mt-5 font-display italic text-parchment/70 text-lg sm:text-2xl max-w-md">
            Where every gentleman deserves a royal experience.
          </p>

          {/* Ornament */}
          <div className="mt-6 flex items-center gap-3 text-gold/40" aria-hidden="true">
            <RazorIcon className="w-5 h-5" />
            <div className="h-px w-10 bg-gold/30" />
            <span className="text-xs">✦</span>
            <div className="h-px w-10 bg-gold/30" />
            <ScissorsIcon className="w-5 h-5" />
          </div>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center">
            <Link to="/join">
              <Button variant="primary" size="lg">
                <BarberPoleIcon className="w-4 h-4" aria-hidden="true" />
                Join Queue Now
              </Button>
            </Link>
            <a href="#services">
              <Button variant="secondary" size="lg">
                View Services
              </Button>
            </a>
          </div>

          {/* Quick nav links */}
          <nav className="mt-10 flex gap-6 sm:gap-10" aria-label="Quick links">
            {["Services", "Barbers", "About"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-parchment/40 hover:text-parchment/80 text-xs tracking-widest
                           uppercase font-body border-b border-transparent hover:border-parchment/30
                           pb-0.5 transition-all"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Bottom decorative rule */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center" aria-hidden="true">
          <div className="flex items-center gap-4 opacity-30">
            <div className="h-px w-24 sm:w-40 bg-gold" />
            <span className="text-gold text-xs">✦</span>
            <div className="h-px w-24 sm:w-40 bg-gold" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-16 flex flex-col items-center gap-1 opacity-30 animate-bounce"
          aria-hidden="true"
        >
          <div className="h-8 w-px bg-parchment" />
          <span className="text-parchment text-[9px] tracking-widest uppercase font-body">Scroll</span>
        </div>
      </section>

      {/* ══ Live queue status ══════════════════════════════════════════ */}
      <QueueStatusBar />

      {/* ══ Services ═══════════════════════════════════════════════════ */}
      <ServicesSection />

      <OrnamentDivider />

      {/* ══ Barbers ════════════════════════════════════════════════════ */}
      <BarbersSection />

      <OrnamentDivider />

      {/* ══ Hours ══════════════════════════════════════════════════════ */}
      <HoursSection />

      {/* ══ Bottom CTA banner ══════════════════════════════════════════ */}
      <section className="bg-copper/10 border-y border-copper/30 py-16 grain-overlay">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <CrownIcon className="w-10 h-10 text-gold/50 mx-auto mb-4" aria-hidden="true" />
          <h2 className="font-heading text-parchment text-3xl sm:text-4xl font-bold mb-3">
            Ready for Your Royal Shave?
          </h2>
          <p className="text-parchment/60 font-body text-base mb-8 leading-relaxed">
            Skip the wait. Join the queue online and we'll have your chair ready when you arrive.
          </p>
          <Link to="/join">
            <Button variant="primary" size="lg">
              <BarberPoleIcon className="w-4 h-4" aria-hidden="true" />
              Secure Your Spot
            </Button>
          </Link>
        </div>
      </section>
    </>
  );
}
