# The Sovereign Blade

> A vintage-themed barbershop queue management system — join online, track your position in real time, and get called when it's your turn.

**Live Site:** [https://c-project-nine.vercel.app](https://c-project-nine.vercel.app)  
**GitHub:** [https://github.com/Panth0102/C---Project](https://github.com/Panth0102/C---Project)

---

## What it does

Customers open the site, pick their services and a barber, enter their phone number, and receive a unique queue token. A live status page shows their position and estimated wait. When the barber is ready, the receptionist calls the token and the customer's screen updates instantly.

Staff get their own views — receptionists manage the full queue from a dashboard, barbers see only their assigned customers and can mark start, done, or break from their phone.

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS — custom vintage palette |
| Backend | FastAPI (Python 3.10+) |
| Database | PostgreSQL on Neon |
| ORM | SQLAlchemy 2.0 + Alembic |
| Testing | Vitest · Pytest — 123 frontend + 71 backend tests |
| Frontend host | Vercel |
| Backend host | Render |

---

## Screens

| URL | Who uses it | What it does |
|-----|-------------|--------------|
| `/` | Everyone | Landing page — hero, services, barbers, opening hours |
| `/join` | Customer | 3-step form: pick services → pick barber → enter details |
| `/status/:token` | Customer | Live queue position, ETA, cancel button |
| `/walk-in` | Customer / Reception | Quick self-registration for walk-ins |
| `/reception` | Receptionist | Full queue table, barber stations, walk-in modal |
| `/barber/:name` | Barber | Personal queue, start / done / break controls |
| `/display` | Waiting area TV | Now-serving token on a large public screen |
| `/admin` | Owner | View services, barbers, and daily statistics |

---

## Folder structure

```
.
├── frontend/
│   └── src/
│       ├── pages/        # one file per screen
│       ├── components/   # Button, Card, VintageIcons, Layout, …
│       ├── services/     # apiClient + queueService (all HTTP calls)
│       ├── types/        # TypeScript interfaces matching backend schemas
│       └── utils/        # errorHandler, formatters
├── backend/
│   └── app/
│       ├── api/v1/       # FastAPI route handlers
│       ├── models/       # SQLAlchemy ORM models
│       ├── schemas/      # Pydantic request / response schemas
│       ├── services/     # queue_service, sms_service, payment_service
│       └── crud/         # all database queries
│   ├── alembic/          # migration scripts
│   └── tests/            # unit + integration tests
├── docs/                 # product spec, API reference, DB schema
├── render.yaml           # Render deployment config
└── vercel.json           # Vercel SPA rewrite rules
```

---

## Running locally

### Requirements
- Python 3.10+
- Node.js 18+
- A PostgreSQL database (local, Neon, or Supabase)

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate      # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env
# Edit .env — set DATABASE_URL to your Postgres connection string

alembic upgrade head
uvicorn app.main:app --reload
```

API runs at **http://localhost:8000**  
Swagger UI at **http://localhost:8000/docs**

### Frontend

```bash
cd frontend
npm install

# Create .env.local with one line:
echo "VITE_API_BASE_URL=http://localhost:8000" > .env.local

npm run dev
```

App runs at **http://localhost:5173**

---

## Tests

```bash
# Backend
cd backend && source .venv/bin/activate
pytest -v                    # 71 tests

# Frontend
cd frontend
npm test                     # 123 tests
```

---

## Environment variables

### Backend — `backend/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `SECRET_KEY` | ✅ | Any long random string |
| `ENVIRONMENT` | ✅ | `development` or `production` |
| `FRONTEND_URL` | ✅ | Your Vercel URL (for CORS) |
| `ALLOWED_ORIGINS` | ✅ | Same as `FRONTEND_URL` (comma-separated if multiple) |
| `TWILIO_ACCOUNT_SID` | ❌ | Leave empty to disable SMS |
| `TWILIO_AUTH_TOKEN` | ❌ | Leave empty to disable SMS |
| `TWILIO_PHONE_NUMBER` | ❌ | Leave empty to disable SMS |

### Frontend — `frontend/.env.local`

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Full URL of the backend, e.g. `https://sovereign-blade-api.onrender.com` |

---

## Deploying

### 1 — Database (Neon, free)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a project, copy the connection string
3. Format: `postgresql://user:pass@host/dbname?sslmode=require`

### 2 — Backend (Render, free)

1. Sign up at [render.com](https://render.com) → **New Web Service**
2. Connect this GitHub repo
3. Set **Root Directory** to `backend`
4. **Build command:** `pip install -r requirements.txt && alembic upgrade head`
5. **Start command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `DATABASE_URL` → your Neon string
   - `SECRET_KEY` → any random string
   - `ENVIRONMENT` → `production`
   - `FRONTEND_URL` → your Vercel URL (fill in after step 3)
   - `ALLOWED_ORIGINS` → same as above

### 3 — Frontend (Vercel, free)

1. Sign up at [vercel.com](https://vercel.com) → **Add New Project**
2. Import this GitHub repo
3. **Root Directory:** `frontend` · **Framework:** Vite
4. Add environment variable:
   - `VITE_API_BASE_URL` → your Render backend URL
5. Deploy

### 4 — Wire them together

After both are live, go back to Render and set `FRONTEND_URL` and `ALLOWED_ORIGINS` to your Vercel URL, then redeploy.

---

## Free-tier limits

| Service | Limit |
|---------|-------|
| Render | Sleeps after 15 min idle — ~30s cold start on first request |
| Neon | 0.5 GB storage |
| Vercel | 100 GB bandwidth / month |

The frontend shows a loading spinner during the cold start, so users see feedback rather than a blank screen.

---

## API — quick reference

Base path: `/api/v1`  
Interactive docs: `https://sovereign-blade-api.onrender.com/docs`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/queue/services` | List all services |
| GET | `/queue/barbers` | List all barbers |
| POST | `/queue/join` | Customer joins queue |
| POST | `/queue/walkin` | Reception adds walk-in |
| GET | `/queue/status/{token}` | Get entry by token |
| GET | `/queue/active` | All active entries |
| PATCH | `/queue/{id}/status` | Transition status |
| DELETE | `/queue/{id}/cancel` | Customer cancels |
| PATCH | `/queue/barbers/{id}/status` | Set barber available / on break |
| GET | `/queue/dashboard/summary` | Reception stats |
| POST | `/payment/create-order` | Create (dummy) payment order |
| POST | `/payment/verify` | Verify payment — always succeeds |
| GET | `/health` | Health check |

---

## Queue rules

- **First come, first served** within each barber's queue
- **One active entry per phone number** — duplicate joins are rejected with a clear error
- **Auto-assign** picks the least-loaded available barber; a manually chosen barber is locked to the token
- **Barbers on break** are excluded from auto-assignment
- **Cancellation** is only allowed while status is `waiting`
- **ETA recalculates** on every queue change — new join, cancellation, service start, or completion
- **No-show** is set manually by reception; the customer can rejoin afterwards

---

## Payment

Payments are **simulated** — no real money moves. The system creates a fake order ID and always returns a successful verification. Intentional for demonstration purposes.
