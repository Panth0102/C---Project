import { Link } from "react-router-dom";
import { ScissorsIcon, BarberPoleIcon } from "@/components/ui/VintageIcons";

export function Footer() {
  return (
    <footer className="bg-brown border-t border-gold/20 grain-overlay">
      <div className="border-t-2 border-copper/60 mx-0" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Ornamental header */}
        <div className="ornament-line mb-8">
          <ScissorsIcon className="w-5 h-5 text-gold/50 rotate-180" aria-hidden="true" />
          <span className="text-gold/50 text-xs tracking-widest2 uppercase font-body">
            The Sovereign Blade
          </span>
          <ScissorsIcon className="w-5 h-5 text-gold/50" aria-hidden="true" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* About */}
          <div>
            <h3 className="font-heading text-gold text-sm tracking-widest uppercase mb-4">
              About The Shop
            </h3>
            <p className="text-parchment/60 text-sm font-body leading-relaxed">
              A century of craft. The Sovereign Blade has served discerning gentlemen
              with precision cuts, royal shaves, and old-world hospitality since 1924.
            </p>
          </div>

          {/* Customer links */}
          <div>
            <h3 className="font-heading text-gold text-sm tracking-widest uppercase mb-4">
              Customers
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Join Queue",       to: "/join"     },
                { label: "Walk-In Register", to: "/walk-in"  },
                { label: "Services",         to: "/#services"},
                { label: "Our Barbers",      to: "/#barbers" },
                { label: "About",            to: "/#about"   },
              ].map(({ label, to }) => (
                <li key={to}>
                  <a
                    href={to}
                    className="text-parchment/60 hover:text-gold text-sm font-body
                               transition-colors uppercase tracking-widest"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Staff links */}
          <div>
            <h3 className="font-heading text-gold text-sm tracking-widest uppercase mb-4">
              Staff
            </h3>
            <ul className="space-y-2">
              {[
                { label: "Reception",      to: "/reception"       },
                { label: "Waiting Display",to: "/display"         },
                { label: "Admin",          to: "/admin"           },
                { label: "Rajan Mehta",    to: "/barber/Rajan Mehta" },
                { label: "Arjun Shah",     to: "/barber/Arjun Shah"  },
                { label: "Dev Patel",      to: "/barber/Dev Patel"   },
                { label: "Kiran Joshi",    to: "/barber/Kiran Joshi" },
              ].map(({ label, to }) => (
                <li key={to}>
                  <Link
                    to={to}
                    className="text-parchment/60 hover:text-gold text-sm font-body
                               transition-colors uppercase tracking-widest"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-heading text-gold text-sm tracking-widest uppercase mb-4">
              Visit Us
            </h3>
            <address className="not-italic text-parchment/60 text-sm font-body space-y-1 leading-relaxed">
              <p>12 Barber Lane, Navrangpura</p>
              <p>Ahmedabad, Gujarat 380009</p>
              <p className="mt-2">
                <a href="tel:+917940012345" className="hover:text-gold transition-colors">
                  +91 79 4001 2345
                </a>
              </p>
              <p>
                <a href="mailto:sovereign@blade.in" className="hover:text-gold transition-colors">
                  sovereign@blade.in
                </a>
              </p>
            </address>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-gold/20 flex flex-col sm:flex-row
                        items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-parchment/40 text-xs font-body tracking-widest">
            <BarberPoleIcon className="w-4 h-4 text-gold/30" aria-hidden="true" />
            <span>© {new Date().getFullYear()} The Sovereign Blade. All rights reserved.</span>
          </div>
          <span className="text-parchment/30 text-xs font-body italic">
            Est. 1924 — Ahmedabad, India
          </span>
        </div>
      </div>
    </footer>
  );
}
