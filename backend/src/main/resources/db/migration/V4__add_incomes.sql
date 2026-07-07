-- M4: Income sources (recurring monthly + one-off).
CREATE TABLE incomes (
    id            BIGSERIAL PRIMARY KEY,
    source        VARCHAR(100) NOT NULL,
    amount        BIGINT       NOT NULL,
    income_type   VARCHAR(20)  NOT NULL,
    received_date DATE,
    notes         TEXT,
    created_at    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
