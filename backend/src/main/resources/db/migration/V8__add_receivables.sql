-- M5: Receivables with partial-payment tracking.
CREATE TABLE receivables (
    id               BIGSERIAL PRIMARY KEY,
    debtor_name      VARCHAR(100) NOT NULL,
    original_amount  BIGINT       NOT NULL,
    created_date     DATE,
    received_amount  BIGINT       NOT NULL DEFAULT 0,
    notes            TEXT,
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
