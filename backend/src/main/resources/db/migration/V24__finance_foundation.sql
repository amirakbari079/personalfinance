-- Additive migration. Preserve historical snapshots; seed opening balances only.
CREATE TABLE pf_catalog (
 id BIGSERIAL PRIMARY KEY, kind VARCHAR(32) NOT NULL, code VARCHAR(80) NOT NULL,
 name VARCHAR(160) NOT NULL, metadata JSONB NOT NULL DEFAULT '{}', active BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), version BIGINT NOT NULL DEFAULT 0,
 UNIQUE(kind,code)
);
INSERT INTO pf_catalog(kind,code,name,metadata) VALUES
 ('ACCOUNT_TYPE','BANK','بانکی','{"behavior":"BANK"}'),
 ('ACCOUNT_TYPE','DIGITAL_WALLET','کیف پول دیجیتال','{"behavior":"DIGITAL_WALLET"}'),
 ('ACCOUNT_TYPE','EXCHANGE','صرافی','{"behavior":"EXCHANGE"}'),
 ('ACCOUNT_TYPE','CASH','نقد','{"behavior":"CASH"}'),
 ('ACCOUNT_TYPE','OTHER','سایر','{"behavior":"OTHER"}'),
 ('EXPENSE_CATEGORY','GENERAL','سایر هزینه‌ها','{}'),
 ('INCOME_CATEGORY','GENERAL','سایر درآمدها','{}'),
 ('CURRENCY','IRT','تومان','{"decimals":0}'),
 ('CURRENCY','IRR','ریال','{"decimals":0}'),
 ('CURRENCY','USD','دلار آمریکا','{"decimals":2}'),
 ('CURRENCY','USDT','تتر','{"decimals":8}'),
 ('UNIT','GRAM','گرم','{"decimals":8}'),
 ('UNIT','UNIT','واحد','{"decimals":18}');

CREATE TABLE pf_settings (
 key VARCHAR(100) PRIMARY KEY, value JSONB NOT NULL,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), version BIGINT NOT NULL DEFAULT 0
);
INSERT INTO pf_settings(key,value) VALUES
 ('display','{"currency":"IRT","timezone":"Asia/Tehran","calendar":"persian"}'),
 ('market','{"refreshSeconds":300,"staleSeconds":900,"retryLimit":2,"conflictPercent":5}'),
 ('retention','{"technicalLogDays":90,"rawPayloadDays":30}');

CREATE TABLE pf_audit_events (
 id BIGSERIAL PRIMARY KEY, occurred_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
 actor VARCHAR(160) NOT NULL, source VARCHAR(40) NOT NULL, request_id VARCHAR(100),
 entity_type VARCHAR(100) NOT NULL, entity_id TEXT NOT NULL, operation VARCHAR(12) NOT NULL,
 before_data JSONB, after_data JSONB, transaction_id BIGINT NOT NULL DEFAULT txid_current()
);
CREATE INDEX pf_audit_entity_idx ON pf_audit_events(entity_type,entity_id,id DESC);

