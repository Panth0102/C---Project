/**
 * Custom vintage SVG icons for The Sovereign Blade.
 * All icons are drawn to a 24×24 viewBox and accept className for sizing.
 */

interface IconProps {
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

export function ScissorsIcon({ className = "w-6 h-6", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className={className} {...rest}>
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

export function RazorIcon({ className = "w-6 h-6", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className={className} {...rest}>
      <path d="M5 3h14l2 4H3L5 3z" />
      <rect x="3" y="7" width="18" height="11" rx="1" />
      <line x1="12" y1="7" x2="12" y2="18" />
      <line x1="8" y1="10" x2="8" y2="15" strokeWidth="1" />
      <line x1="16" y1="10" x2="16" y2="15" strokeWidth="1" />
    </svg>
  );
}

export function BarberPoleIcon({ className = "w-6 h-6", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" className={className} {...rest}>
      <rect x="9" y="1" width="6" height="22" rx="3" />
      <path d="M9 5c2 1.5 4 1.5 6 0" strokeWidth="1" />
      <path d="M9 10c2 1.5 4 1.5 6 0" strokeWidth="1" />
      <path d="M9 15c2 1.5 4 1.5 6 0" strokeWidth="1" />
      <path d="M9 20c2 1.5 4 1.5 6 0" strokeWidth="1" />
    </svg>
  );
}

export function CrownIcon({ className = "w-6 h-6", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className={className} {...rest}>
      <path d="M2 20h20M4 20L2 8l5 4 5-8 5 8 5-4-2 12H4z" />
    </svg>
  );
}

export function ClockIcon({ className = "w-5 h-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className={className} {...rest}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

export function UsersIcon({ className = "w-5 h-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
      strokeLinecap="round" strokeLinejoin="round" className={className} {...rest}>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

export function CheckIcon({ className = "w-5 h-5", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      strokeLinecap="round" strokeLinejoin="round" className={className} {...rest}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "w-4 h-4", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} {...rest}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function XIcon({ className = "w-4 h-4", ...rest }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" className={className} {...rest}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
