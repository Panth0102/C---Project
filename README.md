# Full-Stack Starter

A production-ready monorepo template built with **React + Vite** (frontend), **FastAPI** (backend), and **PostgreSQL** (database). Deployable to Vercel and Render with a free-tier database on Supabase or Neon.

---

## Key Features

- Typed end-to-end: TypeScript on the frontend, Pydantic on the backend
- Full CRUD REST API with Swagger documentation
- Database migrations via Alembic
- 40 frontend tests (Vitest + React Testing Library)
- 28 backend tests (Pytest + HTTPX) — all running against an isolated SQLite database
- Deployment-ready configuration for Vercel, Render, and hosted PostgreSQL
- Clean separation: pages → hooks → services → API → CRUD → DB

---

## Technology Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Axios |
| Backend   | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2, Alembic, Uvicorn |
| Database  | PostgreSQL (local or Supabase/Neon) |
| Testing   | Vitest, React Testing Library, Pytest, HTTPX |
| Deployment| Vercel (frontend), Render (backend) |

---

## Architecture Overview

```
Browser
  │
  ▼
React SPA (Vite)
  ���  Axios HTTP calls → /api/v1/*
  ▼
FastAPI (Uvicorn)
  │  CORS middleware validates origin
  │
  ├── /api/v1/items  →  endpoints/items.py
  │                       └── item_service.py
  │                             └── crud/item.py
  │                                   └── SQLAlchemy (Item model)
  │                                         └── PostgreSQL
  │
  └── /health, /  →  main.py
```

---

## Folder Structure

```
project-root/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/       # Loading, ErrorMessage
│   │   │   ├── layout/       # Header, Footer, Layout
│   │   │   └── ui/           # Button
│   │   ├── pages/            # HomePage, ItemsPage, NotFoundPage
│   │   ├── hooks/            # useItems
│   │   ├── services/         # apiClient, itemService
│   │   ├── context/          # AppContext
│   │   ├── types/            # TypeScript interfaces
│   │   ├── utils/            # errorHandler
│   │   ├── routes/           # React Router config
│   │   └── test/             # All test files
│   ├── vercel.json
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/ # items.py
│   │   ├── core/             # config.py (Pydantic Settings)
│   │   ├── db/               # base.py, session.py
│   │   ├── models/           # item.py (SQLAlchemy model)
│   │   ├── schemas/          # item.py (Pydantic schemas)
│   │   ├── crud/             # item.py (database operations)
│   │   ├── services/         # item_service.py (business logic)
│   │   ├── middleware/        # logging.py
│   │   └── main.py
│   ├── tests/
│   │   ├── unit/             # test_crud_item.py
│   │   ├── integration/      # test_items_api.py
│   │   ├── conftest.py
│   │   └── test_main.py
│   ├── alembic/
│   │   └── versions/         # 0001_create_items_table.py
│   ├── render.yaml
│   └── requirements.txt
│
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
├── README.md
└── LICENSE
```

---

## Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.12 (`brew install python@3.12` on macOS)
- **PostgreSQL** 14+ (for local development; not required for running tests)
- Git

---

## Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Frontend setup
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env if your backend runs on a port other than 8000
```

### 3. Backend setup
```bash
cd backend
python3.12 -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your DATABASE_URL and other values
```

---

## PostgreSQL Configuration

### Local
```bash
# macOS
brew install postgresql@16 && brew services start postgresql@16
psql -U postgres -c "CREATE DATABASE appdb;"
```

Set in `backend/.env`:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/appdb
```

### Hosted (Supabase / Neon)
See [`docs/DATABASE.md`](docs/DATABASE.md) for step-by-step instructions.

---

## Environment Variables

### `frontend/.env`
```bash
VITE_API_BASE_URL=http://localhost:8000
```

### `backend/.env`
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/appdb
SECRET_KEY=change-me-to-a-long-random-string-in-production
ENVIRONMENT=development
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## Running Locally

