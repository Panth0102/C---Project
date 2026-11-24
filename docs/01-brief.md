# Project Brief

## Problem Statement
Customers often face long wait times at salons and have limited visibility into queue status. Salon owners need a digital solution to manage queues, assign barbers, and provide real‑time updates while maintaining a premium, vintage branding.

## Target Users
- **Customer** – joins the queue remotely, selects services/barbers, tracks position, receives notifications.
- **Receptionist** – adds customers, calls next, handles cancellations/no‑shows.
- **Barber** – views own queue, marks start/done/break, updates availability.
- **Salon Owner / Administrator** – configures services, barbers, pricing, and views daily statistics.

## Scope
- End‑to‑end web application (React frontend, FastAPI backend).
- Multi‑language support (English & Gujarati).
- No mobile‑native apps for now – responsive web only.
- Integration with Vercel (frontend) and Render (backend).

## Must‑Have Features
1. Customer registration & queue joining.
2. Service catalogue with price & duration.
3. Barber selection (manual or auto‑assign).
4. Unique queue token generation.
5. Live queue position & ETA.
6. Receptionist dashboard for next‑customer call.
7. Barber controls: **Start**, **Done**, **On Break**.
8. No‑show & cancellation handling.
9. Waiting‑area live display for walk‑ins.
10. Admin UI for service/barber management and daily stats.
11. Bilingual UI (English ↔ Gujarati).

## Exclusions
- Payment processing – not required for the MVP.
- Loyalty / rewards program.
- Third‑party calendar integration.
- Offline/print‑out queue tokens.

## Visual Identity (Vintage Barbershop)
- **Palette**: Deep olive `#29291F`, Aged parchment `#E9E0C8`, Burnt copper `#A65F35`, Antique gold `#C39A5A`, Dark brown `#34291F`, Muted cream `#F4EBDD`.
- **Design language**: retro‑serif headings, decorative borders, paper‑grain textures, brass‑style accents, circular stamps, classic barber illustrations.
- **Avoid**: generic SaaS dashboards, bright gradients, excessive rounded cards, neon colors, glass‑morphism, default Bootstrap styling.

---
*Prepared to guide downstream development without any implementation code.*