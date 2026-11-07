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

## Resume checkpoint — 2026-11-05 (shutdown requested)
- Created isolated worktree: `E:/Ai Agent Project/PersonalFinance-foundation`, branch `codex/finance-foundation`, starting at `bcd4cf3`.
- Main checkout remains on stable `codex/visual-finance-experience` (`e30cf0d`).
- This resume session only inspected source; no database commands, migrations, application restarts, tests, or functional code edits were performed.
- Next: add isolated PostgreSQL integration tests for LedgerService; connect AccountService to opening balances/corrections; replace destructive account deletion with archive; prevent AccountSnapshotService writes from bypassing the ledger. Preserve existing snapshot rows and verify preservation before rollout.
- User requested immediate stop because the computer is shutting down. Do not auto-start or deploy unfinished foundation work.

## Resume checkpoint — 2026-11-07

User requested lower token/cost usage and light models for routine work. Main stable checkout `E:/Ai Agent Project/PersonalFinance` remains at `e30cf0d`; there have been no production database changes or deployment. Foundation work remains uncommitted and incomplete: account ledger integration, archive/restore preserving history, read-only legacy account snapshots, derived ledger history, and transaction UI with preview, search, and reversal are in progress. The full approved feature roadmap remains pending; this is not a completion or release checkpoint.

V25 preserves original snapshots in `pf_legacy_history`, makes ledger/audit records immutable, and defers foreign keys; it was applied only to isolated `personalfinance_foundation_integration_test`. Nine new `LedgerIntegrationTest` tests passed before adding a tenth test for reversal historical summary. Frontend typecheck passed after removing two unused names. `BackupIntegrationTest` currently fails during restore and is the priority blocker; `BackupService` is not fixed. No V26 exists. Latest scheduling configuration and summary/history changes still need a complete backend rerun. No frontend visual test or build has been performed. Failure details are in ignored `foundation-test.log` and `backend/target/surefire-reports`.

Next: investigate and fix backup restore, including the failing `fi_asset_source_routes_asset_id_fkey` ordering (asset rows are restored later), JSONB/UUID binding, and audit insertion collisions. Reject old/incomplete backups before truncation and save a pre-restore backup. Then finish the remaining feature roadmap and agreed checks; routine documentation/formatting may use lower-cost models. Do not change or deploy production.


## Resume checkpoint — 2026-11-07 (verification)

V26 adds `pf_restore_events`, preserving operational restore history through logical restores. Restore suppresses duplicate audit only inside its transaction; it validates tables, columns, and counts before modification, locks target tables, saves a same-connection safety backup, defers and validates foreign keys before commit, restores original audit rows exactly, and rolls back failed replacements. JSONB/UUID binding is handled; new backup names use milliseconds plus randomness, legacy names remain accepted, and existing files are not overwritten. Upgrade old/incomplete backups separately; do not casually restore old data over newer user records.

Account DELETE now archives and requires a version and zero balance; restore is `POST /api/v1/accounts/{id}/restore?version=`. Metadata updates require a version. Balance changes use `/api/v1/ledger/adjustments` with reason, requestKey, and expectedVersion. Legacy account snapshots are read-only; no old transactions are inferred.

Verification: full backend suite passed (67 tests, zero failures/errors/skips), including 10 ledger tests and backup roundtrip, incomplete-backup rejection, and failed-FK rollback. Frontend typecheck, production build, and 9 frontend tests passed. Browser checks created and reversed a 25-toman test expense using Persian digits in the isolated integration database; no horizontal overflow at 375/768/1440/1920px, no browser errors. At 1920px, settings content was 1642px within a 1674px workspace.

UI-only cool-color/fullwidth changes are deployed to the ordinary frontend on port 3000 with original backend 8080, on main repo branch `codex/cool-wide-layout` commit `83bcf8a`; no foundation APIs or new transactions page are included there. Foundation preview on 3100/8180 remains separate and uses test data only; it will be stopped. Main stable checkout was untouched by foundation work. No production database changes or foundation release. The approved foundation roadmap remains unfinished. Agreed foundation test command targets only `personalfinance_foundation_integration_test`: `scripts/test-foundation.ps1 -MavenPath 'E:/Ai Agent Project/PersonalFinance/tools/maven/bin/mvn.cmd' -EnvFile 'E:/Ai Agent Project/PersonalFinance/.env' -Tests '*Test'`.
