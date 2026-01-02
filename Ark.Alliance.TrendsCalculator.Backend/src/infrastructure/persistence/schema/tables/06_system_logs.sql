-- System Logs Table
-- Stores application logs for debugging and monitoring

CREATE TABLE IF NOT EXISTS system_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT NOT NULL CHECK(level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL')),
    source TEXT NOT NULL,
    message TEXT NOT NULL,
    details TEXT, -- JSON
    error_stack TEXT,
    symbol TEXT,
    user_id TEXT,
    session_id TEXT,
    timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_source ON system_logs(source);
CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp ON system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_symbol ON system_logs(symbol);
CREATE INDEX IF NOT EXISTS idx_system_logs_level_timestamp ON system_logs(level, timestamp DESC);

-- Index for error queries
CREATE INDEX IF NOT EXISTS idx_system_logs_errors ON system_logs(level, timestamp DESC) 
WHERE level IN ('ERROR', 'FATAL');
