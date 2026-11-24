# Flows & Rules Documentation

## 1. Customer Journey Flow

1. **Landing on Home** – Customer chooses *Join Queue*.
2. **Select Services** – One‑or‑multiple services can be added. Each service has:
   - `price`
   - `estimatedDuration` (minutes)
   - `category` (haircut, shave, color, etc.)
3. **Barber Assignment** –
   - If customer selects a barber, that barber is locked to the token.
   - If not, the system auto‑assigns the *least‑loaded* available barber (see Assignment Rules).
4. **Contact Info** – Optional name/phone/email; required for token delivery.
5. **Token Generation** – System creates a unique token:
   - Format: `YYMMDD-XXX` where `XXX` is a zero‑padded sequential number for the day.
   - Token stored in `queues` table with status `waiting`.
6. **Confirmation** – Customer sees a preview of the token (styled as a circular stamp) and can share/print.
7. **Live Tracking** – Customer can navigate to `/status/:token` to view real‑time position and ETA.
8. **Notifications** – If opted‑in, backend pushes a push/email/SMS notification when token status changes to `called`.
9. **Completion** – When the barber marks *Done*, the token status becomes `completed` and the customer receives a thank‑you message.

## 2. Walk‑In Flow (Receptionist)

1. Receptionist clicks *Add Customer* on the Reception Dashboard.
2. Enters customer name, selects services, optionally assigns a barber.
3. System generates a token (same format) and adds it to the queue.
4. Customer receives a printed token (future feature) or displays on screen via `/display`.

## 3. Queue Status States

| State            | Description                                                                    | Transitions                                 |
|------------------|--------------------------------------------------------------------------------|---------------------------------------------|
| `waiting`        | Token is in queue, not yet called.                                             | → `called`, `cancelled`, `no_show`          |
| `called`         | Receptionist has announced the token; barber should prepare.                  | → `in_service`, `no_show`                   |
| `in_service`     | Barber has marked **Start**; service is ongoing.                               | → `completed`, `on_break` (if barber pauses) |
| `on_break`       | Barber temporarily unavailable; token remains in service state.               | → `in_service`                              |
| `completed`      | Service finished; token leaves the active queue.                               | → *archived* (auto‑purge after 24h)        |
| `cancelled`      | Customer cancelled before being called.                                        | → *archived*                                 |
| `no_show`        | Token was called but customer did not appear within `X` minutes (configurable).| → *archived*                                 |

## 4. Barber Assignment Rules

- **Manual Selection** – If a specific barber is chosen, the token is locked to that barber.
- **Automatic Assignment** – When no barber is chosen:
  1. Filter barbers with status `available`.
  2. Compute *load* = number of `waiting` + `called` tokens currently assigned.
  3. Choose barber with the **lowest load**; tie‑break by alphabetical name.
  4. If all barbers are busy, assign to the one that will become available soonest (based on average service time).
- **Barber On‑Break** – Barbers marked `on_break` are excluded from auto‑assignment.

## 5. Waiting‑Time Calculation

1. For each token, sum `estimatedDuration` of **all tokens ahead** in the same barber’s queue.
2. Add a configurable *buffer* (default 5 min) for turnover.
3. ETA = `currentTime + cumulativeDuration`.
4. Re‑calculate on every queue mutation (new token, cancellation, service start/completion).

## 6. Cancellation Handling

- Customer can cancel from the Status page **only** while token state is `waiting`.
- Receptionist can cancel any token in `waiting` or `called` state.
- Upon cancellation:
  - Token status → `cancelled`.
  - Remove from barber’s queue.
  - Trigger UI refresh for impacted customers.

## 7. No‑Show Handling

- After a token is moved to `called`, a countdown timer (`noShowTimeout`, default 10 min) starts.
- If the customer does not confirm arrival within the timeout, the system automatically:
  - Sets status to `no_show`.
  - Notifies the receptionist.
  - Optionally re‑queues the token at the end (configurable).

## 8. Test Checklist

- **Unit Tests** for:
  - Service selection logic.
  - Token generation uniqueness per day.
  - Barber auto‑assignment algorithm.
  - ETA calculation accuracy under varying queue lengths.
- **Integration Tests** for:
  - End‑to‑end join‑queue flow (frontend → backend → DB).
  - Status page updates via WebSocket or polling.
  - Notification dispatch (mock email/SMS).
  - Receptionist dashboard actions (call, cancel, no‑show).
- **UI Tests** (Vitest + Testing Library):
  - Render each screen with default data and verify presence of vintage UI elements (e.g., decorative borders, brass icons).
  - Responsive layout checks for mobile vs desktop breakpoints.
- **Performance Tests**:
  - Stress test queue with 200 concurrent tokens, ensure ETA updates within 200 ms.
- **Accessibility Audits**:
  - Verify WCAG AA contrast ratios for all palette colors.
  - Keyboard navigation across all interactive elements.

---
*This flows and rules document provides a deterministic foundation for developers and QA engineers.*