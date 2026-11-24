# CI/CD Pipeline Documentation

## Overview

Automated testing and deployment pipeline using GitHub Actions. Every push and pull request triggers comprehensive tests to ensure code quality and deployability.

---

## Workflows

### 1. Backend Tests (`backend-tests.yml`)

**Triggers:** Push/PR to `backend/` or `develop` branch

**What it does:**
- Sets up PostgreSQL 15 database
- Installs Python 3.12 dependencies
- Runs pytest with coverage reporting
- Uploads coverage to Codecov
- Comments on PR with results

**Run time:** ~2-3 minutes

**Manual trigger:**
```bash
cd backend
python -m pip install -r requirements.txt
pytest -v --cov=app
```

---

### 2. Frontend Tests (`frontend-tests.yml`)

**Triggers:** Push/PR to `frontend/` or `develop` branch

**What it does:**
- Tests on Node.js 18.x and 20.x
- Installs npm dependencies
- Runs linting (if configured)
- Builds production bundle
- Runs Vitest test suite
- Uploads coverage to Codecov
- Saves build artifacts

**Run time:** ~3-4 minutes (per Node version)

**Manual trigger:**
```bash
cd frontend
npm ci
npm run build
npm run test
```

---

### 3. Integration Tests (`integration-tests.yml`)

**Triggers:** Push/PR to `main` or `master` branch

**What it does:**
- Runs both backend and frontend tests
- Sets up full test environment
- Verifies full-stack compatibility
- Reports overall application status

**Run time:** ~5-7 minutes

---

### 4. Code Quality (`code-quality.yml`)

**Triggers:** Push/PR to any branch

**What it does:**
- Lints backend Python code (flake8, pylint)
- Checks frontend dependencies (npm audit)
- Generates code quality report
- Identifies potential issues early

**Run time:** ~1-2 minutes

---

### 5. Deployment Checks (`deployment-checks.yml`)

**Triggers:** Push/PR to `main` or `master`

**What it does:**
- Verifies all required configuration files
- Validates Python syntax
- Checks TypeScript configuration
- Verifies Docker files (optional)
- Generates deployment readiness report
- Comments on PR with deployment status

**Run time:** ~1-2 minutes

---

## Workflow Status Matrix

| Workflow | Backend | Frontend | Integration | Deployment |
|----------|---------|----------|-------------|------------|
| **Trigger** | `backend/**` | `frontend/**` | `main` | `main` |
| **Duration** | 2-3 min | 3-4 min | 5-7 min | 1-2 min |
| **Services** | PostgreSQL | Node.js | Full stack | Config check |
| **Coverage** | pytest | Vitest | Full suite | Readiness |
| **Report** | Codecov | Codecov | Summary | PR comment |

---

## Understanding the Checks

### ✅ When CI Passes

```
✅ Backend tests passed (64 tests)
✅ Frontend tests passed (122 tests)
✅ Build succeeds
✅ Deployment checks pass
→ Ready to deploy!
```

### ❌ When CI Fails

1. **Backend tests fail:**
   - Check error message in GitHub Actions
   - Run locally: `cd backend && pytest -v`
   - Fix the failing test
   - Push fix → CI reruns automatically

2. **Frontend tests fail:**
   - Check error message in GitHub Actions
   - Run locally: `cd frontend && npm test`
   - Fix the failing test
   - Push fix → CI reruns automatically

3. **Build fails:**
   - Check compilation errors
   - Verify dependencies installed
   - Run locally to reproduce
   - Fix and push

---

## PR Workflow

### Step 1: Create Feature Branch
```bash
git checkout -b feature/my-feature
# ... make changes ...
git push origin feature/my-feature
```

### Step 2: GitHub Actions Runs
- Backend tests (if backend files changed)
- Frontend tests (if frontend files changed)
- Code quality checks
- Comments on PR with status

### Step 3: Review Results
- Click "Details" next to each check
- Read full logs if any failures
- Address any issues

### Step 4: Merge
- All checks must pass (or be approved)
- Merge PR to `main` or `master`
- Integration tests run
- Deployment checks run

