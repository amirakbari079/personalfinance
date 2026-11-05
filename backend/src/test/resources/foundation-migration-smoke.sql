\set ON_ERROR_STOP on
-- Run only against personalfinance_foundation_test. All schema/data changes roll back.
BEGIN;
DO $$ BEGIN
 IF current_database()<>'personalfinance_foundation_test' THEN RAISE EXCEPTION 'Requires isolated test database'; END IF;
END $$;
\ir ../../main/resources/db/migration/V24__finance_foundation.sql
DO $$ DECLARE row_id BIGINT; event_count BIGINT; record_version BIGINT; BEGIN
 IF EXISTS(SELECT 1 FROM accounts a LEFT JOIN pf_ledger_accounts l ON l.account_id=a.id WHERE l.account_id IS NULL OR l.opening_balance<>a.balance) THEN
  RAISE EXCEPTION 'Opening balance mismatch';
 END IF;
 PERFORM set_config('pf.actor','migration-smoke-test',true);
 PERFORM set_config('pf.source','test',true);
 INSERT INTO pf_catalog(kind,code,name,metadata) VALUES('EXPENSE_CATEGORY','SMOKE_TEST','test','{"secret":"must-not-leak","nested":{"password":"must-not-leak"}}') RETURNING id INTO row_id;
 UPDATE pf_catalog SET name='test updated' WHERE id=row_id;
 SELECT version INTO record_version FROM pf_catalog WHERE id=row_id;
 IF record_version<>1 THEN RAISE EXCEPTION 'Version did not increment'; END IF;
 SELECT count(*) INTO event_count FROM pf_audit_events WHERE entity_type='pf_catalog' AND entity_id=row_id::text AND actor='migration-smoke-test';
 IF event_count<>2 THEN RAISE EXCEPTION 'Expected two audit events'; END IF;
 IF EXISTS(SELECT 1 FROM pf_audit_events WHERE after_data::text LIKE '%must-not-leak%') THEN RAISE EXCEPTION 'Credential leaked into audit'; END IF;
END $$;
ROLLBACK;