CREATE TABLE pf_ledger_accounts (
 account_id BIGINT PRIMARY KEY REFERENCES accounts(id), opening_date DATE NOT NULL,
 opening_balance BIGINT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO pf_ledger_accounts(account_id,opening_date,opening_balance)
 SELECT id,(now() AT TIME ZONE 'Asia/Tehran')::date,balance FROM accounts;

CREATE TABLE pf_transactions (
 id BIGSERIAL PRIMARY KEY, request_key UUID NOT NULL UNIQUE, request_hash VARCHAR(64) NOT NULL,
 kind VARCHAR(32) NOT NULL CHECK(kind IN ('INCOME','EXPENSE','TRANSFER','ADJUSTMENT','REVERSAL','LOAN_PAYMENT','RECEIVABLE_PAYMENT','PLANNED_PAYMENT','GOODS_SALE','INVESTMENT_BUY','INVESTMENT_SELL')),
 effective_date DATE NOT NULL, description VARCHAR(1000) NOT NULL,
 category_id BIGINT REFERENCES pf_catalog(id), counterparty_id BIGINT REFERENCES pf_catalog(id),
 related_type VARCHAR(40), related_id BIGINT, related_quantity NUMERIC(38,18),
 reversal_of BIGINT UNIQUE REFERENCES pf_transactions(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), version BIGINT NOT NULL DEFAULT 0
);
CREATE TABLE pf_transaction_entries (
 id BIGSERIAL PRIMARY KEY, transaction_id BIGINT NOT NULL REFERENCES pf_transactions(id),
 account_id BIGINT NOT NULL REFERENCES accounts(id), amount BIGINT NOT NULL CHECK(amount<>0),
 UNIQUE(transaction_id,account_id)
);
CREATE INDEX pf_entries_account_idx ON pf_transaction_entries(account_id,transaction_id);
CREATE INDEX pf_transactions_date_idx ON pf_transactions(effective_date,id);

ALTER TABLE investments ALTER COLUMN native_amount TYPE NUMERIC(38,18);
DO $$ DECLARE t TEXT; BEGIN
 FOREACH t IN ARRAY ARRAY['accounts','investments','incomes','loans','pending_expenses','receivables','standby'] LOOP
   EXECUTE format('ALTER TABLE %I ADD COLUMN archived_at TIMESTAMPTZ',t);
 END LOOP;
END $$;

-- Scrub credentials at every nesting level before writing the audit trail.
CREATE FUNCTION pf_audit_redact(value JSONB) RETURNS JSONB LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE result JSONB; k TEXT; v JSONB;
BEGIN
 IF jsonb_typeof(value)='object' THEN
  result='{}';
  FOR k,v IN SELECT * FROM jsonb_each(value) LOOP
   result=result || jsonb_build_object(k,CASE WHEN k ~* '(password|secret|token|api.?key|credential)' THEN '"[REDACTED]"'::jsonb ELSE pf_audit_redact(v) END);
  END LOOP;
  RETURN result;
 ELSIF jsonb_typeof(value)='array' THEN
  SELECT coalesce(jsonb_agg(pf_audit_redact(x)),'[]') INTO result FROM jsonb_array_elements(value) x;
  RETURN result;
 END IF;
 RETURN value;
END $$;

CREATE FUNCTION pf_record_audit() RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE old_json JSONB; new_json JSONB; row_id TEXT;
BEGIN
 IF TG_OP<>'INSERT' THEN old_json=to_jsonb(OLD); END IF;
 IF TG_OP<>'DELETE' THEN new_json=to_jsonb(NEW); END IF;
 IF TG_OP='UPDATE' AND old_json=new_json THEN RETURN NEW; END IF;
 row_id=coalesce(new_json->>'id',old_json->>'id',new_json->>'key',old_json->>'key',new_json->>'account_id',old_json->>'account_id');
 INSERT INTO pf_audit_events(actor,source,request_id,entity_type,entity_id,operation,before_data,after_data)
 VALUES(coalesce(nullif(current_setting('pf.actor',true),''),'system'),coalesce(nullif(current_setting('pf.source',true),''),'system'),
 nullif(current_setting('pf.request_id',true),''),TG_TABLE_NAME,coalesce(row_id,'unknown'),TG_OP,pf_audit_redact(old_json),pf_audit_redact(new_json));
 RETURN coalesce(NEW,OLD);
END $$;

CREATE FUNCTION pf_touch_record() RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at=now(); NEW.version=OLD.version+1; RETURN NEW; END $$;

DO $$ DECLARE t TEXT; BEGIN
 FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'
 AND table_name NOT IN ('flyway_schema_history','pf_audit_events') LOOP
  EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now()',t);
  EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS version BIGINT NOT NULL DEFAULT 0',t);
  EXECUTE format('CREATE TRIGGER pf_touch BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION pf_touch_record()',t);
 END LOOP;
 FOREACH t IN ARRAY ARRAY['accounts','investments','incomes','loans','pending_expenses','receivables','standby','pf_catalog','pf_settings','pf_transactions','pf_transaction_entries','pf_ledger_accounts','fi_assets','fi_data_providers','fi_asset_source_routes'] LOOP
  EXECUTE format('CREATE TRIGGER pf_audit AFTER INSERT OR UPDATE OR DELETE ON %I FOR EACH ROW EXECUTE FUNCTION pf_record_audit()',t);
 END LOOP;
END $$;
