# Finance foundation implementation

Approved scope: single-user local personal finance, transaction-derived balances with explicit corrections, free market sources with fallbacks, AI proposals requiring human confirmation. Preserve all existing data and three visual themes. No AI model integration or public deployment in this phase.

## Execution checklist

- [x] Inspect current architecture and record concrete defects.
- [x] Back up production database and restore a separate test database.
- [ ] Catalog management and database migrations.
- [ ] Atomic transaction ledger, opening balances, corrections and reversals.
- [ ] Payments linked to loans, receivables, planned expenses and goods.
- [ ] Investment trades, quantities, cost and valuation separation.
- [ ] Audit trail, version conflicts and idempotency.
- [ ] Unified configurable market pipeline and provider diagnostics.
- [ ] Settings, authentication settings and scoped local API access.
- [ ] Versioned AI-readable context and confirmed change proposals.
- [ ] Management UI, transaction reports, detail views and responsive QA.
- [ ] OpenAPI, user/developer documentation, migration/restore verification.
- [ ] Production rollout, smoke tests and Git update.

## Baseline findings

- `InvestmentForm` heuristically divides large stock prices by 1000.
- Market calculation defaults all crypto to BTC and currencies to USD.
- The Nobitex USDT quote is labelled USD in a compatibility path.
- Reading balance-sheet history writes today's snapshot.
- Account deletion deletes its historical snapshots; snapshots are not an audit trail.
- Core entities lack update timestamps and optimistic versions.
- Asset/provider catalog tables exist but lack management endpoints.
- Investment quantities have only four decimal places.
- Settings cover colors and backup; architecture document still names Vite although app uses Next.js.

## Data safety

Production database: `personalfinance`. Isolated test database: `personalfinance_foundation_test`. The pre-migration PostgreSQL archive is under ignored `backups/pre-foundation-*.dump`. Tests must never target production. No historical cash transactions may be inferred from old balance snapshots. Existing balances become opening balances at cutover.

## Paused checkpoint — user request, 2026-11-05

The user asked to stop before the usage limit and explicitly emphasized preserving every current record and historical record. This is an **unfinished implementation checkpoint, not a release**.

Implemented drafts: V24 additive schema, opening balance seed, recursive credential redaction and database audit triggers, BaseEntity version/update fields, transactional audit context, allow-listed management endpoints, cash ledger endpoints with idempotency, account locking, corrections and reversals.

Validation completed:
- Backend compiles; all 56 existing Maven tests pass (0 failures/errors). These tests do NOT yet validate the new ledger business flows.
- V24 was run only inside a transaction on the isolated test database and rolled back. Opening balances, audit insert/update events, version increments and nested secret redaction passed the SQL smoke test.
- Production has no `pf_transactions` table: V24 has NOT been applied there.
- Restored database remains an independent pre-change copy. Backup: `backups/pre-foundation-20261105-163917.dump` (249216 bytes).

### Resume here

1. Switch to `codex/finance-foundation`; read this document. The usable app source is preserved on `codex/visual-finance-experience` at `e30cf0d`. Do not run the normal launcher on the foundation branch yet: it auto-builds and would apply migrations to the production database.
2. Complete new ledger integration tests on the isolated database, then connect existing AccountService and AccountSnapshotService writes to the ledger. Currently old account CRUD/snapshot paths bypass the new ledger; this is a release blocker. Account creation must create its opening state. Reject destructive snapshot writes after cutover. Ensure JPA/JDBC flush and version synchronization are tested.
3. Implement archive/restore behavior for the seven core entity services; the migration only adds columns, services still hard-delete. Add DTO versions and conflict handling for legacy CRUD. Add validation for management catalog metadata and provider/asset enum constraints; SQL constraints should become user-readable errors.
4. Complete payment/trade links, market corrections, settings, local API tokens, AI proposals, UI and documentation according to the approved checklist. Add OpenAPI. No financial AI/model work this phase.
5. Test restore and migration on the separate database, compare balances/history, then schedule an explicit rollout. Never infer historical transactions, discard old snapshots, reset production or recreate the user's data.

No frontend changes in this checkpoint. No production restart or deployment was performed. Private backup/database contents must never be committed or pushed.
