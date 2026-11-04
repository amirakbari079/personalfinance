-- Slice 7: macro catalog + observations. Event table is schema-only until a stable calendar exists.

INSERT INTO fi_data_providers (code, name, reliability_score, is_active)
SELECT 'WORLDBANK', 'World Bank Open Data', 88, TRUE
WHERE NOT EXISTS (SELECT 1 FROM fi_data_providers WHERE code = 'WORLDBANK');

CREATE TABLE fi_macro_indicators (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(32)  NOT NULL UNIQUE,
    name            VARCHAR(120) NOT NULL,
    country         VARCHAR(8),
    unit            VARCHAR(32)  NOT NULL,
    frequency       VARCHAR(16)  NOT NULL,
    source_code     VARCHAR(32)  NOT NULL,
    source_path     VARCHAR(120) NOT NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TABLE fi_macro_observations (
    id              BIGSERIAL PRIMARY KEY,
    indicator_id    BIGINT         NOT NULL REFERENCES fi_macro_indicators(id),
    period          VARCHAR(16)    NOT NULL,
    value           NUMERIC(20, 8) NOT NULL,
    previous_value  NUMERIC(20, 8),
    unit            VARCHAR(32)    NOT NULL,
    source          VARCHAR(32)    NOT NULL,
    published_at    TIMESTAMPTZ    NOT NULL,
    created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    UNIQUE (indicator_id, period)
);

CREATE TABLE fi_economic_events (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(200) NOT NULL,
    event_date          DATE         NOT NULL,
    country             VARCHAR(8),
    category            VARCHAR(32),
    expected_value      NUMERIC(20, 8),
    previous_value      NUMERIC(20, 8),
    actual_value        NUMERIC(20, 8),
    importance          VARCHAR(16)  NOT NULL DEFAULT 'MEDIUM',
    potential_impact    TEXT,
    source              VARCHAR(64),
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fi_macro_observations_indicator_period
    ON fi_macro_observations (indicator_id, period DESC);

CREATE INDEX idx_fi_economic_events_date
    ON fi_economic_events (event_date DESC);

INSERT INTO fi_macro_indicators (code, name, country, unit, frequency, source_code, source_path) VALUES
    ('IRN_CPI_YOY', 'تورم ایران (سالانه)', 'IR', 'PERCENT', 'ANNUAL', 'WORLDBANK', 'IRN/FP.CPI.TOTL.ZG'),
    ('USA_CPI_YOY', 'تورم آمریکا (سالانه)', 'US', 'PERCENT', 'ANNUAL', 'WORLDBANK', 'USA/FP.CPI.TOTL.ZG');
