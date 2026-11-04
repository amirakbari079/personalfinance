# PersonalFinance

Persian RTL personal finance app — Spring Boot backend + Next.js frontend.

## Prerequisites

- Java 21+
- Maven 3.9+ (or use the copy under `tools/maven` — `start.bat` prefers it)
- Node.js 22.6+ (Node 24 recommended)
- PostgreSQL 15+ (`CREATE DATABASE personalfinance;`)

Credentials default to `postgres` / `110` (override with env vars — see `.env.example`).

## Current maintenance guide

Read [docs/MAINTENANCE.md](docs/MAINTENANCE.md) for setup, module ownership,
provider contracts, tests, backups, limitations, and troubleshooting.
See [docs/REPAIR-2026-11-04.md](docs/REPAIR-2026-11-04.md) for the verified repair results.

## Quick start

| Action | File |
|--------|------|
| **Start** | Double-click `start.bat` |
| **Stop** | Double-click `stop.bat` |

`start.bat` starts PostgreSQL (if the Windows service is stopped), then backend + frontend, waits until ready, and opens `http://127.0.0.1:3000`.

If start fails: check `logs/backend.log` (most common cause: Postgres not installed / service needs Admin once).

The launcher now uses production builds for normal use and reuses them until source
files change. Closing the browser keeps the application running in the background.
Run `powershell -NoProfile -File scripts/autostart.ps1` to enable launch at Windows
sign-in; add `-Disable` to turn this off. It cannot remain reachable while Windows
is asleep or powered off.

Logs: `logs/backend.log`, `logs/backend.error.log`, `logs/frontend.log`

Backups: `backups/` (create/restore from Settings). Copy this folder off the machine as well.

| Login | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin` |

## Manual run

```bash
# Backend → http://localhost:8080
cd backend && mvn spring-boot:run

# Frontend → http://127.0.0.1:3000
cd frontend && npm install && npm run dev
```

## Docs

- [Visual experience](docs/VISUAL-EXPERIENCE.md) — Persian UI guide, chart calculations, design references and validation
- `REQUIREMENTS.md` — features
- `ARCHITECTURE.md` — design
- `ROADMAP.md` — milestone order
- `PROGRESS.md` — current status
