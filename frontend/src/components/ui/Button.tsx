import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size    = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  children: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  // Burnt copper background — the main CTA colour
  primary:
    "bg-copper text-cream border border-copper hover:bg-copper/80 hover:border-gold " +
    "focus:ring-gold/60 disabled:bg-brown disabled:text-parchment/40 disabled:border-brown",
  // Outlined antique-gold — secondary actions
  secondary:
    "bg-transparent text-gold border border-gold hover:bg-gold/10 " +
    "focus:ring-gold/50 disabled:opacity-40",
  // Minimal ghost for tertiary actions
  ghost:
    "bg-transparent text-parchment/70 border border-parchment/20 hover:border-parchment/50 hover:text-parchment " +
    "focus:ring-parchment/30 disabled:opacity-40",
  // Destructive red-brown
  danger:
    "bg-red-900/80 text-cream border border-red-800 hover:bg-red-900 " +
    "focus:ring-red-700/50 disabled:opacity-40",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-4 py-1.5 text-xs tracking-widest",
  md: "px-6 py-2.5 text-sm tracking-widest",
  lg: "px-8 py-3.5 text-base tracking-widest",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={[
        "inline-flex items-center justify-center gap-2 font-body font-bold uppercase",
        "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-olive",
        "transition-all duration-200",
        "disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
