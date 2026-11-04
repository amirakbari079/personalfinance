# Maintenance and handover

This is a local Persian personal-finance application. PostgreSQL holds the user's
records. Spring Boot exposes the API, and Next.js serves the UI and proxies `/api`.
Do not replace or recreate the user's database to fix a build or market provider.

## Run and stop

- Double-click `start.bat`. It starts PostgreSQL if necessary, builds changed
  sources, starts a packaged Java application and a production Next.js server,
  checks the health endpoint, and opens `http://127.0.0.1:3000`.
- Closing the browser does not stop the app. Use `stop.bat` to stop it.
- Subsequent launches reuse the JAR and frontend build when sources are unchanged.
- Development: stop the normal instance, then run
  `powershell -NoProfile -File scripts/start.ps1 -Dev`.
  Development output uses `.next-dev`; production output uses `.next`.
- Both runtimes started by the launcher listen on loopback. This is not an
  Internet deployment or a multi-user hosted service.
- `scripts/autostart.ps1` installs a per-user Windows Startup shortcut. It starts
  the app silently after Windows sign-in. Run it with `-Disable` to remove the
  shortcut. Windows sleep, shutdown and logout interrupt local availability.
  This is not a crash-restarting Windows service.

Prerequisites: Java 21, Maven 3.9+, Node 22.6+ (Node 24 tested), PostgreSQL 15+.
The bundled local Maven path is `tools/maven/bin/mvn.cmd`; otherwise Maven must
be on PATH. Install frontend dependencies with `npm ci` in `frontend`.

The launcher reads literal `KEY=value` pairs from the repository-root `.env`.
Copy `.env.example` and supply local settings for a new installation. Never commit
that file. Manual `mvn spring-boot:run` requires exported environment variables;
Spring does not automatically read `.env`. The Windows launcher expects ports
3000/8080 and PostgreSQL on 5432. Use a manual launch for custom port arrangements.
Changes to frontend build configuration require rebuilding after stopping it.

## Source map

- `backend/src/main/java/com/personalfinance/account`: accounts and investments.
- `income`, `loan`, `expense`, `receivable`, `standby`: the remaining record types.
- `history`, `balance`, `export`: historical values, summaries and exports.
- `marketdata`: public market adapters, market UI facade and calculation API.
- `intelligence`: provider routing, normalized asset prices, daily rollups,
  update jobs, quality conflicts and macroeconomic series.
- `advisor`: advisory context and optional LLM clients. Invoking the advisor may
  send portfolio context to its configured model. Ordinary market browsing does
  not invoke it.
- `backup`: application backup and restore.
- `frontend/features`: page-level UI and forms.
- `frontend/shared`: navigation, dialogs, market cards, local bank icons.
- `frontend/lib/api`: typed API clients and the short-lived in-memory read cache.
- `frontend/src/app`: route entries, layouts, error boundaries, styles and fonts.
- `backend/src/main/resources/db/migration`: append-only Flyway migrations.

## Market data contract

Never infer currency units from price magnitude. Convert source Rial to Toman
exactly once. Use `BigDecimal` on the backend. A failed provider must not overwrite
a stored price with zero. Last stored prices remain visible with their timestamps.

- TGJU uses the widget response's `p` (Rial) and `updated_at` (Tehran time).
  Missing or invalid timestamps are rejected instead of being labeled current.
- Nobitex uses `apiv2.nobitex.ir`, the v3 BTCIRT order book and
  `stats["usdt-rls"].latest`. Tether is not identical to cash USD; the existing
  routing catalog permits it as a fallback and quality comparisons can flag a
  premium. Nobitex stats currently use collection time because that response
  does not include an observation timestamp.
- CoinGecko fetches BTC and PAXG together, including `last_updated_at`. Successes
  and failures have a 60-second cooldown, preventing duplicate requests and 429
  storms. No paid API key is required by the default configuration.
- TSETMC identifiers verified against its own search API: Ayar
  `34144395039913458`, Narenj leveraged ETF `35831329532779850`. The former bundled
  identifiers are mapped for existing holdings/watchlists. Environment overrides
  remain available. Price date/time comes from `dEven`/`hEven`, Asia/Tehran.
- `GOLD_XAU_USD` is a **PAXG proxy**, not an independent gold spot feed. The UI
  explicitly calls it an estimate. Do not present it as an independent source
  when interpreting premiums or evaluating the advisor.
