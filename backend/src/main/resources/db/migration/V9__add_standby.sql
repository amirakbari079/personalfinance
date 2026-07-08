-- M5: StandBy goods held for sale.
CREATE TABLE standby (
    id                   BIGSERIAL PRIMARY KEY,
    item_label           VARCHAR(100) NOT NULL,
    quantity             INTEGER      NOT NULL,
    expected_unit_price  BIGINT       NOT NULL,
    date_added           DATE,
    notes                TEXT,
    created_at           TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
