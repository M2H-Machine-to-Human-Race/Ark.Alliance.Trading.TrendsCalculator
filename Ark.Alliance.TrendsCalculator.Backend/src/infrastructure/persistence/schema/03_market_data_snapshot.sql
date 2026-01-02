-- Market Data Snapshot Table
-- Stores periodic market data snapshots for historical analysis

CREATE TABLE IF NOT EXISTS market_data_snapshot (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    open_price REAL NOT NULL,
    high_price REAL NOT NULL,
    low_price REAL NOT NULL,
    close_price REAL NOT NULL,
    volume REAL,
    timestamp INTEGER NOT NULL,
    interval_type TEXT CHECK(interval_type IN ('1m', '5m', '15m', '1h', '4h', '1d')),
    data_source TEXT DEFAULT 'BINANCE',
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data_snapshot(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data_snapshot(timestamp);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol_timestamp ON market_data_snapshot(symbol, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_market_data_interval ON market_data_snapshot(interval_type);

-- Composite index for range queries
CREATE INDEX IF NOT EXISTS idx_market_data_query ON market_data_snapshot(symbol, interval_type, timestamp DESC);
