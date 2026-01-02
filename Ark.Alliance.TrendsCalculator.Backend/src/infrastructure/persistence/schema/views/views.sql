-- ============================================================================
-- Views: Database views for common queries
-- ============================================================================

-- Active trading symbols view
CREATE VIEW IF NOT EXISTS active_symbols AS
SELECT 
    symbol,
    base_asset,
    quote_asset,
    tick_size,
    price_decimals,
    step_size,
    qty_decimals,
    min_notional,
    max_leverage,
    volume_24h,
    last_price,
    last_updated
FROM symbol_info
WHERE status = 'TRADING'
ORDER BY symbol ASC;

-- Recently updated symbols view
CREATE VIEW IF NOT EXISTS recently_updated_symbols AS
SELECT 
    symbol,
    status,
    volume_24h,
    last_price,
    price_change_percent_24h,
    last_updated
FROM symbol_info
ORDER BY last_updated DESC
LIMIT 100;
