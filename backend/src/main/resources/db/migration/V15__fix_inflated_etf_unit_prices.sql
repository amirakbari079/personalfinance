-- TSETMC sometimes returns ETF prices with three extra zeros.
-- Unit prices of 1,000,000+ Toman are not realistic for Iranian fund units
-- (e.g. نارنج stored as 5,480,000 instead of 5,480). Scale those holdings down.

UPDATE value_snapshots vs
SET value = ROUND(vs.value / 1000.0)::bigint
WHERE vs.entity_type = 'INVESTMENT'
  AND EXISTS (
        SELECT 1
        FROM investments i
        WHERE i.id = vs.entity_id
          AND i.asset_type = 'STOCK'
          AND i.native_amount IS NOT NULL
          AND i.native_amount > 0
          AND (i.toman_equivalent / i.native_amount) >= 1000000
    );

UPDATE investments
SET toman_equivalent = ROUND(toman_equivalent / 1000.0)::bigint
WHERE asset_type = 'STOCK'
  AND native_amount IS NOT NULL
  AND native_amount > 0
  AND (toman_equivalent / native_amount) >= 1000000;

DELETE FROM balance_sheet_snapshots
WHERE recorded_date = CURRENT_DATE;
