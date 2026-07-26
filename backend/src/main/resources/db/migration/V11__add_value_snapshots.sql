CREATE TABLE value_snapshots (
    id            BIGSERIAL PRIMARY KEY,
    entity_type   VARCHAR(30)  NOT NULL,
    entity_id     BIGINT       NOT NULL,
    value         BIGINT       NOT NULL,
    recorded_date DATE         NOT NULL,
    notes         TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    UNIQUE (entity_type, entity_id, recorded_date)
);

CREATE INDEX idx_snapshots_entity ON value_snapshots (entity_type, entity_id, recorded_date DESC);
CREATE INDEX idx_snapshots_type_date ON value_snapshots (entity_type, recorded_date DESC);
