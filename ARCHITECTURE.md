# Architecture

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21 + Spring Boot 3 |
| Database | PostgreSQL |
| Frontend | React (TypeScript) |
| Build | Maven (backend), Vite (frontend) |
| API style | REST, JSON, versioned under `/api/v1/` |

---

## High-Level Structure

```
┌─────────────────────────────────┐
│         React Frontend          │  RTL, Persian UI, Jalali calendar
└────────────────┬────────────────┘
                 │ HTTP / REST
┌────────────────▼────────────────┐
│      Spring Boot Backend        │
│  Controllers → Services → Repos │
└────────────────┬────────────────┘
                 │ JPA / JDBC
┌────────────────▼────────────────┐
│           PostgreSQL            │
└─────────────────────────────────┘
```

---

## Backend Module Breakdown

### Phase 1 — Personal
| Module | Responsibility |
|---|---|
| `auth` | Simple single-user login (username + password) |
| `account` | Cash accounts CRUD + total balance |
| `investment` | Investment entries, multi-currency fields, Toman equivalent |
| `income` | Income sources (recurring + one-off) |
| `liability` | Loan installments + pending one-off expenses |
| `receivable` | Receivables with partial-payment tracking |
| `standby` | StandBy goods for sale |
| `balance` | Net worth calculation (aggregates all modules above) |

### Phase 2 — Business
| Module | Responsibility |
|---|---|
| `product` | Product catalogue |
| `counterparty` | Customers, suppliers, computed balances |
| `inventory` | Quantity tracking only — stock movements in/out, current stock per product |
| `costing` | Per-product cost basis — total purchase spend, unit cost, suggested sale price |
| `invoice.purchase` | Purchase invoice headers + line items (type: normal/return); on save: updates inventory + costing |
| `invoice.sale` | Sales invoice headers + line items (type: normal/return); reads costing for profit calc, updates inventory |
| `receipt` | Money received from counterparties |
| `payment` | Money paid to counterparties |
| `report` | Aggregated financial summary queries |

---

## Data Model Overview

### Currency / Multi-Currency Convention
Every monetary field is stored as **Toman (bigint, no decimals)**.

For crypto assets, the investment table stores:
- `native_currency_code` (VARCHAR) — e.g. "BTC", "PAXG"
- `native_amount` (DECIMAL) — actual units held
- `exchange_rate_at_entry` (BIGINT) — Toman per 1 unit at time of entry
- `toman_equivalent` (BIGINT) — used in all calculations

For foreign currency assets:
- `native_currency_code` (VARCHAR) — e.g. "USD", "EUR"
- `native_amount` (DECIMAL) — amount in foreign currency
- `exchange_rate_at_entry` (BIGINT) — Toman per 1 unit at time of entry
- `toman_equivalent` (BIGINT) — used in all calculations

For physical gold:
- `weight_grams` (DECIMAL) — exact weight, 18-karat assumed (no separate purity field)
- `price_per_gram_18k_at_entry` (BIGINT) — Toman per gram at time of entry
- `toman_total` (BIGINT) — computed and stored: `weight_grams × price_per_gram_18k_at_entry`

### Inventory vs. Costing — Separation of Concerns
- **Inventory** (`inventory_movement` table): one row per stock event (opening, purchase-in, sale-out, adjustment). Tracks quantities only. Current stock = sum of all in minus sum of all out per product.
- **Costing** (`product_costing` table): one row per product, updated on every purchase. Stores `total_purchase_amount`, `unit_cost`, `suggested_sale_price`. Sales invoices read `unit_cost` from here to compute per-line profit. Costing is never derived from inventory quantities — it is maintained independently by the purchase invoice service.

### Jalali Dates
Stored as plain `DATE` (Gregorian) in PostgreSQL. Conversion to/from Jalali handled in the backend service layer and frontend display layer. No Jalali-specific column types needed.

### Document Numbering
Auto-incremented sequences per document type, formatted with a prefix:
- Purchase invoices: `خ-0001`, `خ-0002`, …
- Sales invoices: `ف-0001`, `ف-0002`, …
- Receipts: `د-0001`, `د-0002`, …
- Payments: `پ-0001`, `پ-0002`, …

### Key Relationships (Phase 2)
```
Counterparty ──< PurchaseInvoice ──< PurchaseInvoiceLine >── Product
                                                               │
                                                         updates ▼
                                                    ProductCosting (unit_cost)
                                                    InventoryMovement (qty in)

Counterparty ──< SaleInvoice ──< SaleInvoiceLine >── Product
                                                        │
                                              reads from ▼
                                          ProductCosting (unit_cost for profit)
                                          InventoryMovement (qty out)

Counterparty ──< Receipt
Counterparty ──< Payment
```

---

## Authentication
Single-user, simple username + password login secured with Spring Security.
- Password stored hashed (bcrypt).
- Stateless JWT token — issued on login, stored in an HttpOnly cookie
  (SameSite=Strict), sent automatically by the browser on all API calls.
  Token is never placed in the response body or a Bearer header.
- Logout clears the cookie (MaxAge=0).
- No roles or permission tiers yet — single-user for now. Security layer
  is designed to support multi-user/roles later without rework:
  - No valid token (missing/invalid/expired) → HTTP 401
    (via CustomAuthenticationEntryPoint)
  - Valid token but insufficient permission → HTTP 403
    (via CustomAccessDeniedHandler)
- All `/api/v1/` endpoints require a valid token except `/api/v1/auth/login`.

---

## Data Export / Backup
- CSV export endpoint per entity, for backup purposes.

---

## API Design Principles
- All endpoints under `/api/v1/`
- Standard REST verbs: GET, POST, PUT, DELETE
- Responses in JSON; amounts always in Toman (integer)
- Dates returned as Jalali strings (`YYYY/MM/DD`) from the backend
- Validation errors return 400 with a structured error body

---

## Frontend Structure
- Single-page application (React + TypeScript)
- RTL layout; all text Persian
- Jalali date picker component for all date inputs
- Each backend module maps to one or more pages/views
- Global state minimal — server is the source of truth, fetch on navigation

---

## What Is Deliberately Out of Scope (for now)
- Multi-user / roles (deferred — security layer is ready for it when needed)
- Live exchange rate API (deferred — crypto/FX stored as native amount +
  Toman equivalent at entry for now; live rates to be added in a later phase)
- Mobile app
- Report exports (PDF/Excel)
- FIFO/LIFO inventory costing