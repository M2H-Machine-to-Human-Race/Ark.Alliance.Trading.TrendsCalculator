-- IA Conversation Table
-- Stores AI provider conversations and responses

CREATE TABLE IF NOT EXISTS ia_conversation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    provider TEXT NOT NULL CHECK(provider IN ('GEMINI', 'OPENAI', 'CUSTOM')),
    model TEXT NOT NULL,
    system_prompt TEXT,
    user_prompt TEXT NOT NULL,
    ai_response TEXT,
    parsed_result TEXT, -- JSON
    success INTEGER NOT NULL DEFAULT 1,
    error_message TEXT,
    token_count INTEGER,
    latency_ms INTEGER,
    cost REAL,
    timestamp INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ia_conversation_symbol ON ia_conversation(symbol);
CREATE INDEX IF NOT EXISTS idx_ia_conversation_timestamp ON ia_conversation(timestamp);
CREATE INDEX IF NOT EXISTS idx_ia_conversation_provider ON ia_conversation(provider);
CREATE INDEX IF NOT EXISTS idx_ia_conversation_success ON ia_conversation(success);
CREATE INDEX IF NOT EXISTS idx_ia_conversation_symbol_timestamp ON ia_conversation(symbol, timestamp DESC);
