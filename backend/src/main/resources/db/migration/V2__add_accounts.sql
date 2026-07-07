CREATE TABLE accounts (
    id         BIGSERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    type       VARCHAR(30)  NOT NULL,
    balance    BIGINT       NOT NULL DEFAULT 0,
    notes      TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
