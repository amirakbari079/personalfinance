# Requirements

## Guiding Principles
- Unit of currency throughout the app is **Toman** (not Rial) — database, forms, reports, all.
- Calendar is **Jalali (Solar Hijri)** throughout.
- UI is **RTL, Persian**.
- Foreign/crypto assets stored as **native amount + Toman equivalent at time of entry**; live-rate API deferred to a later phase.
- All document numbers (invoices, receipts, payments) are **auto-generated and unique** by the system.
- Catalogue prices are **reference/default** values; per-invoice overrides are always allowed.
- Account labels, asset names, income sources, expense categories — all are **user-defined**, not hardcoded.
- Data export to CSV/Excel is supported for all entities, for backup purposes.
---

## Phase 1 — Personal Finance

### 1.1 Cash Accounts
Each account has:
- Name (user-defined label, e.g. "بلو", "رسالت")
- Type (bank / digital wallet / exchange / cash / other)
- Current balance (Toman)
- Notes (optional)

Total cash = sum of all account balances.

### 1.2 Investments
Each investment entry has:
- Name / label (user-defined)
- Asset type (fund / physical gold / crypto / foreign currency / other)
- For standard assets: amount (Toman)
- For crypto: native currency code (e.g. BTC, PaxG) + native amount + Toman equivalent at time of entry
- For physical gold: weight in grams (decimal, exact) + price per gram of 18k gold at time of entry + Toman total (computed: weight × price)
- For foreign currency: currency code + foreign amount + exchange rate at entry + Toman equivalent
- Notes (optional)

Total investments = sum of all Toman-equivalent values.

### 1.3 Income
Each income entry has:
- Source label (user-defined)
- Amount (Toman)
- Type: recurring monthly / one-off
- Date of receipt / registration (Jalali)
- Notes (optional)

Monthly income total = sum of all active recurring entries.

### 1.4 Liabilities

#### 1.4.1 Loan Installments
Each loan installment has:
- Creditor name (user-defined)
- Monthly installment amount (Toman)
- Start date (Jalali) — the date the first installment begins
- Notes (optional)

#### 1.4.2 Pending One-Off Expenses
Each pending expense has:
- Label (user-defined)
- Planned amount (Toman)
- Due date (Jalali)
- Notes (optional)

### 1.5 Receivables
Each receivable has:
- Debtor name (user-defined)
- Original amount (Toman)
- Date created (Jalali) — when the debt was established
- Amount received so far (Toman)
- Outstanding = original − received (computed automatically, not entered)
- Notes (optional)

### 1.6 StandBy (Goods Held for Sale)
Each StandBy entry has:
- Item label (user-defined)
- Quantity
- Expected unit sale price (Toman)
- Date added (Jalali) — when the item was recorded
- Total StandBy value = quantity × expected price (computed)
- Notes (optional)

### 1.7 Net Worth (Balance)
Single formula displayed as one number:

```
Net Worth = Total Capital − Monthly Installments − Pending Expenses

Total Capital = Cash + Investments + StandBy + Outstanding Receivables
Deductions    = sum of monthly loan installments + sum of pending one-off expenses
```

- **Monthly installment total** (not the full loan principal) is what is deducted.
- No multi-view, no liquidity tiers in Phase 1.

---

## Phase 2 — Business Finance ("The One")

### 2.1 Product Catalogue
Each product has:
- Product code (auto-generated or user-defined)
- Name
- Unit (e.g. عدد, جفت, کیلو)
- Category (user-defined)
- Default purchase price per unit (Toman) — reference value, overridable per invoice
- Default sale price per unit (Toman) — reference value, overridable per invoice
- Current stock quantity (computed from inventory)
- Notes (optional)

### 2.2 Counterparties
Each counterparty has:
- Code (auto-generated)
- Name
- Type: customer / supplier / both
- Phone
- Address
- National ID / business ID
- Credit limit (Toman, optional)
- Notes (optional)

Computed fields (read-only):
- Total invoiced to/from this party (sales or purchases)
- Total received / paid
- Outstanding balance (net)

### 2.3 Inventory
Tracks quantity movement only — costing is handled separately (see 2.4).

Each inventory record has:
- Product (from catalogue)
- Date (Jalali)
- Movement type: opening stock / purchase-in / sale-out / adjustment
- Quantity in
- Quantity out
- Current stock after movement (computed)
- Reference document (invoice number, optional)

### 2.4 Costing
One costing record per product, maintained automatically:
- Product (from catalogue)
- Total purchase amount (Toman) — sum of all purchase invoice lines for this product
- Unit purchase cost (Toman) — used as the cost basis for profit calculation
- Suggested sale price per unit (Toman) — reference, from catalogue default

When a purchase invoice is recorded, Costing is updated.
When a sales invoice is recorded, profit per line is read from Costing (unit purchase cost).

### 2.5 Purchase Invoices
Invoice header:
- Invoice number (auto-generated, unique, format خ-XXXX)
- Date (Jalali)
- Supplier (from counterparty list)
- Payment status: cash (نقد) / credit (نسیه)
- Invoice type: normal / return (return invoices reference the original invoice and reverse inventory/costing effects)
- Notes

Invoice line items (one or more per invoice):
- Product (from catalogue)
- Quantity
- Unit purchase price (defaults from catalogue, overridable)
- Discount (Toman, per line)
- Line total = (qty × unit price) − discount (computed)

On save: writes inbound movement to Inventory; updates Costing for each product.
Invoice total = sum of all line totals (computed).

### 2.6 Sales Invoices
Invoice header:
- Invoice number (auto-generated, unique, format ف-XXXX)
- Date (Jalali)
- Customer (from counterparty list)
- Payment status: cash (نقد) / credit (نسیه)
- Invoice type: normal / return (return invoices reference the original invoice and reverse inventory/costing effects)
- Notes

Invoice line items:
- Product (from catalogue)
- Quantity
- Unit sale price (defaults from catalogue, overridable per line)
- Unit purchase cost (read from Costing, used for profit calc — not editable here)
- Discount (Toman, per line)
- Line total = (qty × unit sale price) − discount (computed)
- Line profit = (unit sale price − unit purchase cost) × qty − discount (computed)

On save: writes outbound movement to Inventory; reads unit purchase cost from Costing.
Invoice total = sum of all line totals (computed).
Invoice gross profit = sum of all line profits (computed).

### 2.7 Receipts
Each receipt has:
- Document number (auto-generated, unique, format د-XXXX)
- Date (Jalali)
- Counterparty (from list)
- Amount received (Toman)
- Payment method: cash / bank transfer / cheque / other
- Cheque/transfer reference number (optional)
- Bank name (optional)
- Linked invoice(s) (optional reference)
- Notes

### 2.8 Payments
Each payment has:
- Document number (auto-generated, unique, format پ-XXXX)
- Date (Jalali)
- Counterparty (from list)
- Amount paid (Toman)
- Payment method: cash / bank transfer / cheque / other
- Cheque/transfer reference number (optional)
- Bank name (optional)
- Linked invoice(s) (optional reference)
- Notes

### 2.9 Financial Report (Summary Dashboard)
- Gross profit = total sales invoice totals − total purchase invoice totals
- Net cash flow = total receipts − total payments
- Outstanding receivables per customer (invoiced − received)
- Current inventory quantity and value per product