- Derived BTC/Toman follows the configured source priority and takes the older
  timestamp of its inputs. It is an estimate, not an executable exchange price.

The market page reads stored prices and never starts provider HTTP calls on a GET.
Startup collection runs in the background; subsequent automatic collection is
every ten minutes. Manual refresh is available. Update submissions within 30
seconds reuse recent work; queued/running work is deduplicated. An interrupted
job becomes retryable after ten minutes. The market page checks stored updates
once per minute while visible.

The UI facade selects the most recently received snapshot and displays its actual
source timestamp. Historical snapshots from older versions may contain collection
times or incorrect ETF values; they were not silently deleted or rewritten in
this repair. Monthly percentage changes compare stored samples, not a complete
exchange historical series. Outside trading hours a previous close is expected.

### Critical transaction boundary

`FinancialDataUpdateRunner` and `MarketDataService.fetchAllQuotes` must **not** have
an outer transaction. Provider payloads must commit before
`MarketPriceIngestService.ingestQuote` opens its isolated `REQUIRES_NEW` transaction.
An outer transaction made raw payload IDs invisible and caused foreign-key
failures for every quote. `saveAndFlush` alone does not solve cross-transaction
visibility. Each quote remains isolated so one failed quote does not roll back
all other providers. Quality persistence has its own transaction.

### Frontend cache

`apiGet`/`apiGetList` share in-flight requests and cache results in memory for 15
seconds, with a 100-entry cap. Mutations clear the cache before and after the
request; login/logout/session expiry also clear it. Errors are never retained.
Do not move financial data into persistent browser storage to optimize navigation.
Watchlist preferences are the existing localStorage exception.

## Test and release

```powershell
cd backend
..\tools\maven\bin\mvn.cmd test
cd ..\frontend
npm test
npm run build
```

Backend tests cover provider parsing, Rial/Toman conversion, exchange timestamps,
batch requests, rate-limit cooldown, and existing intelligence/advisor behavior.
Frontend tests cover request deduplication, mutation/auth invalidation, failed
requests and in-flight reads during mutation. Unit tests do not hit real providers.

After changes, start the app and check login, dashboard, market, accounts,
investments, balance sheet, intelligence, settings, and form open/cancel using
keyboard and mobile widths. Check actual API responses; a successful build alone
does not prove provider connectivity. Do not create/delete real financial records
for smoke tests. Use an isolated test database for destructive CRUD or restore tests.

## Troubleshooting

- UI: use `127.0.0.1`, not `localhost`, if IPv6 fallback adds delays on Windows.
- Runtime logs: `logs/backend.log`, `logs/backend.error.log`, `logs/frontend.log`.
- Health: `GET /api/v1/health` verifies an actual database query.
- Provider outcomes: authenticated `GET /api/v1/financial-intelligence/updates`.
- Missing price: inspect the latest job's rejected count and provider errors.
  VPN/DNS and provider rate limits can change independently of the application.
- TSETMC TLS on Windows uses the OS trusted root store and validates hostnames.
  On other systems it uses the Java trust store. Install valid trusted CA chains
  if needed; do not restore the former trust-all certificate code.
- If the build fails, read the command output. Do not start an old build while
  claiming the new source is deployed. Do not run build and dev in the same output.
- Stop only tracked app processes. The stop script checks PID creation time or
  legacy command-line ownership and never kills another app by port number.

## Data and version control

Create a backup in Settings before migrations or restore operations. Application
JSON backups contain database table rows except Flyway schema history; use PostgreSQL
`pg_dump` for a complete schema and database backup. Keep an off-device
copy. Restore is destructive and must be tested against a separate database first.

Ignored local files include `.env`, `.run`, logs, build output, JSON backups,
scratch plans and bank design references. Do not include screenshots containing
personal balances in the public repository. The remote repository is public.
Local Vazirmatn fonts are OFL-licensed; bank SVGs have their bundled MIT license.

For schema changes, add a new migration; never edit an already-applied migration.
Before publishing, review `git diff --cached`, run tests/build, and check that no
backup or credential file is staged. Existing uncommitted intelligence/advisor
and backup modules were preserved as part of this handover.

Sources: [Nobitex official API documentation](https://apidocs.nobitex.ir/),
[CoinGecko simple price](https://docs.coingecko.com/reference/simple-price),
[TSETMC](https://www.tsetmc.com/), [TGJU](https://www.tgju.org/).
