/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // ── Vintage Barbershop Palette ─────────────────────────────────────
        olive:    "#29291F",   // deep olive – primary dark background
        parchment:"#E9E0C8",   // aged parchment – light surface
        copper:   "#A65F35",   // burnt copper – accent / warning
        gold:     "#C39A5A",   // antique gold – active / highlight
        brown:    "#34291F",   // dark brown – secondary dark
        cream:    "#F4EBDD",   // muted cream – completed / light bg
      },
      fontFamily: {
        heading: ["'Playfair Display'", "Georgia", "serif"],
        display: ["'Cormorant Garamond'", "Georgia", "serif"],
        body:    ["'Lato'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      letterSpacing: {
        widest2: "0.3em",
      },
    },
  },
  plugins: [],
};
