import { useState } from "react";
import { Link } from "react-router-dom";
import { ScissorsIcon } from "@/components/ui/VintageIcons";

const NAV_LINKS = [
  { to: "/#services",  label: "Services" },
  { to: "/#barbers",   label: "Barbers"  },
  { to: "/#about",     label: "About"    },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-olive/95 backdrop-blur-sm border-b border-gold/20">
      {/* Top decorative strip */}
      <div className="bg-copper/90 h-0.5 w-full" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* ── Logo / Emblem ─────────────────────────────────────── */}
          <Link
            to="/"
            className="flex items-center gap-3 group"
            aria-label="The Sovereign Blade — Home"
          >
            <div className="w-9 h-9 rounded-full border-2 border-gold/70 flex items-center justify-center
                            group-hover:border-gold transition-colors bg-brown/60">
              <ScissorsIcon className="w-4 h-4 text-gold" aria-hidden="true" />
            </div>
            <div className="hidden sm:block">
              <span className="font-heading font-bold text-parchment text-lg leading-none tracking-wide
                               group-hover:text-gold transition-colors">
                The Sovereign Blade
              </span>
              <span className="block text-gold/70 text-[9px] tracking-widest2 uppercase font-body">
                Est. 1924
              </span>
            </div>
          </Link>

          {/* ── Desktop nav ───────────────────────────────────────── */}
          <nav aria-label="Main navigation" className="hidden md:block">
            <ul className="flex items-center gap-8">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <a
                    href={to}
                    className="text-parchment/70 hover:text-gold font-body text-sm tracking-widest
                               uppercase transition-colors border-b border-transparent hover:border-gold/40 pb-0.5"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Right: language toggle + CTA ─────────────────────── */}
          <div className="flex items-center gap-3">
            {/* Language toggle — stamp style */}
            <button
              aria-label="Toggle language"
              className="stamp-circle w-8 h-8 text-[10px] tracking-wider hover:bg-gold/10 transition-colors"
            >
              EN
            </button>

            {/* Join Queue CTA */}
            <Link
              to="/join"
              className="hidden sm:inline-flex items-center gap-2 bg-copper text-cream
                         border border-copper hover:bg-copper/80 hover:border-gold
                         font-body font-bold text-xs uppercase tracking-widest
                         px-5 py-2 transition-all"
            >
              Join Queue
            </Link>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-parchment/70 hover:text-gold transition-colors"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle mobile menu"
              aria-expanded={menuOpen}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" viewBox="0 0 24 24" aria-hidden="true">
                {menuOpen ? (
                  <><line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" /></>
                ) : (
                  <><line x1="4" y1="8" x2="20" y2="8" /><line x1="4" y1="16" x2="20" y2="16" /></>
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* ── Mobile menu ───────────────────────────────────────────── */}
        {menuOpen && (
          <nav className="md:hidden border-t border-gold/20 py-4" aria-label="Mobile navigation">
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map(({ to, label }) => (
                <li key={to}>
                  <a
                    href={to}
                    onClick={() => setMenuOpen(false)}
                    className="block px-2 py-2 text-parchment/70 hover:text-gold font-body
                               text-sm tracking-widest uppercase transition-colors"
                  >
                    {label}
                  </a>
                </li>
              ))}
              <li className="mt-3 pt-3 border-t border-gold/20">
                <Link
                  to="/join"
                  onClick={() => setMenuOpen(false)}
                  className="block text-center bg-copper text-cream font-body font-bold
                             text-xs uppercase tracking-widest py-3 hover:bg-copper/80"
                >
                  Join Queue
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>

      {/* Bottom decorative strip */}
      <div className="bg-copper/90 h-0.5 w-full" />
    </header>
  );
}
