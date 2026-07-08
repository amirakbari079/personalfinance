# PersonalFinance

Persian RTL personal finance app — Spring Boot backend + Next.js frontend.

## Prerequisites

- Java 21
- Maven 3.9+
- Node.js 20+
- PostgreSQL 15+

## Database setup

```sql
CREATE DATABASE personalfinance;
```

Update credentials in `backend/src/main/resources/application.yml` if needed (default: `postgres` / `110`).

Flyway runs automatically on backend startup and applies all migrations.

## Default login (development)

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin` |

Set via migration `V7__set_dev_user_password.sql`. Change before any production deployment.

## Run backend

```bash
cd backend
mvn spring-boot:run
```

API: `http://localhost:8080/api/v1/`

## Run frontend

```bash
cd frontend
npm install
npm run dev
```

UI: `http://localhost:3000`

Next.js rewrites `/api/*` to the backend (`frontend/next.config.ts`), so the browser sends cookies on the same origin.

## Authentication

- JWT stored in HttpOnly cookie (`token`)
- Login: `POST /api/v1/auth/login`
- Session check: `GET /api/v1/auth/me`
- Logout: `POST /api/v1/auth/logout`
- All other `/api/v1/**` endpoints require a valid token

## CSV export (backup)

Authenticated GET endpoints return UTF-8 CSV with BOM:

| Entity | Endpoint |
|--------|----------|
| Accounts | `GET /api/v1/accounts/export` |
| Investments | `GET /api/v1/investments/export` |
| Incomes | `GET /api/v1/incomes/export` |
| Loans | `GET /api/v1/loans/export` |
| Pending expenses | `GET /api/v1/pending-expenses/export` |

## Project docs

- `REQUIREMENTS.md` — feature requirements
- `ARCHITECTURE.md` — technical design
- `ROADMAP.md` — milestone order (authoritative)

## Current milestone status

- **M1** — Foundation (auth, Jalali, CSV export, dev docs)
- **M2–M4** — Accounts, Investments, Income, Loans, Pending expenses
- **M5–M6** — Receivables, StandBy, Net Worth dashboard (not started)
