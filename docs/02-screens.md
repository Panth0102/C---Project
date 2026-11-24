# Screen Documentation

## 1. Home – `/`

**Purpose**: Entry point for all users. Provides navigation to join the queue, view services, and switch language.

**Layout**:
- Hero section with vintage barber shop signage (deep olive background, aged parchment overlay, brass‑styled logo).  
- CTA button *“Join Queue”* (Burnt copper background, antique‑gold hover).
- Quick‑links row: *Services*, *Barbers*, *About* (text‑only, underlined on hover).
- Language toggle (EN/GU) in top‑right corner – small circular stamp icon.

**Elements**:
- Header (logo, navigation, language switch).
- Hero image (background texture, subtle paper grain).
- Primary button (`<Button variant="primary">Join Queue</Button>`).
- Footer with contact info and vintage decorative border.

**Responsive Behaviour**:
- Mobile: hero collapses to stacked layout, button full‑width.
- Tablet: two‑column hero (image left, text right).
- Desktop: three‑column layout with decorative side panels.

**Empty / Error States**:
- If services data fails to load, show a centered message with a *Retry* button and an illustration of a vacant barber chair.

---
## 2. Join Queue – `/join`

**Purpose**: Customer selects services, optional barber, and enters contact info to receive a token.

**Layout**:
- Stepper UI (3 steps): *Select Services → Choose Barber → Confirmation*.
- Left pane: Service catalogue cards (retro‑serif title, price, estimated duration, illustration).
- Right pane: Summary box showing selected items, total price, estimated wait.

**Elements**:
- Service cards (clickable, toggle selection, burn copper border on selected).
- Barber dropdown (searchable, displays avatar with brass‑frame).
- Input fields: Name, Phone (optional email), with vintage placeholder style.
- *Add to Queue* button (antique gold).
- Real‑time token preview (circular stamp with token number).

**Responsive Behaviour**:
- Mobile: vertical stacking of service list then form.
- Tablet: two‑column; services left, form right.
- Desktop: three‑column, with decorative vertical separator.

**Empty / Error States**:
- No services available → display “No services currently offered” message with illustration of closed shop.
- API failure on submission → error toast with retry option.

---
## 3. Customer Status – `/status/:id`

**Purpose**: Show live position, ETA, and token details for a specific queue entry.

**Layout**:
- Header with token number in vintage circular stamp.
- Main card: current position, estimated wait time, status badge (Waiting / Called / Completed).
- Progress bar styled as an ornamental ribbon.
- Action buttons: *Cancel* (red‑brown), *Refresh* (neutral).

**Elements**:
- Status badge colors: Waiting (Burnt copper), Called (Antique gold), Completed (Muted cream).
- QR code optional for in‑shop scanning (styled with parchment background).
- Notification toggle (checkbox with brass‑styled checkmark).

**Responsive Behaviour**:
- Mobile: cards occupy full width, progress bar full width.
- Desktop: side‑by‑side with QR code.

**Empty / Error States**:
- Invalid ID → full‑screen error page with vintage “404 – Not Found” illustration.
- Queue departed → message “Your turn has passed; thank you for visiting!”.

---
## 4. Reception Dashboard – `/reception`

**Purpose**: Receptionist manages incoming customers, calls next, handles cancellations and no‑shows.

**Layout**:
- Top bar: current time, language toggle, quick stats (waiting count, next ETA).
- Main table: list of queue entries (Token, Customer Name, Services, Position, Status).
- Action column with *Call*, *Cancel*, *Mark No‑Show* buttons.
- Bottom panel: manual *Add Customer* shortcut.

**Elements**:
- Table rows with alternating parchment background rows, burnt copper hover.
- Buttons styled as brass‑etched icons.
- Auto‑refresh every 15 seconds (configurable).

**Responsive Behaviour**:
- Mobile: collapsible accordion rows; actions appear in a slide‑out panel.
- Desktop: full table view.

**Empty / Error States**:
- No customers → display “Queue is empty” with a stylized empty chair illustration.
- API error → banner at top with retry.

---
## 5. Barber View – `/barber/:name`

**Purpose**: Individual barber sees their personal queue and can update status.

**Layout**:
- Header with barber name in condensed serif, brass‑border badge (Available / On Break / Offline).
- Queue list similar to Reception but filtered to barber’s assignments.
- Controls: *Start*, *Done*, *Break* for each entry.
- Stats panel: today’s completed count, average service time.

**Elements**:
- Status toggle switch (styled as vintage toggle).
- Inline timer showing service duration elapsed.
- “End Shift” button (dark brown).

**Responsive Behaviour**:
- Mobile: list view with swipe actions for *Start/Done*.
- Desktop: two‑pane – queue list left, stats right.

**Empty / Error States**:
- No assignments → “You have no customers queued.” message with barber pole illustration.

---
## 6. Waiting Area Display – `/display`

**Purpose**: Public screen showing current queue tokens and next customer.

**Layout**:
- Full‑screen dark‑olive background.
- Scrolling marquee of upcoming tokens (brass‑styled numbers).
- Central highlighted token for *Now Serving* (large antique‑gold typography).
- Footer with salon name and vintage decorative border.

**Elements**:
- Token cards with parchment texture.
- Fade‑in/out animation mimicking old‑school LED board.

**Responsive Behaviour**:
- Designed for large monitors; on smaller devices it stacks vertically.

**Empty / Error States**:
- Empty queue → display “Welcome – No customers yet” with animated barber pole.

---
## 7. Owner Settings – `/admin`

**Purpose**: Admin configures services, barbers, pricing, and views analytics.

**Layout**:
- Sidebar navigation (Services, Barbers, Prices, Statistics, Language).
- Main content area with forms/tables.
- Each form uses vintage input boxes (bordered with burnt copper, placeholder in muted cream).

**Elements**:
- Service Management table: *Add Service* modal, edit inline.
- Barber Management: profile picture with brass frame, schedule toggle.
- Statistics Dashboard: bar charts with antique‑gold accent, parchment background.
- Language management: toggle switch per phrase (EN/GU).

**Responsive Behaviour**:
- Tablet: collapsible sidebar.
- Mobile: full‑screen tabs.

**Empty / Error States**:
- No services/barbers → show empty state with “Add your first service/barber” call‑to‑action.

---
## Visual Consistency Guidelines (applies to all screens)
- **Typography**: Primary headings – condensed serif (e.g., *Playfair Display Condensed*). Body – clean serif or sans‑serif with moderate line‑height.
- **Colors**: Use palette strictly; background variations per screen (deep olive for dark sections, parchment for content cards).
- **Borders & Dividers**: Decorative ornamental separators (thin gold line with subtle grain).
- **Icons**: Custom‑drawn vintage icons (scissors, razor, barber pole) in burnt copper.
- **Textures**: Subtle paper grain overlay on all containers (via CSS `background-image` with low‑opacity PNG).
- **Accessibility**: Ensure color contrast meets WCAG AA; provide ARIA labels for all interactive elements.

---
*All screens are described to allow a developer to implement the UI without additional assumptions.*