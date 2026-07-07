CREATE TABLE investments (
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(100) NOT NULL,
    asset_type        VARCHAR(30)  NOT NULL,
    native_amount     NUMERIC(20,4),
    native_unit       VARCHAR(20),
    toman_equivalent  BIGINT       NOT NULL DEFAULT 0,
    notes             TEXT,
    created_at        TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
