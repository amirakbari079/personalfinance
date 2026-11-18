-- V24: Business Finance Skeleton (Phase 2 - Step 1)
-- Independent tables for business domain: categories, products, counterparties, accounts.
-- Isolated from personal finance tables.

CREATE TABLE biz_categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Seed default general category
INSERT INTO biz_categories (name, description)
VALUES ('عمومی', 'دسته‌بندی پیش‌فرض کالاهای فروشگاه')
ON CONFLICT (name) DO NOTHING;

CREATE TABLE biz_products (
    id                     BIGSERIAL PRIMARY KEY,
    code                   VARCHAR(50) NOT NULL UNIQUE,
    name                   VARCHAR(150) NOT NULL,
    unit                   VARCHAR(30) NOT NULL, -- عدد، بسته، کیلوگرم، متر، ...
    category_id            BIGINT REFERENCES biz_categories(id) ON DELETE SET NULL,
    default_purchase_price BIGINT, -- ریال/تومان واحد (پیشنهاد فرم)
    default_sale_price     BIGINT, -- ریال/تومان واحد (پیشنهاد فرم)
    min_stock_alert        NUMERIC(15, 3), -- حد هشدار موجودی
    is_active              BOOLEAN NOT NULL DEFAULT TRUE,
    notes                  TEXT,
    created_at             TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_biz_products_category ON biz_products(category_id);
CREATE INDEX idx_biz_products_is_active ON biz_products(is_active);
CREATE INDEX idx_biz_products_code ON biz_products(code);

CREATE TABLE biz_counterparties (
    id         BIGSERIAL PRIMARY KEY,
    code       VARCHAR(50) NOT NULL UNIQUE,
    name       VARCHAR(150) NOT NULL,
    role       VARCHAR(20) NOT NULL, -- CUSTOMER, SUPPLIER, BOTH
    phone      VARCHAR(30),
    is_active  BOOLEAN NOT NULL DEFAULT TRUE,
    notes      TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_biz_counterparties_role ON biz_counterparties(role);
CREATE INDEX idx_biz_counterparties_is_active ON biz_counterparties(is_active);
CREATE INDEX idx_biz_counterparties_code ON biz_counterparties(code);

CREATE TABLE biz_accounts (
    id                   BIGSERIAL PRIMARY KEY,
    name                 VARCHAR(100) NOT NULL,
    type                 VARCHAR(30) NOT NULL, -- CASH, BANK, WALLET, PETTY_CASH
    account_number       VARCHAR(50),
    opening_balance      BIGINT NOT NULL DEFAULT 0, -- مانده افتتاحیه (تومان)
    opening_balance_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    notes                TEXT,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_biz_accounts_is_active ON biz_accounts(is_active);
