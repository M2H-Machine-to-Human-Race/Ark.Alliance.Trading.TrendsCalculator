-- System Settings Table
-- Stores application configuration and feature toggles

CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT NOT NULL UNIQUE,
    value TEXT NOT NULL,
    value_type TEXT NOT NULL CHECK(value_type IN ('STRING', 'NUMBER', 'BOOLEAN', 'JSON', 'ENUM')),
    category TEXT NOT NULL,
    scope TEXT NOT NULL CHECK(scope IN ('GLOBAL', 'PER_SYMBOL', 'AI_PROVIDER', 'CALCULATION', 'WEBSOCKET', 'TRAINING')),
    description TEXT,
    default_value TEXT,
    is_encrypted INTEGER NOT NULL DEFAULT 0,
    is_feature_flag INTEGER NOT NULL DEFAULT 0,
    validation_regex TEXT,
    min_value REAL,
    max_value REAL,
    allowed_values TEXT, -- JSON array for enums
    requires_restart INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_scope ON system_settings(scope);
CREATE INDEX IF NOT EXISTS idx_system_settings_feature_flag ON system_settings(is_feature_flag);

-- Trigger to update updated_at timestamp
CREATE TRIGGER IF NOT EXISTS update_system_settings_timestamp 
AFTER UPDATE ON system_settings
FOR EACH ROW
BEGIN
    UPDATE system_settings 
    SET updated_at = strftime('%s', 'now')
    WHERE id = NEW.id;
END;

-- Insert default settings
INSERT OR IGNORE INTO system_settings (key, value, value_type, category, scope, description, default_value) VALUES
-- AI Provider Settings
('gemini_api_key', '', 'STRING', 'AI_PROVIDER', 'GLOBAL', 'Gemini API key', ''),
('gemini_model', 'gemini-2.0-flash', 'STRING', 'AI_PROVIDER', 'GLOBAL', 'Gemini model name', 'gemini-2.0-flash'),
('ai_temperature', '0.7', 'NUMBER', 'AI_PROVIDER', 'GLOBAL', 'AI temperature parameter', '0.7'),
('ai_max_tokens', '1000', 'NUMBER', 'AI_PROVIDER', 'GLOBAL', 'Maximum AI response tokens', '1000'),

-- Calculation Settings
('buffer_size', '200', 'NUMBER', 'CALCULATION', 'GLOBAL', 'Price buffer size', '200'),
('min_data_points', '50', 'NUMBER', 'CALCULATION', 'GLOBAL', 'Minimum data points for analysis', '50'),
('ema_short_period', '12', 'NUMBER', 'CALCULATION', 'GLOBAL', 'EMA short period', '12'),
('ema_long_period', '26', 'NUMBER', 'CALCULATION', 'GLOBAL', 'EMA long period', '26'),

-- Feature Flags
('enable_ai_analysis', 'true', 'BOOLEAN', 'CALCULATION', 'GLOBAL', 'Enable AI trend analysis', 'true'),
('enable_hurst_exponent', 'true', 'BOOLEAN', 'CALCULATION', 'GLOBAL', 'Enable Hurst exponent calculation', 'true'),
('enable_garch', 'true', 'BOOLEAN', 'CALCULATION', 'GLOBAL', 'Enable GARCH volatility modeling', 'true'),
('enable_regime_detection', 'true', 'BOOLEAN', 'CALCULATION', 'GLOBAL', 'Enable market regime detection', 'true'),

-- WebSocket Settings
('ws_reconnect_attempts', '10', 'NUMBER', 'WEBSOCKET', 'GLOBAL', 'WebSocket reconnection attempts', '10'),
('ws_ping_interval', '30000', 'NUMBER', 'WEBSOCKET', 'GLOBAL', 'WebSocket ping interval (ms)', '30000'),

-- Training Settings
('enable_training_mode', 'false', 'BOOLEAN', 'TRAINING', 'GLOBAL', 'Enable training mode', 'false'),
('training_evaluation_interval', '60000', 'NUMBER', 'TRAINING', 'GLOBAL', 'Training evaluation interval (ms)', '60000'),
('training_forecast_horizon', '15000', 'NUMBER', 'TRAINING', 'GLOBAL', 'Forecast horizon for training (ms)', '15000');
