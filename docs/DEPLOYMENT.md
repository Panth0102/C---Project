# Deployment

## Overview

| Component | Platform | Free tier |
|-----------|----------|-----------|
| Frontend  | Vercel   | Yes       |
| Backend   | Render   | Yes (spins down after inactivity) |
| Database  | Supabase or Neon | Yes |

> Free-tier terms change over time. Verify current limits on each provider's pricing page.

---

## 1. Database (Supabase or Neon) — do this first

You need the `DATABASE_URL` before deploying the backend.

### Supabase
1. Sign up at https://supabase.com and create a project.
2. Under **Settings → Database → Connection string → URI**, copy the pooler URL.
3. It looks like: `postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`
4. Keep this URL — you will paste it into Render.

### Neon
1. Sign up at https://neon.tech and create a project.
2. Copy the connection string from the **Dashboard → Connection Details**.
3. It looks like: `postgresql://[user]:[password]@[host]/[dbname]?sslmode=require`
4. Keep this URL — you will paste it into Render.

---

## 2. Backend (Render)

### Option A: Deploy from `render.yaml` (recommended)
1. Push this repository to GitHub.
2. Go to https://render.com → **New → Blueprint**.
3. Connect your GitHub repository.
4. Render reads `backend/render.yaml` and creates the web service.
5. Set the following environment variables in the Render dashboard (they are marked `sync: false` in `render.yaml`):
   - `DATABASE_URL` — your Supabase or Neon connection string
   - `FRONTEND_URL` — your Vercel URL (set after deploying the frontend, or use a placeholder first)
   - `ALLOWED_ORIGINS` — same value as `FRONTEND_URL` (comma-separated if multiple)

### Option B: Manual setup
1. Go to https://render.com → **New → Web Service**.
2. Connect your GitHub repo.
3. Set:
   - **Root directory**: `backend`
   - **Build command**: `pip install -r requirements.txt && alembic upgrade head`
   - **Start command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Python version**: `3.12`
4. Add the same environment variables as Option A.

### Running migrations on Render
Alembic runs automatically during the build step (`alembic upgrade head`).  
To run manually: open **Shell** in the Render dashboard and run:
```bash
alembic upgrade head
```

### Health check
Render pings `GET /health` to confirm the service is running.

---

## 3. Frontend (Vercel)

1. Push this repository to GitHub.
2. Go to https://vercel.com → **Add New Project**.
3. Import your repository.
4. Configure:
   - **Root directory**: `frontend`
   - **Build command**: `npm run build`
   - **Output directory**: `dist`
   - **Framework preset**: Vite
5. Add environment variable:
   - `VITE_API_BASE_URL` = your Render backend URL (e.g. `https://fullstack-api.onrender.com`)
6. The `frontend/vercel.json` already configures SPA routing rewrites.
7. Click **Deploy**.

### Updating `FRONTEND_URL` on Render
After Vercel assigns your URL (e.g. `https://my-app.vercel.app`):
1. Go to Render dashboard → your backend service → **Environment**.
2. Update `FRONTEND_URL` and `ALLOWED_ORIGINS` to match.
3. Render redeploys automatically.

---

## 4. Custom domains (optional)

Both Vercel and Render support custom domains on free and paid plans.  
Follow their respective documentation to add a domain and configure DNS.

---

## 5. Post-deployment checklist

- [ ] Backend health check responds: `GET https://your-api.onrender.com/health`
- [ ] Swagger UI is accessible: `GET https://your-api.onrender.com/docs`
- [ ] Frontend loads and displays the home page
- [ ] Frontend can call the backend (CORS is configured correctly)
- [ ] Database migrations have been applied (`alembic current` shows `0001`)
- [ ] No secrets in source control (`.env` files are gitignored)
