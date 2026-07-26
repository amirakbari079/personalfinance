CREATE TABLE market_price_snapshots (
    id          BIGSERIAL PRIMARY KEY,
    symbol      VARCHAR(32)  NOT NULL,
    value       NUMERIC(20, 4) NOT NULL,
    currency    VARCHAR(8)   NOT NULL,
    recorded_at TIMESTAMP    NOT NULL DEFAULT NOW(),
    source      VARCHAR(64)  NOT NULL
);

CREATE INDEX idx_market_price_symbol_recorded
    ON market_price_snapshots (symbol, recorded_at DESC);
