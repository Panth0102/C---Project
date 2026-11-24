# The Sovereign Blade — Barbershop Queue Management System

**Live Demo:** [Deploy to get URL — see deployment instructions below]

**GitHub Repository:** https://github.com/Panth0102/C---Project

---

## Overview

A production-ready, vintage-themed barbershop queue management system. Customers join a digital queue online or via walk-in registration, receive a unique token, and track their position in real time. Barbers and receptionists manage the queue through dedicated dashboards.

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Tailwind CSS (custom vintage palette) |
| Backend | Python 3.10+ + FastAPI |
| Database | PostgreSQL (Neon or Supabase on free tier) |
| ORM | SQLAlchemy 2.0 + Alembic |
| Testing | Vitest (frontend) + Pytest (backend) |
| Hosting | Vercel (frontend) + Render (backend) |

---

## Architecture

```
Browser → Vercel (React SPA)
              ↓ HTTPS API calls
         Render (FastAPI)
              ↓ SQLAlchemy
         PostgreSQL (Neon/Supabase)
```

Frontend communicates exclusively with the backend REST API (`/api/v1/`). No SSR. SPA routing handled by Vercel rewrites.

---

## Folder Structure

```
.
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── pages/         # 7 screens (Home, Join, Status, Reception, Barber, Display, Admin)
│   │   ├── components/    # UI primitives + layout
│   │   ├── services/      # API client + queue service
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Error handling, formatters
│   └── public/
├── backend/               # FastAPI + Python
│   ├── app/
│   │   ├── api/v1/        # Route handlers
│   │   ├── models/        # SQLAlchemy ORM models
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── services/      # Business logic (queue, SMS, payment)
│   │   ├── crud/          # Database operations
│   │   └── core/          # Config, settings
│   ├── alembic/           # Database migrations
│   └── tests/             # Pytest test suite
├── docs/                  # Product documentation
├── render.yaml            # Render deployment config
├── vercel.json            # Vercel deployment config
└── README.md
```

---

## Screens (7 Routes)

| Route | Screen | Description |
|-------|--------|-------------|
| `/` | Home | Landing page with hero, services, barbers, hours |
| `/join` | Join Queue | 3-step: select services → choose barber → enter details |
| `/status/:token` | Customer Status | Live position, ETA, cancel button |
| `/reception` | Reception Dashboard | Queue management, walk-in add, barber stations |
| `/barber/:name` | Barber View | Personal queue, start/done/break controls |
| `/display` | Waiting Area Display | Public TV screen showing current token |
| `/admin` | Admin Settings | View services, barbers, statistics |
| `/walk-in` | Walk-In Registration | Customer self-registration form |

---

## Local Development

### Prerequisites
- Node.js 18+
- Python 3.10+
- PostgreSQL (or use SQLite for tests)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env          # Edit with your database URL
alembic upgrade head
uvicorn app.main:app --reload
# API available at http://localhost:8000
# Swagger UI at http://localhost:8000/docs
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local    # Set VITE_API_BASE_URL=http://localhost:8000
npm run dev
# App available at http://localhost:5173
```

---

## Testing

### Backend Tests (Pytest)
```bash
cd backend
source venv/bin/activate
pytest -v
```

### Frontend Tests (Vitest)
```bash
cd frontend
npm test
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `SECRET_KEY` | JWT signing secret | ✅ |
| `ENVIRONMENT` | `development` / `production` | ✅ |
| `FRONTEND_URL` | Frontend origin URL | ✅ |
| `ALLOWED_ORIGINS` | Comma-separated CORS origins | ✅ |
| `TWILIO_ACCOUNT_SID` | Twilio account (SMS optional) | ❌ |
| `TWILIO_AUTH_TOKEN` | Twilio auth token | ❌ |
| `TWILIO_PHONE_NUMBER` | Twilio sender number | ❌ |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend API URL (e.g. `https://api.onrender.com`) |

---

## Database Setup

### Local (PostgreSQL)
```bash
psql -U postgres -c "CREATE DATABASE sovereignblade;"
# Set DATABASE_URL=postgresql://postgres:password@localhost:5432/sovereignblade
alembic upgrade head
```

### Hosted (Neon — recommended free tier)
1. Create project at https://neon.tech
2. Copy connection string
3. Set `DATABASE_URL` in Render environment variables
4. Alembic runs automatically on deploy

---

## API Reference

Base URL: `/api/v1`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/queue/services` | GET | List all services |
| `/queue/barbers` | GET | List all barbers |
| `/queue/join` | POST | Customer joins queue |
| `/queue/walkin` | POST | Receptionist adds walk-in |
| `/queue/status/{token}` | GET | Get entry by token |
| `/queue/active` | GET | All active entries |
| `/queue/{id}/status` | PATCH | Update entry status |
| `/queue/{id}/cancel` | DELETE | Customer cancel |
| `/queue/barbers/{id}/status` | PATCH | Update barber status |
| `/queue/dashboard/summary` | GET | Dashboard stats |
| `/payment/create-order` | POST | Create dummy payment order |
| `/payment/verify` | POST | Verify payment (always succeeds) |
| `/health` | GET | Health check |

Full interactive docs: `http://localhost:8000/docs`

---

## Deployment

### Step 1: Database (Neon)
1. Sign up at https://neon.tech (free)
2. Create a new project
3. Copy the connection string — format: `postgresql://user:pass@host/dbname?sslmode=require`

### Step 2: Backend (Render)
1. Sign up at https://render.com (free)
2. Click **New → Web Service**
3. Connect your GitHub repository
4. Settings:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt && alembic upgrade head`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables:
   - `DATABASE_URL` = your Neon connection string
   - `SECRET_KEY` = any long random string
   - `ENVIRONMENT` = `production`
   - `FRONTEND_URL` = your Vercel URL (add after Step 3)
   - `ALLOWED_ORIGINS` = your Vercel URL
6. Deploy and note the backend URL (e.g. `https://sovereign-blade-api.onrender.com`)

### Step 3: Frontend (Vercel)
1. Sign up at https://vercel.com (free)
2. Click **Add New → Project**
3. Import your GitHub repository
4. Settings:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Environment Variables:
   - `VITE_API_BASE_URL` = your Render backend URL
6. Deploy

### Step 4: Update CORS
After both are deployed:
- In Render, update `FRONTEND_URL` and `ALLOWED_ORIGINS` to your Vercel URL
- Redeploy the backend

---

## Free Tier Limitations

| Service | Limitation |
|---------|-----------|
| Render (backend) | Spins down after 15 min inactivity; ~30s cold start |
| Neon (database) | 0.5 GB storage, 1 compute unit |
| Vercel (frontend) | 100 GB bandwidth/month, unlimited deployments |

**Mitigation for Render cold starts:** The frontend shows a loading spinner while the first API call wakes the backend. Expected delay: 20-30 seconds on first visit after inactivity.

---

## Queue Business Rules

- **FCFS:** Customers served in join order
- **Duplicate prevention:** One active queue entry per phone number
- **Barber assignment:** Auto-assigns least-loaded available barber; manual lock respected
- **Cancellation:** Customer can cancel only while `waiting`
- **No-show:** Receptionist marks manually; customer can rejoin
- **Break handling:** Barbers on break excluded from auto-assignment
- **ETA:** Recalculates on every queue mutation

---

## Payment

Payment is **simulated (dummy)** — no real charges. The system generates a fake order ID and always confirms payment. This is intentional for demonstration purposes.

To enable real Razorpay payments in production, replace `backend/app/services/payment_service.py` with the Razorpay implementation and add `razorpay` to `requirements.txt`.
