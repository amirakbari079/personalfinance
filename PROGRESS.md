# PersonalFinance Progress Log

Last updated: 2026-07-15
Current branch: `cursor/m1-auth-csv-jalali-theme`
Base branch: `main`

## Completed

- M1 Foundation gap closure completed:
  - Real auth enabled (JWT in HttpOnly cookie, frontend session check via `/api/v1/auth/me`).
  - Dev bypass removed from backend security and frontend auth context.
  - Jalali date picker upgraded to real calendar selection in forms.
  - CSV export flows added (backend export endpoints + frontend export buttons).
  - Dev documentation added in `README.md`.
- M2 to M4 features are implemented:
  - Accounts CRUD + total.
  - Investments CRUD + total.
  - Incomes CRUD + monthly total.
  - Loans CRUD + pay-next installment.
  - Pending expenses CRUD + total.
- UI system upgraded:
  - Tokenized dark/light theme.
  - Glass header + theme toggle.
  - Shared page header and export button.
  - Shared modal/input/card styling with CSS variables.
- M5 Receivables & StandBy:
  - Receivables CRUD + CSV at `/api/v1/receivables` (`V8__add_receivables.sql`).
  - StandBy CRUD + CSV at `/api/v1/standby` (`V9__add_standby.sql`).
  - Frontend pages at `/receivables` and `/standby`.
- M6 Net Worth Dashboard:
  - Balance aggregation API at `GET /api/v1/balance`.
  - Formula: `Net Worth = (Cash + Investments + StandBy + Receivables) − Monthly Installments − Pending Expenses`.
  - Dashboard page at `/` with category breakdown and net figure.
- **M6.1 Value history (accounts + investments)**:
  - Generic `value_snapshots` table (`V11`, backfill `V12`).
  - CRUD snapshot API per account/investment; aggregate trend + cash-flow endpoints.
  - Shared frontend history modal, trend chart, cash-flow card on accounts and investments pages.
  - Branding: logo, favicon, AppShell metadata.
  - Snapshot edit bugfix: form state sync, Jalali digit normalize, backend duplicate-date guard.

## Current state

- **Phase 1 complete** (M1–M6).
- **Phase 1.5 — History & Market Intelligence (Enterprise Investments)** in progress.
- **Phase 2 (M7–M12) on hold** until M6.x milestones are complete.

## Current focus

Enterprise Investments: live market quotes (BTC, gold, ETFs), sidebar layout, auto toman valuation in investment form, navigation performance.

## Next tasks (Phase 1.5)

1. ~~Fix snapshot edit duplicate-date bug~~ (done)
2. Market data backend (`V13`, scheduler, `/api/v1/market/*`)
3. Investments page: two-column layout + market sidebar + month mini charts
4. InvestmentForm: live unit price, auto toman calc, manual override
5. Performance: dynamic recharts import, route loading skeletons

## Notes for low-token next chats

- Read only: `PROGRESS.md`, `ROADMAP.md`, `REQUIREMENTS.md`.
- Reuse Phase 1 module patterns; market data lives in `backend/.../marketdata/`.
- Do not start M7 (Product Catalogue) until M6.2–M6.6 are done.
