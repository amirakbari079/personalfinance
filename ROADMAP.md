# Roadmap

Milestone-based, no fixed dates. Each milestone is approved before the next begins.
Phases are sequential; Phase 2 starts only after Phase 1 is complete and stable.

---

## Phase 1 — Personal Finance

### M1 — Project Foundation
- Spring Boot project scaffolding (Maven, directory structure)
- PostgreSQL setup + initial schema migration (Flyway or Liquibase)
- React + TypeScript project scaffolding (Vite, RTL config)
- Jalali date utility (backend conversion + frontend date picker)
- Authentication (login page, Spring Security, JWT, bcrypt)
- Development environment documented and runnable
- Basic CSV export utility (backup)

### M2 — Cash Accounts
- Account CRUD (backend + API)
- Account list + balance view (frontend)
- Total cash displayed

### M3 — Investments
- Investment CRUD with asset-type branching (standard / gold / crypto / foreign currency)
- Multi-currency field storage (native amount + Toman equivalent at entry)
- Gold: weight × price-per-gram-18k calculation
- Investment list + total Toman value displayed

### M4 — Income & Liabilities
- Income sources CRUD (recurring + one-off, with date)
- Loan installments CRUD (with start date)
- Pending one-off expenses CRUD (with due date)

### M5 — Receivables & StandBy
- Receivables CRUD with partial-payment tracking (outstanding auto-computed, with creation date)
- StandBy goods CRUD (qty × expected price auto-computed, with date added)

### M6 — Net Worth Dashboard
- Balance calculation API endpoint (aggregates all Phase 1 modules)
- Net Worth dashboard page: all categories summarised + single net figure
- End-to-end review with real data migrated from the personal Excel file

---

## Phase 2 — Business Finance ("The One")

### M7 — Product Catalogue & Counterparties
- Product CRUD (code, name, unit, category, default purchase + sale prices)
- Counterparty CRUD (customer / supplier / both, all fields)
- Counterparty computed balance view (invoiced, received/paid, outstanding)

### M8 — Inventory & Costing
- Inventory movement table (opening stock entries, quantity tracking per product)
- ProductCosting record per product (total purchase amount, unit cost, suggested sale price)
- Current stock and costing values viewable per product
- No invoice integration yet — manual opening stock entry only at this milestone

### M9 — Purchase Invoices
- Purchase invoice CRUD (header + multi-line items, auto document numbering)
- Item name + default price populated from catalogue (overridable per line)
- On save: writes inbound movement to Inventory + updates ProductCosting
- Support invoice type: normal/return
- Invoice total computed; supplier linked from counterparty list

### M10 — Sales Invoices
- Sales invoice CRUD (header + multi-line items, auto document numbering)
- Unit sale price defaulted from catalogue (overridable per line)
- Unit purchase cost read from ProductCosting (not editable on invoice)
- Per-line profit computed: (sale price − unit cost) × qty − discount
- Support invoice type: normal/return
- On save: writes outbound movement to Inventory
- Invoice total and gross profit computed

### M11 — Receipts & Payments
- Receipt CRUD (money in from counterparty, auto document numbering)
- Payment CRUD (money out to counterparty, auto document numbering)
- Counterparty outstanding balance updated on receipt/payment entry

### M12 — Financial Report & Business Dashboard
- Gross profit summary (total sales − total purchase costs)
- Net cash flow (total receipts − total payments)
- Outstanding receivables per counterparty
- Current inventory quantity and value per product
- End-to-end review with real data migrated from the business Excel file
