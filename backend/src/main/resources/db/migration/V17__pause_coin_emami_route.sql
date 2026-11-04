-- Coin Emami has no live adapter yet; keep the asset, drop the empty route
-- so update jobs are not always PARTIAL_SUCCESS.

DELETE FROM fi_asset_source_routes
WHERE asset_id = (SELECT id FROM fi_assets WHERE symbol = 'COIN_EMAMI');
