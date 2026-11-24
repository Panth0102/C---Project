
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

Read the existing project structure and all existing files before making changes.

I am building a **Salon Queue Management System**. Before implementing the application, establish the product documentation that will guide all future development.

Create the following files:

1. `docs/01-brief.md`
2. `docs/02-screens.md`
3. `docs/03-flows-rules.md`
4. `AGENTS.md` in the project root.

Use the following project requirements:

### Project purpose
A digital salon queue management system where customers can join a queue remotely, select services and preferred barbers, track their waiting position, and receive notifications when their turn arrives.

### Users
- Customer
- Receptionist
- Barber
- Salon Owner / Administrator

### Required screens
1. Home — `/`
2. Join Queue — `/join`
3. Customer Status — `/status/:id`
4. Reception Dashboard — `/reception`
5. Barber View — `/barber/:name`
6. Waiting Area Display — `/display`
7. Owner Settings — `/admin`

### Core features
- Customer registration and queue joining.
- Service selection with prices and estimated durations.
- Barber selection or automatic assignment.
- Unique queue tokens.
- Live queue position and estimated waiting time.
- Receptionist controls for calling the next customer.
- Barber controls for Start, Done and On Break.
- No-show and cancellation handling.
- Waiting-area live display.
- Service and barber management.
- Daily salon statistics.
- English and Gujarati language support.

### Visual identity — extremely important

Use the uploaded vintage brewery website screenshot as the visual inspiration.

Adapt its visual language to a premium old-school barbershop.

Color palette:
- Deep olive: #29291F
- Aged parchment: #E9E0C8
- Burnt copper: #A65F35
- Antique gold: #C39A5A
- Dark brown: #34291F
- Muted cream: #F4EBDD

Design direction:
- Vintage barbershop signage.
- Retro typography with condensed serif display headings.
- Elegant decorative borders and ornamental separators.
- Subtle paper grain and aged textures.
- Vintage circular stamps and emblem-style elements.
- Antique brass details.
- Dark, atmospheric hero sections.
- Cream-colored content sections.
- Classic barber-inspired illustrations and imagery.

Avoid:
- Generic SaaS dashboards.
- Bright gradients.
- Excessive rounded cards.
- Neon colors.
- Default Bootstrap styling.
- Modern glassmorphism.

### Documentation requirements

`01-brief.md`: Problem, users, scope, must-have features, exclusions and visual identity.

`02-screens.md`: Detailed description of all seven screens, their layout, elements, buttons, responsive behavior, empty states and error states.

`03-flows-rules.md`: Customer and walk-in flows, queue statuses, barber assignment rules, waiting-time calculations, cancellation, no-show handling and test checklist.

`AGENTS.md`: Technology stack, design rules, architecture rules, documentation references and development instructions.

### Technical stack
- React + TypeScript + Vite
- Tailwind CSS
- Python + FastAPI
- PostgreSQL
- SQLAlchemy + Alembic
- Vercel for frontend
- Render for backend

Do not build the actual application yet.

Preserve the existing project files. Make these documents detailed enough that another coding agent can implement the complete application without inventing product requirements.

When finished, show me the contents of the created documents and identify any unresolved decisions.



# Prompt 3
Read `AGENTS.md` and all files inside `docs/` before starting.

Now establish the application's frontend and backend foundation.

### Frontend
- Configure React, TypeScript, Vite and Tailwind CSS.
- Configure React Router.
- Set up Axios with a centralized API client.
- Configure reusable components and application layouts.
- Create all seven routes specified in `docs/02-screens.md`.
- Add English/Gujarati language configuration.
- Create reusable loading, error and empty-state components.

### Backend
- Configure FastAPI.
- Configure PostgreSQL using SQLAlchemy.
- Set up Pydantic Settings.
- Configure database sessions.
- Configure Alembic.
- Create API versioning under `/api/v1`.
- Configure CORS through environment variables.
- Add a health-check endpoint.

### Vintage design system

Implement a consistent design system across the application.

Colors:
- Background: #E9E0C8
- Primary dark: #29291F
- Secondary dark: #34291F
- Accent: #A65F35
- Antique gold: #C39A5A
- Light surface: #F4EBDD

Typography:
- Use a vintage serif font for headings.
- Use a condensed display font for large titles.
- Use a highly readable font for body text.
- Use decorative lettering sparingly.

