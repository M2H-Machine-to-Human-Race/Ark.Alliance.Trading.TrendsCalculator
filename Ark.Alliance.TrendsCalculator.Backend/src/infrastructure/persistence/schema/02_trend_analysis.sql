-- Trend Analysis Results Table
-- Stores calculated trend analysis results

CREATE TABLE IF NOT EXISTS trend_analysis (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    direction TEXT NOT NULL CHECK(direction IN ('LONG', 'SHORT', 'WAIT')),
    composite_score REAL NOT NULL,
    confidence REAL NOT NULL CHECK(confidence >= 0 AND confidence <= 1),
    slope REAL,
    r_squared REAL,
    data_points INTEGER NOT NULL,
    price_change REAL,
    price_change_percent REAL,
    is_oscillating INTEGER NOT NULL DEFAULT 0,
    strength REAL,
    start_price REAL,
    end_price REAL,
    direction_changes INTEGER DEFAULT 0,
    ema_fast REAL,
    ema_slow REAL,
    ma_bias REAL,
    ai_confirmation TEXT,
    ai_confidence REAL,
    regime_type TEXT,
    volatility_level TEXT,
    timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_trend_analysis_symbol ON trend_analysis(symbol);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_timestamp ON trend_analysis(timestamp);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_direction ON trend_analysis(direction);
CREATE INDEX IF NOT EXISTS idx_trend_analysis_symbol_timestamp ON trend_analysis(symbol, timestamp DESC);

-- Index for latest trend per symbol queries
CREATE INDEX IF NOT EXISTS idx_trend_analysis_latest ON trend_analysis(symbol, timestamp DESC);