### Backend
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```
API available at: http://localhost:8000  
Swagger UI: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm run dev
```
App available at: http://localhost:5173

---

## Running Tests

### Frontend tests
```bash
cd frontend
npm run test               # single run
npm run test:watch         # watch mode
npm run test:coverage      # with coverage report
```

### Backend tests
```bash
cd backend
source .venv/bin/activate
pytest                     # all tests
pytest -m unit             # unit tests only
pytest -m integration      # integration tests only
pytest --cov=app --cov-report=html   # with HTML coverage report
```

---

## Database Migrations

```bash
cd backend
source .venv/bin/activate

# Apply all pending migrations
alembic upgrade head

# Create a new migration (after changing a model)
alembic revision --autogenerate -m "add column to items"

# Roll back one migration
alembic downgrade -1

# Show current state
alembic current
```

---

## API Endpoints

| Method | Endpoint             | Description          |
|--------|----------------------|----------------------|
| GET    | `/`                  | Welcome message      |
| GET    | `/health`            | Health check         |
| GET    | `/api/v1/items/`     | List all items       |
| POST   | `/api/v1/items/`     | Create an item       |
| GET    | `/api/v1/items/{id}` | Get item by ID       |
| PUT    | `/api/v1/items/{id}` | Update an item       |
| DELETE | `/api/v1/items/{id}` | Delete an item       |

Full request/response documentation: [`docs/API.md`](docs/API.md)

---

## Swagger Documentation

With the backend running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Git & GitHub Workflow

```bash
# Start a feature
git checkout -b feature/my-feature

# Commit
git add .
git commit -m "feat: add my feature"

# Push and open a pull request
git push origin feature/my-feature
```

Suggested branch naming: `feature/`, `fix/`, `docs/`, `chore/`.

---

## Vercel Deployment (Frontend)

1. Push the repository to GitHub.
2. Go to https://vercel.com → **Add New Project** → import the repo.
3. Set **Root Directory** to `frontend`.
4. Add environment variable: `VITE_API_BASE_URL=https://your-api.onrender.com`
5. Click **Deploy**.

The `frontend/vercel.json` handles SPA routing rewrites automatically.

---

## Render Deployment (Backend)

The simplest path uses the included `backend/render.yaml`:

1. Go to https://render.com → **New → Blueprint**.
2. Connect your GitHub repository.
3. In the Render dashboard, set these environment variables:
   - `DATABASE_URL` — your Supabase or Neon connection string
   - `FRONTEND_URL` — your Vercel URL
   - `ALLOWED_ORIGINS` — your Vercel URL

Alembic runs automatically during the build step.

Full instructions: [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md)

---

## Database Hosting

See [`docs/DATABASE.md`](docs/DATABASE.md) for:
- Setting up Supabase
- Setting up Neon
- Running migrations against a hosted database

---

## Troubleshooting

**Backend fails to start — `DATABASE_URL` error**  
Copy `.env.example` to `.env` in the `backend/` directory and fill in your database credentials.

**Tests fail on Python 3.14**  
Use Python 3.12: `brew install python@3.12` then recreate the venv with `python3.12 -m venv .venv`.

**Frontend cannot reach the backend**  
Confirm `VITE_API_BASE_URL` in `frontend/.env` matches the port your backend is running on.

**CORS errors in the browser**  
Add your frontend origin to `ALLOWED_ORIGINS` in `backend/.env`.

**`alembic upgrade head` fails on a hosted database**  
Make sure the `DATABASE_URL` in Render's environment variables includes `?sslmode=require` for Supabase/Neon.

---

## Contributing

1. Fork the repository.
2. Create a branch: `git checkout -b feature/your-feature`.
3. Make your changes and add tests.
4. Run `npm run test` and `pytest` — both must pass.
5. Open a pull request with a clear description.

---

## License

[MIT](LICENSE)