Visual components:
- Vintage navigation bar.
- Antique-style buttons.
- Ornamental section dividers.
- Circular badge components.
- Vintage service cards.
- Parchment-style content panels.
- Subtle aged-paper textures.
- Consistent iconography.

Create a reusable theme system rather than hardcoding colors in individual components.

The application must feel like an old premium barbershop website, not a modern admin template.

### Important
Create functional starter components and pages, not just empty files.

Do not implement complete business logic yet.

Run the frontend and backend, fix configuration errors, and report the files created.

Do not modify unrelated files.

# Prompt 4

Read `AGENTS.md`, `docs/01-brief.md`, and `docs/02-screens.md`.

Build only Screen 1 (Home) and Screen 2 (Join Queue).

### Home page `/`

Create a visually impressive vintage barbershop landing page.

Include:

1. Vintage navigation bar with salon emblem and navigation links.
2. Full-width atmospheric hero section with dark olive background.
3. Large vintage-style salon title.
4. Decorative circular emblem or badge.
5. Short salon introduction.
6. Salon opening hours and current queue status.
7. Live waiting count and estimated waiting time.
8. Barber profiles with availability indicators.
9. Services section with service names, prices and durations.
10. Prominent antique-copper Join Queue button.
11. Footer with salon information and contact details.

The hero should resemble the uploaded vintage brewery reference in composition: dark photographic background, centered ornamental branding and large decorative typography.

Use authentic barbershop photography or appropriate illustrations. Do not use beer or brewery imagery.

### Join Queue `/join`

Create a responsive customer registration and service selection page.

Include:
- Customer name.
- Indian mobile number with 10-digit validation.
- Service selection.
- Maximum three selected services.
- Service prices and estimated durations.
- Barber selection.
- Any Available Barber option.
- Live total price.
- Live total service duration.
- Estimated queue waiting time.
- Confirm Queue button.

Display a vintage-style order summary.

### Functional requirements

- Selecting services updates totals immediately.
- Invalid phone numbers show validation errors.
- Prevent selecting more than three services.
- Customers cannot select unavailable barbers.
- Show confirmation before submitting.
- On successful submission, navigate to Customer Status.
- Prevent duplicate active queue entries for the same phone number.

Use realistic sample services and barbers initially.

Ensure the design works on mobile, tablet and desktop.

Do not build other screens or modify unrelated features.

Run the application and verify all interactions.

# Prompt 5

Read `AGENTS.md`, `docs/02-screens.md`, and `docs/03-flows-rules.md`.

Build only Screen 3: Customer Status (`/status/:id`).

Create a premium vintage-style customer tracking experience.

### UI requirements

Display:
- Large unique queue token.
- Customer name.
- Selected services.
- Assigned barber.
- Current queue position.
- Number of customers ahead.
- Estimated waiting time.
- Queue status.
- Salon address and opening hours.

### Status experiences

Implement distinct visual states:

1. **Waiting:** Show queue position and estimated wait.
2. **Approaching turn:** When the customer is second in line, show a prominent reminder.
3. **Called:** Display a full-screen antique-gold announcement saying "IT'S YOUR TURN!" with the assigned barber's name.
4. **In Chair:** Show that the service has started.
5. **Completed:** Show a completion message.
6. **Cancelled:** Show cancellation confirmation.
7. **No-show:** Show an appropriate status message.

### Functional requirements

- Queue position must update automatically.
- Estimated waiting time must recalculate when queue conditions change.
- Add a Cancel My Spot button with confirmation.
- Display the latest queue status without requiring manual refresh.
- Use FastAPI endpoints and persistent PostgreSQL data.
- Use polling initially or another appropriate synchronization mechanism.

### Design

Use dark olive, parchment, copper and antique gold.

Make the queue token the visual centerpiece.

Use vintage ticket-inspired styling, ornamental borders and subtle animations.

Do not make this look like a generic tracking dashboard.

Implement and test this screen only.

# Prompt 6

Read `AGENTS.md`, `docs/02-screens.md`, and `docs/03-flows-rules.md`.

Build only Screen 4: Reception Dashboard (`/reception`).

This is the primary operational interface for salon receptionists.

### Layout

Create a tablet-first dashboard with:

**Top navigation**
- Salon emblem.
- Current date and time.
- Queue open/closed status.
- Total customers waiting.
- Average estimated waiting time.

**Barber management section**

Display individual barber cards containing:
- Barber name and photograph.
- Availability status.
- Current customer token.
- Service being performed.
- Time elapsed.
- Call Next button.
- On Break / Available control.

