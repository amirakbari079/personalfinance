# PersonalFinance Progress Log

Last updated: 2026-08-17
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
- **M6.7 Slice 1 — Financial Intelligence catalog:**
  - Flyway `V16`: `fi_assets`, providers, source routes, immutable `fi_asset_prices`, daily OHLC, jobs, quality/conflict tables.
  - Seeded USD, USDT, GOLD_18K, GOLD_SPOT, COIN_EMAMI, PAXG, BTC, ETF_AYAR, ETF_NARANGE.
  - Migrated `market_price_snapshots` into `fi_asset_prices` (currency normalized to `IRT`/`USD`).
  - Dual-write from `MarketDataService` so `/api/v1/market` is unchanged.
  - `GET /api/v1/financial-intelligence/assets`.
- **M6.7 Slices 2–4 + overview UI:**
  - `FinancialDataProvider` adapters (TGJU, CoinGecko, Nobitex, TSETMC) with route fallback.
  - Async `POST /api/v1/financial-intelligence/updates` (202) + job history; scheduler/manual market refresh use the same pipeline.
  - Daily OHLC rollup; `GET /prices`, `/history`, `/metrics/premiums`.
  - Overview page at `/intelligence` (بروزرسانی اطلاعات).
  - V17 pauses Coin Emami route until a live adapter exists.
- **M6.7 Slice 5–6 — quality + Update Center:**
  - Conflict detector (threshold 0.5%, symmetric %); primary kept, conflict recorded (`CONFLICT_PRIMARY_KEPT`).
  - Reference values + market snapshot per update job.
  - `GET /quality`, `GET /conflicts`; Flyway `V18` adds conflict currency.
  - Pages: `/intelligence/updates`, `/intelligence/quality`.
- **M6.7 Slice 7 — macro:**
  - Flyway `V19`: `fi_macro_indicators`, `fi_macro_observations`, `fi_economic_events` (events schema-only).
  - World Bank CPI YoY for IR/US; delta ingest, skipped if observations are newer than 7 days; failures do not fail the market job.
  - `GET /api/v1/financial-intelligence/macro`; page `/intelligence/macro`.
- **M6.7 Slice 8 — advisor context + LLM interface:**
  - `GET /api/v1/advisor/context?symbols=` returns latest price, 30d/1y return, ≤12 monthly closes, premiums, latest macro, open conflict count, `marketSnapshotId`.
  - `POST /api/v1/advisor/draft`: Claude if `ADVISOR_LLM_API_KEY` is set, otherwise fake client. No ChatGPT.
- **M6.7 Slice 9 — recommendation audit:**
  - Flyway `V20`: sessions, recommendations, theses, prompt versions.
  - Draft persists as `ACTIVE`, bound to `market_snapshot_id` + prompt `1.0`.
  - Cache: same decision + same snapshot + same prompt reuses the row (`reuse_count`).
  - New snapshot for the same decision marks previous open rows `SUPERSEDED`.
  - Lifecycle: `ACTIVE` → `COMPLETED` / `EXPIRED` / `INVALIDATED` (supersede is system-only).
  - Page: `/intelligence/advisor`.
- **M6.7 Slice 10 — evaluation foundation:**
  - Flyway `V21`: `advisor_recommendation_evaluations` + reserved `advisor_strategy_definitions` (no runner).
  - `GET /api/v1/advisor/recommendations/{id}/evaluation` recomputes returns from daily OHLC (thesis asset vs GOLD_18K / USD / BTC). Does not judge whether the AI was “right”.
  - Advisor page shows the evaluation under the selected recommendation.

## Current state

- **Phase 1 complete** (M1–M6).
- **Phase 1.5 — History & Market Intelligence** complete for M6.7 slices 1–10.
- **Phase 2 (M7–M12) on hold.**

## Current focus

Advisor page now requires a market-context preview and a real portfolio (accounts, investments, optional session-only holdings) before draft. Flyway `V23` stores `portfolio_json` and activates prompt `1.1`.

## Next task (for new session)

Do not start Phase 2 M7 unless explicitly requested. Optional later: backtest engine on `advisor_strategy_definitions`, compare-normalized charts.

## Notes for low-token next chats

- Read only: `PROGRESS.md`, `ROADMAP.md`, `REQUIREMENTS.md`.
- Market facade stays in `marketdata`; catalog/history live in `intelligence` (`fi_*` tables).
- Advisor context is summaries only — never send raw ticks or provider payloads to an LLM.
- Advisor preview is `POST /api/v1/advisor/context` with selected account/investment IDs; draft uses the same payload plus the question.
- Advisor LLM: Anthropic HTTP if `ADVISOR_LLM_API_KEY` is set; otherwise Cursor `agent` CLI (`--mode ask`). Fake only if neither is available.
- Do not start M7 until M6.7 data-platform slices are stable.
