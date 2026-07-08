-- Optional bank/logo code for cash accounts (matched on frontend catalog).
ALTER TABLE accounts ADD COLUMN bank_code VARCHAR(50);
