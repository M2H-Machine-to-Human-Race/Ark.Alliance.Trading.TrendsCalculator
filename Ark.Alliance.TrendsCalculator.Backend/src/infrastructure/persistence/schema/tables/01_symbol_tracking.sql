-- Symbol Tracking Table
-- Stores tracked symbols and their buffer status

CREATE TABLE IF NOT EXISTS symbol_tracking (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL UNIQUE,
    is_active INTEGER NOT NULL DEFAULT 1,
    buffer_size INTEGER NOT NULL DEFAULT 200,
    current_buffer_count INTEGER NOT NULL DEFAULT 0,
    last_price REAL,
    last_update_timestamp INTEGER,
    ai_analysis_enabled INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_symbol_tracking_symbol ON symbol_tracking(symbol);
CREATE INDEX IF NOT EXISTS idx_symbol_tracking_active ON symbol_tracking(is_active);
CREATE INDEX IF NOT EXISTS idx_symbol_tracking_updated ON symbol_tracking(updated_at);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_symbol_tracking_timestamp 
AFTER UPDATE ON symbol_tracking
FOR EACH ROW
BEGIN
    UPDATE symbol_tracking 
    SET updated_at = strftime('%s', 'now')
    WHERE id = NEW.id;
END;