**Waiting queue section**

Display a properly ordered customer list with:
- Queue token.
- Customer name.
- Phone number.
- Selected services.
- Preferred barber.
- Waiting duration.
- Current status.
- No-show action.
- Cancel action.

**Walk-in registration**

Create an Add Walk-in button that opens a modal.

Include customer details, service selection and barber preference.

Walk-ins must enter the same queue as online customers.

### Queue rules

Follow `docs/03-flows-rules.md` exactly.

- First come, first served.
- A barber only receives customers who selected that barber or Any Barber.
- Customers with a specific barber preference must never be assigned elsewhere.
- One active customer per barber.
- A barber on break cannot receive new customers.
- No-show customers must be removed from the active queue.
- Cancelled customers must be removed from the active queue.

### Design

Create a vintage administrative interface with parchment panels, olive backgrounds, copper action buttons and antique-gold highlights.

Prioritize information density and usability over decoration.

Make it suitable for a 10-inch tablet in landscape orientation.

### Functional requirements

Connect all actions to the FastAPI backend and PostgreSQL database.

Ensure changes immediately appear in Customer Status, Barber View and Waiting Area Display.

Use confirmation dialogs for destructive actions.

Do not implement other screens.

# Prompt 7

Read `AGENTS.md`, `docs/02-screens.md`, and `docs/03-flows-rules.md`.

Build only:

1. Screen 5: Barber View (`/barber/:name`)
2. Screen 6: Waiting Area Display (`/display`)

### Screen 5 — Barber View

Design a mobile-first interface for barbers.

Display:
- Barber name and profile image.
- Availability status.
- Current customer token.
- Customer name.
- Selected services.
- Service duration.
- Timer showing elapsed service time.
- Next customer information.

Actions:
- Start Service.
- Mark Service as Done.
- Go on Break.
- Return to Available.

Functional requirements:
- A barber cannot start another service while already serving a customer.
- Starting a service changes the customer status to In Chair.
- Completing a service changes the customer status to Done.
- Completing a service makes the barber available again.
- Break status prevents new customer assignments.
- All changes must synchronize with the Reception Dashboard and Customer Status.

### Screen 6 — Waiting Area Display

Create a full-screen television interface designed to be readable from at least five metres.

Display:
- Large salon branding.
- Current date and time.
- Each barber's name and photograph.
- Current customer token for each barber.
- Up Next queue containing the next five customers.
- Estimated waiting times.
- Recently called customer announcement.

When a customer is called:
- Highlight the token with an antique-gold effect.
- Display a prominent announcement.
- Play a subtle notification chime when browser permissions allow it.

### Design requirements

The television display should resemble a vintage salon announcement board.

Use:
- Deep olive background.
- Aged parchment typography.
- Antique-gold token highlights.
- Decorative copper separators.
- Large readable typography.

Avoid excessive animations and small text.

### Synchronization

All updates must come from the same backend data.

Changes from the Barber View must appear in the Reception Dashboard, Customer Status and Waiting Area Display within five seconds under normal network conditions.

Implement and test both screens without modifying unrelated screens.

# Prompt 8

Read `AGENTS.md`, `docs/02-screens.md`, and `docs/03-flows-rules.md`.

Build only Screen 7: Owner Settings (`/admin`).

Create a vintage premium administration interface for salon owners.

### Sections

**1. Salon Information**
- Salon name.
- Logo.
- Address.
- Contact number.
- Opening and closing hours.

**2. Service Management**

Allow owners to:
- Add services.
- Edit services.
- Delete services.
- Enable or disable services.
- Set service prices.
- Set estimated service durations.
- Add English and Gujarati service names.

**3. Barber Management**

Allow owners to:
- Add barbers.
- Edit barber profiles.
- Upload profile photographs.
- Activate or deactivate barbers.
- Set availability.
- Configure their working hours.

Do not allow deactivation while a barber has an active customer without appropriate confirmation and reassignment handling.

**4. Queue Management**
- Open or close online queue joining.
- Configure the online joining cutoff time.
- Display the current queue.
- Allow walk-ins according to the queue rules.

**5. Daily Statistics**

Create dashboard cards showing:
- Total customers served.
- Total cancellations.
- Total no-shows.
- Average waiting time.
- Average service duration.
- Most popular service.
- Revenue generated from completed services.

