-- Backfill initial snapshots from current values for existing records.
INSERT INTO value_snapshots (entity_type, entity_id, value, recorded_date, notes)
SELECT 'ACCOUNT', id, balance, created_at::date, NULL
FROM accounts a
WHERE NOT EXISTS (
    SELECT 1 FROM value_snapshots vs
    WHERE vs.entity_type = 'ACCOUNT' AND vs.entity_id = a.id
);

INSERT INTO value_snapshots (entity_type, entity_id, value, recorded_date, notes)
SELECT 'INVESTMENT', id, toman_equivalent, created_at::date, NULL
FROM investments i
WHERE NOT EXISTS (
    SELECT 1 FROM value_snapshots vs
    WHERE vs.entity_type = 'INVESTMENT' AND vs.entity_id = i.id
);
