CREATE TABLE balance_sheet_snapshots (
    id                 BIGSERIAL PRIMARY KEY,
    recorded_date      DATE         NOT NULL UNIQUE,
    total_assets       BIGINT       NOT NULL,
    total_liabilities  BIGINT       NOT NULL,
    net_balance        BIGINT       NOT NULL,
    created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_balance_sheet_snapshots_date ON balance_sheet_snapshots (recorded_date DESC);