### Step 5: Automatic Deployment
- **Vercel** automatically deploys frontend
- **Render** automatically deploys backend
- Both services updated within 2-3 minutes

---

## Viewing Workflow Results

### GitHub UI

1. Go to your repository
2. Click **Actions** tab
3. Select workflow from list
4. Click run to see details
5. Click **Jobs** to see logs

### Artifacts

- **Build artifacts:** `frontend/dist/`
- **Test coverage:** View on Codecov
- **Reports:** Download from Artifacts section

### PR Comments

Workflows automatically comment on PRs with:
- Test results summary
- Coverage changes
- Deployment status
- Instructions to run locally

---

## Environment Variables

### For CI/CD

GitHub Actions automatically sets:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/test_db
ENVIRONMENT=test
SECRET_KEY=test-secret-key-for-ci
ALLOWED_ORIGINS=http://localhost:5173
```

### Add Secrets (Optional)

For sensitive keys (Twilio, Razorpay, etc.):

1. Go to **Settings → Secrets and variables → Actions**
2. Click **New repository secret**
3. Add secret: `TWILIO_ACCOUNT_SID=xxxxx`
4. Use in workflow: `${{ secrets.TWILIO_ACCOUNT_SID }}`

---

## Troubleshooting

### "Tests passed locally but fail in CI"

**Cause:** Environment differences
**Solution:**
- Run with same Python/Node version as CI
- Use same database setup
- Check env variables

### "Coverage report not uploading"

**Cause:** Codecov misconfiguration
**Solution:**
- Check `.codecov.yml` exists (optional)
- Verify coverage files generated
- Check Codecov token (optional)

### "Build times too long"

**Solution:**
- Use `cache: 'pip'` for backend (caches dependencies)
- Use `cache: 'npm'` for frontend
- Avoid unnecessary dependencies

---

## Best Practices

### 1. Keep Tests Fast
- Unit tests: <30 seconds
- Integration tests: <1 minute
- Full suite: <10 minutes

### 2. Run Tests Before Pushing
```bash
# Backend
cd backend && pytest -v

# Frontend
cd frontend && npm test
```

### 3. Write Meaningful Commit Messages
```
✅ Good:    "Add SMS notifications for queue calls"
❌ Bad:     "fix bug"
```

### 4. Use Feature Branches
```bash
git checkout -b feature/payment-integration
# ... work ...
git push origin feature/payment-integration
# Create PR → CI runs → Merge
```

### 5. Review Logs on Failure
- Always read the error message
- Understand what failed
- Fix root cause, not symptom

---

## Customization

### Add More Workflows

Create new `.yml` file in `.github/workflows/`:
```bash
.github/workflows/security-scan.yml      # For vulnerability scanning
.github/workflows/performance-tests.yml   # For load testing
.github/workflows/docker-build.yml       # For Docker images
```

### Modify Existing Workflows

Edit the YAML file:
```yaml
on:
  push:
    branches: [ main, master, develop ]  # Add branches
  pull_request:
    branches: [ main, master, develop ]
  schedule:                                # Run on schedule
    - cron: '0 2 * * *'                   # 2 AM daily
```

### Add Notifications

Send Slack/Discord messages on failures:
```yaml
- name: Notify Slack on failure
  if: failure()
  uses: slack-notify-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## Status Badges

Add to your README:

```markdown
[![Backend Tests](https://github.com/username/repo/workflows/Backend%20Tests/badge.svg)](https://github.com/username/repo/actions)
[![Frontend Tests](https://github.com/username/repo/workflows/Frontend%20Tests/badge.svg)](https://github.com/username/repo/actions)
[![Integration Tests](https://github.com/username/repo/workflows/Integration%20Tests/badge.svg)](https://github.com/username/repo/actions)
```

---

## Support & Links

| Resource | Link |
|----------|------|
| GitHub Actions Docs | https://docs.github.com/en/actions |
| Codecov | https://codecov.io |
| pytest Documentation | https://docs.pytest.org |
| Vitest Documentation | https://vitest.dev |
| Actions Marketplace | https://github.com/marketplace?type=actions |

---

**CI/CD Status:** ✅ Active  
**Last Updated:** November 24, 2024
