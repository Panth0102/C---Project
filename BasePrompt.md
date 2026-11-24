
# Full-Stack Web Application Project Setup

# Prompt 1

## Objective

The objective is to establish a working project foundation with all essential configurations, basic implementation code, automated tests, documentation, and deployment readiness.

## 1. Technology Stack

**Frontend**
- React.js
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios
- Lucide React
- Vitest
- React Testing Library

**Backend**
- Python 3.12+
- FastAPI
- Pydantic
- SQLAlchemy
- Alembic
- Uvicorn
- Pytest
- HTTPX

**Database**
- PostgreSQL
- SQLAlchemy ORM

**Deployment**
- Vercel (Frontend)
- Render (Backend)
- Supabase or Neon (PostgreSQL database)

**Version Control**
- Git
- GitHub

## 2. Project Folder Structure

Create a monorepo with separate frontend, backend, and documentation directories.

Frontend structure:

```text
frontend/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── ui/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── context/
│   ├── types/
│   ├── utils/
│   ├── routes/
│   ├── test/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .gitignore
```

Backend structure:

```text
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── endpoints/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   ├── crud/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   ├── main.py
│   └── __init__.py
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── conftest.py
│   └── test_main.py
├── alembic/
├── requirements.txt
├── pytest.ini
├── alembic.ini
├── .env.example
└── .gitignore
```

Root structure:

```text
project-root/
├── frontend/
├── backend/
├── docs/
│   ├── API.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
├── .gitignore
├── README.md
└── LICENSE
```

You may add necessary files and directories to improve the structure.

## 3. Basic Frontend Implementation

Create working starter code, not empty placeholder files.

Include:

- A functional React application.
- A basic responsive homepage.
- Reusable Header, Footer, Button, and Loading components.
- React Router configuration with at least Home and Not Found pages.
- Axios API client with centralized base URL configuration.
- A basic API service demonstrating communication with the backend.
- TypeScript interfaces for API responses.
- A reusable error-handling utility.
- A basic loading and error state implementation.
- Tailwind CSS configuration and basic styling.

Keep the interface simple, clean, responsive, and professional.

## 4. Basic Backend Implementation

Create a functional FastAPI backend.

Include:

- FastAPI application entry point.
- Environment-based configuration using Pydantic Settings.
- Database connection using SQLAlchemy.
- PostgreSQL connection configuration.
- Database session management.
- A basic SQLAlchemy model named `Item`.
- Corresponding Pydantic request and response schemas.
- CRUD operations for the Item model.
- API endpoints for creating, reading, updating, and deleting items.
- Proper HTTP status codes.
- Input validation.
- Exception handling.
- CORS configuration allowing the frontend origin through environment variables.
- API versioning using `/api/v1`.
- Automatic Swagger documentation.

Implement these endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/` | Root welcome message |
| GET | `/health` | Health check |
| GET | `/api/v1/items` | Retrieve all items |
| GET | `/api/v1/items/{id}` | Retrieve one item |
| POST | `/api/v1/items` | Create an item |
| PUT | `/api/v1/items/{id}` | Update an item |
| DELETE | `/api/v1/items/{id}` | Delete an item |

Ensure the API is functional and follows clean separation between endpoints, schemas, models, CRUD operations, and services.

## 5. Database and Migrations

Configure PostgreSQL using SQLAlchemy.

Include:

- Database connection management.
- SQLAlchemy declarative base.
- Session factory.
- Item model.
- Alembic configuration.
- Initial migration.
- Instructions for generating and applying future migrations.

Support both local PostgreSQL and hosted PostgreSQL providers such as Supabase and Neon.

Use environment variables for all database credentials.

Do not create or commit real credentials.

## 6. Frontend Testing

Configure Vitest and React Testing Library.

Create actual basic test cases for:

- Application rendering.
- Homepage rendering.
- Header component rendering.
- Button component interaction.
- Navigation between pages.
- Loading component rendering.
- API service mocking.
- Error-state rendering.

Ensure tests can run using:

`npm run test`

Also configure:

`npm run test:coverage`

## 7. Backend Testing

Configure Pytest and HTTPX.

Create actual tests for:

- Root endpoint.
- Health check endpoint.
- GET items.
- POST item.
- GET item by ID.
- PUT item.
- DELETE item.
- Invalid request validation.
- Non-existent item handling.
- Database operations.

Use a separate test database or isolated SQLite test database where appropriate.

Never allow tests to modify production database records.

Include fixtures in `conftest.py` and use dependency overrides for database sessions.

Ensure the tests can run using:

`pytest`

## 8. Git and .gitignore Configuration

Create appropriate `.gitignore` files at the root and inside frontend and backend.

Exclude:

- `.env` and other secret files.
- `node_modules/`
- `dist/`
- `build/`
- `__pycache__/`
- `*.pyc`
- `.venv/`
- `venv/`
- `.pytest_cache/`
- `.coverage`
- `htmlcov/`
- `.DS_Store`
- IDE-specific temporary files.
- Logs and temporary files.

Ensure `.env.example` files are committed.

Do not ignore important project configuration files.

If Git is already initialized, preserve its existing history and configuration.

## 9. Environment Variables

Create frontend `.env.example`:

`VITE_API_BASE_URL=http://localhost:8000`

