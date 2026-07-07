-- M4: Loans with installment counter (sequential payments).
CREATE TABLE loans (
    id                 BIGSERIAL PRIMARY KEY,
    creditor           VARCHAR(100) NOT NULL,
    monthly_amount     BIGINT       NOT NULL,
    total_installments INTEGER      NOT NULL,
    start_date         DATE         NOT NULL,
    paid_installments  INTEGER      NOT NULL DEFAULT 0,
    notes              TEXT,
    created_at         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

ALTER TABLE loans ADD CONSTRAINT chk_loan_installments CHECK (total_installments > 0);
ALTER TABLE loans ADD CONSTRAINT chk_loan_paid CHECK (paid_installments >= 0 AND paid_installments <= total_installments);
