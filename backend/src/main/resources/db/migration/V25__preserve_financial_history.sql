-- Original observations remain available to analysis even if a daily aggregate changes.
CREATE TABLE pf_legacy_history (
 source_table VARCHAR(80) NOT NULL, source_id BIGINT NOT NULL, data JSONB NOT NULL,
 captured_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY(source_table,source_id)
);
INSERT INTO pf_legacy_history(source_table,source_id,data)
 SELECT 'value_snapshots',id,to_jsonb(v) FROM value_snapshots v;
INSERT INTO pf_legacy_history(source_table,source_id,data)
 SELECT 'balance_sheet_snapshots',id,to_jsonb(b) FROM balance_sheet_snapshots b;

CREATE FUNCTION pf_reject_history_mutation() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Posted financial history is immutable; record a reversal or correction' USING ERRCODE='55000'; END $$;
CREATE TRIGGER pf_immutable BEFORE UPDATE OR DELETE ON pf_audit_events FOR EACH ROW EXECUTE FUNCTION pf_reject_history_mutation();
CREATE TRIGGER pf_immutable BEFORE UPDATE OR DELETE ON pf_legacy_history FOR EACH ROW EXECUTE FUNCTION pf_reject_history_mutation();
CREATE TRIGGER pf_immutable BEFORE UPDATE OR DELETE ON pf_transactions FOR EACH ROW EXECUTE FUNCTION pf_reject_history_mutation();
CREATE TRIGGER pf_immutable BEFORE UPDATE OR DELETE ON pf_transaction_entries FOR EACH ROW EXECUTE FUNCTION pf_reject_history_mutation();
CREATE TRIGGER pf_immutable BEFORE UPDATE OR DELETE ON pf_ledger_accounts FOR EACH ROW EXECUTE FUNCTION pf_reject_history_mutation();
CREATE TRIGGER pf_audit AFTER INSERT OR UPDATE OR DELETE ON value_snapshots FOR EACH ROW EXECUTE FUNCTION pf_record_audit();
CREATE TRIGGER pf_audit AFTER INSERT OR UPDATE OR DELETE ON balance_sheet_snapshots FOR EACH ROW EXECUTE FUNCTION pf_record_audit();

-- Restore may insert in any order, but all references are checked before commit.
-- This also covers the existing cycle between market snapshots and reference values.
DO $$ DECLARE c RECORD; BEGIN
 FOR c IN SELECT conrelid::regclass AS tbl,conname FROM pg_constraint
 WHERE contype='f' AND connamespace='public'::regnamespace LOOP
  EXECUTE format('ALTER TABLE %s ALTER CONSTRAINT %I DEFERRABLE INITIALLY IMMEDIATE',c.tbl,c.conname);
 END LOOP;
END $$;