Create backend `.env.example` with:

- `DATABASE_URL`
- `SECRET_KEY`
- `ENVIRONMENT`
- `FRONTEND_URL`
- `ALLOWED_ORIGINS`

Include safe development defaults where appropriate, but never place actual secrets in tracked files.

Ensure frontend variables use the Vite `VITE_` prefix only for public configuration. Never expose backend secrets to the browser.

## 10. Deployment Configuration

Prepare the project for deployment.

**Vercel:**
- Configure frontend deployment.
- Set frontend root directory.
- Configure build command and output directory.
- Configure production API base URL.
- Add appropriate SPA routing fallback configuration if necessary.

**Render:**
- Prepare backend deployment configuration.
- Create a suitable `render.yaml` or deployment instructions.
- Configure Python runtime.
- Define build and start commands.
- Support environment variables.
- Configure CORS for the deployed frontend.
- Include a health-check endpoint.

**PostgreSQL:**
- Provide instructions for connecting Supabase or Neon.
- Configure the production database URL.
- Explain how to run Alembic migrations during deployment.

Prioritize free-tier compatibility and avoid requiring paid services.

Do not assume free-tier availability or limitations will remain unchanged.

## 11. Documentation

Create a comprehensive `README.md` containing:

1. Project overview.
2. Key features.
3. Technology stack.
4. Architecture overview.
5. Folder structure.
6. Prerequisites.
7. Installation instructions.
8. Frontend setup.
9. Backend setup.
10. PostgreSQL configuration.
11. Environment variables.
12. Running the application locally.
13. Running frontend tests.
14. Running backend tests.
15. Generating test coverage.
16. Database migrations.
17. API endpoints.
18. Swagger documentation.
19. Git and GitHub workflow.
20. Vercel deployment.
21. Render deployment.
22. Database hosting setup.
23. Troubleshooting.
24. Contribution guidelines.
25. License.

Also create:
- `docs/API.md`
- `docs/DATABASE.md`
- `docs/DEPLOYMENT.md`

Documentation must contain correct commands matching the actual configuration.

## 12. Code Quality and Best Practices

Follow these principles:

- Clean and modular architecture.
- Separation of concerns.
- Reusable components.
- Type safety.
- Consistent naming conventions.
- Proper error handling.
- No hardcoded credentials.
- No unnecessary dependencies.
- No duplicated code.
- Meaningful comments where necessary.
- Maintainable and testable code.
- Production-conscious security practices.

Use compatible dependency versions and generate the appropriate lockfiles where practical.

## 13. Execution Instructions

IMPORTANT: Actually create the complete project in my current workspace. Do not simply print the folder structure or provide code snippets.

Follow this sequence:

1. Inspect the current workspace.
2. Identify existing files and preserve all existing user work.
3. Create the complete folder structure.
4. Generate the configuration files.
5. Implement the basic frontend.
6. Implement the basic backend.
7. Configure the PostgreSQL integration.
8. Configure Alembic migrations.
9. Implement frontend tests.
10. Implement backend tests.
11. Create all `.gitignore` files.
12. Create `.env.example` files.
13. Create the README and technical documentation.
14. Prepare deployment configuration.
15. Install dependencies if possible.
16. Run frontend and backend tests.
17. Fix errors caused by the generated implementation.
18. Verify that the frontend and backend can run independently.

Do not overwrite existing code without permission. Do not initialize a new Git repository if one already exists.

If PostgreSQL credentials or external services are unavailable, prepare the configuration and clearly identify the remaining manual setup steps.

## 14. Final Report

After completing the implementation, provide:

- Final folder tree.
- Summary of all generated files.
- Frontend implementation details.
- Backend implementation details.
- Database configuration details.
- Number of frontend and backend tests created.
- Actual test execution results.
- Commands to install dependencies.
- Commands to run frontend and backend.
- Commands to execute tests.
- Commands to run migrations.
- Deployment instructions.
- Remaining manual configuration.

Do not claim that tests pass unless you have actually executed them successfully.

**Final objective:** Build a complete, working, testable full-stack starter project that follows professional development practices and is ready for GitHub, Vercel, Render, and hosted PostgreSQL deployment, with a strong preference for free-tier services.



# Prompt 2

