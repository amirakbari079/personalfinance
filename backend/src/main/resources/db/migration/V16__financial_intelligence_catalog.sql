-- M6.7 Slice 1: Financial Intelligence catalog, prices, jobs, quality.
-- market_price_snapshots (V13) is retained as the live /api/v1/market compatibility store.

CREATE TABLE fi_assets (
    id              BIGSERIAL PRIMARY KEY,
    symbol          VARCHAR(32)  NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    name_en         VARCHAR(100),
    asset_type      VARCHAR(30)  NOT NULL,
    asset_category  VARCHAR(30)  NOT NULL,
    country         VARCHAR(8),
    currency        VARCHAR(8)   NOT NULL,
    unit            VARCHAR(32)  NOT NULL,
    market          VARCHAR(32),
    is_tradable     BOOLEAN      NOT NULL DEFAULT TRUE,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE fi_data_providers (
    id                  BIGSERIAL PRIMARY KEY,
    code                VARCHAR(32)  NOT NULL UNIQUE,
    name                VARCHAR(100) NOT NULL,
    reliability_score   SMALLINT     NOT NULL DEFAULT 70,
    is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE fi_asset_source_routes (
    id              BIGSERIAL PRIMARY KEY,
    asset_id        BIGINT       NOT NULL REFERENCES fi_assets(id),
    provider_id     BIGINT       NOT NULL REFERENCES fi_data_providers(id),
    route_role      VARCHAR(16)  NOT NULL,
    priority        SMALLINT     NOT NULL,
    quote_currency  VARCHAR(8)   NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (asset_id, provider_id, quote_currency)
);

CREATE TABLE fi_legacy_market_symbols (
    market_symbol   VARCHAR(32) PRIMARY KEY,
    asset_id        BIGINT      NOT NULL REFERENCES fi_assets(id),
    quote_currency  VARCHAR(8)  NOT NULL
);

CREATE TABLE fi_data_updates (
    id                      BIGSERIAL PRIMARY KEY,
    started_at              TIMESTAMPTZ,
    completed_at            TIMESTAMPTZ,
    status                  VARCHAR(20)  NOT NULL DEFAULT 'QUEUED',
    trigger_type            VARCHAR(16)  NOT NULL DEFAULT 'SCHEDULED',
    provider_count          INTEGER      NOT NULL DEFAULT 0,
    successful_providers    INTEGER      NOT NULL DEFAULT 0,
    failed_providers        INTEGER      NOT NULL DEFAULT 0,
    records_fetched         INTEGER      NOT NULL DEFAULT 0,
    records_stored          INTEGER      NOT NULL DEFAULT 0,
    records_rejected        INTEGER      NOT NULL DEFAULT 0,
    error_count             INTEGER      NOT NULL DEFAULT 0,
    error_summary           TEXT,
    created_at              TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE fi_raw_provider_payloads (
    id              BIGSERIAL PRIMARY KEY,
    provider_id     BIGINT       NOT NULL REFERENCES fi_data_providers(id),
    collected_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    content_type    VARCHAR(64),
    payload         TEXT         NOT NULL,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE fi_market_snapshots (
    id              BIGSERIAL PRIMARY KEY,
    data_update_id  BIGINT REFERENCES fi_data_updates(id),
    captured_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    status          VARCHAR(20)  NOT NULL DEFAULT 'SUCCESS',
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE fi_asset_prices (
    id                  BIGSERIAL PRIMARY KEY,
    asset_id            BIGINT         NOT NULL REFERENCES fi_assets(id),
    observed_at         TIMESTAMPTZ    NOT NULL,
    quote_type          VARCHAR(16)    NOT NULL DEFAULT 'LIVE',
    price               NUMERIC(20, 8) NOT NULL,
    open                NUMERIC(20, 8),
    high                NUMERIC(20, 8),
    low                 NUMERIC(20, 8),
    close               NUMERIC(20, 8),
    volume              NUMERIC(24, 8),
    currency            VARCHAR(8)     NOT NULL,
    unit                VARCHAR(32)    NOT NULL,
    provider_id         BIGINT         NOT NULL REFERENCES fi_data_providers(id),
    original_value      NUMERIC(20, 8) NOT NULL,
    confidence          SMALLINT,
    raw_payload_id      BIGINT REFERENCES fi_raw_provider_payloads(id),
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE fi_asset_price_daily (
    id                  BIGSERIAL PRIMARY KEY,
    asset_id            BIGINT         NOT NULL REFERENCES fi_assets(id),
    trade_date          DATE           NOT NULL,
    currency            VARCHAR(8)     NOT NULL,
    unit                VARCHAR(32)    NOT NULL,
    open                NUMERIC(20, 8) NOT NULL,
    high                NUMERIC(20, 8) NOT NULL,
    low                 NUMERIC(20, 8) NOT NULL,
    close               NUMERIC(20, 8) NOT NULL,
    sample_count        INTEGER        NOT NULL DEFAULT 1,
    source_provider_id  BIGINT REFERENCES fi_data_providers(id),
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    UNIQUE (asset_id, trade_date, currency)
);

CREATE TABLE fi_price_corrections (
    id                  BIGSERIAL PRIMARY KEY,
    asset_price_id      BIGINT         NOT NULL REFERENCES fi_asset_prices(id),
    original_value      NUMERIC(20, 8) NOT NULL,
    corrected_value     NUMERIC(20, 8) NOT NULL,
    correction_reason   TEXT           NOT NULL,
    corrected_at        TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE fi_reference_values (
    id                      BIGSERIAL PRIMARY KEY,
    asset_id                BIGINT         NOT NULL REFERENCES fi_assets(id),
    observed_at             TIMESTAMPTZ    NOT NULL,
    quote_type              VARCHAR(16)    NOT NULL DEFAULT 'LIVE',
    value                   NUMERIC(20, 8) NOT NULL,
    currency                VARCHAR(8)     NOT NULL,
    unit                    VARCHAR(32)    NOT NULL,
    selected_provider_id    BIGINT REFERENCES fi_data_providers(id),
    selection_reason        TEXT,
    confidence              SMALLINT,
    market_snapshot_id      BIGINT REFERENCES fi_market_snapshots(id),
    created_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE fi_market_snapshot_items (
    id                      BIGSERIAL PRIMARY KEY,
    market_snapshot_id      BIGINT         NOT NULL REFERENCES fi_market_snapshots(id),
    asset_id                BIGINT         NOT NULL REFERENCES fi_assets(id),
    reference_value_id      BIGINT REFERENCES fi_reference_values(id),
    price                   NUMERIC(20, 8) NOT NULL,
    currency                VARCHAR(8)     NOT NULL,
    quote_type              VARCHAR(16)    NOT NULL DEFAULT 'LIVE',
    created_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    UNIQUE (market_snapshot_id, asset_id, currency, quote_type)
);

CREATE TABLE fi_data_conflicts (
    id                  BIGSERIAL PRIMARY KEY,
    asset_id            BIGINT         NOT NULL REFERENCES fi_assets(id),
    provider_a_id       BIGINT         NOT NULL REFERENCES fi_data_providers(id),
    value_a             NUMERIC(20, 8) NOT NULL,
    provider_b_id       BIGINT         NOT NULL REFERENCES fi_data_providers(id),
    value_b             NUMERIC(20, 8) NOT NULL,
    difference_percent  NUMERIC(12, 4) NOT NULL,
    detected_at         TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    resolution_status   VARCHAR(16)    NOT NULL DEFAULT 'OPEN',
    created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fi_asset_prices_asset_observed
    ON fi_asset_prices (asset_id, observed_at DESC);

CREATE INDEX idx_fi_asset_prices_asset_quote_observed
    ON fi_asset_prices (asset_id, quote_type, observed_at DESC);

CREATE INDEX idx_fi_asset_prices_provider_observed
    ON fi_asset_prices (provider_id, observed_at DESC);

CREATE INDEX idx_fi_asset_price_daily_asset_date
    ON fi_asset_price_daily (asset_id, trade_date DESC);

CREATE INDEX idx_fi_data_updates_started
    ON fi_data_updates (started_at DESC);

CREATE INDEX idx_fi_market_snapshot_items_snapshot
    ON fi_market_snapshot_items (market_snapshot_id);

CREATE INDEX idx_fi_reference_values_asset_observed
    ON fi_reference_values (asset_id, observed_at DESC);

CREATE INDEX idx_fi_data_conflicts_asset_detected
    ON fi_data_conflicts (asset_id, detected_at DESC);

INSERT INTO fi_data_providers (code, name, reliability_score, is_active) VALUES
    ('TGJU',      'TGJU',                         80, TRUE),
    ('COINGECKO', 'CoinGecko',                    85, TRUE),
    ('NOBITEX',   'Nobitex',                      75, TRUE),
    ('TSETMC',    'TSETMC',                       80, TRUE),
    ('DERIVED',   'Calculated / cross-rate',      70, TRUE);

INSERT INTO fi_assets (
    symbol, name, name_en, asset_type, asset_category,
    country, currency, unit, market, is_tradable, is_active
) VALUES
    ('USD',         'دلار آمریکا',              'US Dollar',           'FIAT',            'CURRENCY', 'US', 'IRT', 'USD',  'FX',     TRUE, TRUE),
    ('USDT',        'تتر',                      'Tether',              'CRYPTO',          'CRYPTO',   'US', 'IRT', 'USDT', 'CRYPTO', TRUE, TRUE),
    ('GOLD_18K',    'طلای ۱۸ عیار',             'Gold 18K',            'PRECIOUS_METAL',  'GOLD',     'IR', 'IRT', 'GRAM', 'IRAN',   TRUE, TRUE),
    ('GOLD_SPOT',   'طلای جهانی',               'Gold Spot',           'PRECIOUS_METAL',  'GOLD',     'US', 'USD', 'OZ',   'COMEX',  TRUE, TRUE),
    ('COIN_EMAMI',  'سکه امامی',                'Emami Coin',          'COIN',            'GOLD',     'IR', 'IRT', 'COIN', 'IRAN',   TRUE, TRUE),
    ('PAXG',        'PAXG',                     'PAXG',                'CRYPTO',          'GOLD',     'US', 'USD', 'OZ',   'CRYPTO', TRUE, TRUE),
    ('BTC',         'بیت‌کوین',                 'Bitcoin',             'CRYPTO',          'CRYPTO',   'US', 'USD', 'BTC',  'CRYPTO', TRUE, TRUE),
    ('ETF_AYAR',    'صندوق عیار',               'Ayar ETF',            'ETF',             'GOLD',     'IR', 'IRT', 'UNIT', 'TSE',    TRUE, TRUE),
    ('ETF_NARANGE', 'صندوق نارنج',              'Narange ETF',         'ETF',             'GOLD',     'IR', 'IRT', 'UNIT', 'TSE',    TRUE, TRUE);

INSERT INTO fi_legacy_market_symbols (market_symbol, asset_id, quote_currency)
SELECT 'USD_IRR',       id, 'IRT' FROM fi_assets WHERE symbol = 'USD'
UNION ALL
SELECT 'GOLD_18K_IRR',  id, 'IRT' FROM fi_assets WHERE symbol = 'GOLD_18K'
UNION ALL
SELECT 'GOLD_XAU_USD',  id, 'USD' FROM fi_assets WHERE symbol = 'GOLD_SPOT'
UNION ALL
SELECT 'PAXG_USD',      id, 'USD' FROM fi_assets WHERE symbol = 'PAXG'
UNION ALL
SELECT 'BTC_USD',       id, 'USD' FROM fi_assets WHERE symbol = 'BTC'
UNION ALL
SELECT 'BTC_IRR',       id, 'IRT' FROM fi_assets WHERE symbol = 'BTC'
UNION ALL
SELECT 'ETF_AYAR',      id, 'IRT' FROM fi_assets WHERE symbol = 'ETF_AYAR'
UNION ALL
SELECT 'ETF_NARANGE',   id, 'IRT' FROM fi_assets WHERE symbol = 'ETF_NARANGE';

INSERT INTO fi_asset_source_routes (asset_id, provider_id, route_role, priority, quote_currency)
SELECT a.id, p.id, v.route_role, v.priority, v.quote_currency
FROM (VALUES
    ('USD',         'TGJU',      'PRIMARY',   1, 'IRT'),
    ('USD',         'NOBITEX',   'FALLBACK',  3, 'IRT'),
    ('GOLD_18K',    'TGJU',      'PRIMARY',   1, 'IRT'),
    ('GOLD_SPOT',   'COINGECKO', 'PRIMARY',   1, 'USD'),
    ('PAXG',        'COINGECKO', 'PRIMARY',   1, 'USD'),
    ('BTC',         'COINGECKO', 'PRIMARY',   1, 'USD'),
    ('BTC',         'DERIVED',   'PRIMARY',   1, 'IRT'),
    ('BTC',         'NOBITEX',   'SECONDARY', 2, 'IRT'),
    ('ETF_AYAR',    'TSETMC',    'PRIMARY',   1, 'IRT'),
    ('ETF_NARANGE', 'TSETMC',    'PRIMARY',   1, 'IRT'),
    ('USDT',        'NOBITEX',   'PRIMARY',   1, 'IRT'),
    ('COIN_EMAMI',  'TGJU',      'PRIMARY',   1, 'IRT')
) AS v(asset_symbol, provider_code, route_role, priority, quote_currency)
JOIN fi_assets a ON a.symbol = v.asset_symbol
JOIN fi_data_providers p ON p.code = v.provider_code;

INSERT INTO fi_asset_prices (
    asset_id, observed_at, quote_type, price, currency, unit,
    provider_id, original_value, confidence, created_at
)
SELECT
    l.asset_id,
    s.recorded_at,
    'LIVE',
    s.value,
    CASE
        WHEN UPPER(s.currency) IN ('TOMAN', 'IRT', 'IRR', 'RLS', 'RIAL') THEN 'IRT'
        ELSE UPPER(s.currency)
    END,
    a.unit,
    COALESCE(p.id, d.id),
    s.value,
    70,
    s.recorded_at
FROM market_price_snapshots s
JOIN fi_legacy_market_symbols l ON l.market_symbol = s.symbol
JOIN fi_assets a ON a.id = l.asset_id
LEFT JOIN fi_data_providers p ON p.code = CASE
    WHEN s.source ILIKE 'TGJU%' THEN 'TGJU'
    WHEN s.source ILIKE 'CoinGecko%' THEN 'COINGECKO'
    WHEN s.source ILIKE 'Nobitex%' THEN 'NOBITEX'
    WHEN s.source ILIKE 'TSETMC%' THEN 'TSETMC'
    ELSE 'DERIVED'
END
JOIN fi_data_providers d ON d.code = 'DERIVED';

INSERT INTO fi_asset_price_daily (
    asset_id, trade_date, currency, unit,
    open, high, low, close, sample_count, source_provider_id
)
SELECT
    asset_id,
    (observed_at AT TIME ZONE 'Asia/Tehran')::date,
    currency,
    MIN(unit),
    (ARRAY_AGG(price ORDER BY observed_at ASC))[1],
    MAX(price),
    MIN(price),
    (ARRAY_AGG(price ORDER BY observed_at DESC))[1],
    COUNT(*)::INTEGER,
    (ARRAY_AGG(provider_id ORDER BY observed_at DESC))[1]
FROM fi_asset_prices
GROUP BY asset_id, (observed_at AT TIME ZONE 'Asia/Tehran')::date, currency;
