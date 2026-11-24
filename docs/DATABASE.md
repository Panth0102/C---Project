# Database

## Overview

The application uses **PostgreSQL** via **SQLAlchemy 2.0** ORM and **Alembic** for schema migrations.

---

## Local development

### 1. Install PostgreSQL

macOS (Homebrew):
```bash
brew install postgresql@16
brew services start postgresql@16
```

Ubuntu/Debian:
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create the database
```bash
psql -U postgres
CREATE DATABASE appdb;
\q
```

### 3. Set DATABASE_URL in `backend/.env`
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/appdb
```

### 4. Run migrations
```bash
cd backend
source .venv/bin/activate
alembic upgrade head
```

---

## Hosted PostgreSQL (Supabase or Neon)

Both services offer free-tier PostgreSQL. Use the connection string they provide.

### Supabase
1. Create a project at https://supabase.com.
2. Go to **Settings → Database → Connection string → URI**.
3. Use the **pooler** connection string for serverless environments.
4. Set `DATABASE_URL` in Render's environment variables.

### Neon
1. Create a project at https://neon.tech.
2. Copy the connection string from the dashboard.
3. Append `?sslmode=require` if not already present.
4. Set `DATABASE_URL` in Render's environment variables.

> **Never commit real credentials to source control.**

---

## Alembic workflow

| Task | Command |
|------|---------|
| Apply all pending migrations | `alembic upgrade head` |
| Roll back one migration | `alembic downgrade -1` |
| Roll back all migrations | `alembic downgrade base` |
| Create a new migration | `alembic revision --autogenerate -m "describe change"` |
| Show current revision | `alembic current` |
| Show migration history | `alembic history` |

Always run `alembic upgrade head` as part of your deployment process (the `render.yaml` build command does this automatically).

---

## Schema — `items` table

| Column      | Type                       | Constraints               |
|-------------|----------------------------|---------------------------|
| id          | INTEGER                    | PRIMARY KEY, AUTO         |
| title       | VARCHAR(255)               | NOT NULL, indexed         |
| description | TEXT                       | nullable                  |
| is_active   | BOOLEAN                    | NOT NULL, default true    |
| created_at  | TIMESTAMP WITH TIME ZONE   | NOT NULL, default now()   |
| updated_at  | TIMESTAMP WITH TIME ZONE   | NOT NULL, default now()   |

---

## Test database

Tests use an in-memory SQLite database (no PostgreSQL required).  
The file `backend/test.db` is created at test time and cleaned up automatically via pytest session fixtures.  
Add `test.db` to `.gitignore` (already done).
