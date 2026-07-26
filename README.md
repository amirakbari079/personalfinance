# PersonalFinance

Persian RTL personal finance app — Spring Boot backend + Next.js frontend.

## Prerequisites

- Java 21+
- Maven 3.9+
- Node.js 20+
- PostgreSQL 15+ (`CREATE DATABASE personalfinance;`)

Credentials default to `postgres` / `110` (override with env vars — see `.env.example`).

## Quick start

| Action | File |
|--------|------|
| **Start** | Double-click `start.bat` |
| **Stop** | Double-click `stop.bat` |

`start.bat` starts PostgreSQL (if the Windows service is stopped), then backend + frontend, waits until ready, and opens `http://localhost:3000`.

If start fails: check `logs/backend.log` (most common cause: Postgres not installed / service needs Admin once).

Logs: `logs/backend.log`, `logs/frontend.log`

| Login | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin` |

## Manual run

```bash
# Backend → http://localhost:8080
cd backend && mvn spring-boot:run

# Frontend → http://localhost:3000
cd frontend && npm install && npm run dev
```

## Docs

- `REQUIREMENTS.md` — features
- `ARCHITECTURE.md` — design
- `ROADMAP.md` — milestone order
- `PROGRESS.md` — current status