Only use actual database records for statistics.

### Functional requirements

- Disabling a service removes it from customer service selection.
- Closing the online queue disables the Join Queue action.
- Existing customers must retain their queue records.
- Changes must persist in PostgreSQL.
- Validate all owner inputs.
- Use appropriate confirmation dialogs.

### Design

Continue the old-school barbershop theme.

Use parchment panels, dark olive navigation, copper action buttons and vintage typography.

Keep the dashboard professional and readable.

Implement this screen and verify its integration with the rest of the application.

# Prompt 9

Read `AGENTS.md` and all documentation in `docs/`.

Now perform a complete integration and quality-assurance pass across the Salon Queue Management System.

Do not redesign the application or introduce unrelated features.

### 1. End-to-end integration

Verify the complete customer journey:

1. Customer opens Home.
2. Customer selects services and barber.
3. Customer joins the queue.
4. A unique token is generated.
5. Customer views queue position and estimated wait.
6. Receptionist calls the next eligible customer.
7. Customer receives the turn announcement.
8. Barber starts the service.
9. Barber completes the service.
10. Customer status updates to completed.
11. Reception Dashboard and Waiting Area Display update accordingly.

### 2. Verify queue rules

Test:
- First come, first served.
- Specific barber preference.
- Any Barber assignment.
- Barber on break.
- Duplicate active phone numbers.
- Multiple services.
- Queue cancellation.
- No-show handling.
- Rejoining after no-show.
- Online queue closure.
- Waiting-time recalculation.
- Simultaneous queue operations.

Fix violations of the documented business rules.

### 3. Frontend testing

Run all Vitest and React Testing Library tests.

Test:
- All seven routes.
- Form validation.
- Service selection.
- Barber selection.
- Navigation.
- API error handling.
- Loading states.
- Language switching.
- Responsive layouts.

### 4. Backend testing

Run the complete Pytest suite.

Test:
- All API endpoints.
- CRUD operations.
- Database persistence.
- Invalid inputs.
- Queue assignment.
- Duplicate customer prevention.
- Cancellation.
- No-show.
- Barber availability.
- Concurrent requests where applicable.

### 5. Visual quality assurance

Review all seven screens.

Maintain the same vintage design language throughout.

Check:
- Color consistency.
- Typography consistency.
- Responsive behavior.
- Button sizes.
- Text readability.
- Image quality.
- Empty states.
- Error states.
- Loading states.
- Navigation consistency.

Check mobile, tablet and desktop layouts.

Ensure no page looks like an unrelated template.

### 6. Final report

Provide:
- Tests executed.
- Pass/fail results.
- Bugs discovered.
- Bugs fixed.
- Remaining issues.
- Screens verified.
- Files modified.

Do not claim that a test passed unless it was actually executed.

Do not change documented business rules without explicitly identifying the reason and requesting approval.

# Prompt 10

Read `AGENTS.md` and inspect the complete application.

Prepare the Salon Queue Management System for free-tier deployment.

### Deployment architecture

- Frontend: Vercel.
- Backend: Render.
- Database: Supabase or Neon PostgreSQL.
- Source control: GitHub.

### Requirements

1. Verify the production frontend build.
2. Verify the backend starts correctly using the production ASGI server.
3. Configure environment variables.
4. Remove hardcoded localhost API URLs from production configuration.
5. Configure production CORS.
6. Configure PostgreSQL connection using hosted database credentials.
7. Prepare and verify Alembic migrations.
8. Configure Render build and start commands.
9. Configure Vercel build settings and frontend root directory.
10. Configure SPA routing fallbacks.
11. Verify API health checks.
12. Check that no secrets are exposed in frontend bundles.
13. Verify that the production frontend communicates with the production backend.
14. Test the complete customer-to-barber queue flow on the deployed application.

### Documentation


Update README.md with:

- Project description.
- Technology stack.
- Architecture.
- Folder structure.
- Installation instructions.
- Local development commands.
- Testing commands.
- Environment variable configuration.
- Database setup.
- API documentation.
- Deployment instructions.

Keep the following at the very top of README.md:

**Live Demo:** [Actual deployed URL]

**GitHub Repository:** [Actual repository URL]

Do not invent URLs. Leave placeholders until deployment is complete.

### Final verification

Give me exact step-by-step instructions to deploy the frontend, backend and database.

Identify any limitations of the free hosting tiers.

Do not claim the application is live until deployment has actually succeeded.