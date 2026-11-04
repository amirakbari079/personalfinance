-- Current-year / monthly CPI. World Bank annual WDI lags (USA still 2024).

INSERT INTO fi_data_providers (code, name, reliability_score, is_active)
SELECT 'BLS', 'U.S. Bureau of Labor Statistics', 92, TRUE
WHERE NOT EXISTS (SELECT 1 FROM fi_data_providers WHERE code = 'BLS');

INSERT INTO fi_data_providers (code, name, reliability_score, is_active)
SELECT 'IMF', 'IMF World Economic Outlook', 90, TRUE
WHERE NOT EXISTS (SELECT 1 FROM fi_data_providers WHERE code = 'IMF');

UPDATE fi_macro_indicators
SET is_active = FALSE
WHERE code IN ('IRN_CPI_YOY', 'USA_CPI_YOY');

INSERT INTO fi_macro_indicators (code, name, country, unit, frequency, source_code, source_path)
SELECT 'USA_CPI_YOY_M', 'تورم آمریکا (ماهانه، نقطه‌به‌نقطه)', 'US', 'PERCENT', 'MONTHLY', 'BLS', 'CUUR0000SA0'
WHERE NOT EXISTS (SELECT 1 FROM fi_macro_indicators WHERE code = 'USA_CPI_YOY_M');

INSERT INTO fi_macro_indicators (code, name, country, unit, frequency, source_code, source_path)
SELECT 'IRN_CPI_YOY_WEO', 'تورم ایران (IMF، سال جاری)', 'IR', 'PERCENT', 'ANNUAL', 'IMF', 'PCPIPCH/IRN'
WHERE NOT EXISTS (SELECT 1 FROM fi_macro_indicators WHERE code = 'IRN_CPI_YOY_WEO');
