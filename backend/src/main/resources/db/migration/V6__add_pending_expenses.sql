-- M4: Pending one-off expenses (planned, with due date).
CREATE TABLE pending_expenses (
    id             BIGSERIAL PRIMARY KEY,
    label          VARCHAR(100) NOT NULL,
    planned_amount BIGINT       NOT NULL,
    due_date       DATE,
    notes          TEXT,
    created_at     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
