-- Slice 10: recommendation evaluation store + reserved strategy catalog (no backtest runner).

CREATE TABLE advisor_recommendation_evaluations (
    id                      BIGSERIAL PRIMARY KEY,
    recommendation_id       BIGINT         NOT NULL UNIQUE REFERENCES advisor_recommendations(id),
    asset_symbol            VARCHAR(32)    NOT NULL,
    currency                VARCHAR(8)     NOT NULL,
    start_date              DATE,
    end_date                DATE,
    start_price             NUMERIC(20, 8),
    end_price               NUMERIC(20, 8),
    asset_return_percent    NUMERIC(12, 4),
    gold_return_percent     NUMERIC(12, 4),
    usd_return_percent      NUMERIC(12, 4),
    btc_return_percent      NUMERIC(12, 4),
    asset_move              VARCHAR(8),
    time_horizon            VARCHAR(16),
    horizon_end             DATE,
    horizon_elapsed         BOOLEAN        NOT NULL DEFAULT FALSE,
    status                  VARCHAR(20)    NOT NULL,
    evaluated_at            TIMESTAMPTZ    NOT NULL,
    created_at              TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_advisor_eval_status
    ON advisor_recommendation_evaluations (status, evaluated_at DESC);

-- Catalog only. No engine, no runs, no rule execution in this slice.
CREATE TABLE advisor_strategy_definitions (
    id              BIGSERIAL PRIMARY KEY,
    code            VARCHAR(32)  NOT NULL UNIQUE,
    name            VARCHAR(120) NOT NULL,
    description     TEXT,
    rule_json       TEXT,
    is_active       BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);
