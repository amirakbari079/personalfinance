-- Replaying a backup must preserve its audit rows, not manufacture duplicate events.
DO $$ DECLARE t RECORD; BEGIN
 FOR t IN SELECT c.relname FROM pg_trigger tr JOIN pg_class c ON c.oid=tr.tgrelid
 JOIN pg_namespace n ON n.oid=c.relnamespace WHERE tr.tgname='pf_audit' AND n.nspname='public' LOOP
  EXECUTE format('DROP TRIGGER pf_audit ON %I',t.relname);
  EXECUTE format($ddl$CREATE TRIGGER pf_audit AFTER INSERT OR UPDATE OR DELETE ON %I
   FOR EACH ROW WHEN (current_setting('pf.restoring',true) IS DISTINCT FROM 'true')
   EXECUTE FUNCTION pf_record_audit()$ddl$,t.relname);
 END LOOP;
END $$;

-- Operational restore history survives restoring an older financial backup.
CREATE TABLE pf_restore_events (
 id BIGSERIAL PRIMARY KEY, occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
 actor VARCHAR(160) NOT NULL, backup_filename TEXT NOT NULL,
 backup_created_at TIMESTAMPTZ, safety_backup_filename TEXT NOT NULL
);
CREATE TRIGGER pf_immutable BEFORE UPDATE OR DELETE ON pf_restore_events
 FOR EACH ROW EXECUTE FUNCTION pf_reject_history_mutation();
