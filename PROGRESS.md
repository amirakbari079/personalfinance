# PersonalFinance Progress Log

Last updated: 2026-07-08
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

## Current state

- **Phase 1 is complete** (M1 through M6).
- Phase 2 (M7–M12) is not started.

## Next task (for new session)

Implement **M7 — Product Catalogue & Counterparties** (Phase 2 start).

### Scope

1. Backend modules `product` and `counterparty`.
2. Flyway migrations for product and counterparty tables.
3. CRUD + CSV export per module.
4. Counterparty computed balance view (invoiced, received/paid, outstanding).
5. Frontend pages, forms, API clients, nav items.

### Explicitly out of scope

- Inventory, invoices, receipts/payments (M8–M11).
- Business dashboard (M12).

## Notes for low-token next chats

- Read only: `PROGRESS.md`, `ROADMAP.md`, `REQUIREMENTS.md` (Phase 2 sections).
- Reuse Phase 1 module patterns; do not rescan entire repo.
