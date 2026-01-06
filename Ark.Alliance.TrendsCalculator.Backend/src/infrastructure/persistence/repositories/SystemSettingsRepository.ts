/**
 * @fileoverview System Settings Repository
 * @module Data/repositories/SystemSettingsRepository
 */

import { SystemSetting, systemSettingFromRow, getTypedValue, SettingDataTypeValue, SettingCategoryValue } from '../entities/SystemSettings';
import { SettingCategory, LogLevel, SettingDataType } from '@share/enums';

/**
 * In-memory implementation (will be replaced with SQLite when available)
 */
export class SystemSettingsRepository {
    private static instance: SystemSettingsRepository | null = null;

    // In-memory cache of settings
    private settings: Map<string, SystemSetting> = new Map();

    // Default settings
    private readonly defaults: Array<Omit<SystemSetting, 'createdAt' | 'updatedAt'>> = [
        // Account settings
        { key: 'account_refresh_interval_ms', value: '1000', dataType: 'number', description: 'Account balance refresh interval in milliseconds', category: 'account' },
        { key: 'position_refresh_interval_ms', value: '1000', dataType: 'number', description: 'Position data broadcast interval to UI in milliseconds', category: 'account' },

        // Cache settings
        { key: 'order_cache_max_per_instance', value: '1000', dataType: 'number', description: 'Maximum orders to cache per instance', category: 'cache' },

        // Rate limit settings
        { key: 'rate_limit_warning_threshold', value: '80', dataType: 'number', description: 'Rate limit warning threshold percentage', category: 'ratelimit' },

        // Logging settings
        { key: 'log_retention_days', value: '30', dataType: 'number', description: 'Number of days to retain logs', category: 'logging' },
        { key: 'log_level', value: 'info', dataType: 'string', description: 'Minimum log level to persist to database (debug, info, warn, error)', category: 'logging' },

        // Strategy settings
        { key: 'strategy_default_check_interval_ms', value: '100', dataType: 'number', description: 'Default strategy monitoring interval', category: 'strategy' },
        { key: 'strategy_inversion_order_timeout_ms', value: '2000', dataType: 'number', description: 'GTX inversion order timeout before cancel/retry', category: 'strategy' },

        // Strategy GFX settings
        { key: 'gfx_order_timeout_ms', value: '10000', dataType: 'number', description: 'GFX order timeout before repricing', category: 'strategy' },

        // ClickStrategyEngine configurable parameters
        { key: 'strategy_max_initial_order_retries', value: '15', dataType: 'number', description: 'Max retries for initial order placement', category: 'strategy' },
        { key: 'strategy_max_inversion_retries', value: '5', dataType: 'number', description: 'Max retries for inversion orders', category: 'strategy' },
        { key: 'strategy_default_leverage', value: '50', dataType: 'number', description: 'Default leverage for new strategies', category: 'strategy' },
        { key: 'strategy_default_investment_usdt', value: '30', dataType: 'number', description: 'Default investment in USDT', category: 'strategy' },
        { key: 'strategy_default_sigma', value: '0.3', dataType: 'number', description: 'Default sigma value (inversion threshold)', category: 'strategy' },
        { key: 'strategy_default_take_profit_click', value: '0.3', dataType: 'number', description: 'Default take profit per click level', category: 'strategy' },
        { key: 'strategy_default_book_level', value: '2', dataType: 'number', description: 'Default order book level for pricing', category: 'strategy' },
        { key: 'strategy_click_debounce_ms', value: '500', dataType: 'number', description: 'Minimum time between click events (allows stop-limit order recreation)', category: 'strategy' },
        { key: 'trend_analysis_points', value: '500', dataType: 'number', description: 'Buffer size for price points (must be >= trend_min_data_points)', category: 'strategy' },
        { key: 'trend_analysis_interval_ms', value: '1000', dataType: 'number', description: 'Interval between price points for trend analysis in ms', category: 'strategy' },
        { key: 'trend_calculation_interval_ms', value: '1000', dataType: 'number', description: 'Live trend calculation interval in ms (default 1000 = 1 second)', category: 'strategy' },
        { key: 'wait_for_trend_confirmation_delay_ms', value: '2000', dataType: 'number', description: 'Delay before using trend confirmation for inversion in ms', category: 'strategy' },

        { key: 'symbol_info_refresh_interval_ms', value: '30000', dataType: 'number', description: 'Symbol info cache refresh interval (5 min)', category: 'cache' },

        // Binance USD-M Futures - MAINNET endpoints
        { key: 'binance_mainnet_rest_usdm', value: 'https://fapi.binance.com', dataType: 'string', description: 'Binance USD-M Futures REST API (MAINNET)', category: 'binance_endpoints' },
        { key: 'binance_mainnet_ws_api_usdm', value: 'wss://ws-fapi.binance.com/ws-fapi/v1', dataType: 'string', description: 'Binance USD-M Futures WS API (MAINNET)', category: 'binance_endpoints' },
        { key: 'binance_mainnet_ws_market_usdm', value: 'wss://fstream.binance.com', dataType: 'string', description: 'Binance USD-M Futures Market Data Stream (MAINNET)', category: 'binance_endpoints' },
        { key: 'binance_mainnet_ws_userdata_usdm', value: 'wss://fstream.binance.com', dataType: 'string', description: 'Binance USD-M Futures User Data Stream (MAINNET)', category: 'binance_endpoints' },

        // Binance USD-M Futures - TESTNET endpoints
        { key: 'binance_testnet_rest_usdm', value: 'https://demo-fapi.binance.com', dataType: 'string', description: 'Binance USD-M Futures REST API (TESTNET/Demo)', category: 'binance_endpoints' },
        { key: 'binance_testnet_ws_api_usdm', value: 'wss://testnet.binancefuture.com/ws-fapi/v1', dataType: 'string', description: 'Binance USD-M Futures WS API (TESTNET)', category: 'binance_endpoints' },
        { key: 'binance_testnet_ws_market_usdm', value: 'wss://stream.binancefuture.com', dataType: 'string', description: 'Binance USD-M Futures Market Data Stream (TESTNET)', category: 'binance_endpoints' },
        { key: 'binance_testnet_ws_userdata_usdm', value: 'wss://stream.binancefuture.com', dataType: 'string', description: 'Binance USD-M Futures User Data Stream (TESTNET)', category: 'binance_endpoints' },

        // Binance COIN-M Futures - MAINNET endpoints
        { key: 'binance_mainnet_rest_coinm', value: 'https://dapi.binance.com', dataType: 'string', description: 'Binance COIN-M Futures REST API (MAINNET)', category: 'binance_endpoints' },
        { key: 'binance_mainnet_ws_api_coinm', value: 'wss://ws-dapi.binance.com/ws-dapi/v1', dataType: 'string', description: 'Binance COIN-M Futures WS API (MAINNET)', category: 'binance_endpoints' },
        { key: 'binance_mainnet_ws_market_coinm', value: 'wss://dstream.binance.com', dataType: 'string', description: 'Binance COIN-M Futures Market Data Stream (MAINNET)', category: 'binance_endpoints' },

        // Binance COIN-M Futures - TESTNET endpoints
        { key: 'binance_testnet_rest_coinm', value: 'https://testnet.binancefuture.com', dataType: 'string', description: 'Binance COIN-M Futures REST API (TESTNET)', category: 'binance_endpoints' },
        { key: 'binance_testnet_ws_api_coinm', value: 'wss://testnet.binancefuture.com/ws-dapi/v1', dataType: 'string', description: 'Binance COIN-M Futures WS API (TESTNET)', category: 'binance_endpoints' },
        { key: 'binance_testnet_ws_market_coinm', value: 'wss://dstream.binancefuture.com', dataType: 'string', description: 'Binance COIN-M Futures Market Data Stream (TESTNET)', category: 'binance_endpoints' },

        // Binance Spot - MAINNET endpoints
        { key: 'binance_mainnet_rest_spot', value: 'https://api.binance.com', dataType: 'string', description: 'Binance Spot REST API (MAINNET)', category: 'binance_endpoints' },
        { key: 'binance_mainnet_ws_api_spot', value: 'wss://ws-api.binance.com/ws-api/v3', dataType: 'string', description: 'Binance Spot WS API (MAINNET)', category: 'binance_endpoints' },
        { key: 'binance_mainnet_ws_market_spot', value: 'wss://stream.binance.com:9443', dataType: 'string', description: 'Binance Spot Market Data Stream (MAINNET)', category: 'binance_endpoints' },

        // Binance Spot - TESTNET endpoints
        { key: 'binance_testnet_rest_spot', value: 'https://testnet.binance.vision/api', dataType: 'string', description: 'Binance Spot REST API (TESTNET)', category: 'binance_endpoints' },
        { key: 'binance_testnet_ws_api_spot', value: 'wss://ws-api.testnet.binance.vision/ws-api/v3', dataType: 'string', description: 'Binance Spot WS API (TESTNET)', category: 'binance_endpoints' },
        { key: 'binance_testnet_ws_market_spot', value: 'wss://stream.testnet.binance.vision', dataType: 'string', description: 'Binance Spot Market Data Stream (TESTNET)', category: 'binance_endpoints' },

        { key: 'market_data_ws_reconnect_interval_ms', value: '2000', dataType: 'number', description: 'Market data WS reconnect interval', category: 'binance' },

        // WebSocket Reconnection Settings
        { key: 'websocket_reconnection_delay_ms', value: '1000', dataType: 'number', description: 'WebSocket reconnection delay in milliseconds', category: 'general' },

        // Market Data - Default streaming symbols (JSON array)
        { key: 'market_data_default_symbols', value: '["BTCUSDT","ETHUSDT","BNBUSDT","XRPUSDT","SOLUSDT","ADAUSDT","DOGEUSDT","AVAXUSDT","DOTUSDT","MATICUSDT"]', dataType: 'json', description: 'Default symbols to stream at startup', category: 'binance' },

        // AI Model Configuration (Gemini 3 Flash for Symbol Analysis)
        { key: 'ai_provider', value: 'gemini', dataType: 'string', description: 'AI provider for Symbol Analysis', category: 'ai' },
        { key: 'ai_model', value: 'gemini-3-flash-preview', dataType: 'string', description: 'AI model for Symbol Analysis (Gemini 3 Flash)', category: 'ai' },
        { key: 'ai_api_key', value: 'AIzaSyBqQtp0aW4XbylNmece4EnQ5HCfxpXg_jA', dataType: 'string', description: 'Gemini AI API Key', category: 'ai' },
        { key: 'ai_max_tokens', value: '8192', dataType: 'number', description: 'Maximum tokens per AI request', category: 'ai' },
        { key: 'ai_temperature', value: '0.3', dataType: 'number', description: 'AI model temperature (0.3 for financial analysis determinism)', category: 'ai' },
        { key: 'ai_thinking_level', value: 'LOW', dataType: 'string', description: 'Gemini 3 thinking level (MINIMAL, LOW, MEDIUM, HIGH)', category: 'ai' },
        { key: 'ai_optimization_interval_ms', value: '300000', dataType: 'number', description: 'AI optimization check interval (5 min)', category: 'ai' },
        { key: 'ai_enabled', value: 'true', dataType: 'boolean', description: 'Enable AI optimization globally', category: 'ai' },

        // Order Tracking
        { key: 'order_tracking_enabled', value: 'true', dataType: 'boolean', description: 'Enable recording of all orders to database', category: 'strategy' },

        // Trend Analysis Mode - Close position and analyze before reopening
        { key: 'strategy_trend_wait_enabled', value: 'true', dataType: 'boolean', description: 'Close position first, analyze trend, then open in trend direction', category: 'strategy' },
        { key: 'strategy_trend_analysis_cycles', value: '4', dataType: 'number', description: 'Number of refresh cycles to analyze trend before reopening', category: 'strategy' },

        // Enhanced Trend Confirmation Settings
        { key: 'trend_min_data_points', value: '100', dataType: 'number', description: 'Minimum data points before trend calculation is valid (400 = ~6.6 min with 1s ticks)', category: 'strategy' },
        { key: 'trend_min_r_squared', value: '0.4', dataType: 'number', description: 'Minimum R² for trend confidence (0-1, higher = stricter)', category: 'strategy' },
        { key: 'trend_composite_score_threshold', value: '0.35', dataType: 'number', description: 'Composite score threshold for LONG/SHORT (0.3-0.5 recommended)', category: 'strategy' },
        { key: 'trend_confirmation_max_wait_ms', value: '8000', dataType: 'number', description: 'Maximum time to wait for trend confirmation in ms (8s for faster opportunities)', category: 'strategy' },
        { key: 'gtx_fallback_max_attempts', value: '50', dataType: 'number', description: 'Maximum GTX fallback attempts before giving up (prevents infinite loops)', category: 'strategy' },
        { key: 'trend_short_term_min_points', value: '30', dataType: 'number', description: 'Minimum data points for short-term sigma-based trend (30 = ~30s)', category: 'strategy' },

        // AI-Driven Inversion Optimization Settings
        { key: 'ia_optimize_on_inversion', value: 'false', dataType: 'boolean', description: 'Enable AI optimization analysis after position inversion', category: 'ai' },
        { key: 'ia_inversion_cooldown_ms', value: '5000', dataType: 'number', description: 'Cooldown period after inversion before AI analysis (ms)', category: 'ai' },
        { key: 'ia_auto_apply_adjustments', value: 'true', dataType: 'boolean', description: 'Automatically apply AI-recommended parameter adjustments', category: 'ai' },
        { key: 'ia_max_adjustment_percent', value: '0.2', dataType: 'number', description: 'Maximum adjustment percentage per parameter (0.2 = 20%)', category: 'ai' },

        // Forecast Horizon Settings (UI configurable)
        { key: 'forecast.show_horizon', value: 'true', dataType: 'boolean', description: 'Show forecast horizon overlay on charts', category: 'general' },
        { key: 'forecast.horizon_ms', value: '60000', dataType: 'number', description: 'Forecast horizon duration in milliseconds (default 1 minute)', category: 'general' },
        { key: 'forecast.horizon_presets', value: '[30000,60000,300000,900000]', dataType: 'json', description: 'Available horizon presets (30s, 1m, 5m, 15m)', category: 'general' },

        // Order Tracking
        { key: 'order_tracking_enabled', value: 'true', dataType: 'boolean', description: 'Enable recording of all orders to database', category: 'strategy' },

        // Trend Analysis Mode - Close position and analyze before reopening
        { key: 'strategy_trend_wait_enabled', value: 'true', dataType: 'boolean', description: 'Close position first, analyze trend, then open in trend direction', category: 'strategy' },
        { key: 'strategy_trend_analysis_cycles', value: '4', dataType: 'number', description: 'Number of refresh cycles to analyze trend before reopening', category: 'strategy' },

        // Enhanced Trend Confirmation Settings
        { key: 'trend_min_data_points', value: '100', dataType: 'number', description: 'Minimum data points before trend calculation is valid (400 = ~6.6 min with 1s ticks)', category: 'strategy' },
        { key: 'trend_min_r_squared', value: '0.4', dataType: 'number', description: 'Minimum R² for trend confidence (0-1, higher = stricter)', category: 'strategy' },
        { key: 'trend_composite_score_threshold', value: '0.35', dataType: 'number', description: 'Composite score threshold for LONG/SHORT (0.3-0.5 recommended)', category: 'strategy' },
        { key: 'trend_confirmation_max_wait_ms', value: '8000', dataType: 'number', description: 'Maximum time to wait for trend confirmation in ms (8s for faster opportunities)', category: 'strategy' },
        { key: 'gtx_fallback_max_attempts', value: '50', dataType: 'number', description: 'Maximum GTX fallback attempts before giving up (prevents infinite loops)', category: 'strategy' },
        { key: 'trend_short_term_min_points', value: '30', dataType: 'number', description: 'Minimum data points for short-term sigma-based trend (30 = ~30s)', category: 'strategy' },

        // AI-Driven Inversion Optimization Settings
        { key: 'ia_optimize_on_inversion', value: 'false', dataType: 'boolean', description: 'Enable AI optimization analysis after position inversion', category: 'ai' },
        { key: 'ia_inversion_cooldown_ms', value: '5000', dataType: 'number', description: 'Cooldown period after inversion before AI analysis (ms)', category: 'ai' },
        { key: 'ia_auto_apply_adjustments', value: 'true', dataType: 'boolean', description: 'Automatically apply AI-recommended parameter adjustments', category: 'ai' },
        { key: 'ia_max_adjustment_percent_final', value: '0.2', dataType: 'number', description: 'Maximum adjustment percentage per parameter (0.2 = 20%)', category: 'ai' },

        // System state
        { key: 'active_environment', value: '', dataType: 'string', description: 'Currently active environment (TESTNET/MAINNET)', category: 'system' }
    ];

    private constructor() {
        // Initialize with defaults
        const now = Date.now();
        for (const def of this.defaults) {
            this.settings.set(def.key, {
                ...def,
                createdAt: now,
                updatedAt: now
            });
        }
    }

    static getInstance(): SystemSettingsRepository {
        if (!SystemSettingsRepository.instance) {
            SystemSettingsRepository.instance = new SystemSettingsRepository();
        }
        return SystemSettingsRepository.instance;
    }

    /**
     * Get all settings
     */
    getAll(): SystemSetting[] {
        return Array.from(this.settings.values());
    }

    /**
     * Get settings by category
     */
    getByCategory(category: SettingCategory): SystemSetting[] {
        return this.getAll().filter(s => s.category === category);
    }

    /**
     * Get single setting
     */
    get(key: string): SystemSetting | undefined {
        return this.settings.get(key);
    }

    /**
     * Get typed value
     */
    getValue<T extends string | number | boolean | object>(key: string): T | undefined {
        const setting = this.settings.get(key);
        if (!setting) return undefined;
        return getTypedValue(setting) as T;
    }

    /**
     * Update setting value
     */
    update(key: string, value: string): boolean {
        const existing = this.settings.get(key);
        if (!existing) return false;

        // Validate value based on type
        if (existing.dataType === 'number') {
            const num = parseFloat(value);
            if (isNaN(num)) return false;
        } else if (existing.dataType === 'boolean') {
            if (value !== 'true' && value !== 'false') return false;
        } else if (existing.dataType === 'json') {
            try {
                JSON.parse(value);
            } catch {
                return false;
            }
        }

        this.settings.set(key, {
            ...existing,
            value,
            updatedAt: Date.now()
        });

        return true;
    }

    /**
     * Set a setting value (creates if not exists)
     * @param key - Setting key
     * @param value - Setting value as string
     * @param dataType - Data type (defaults to 'string')
     * @param category - Category (defaults to 'system')
     */
    set(key: string, value: string, dataType?: SettingDataType | string, category?: SettingCategory | string): void {
        const existing = this.settings.get(key);
        const now = Date.now();

        if (existing) {
            this.settings.set(key, {
                ...existing,
                value,
                dataType: (dataType as SettingDataTypeValue) || existing.dataType,
                category: (category as SettingCategoryValue) || existing.category,
                updatedAt: now
            });
        } else {
            // Create new setting
            this.settings.set(key, {
                key,
                value,
                dataType: (dataType as SettingDataType) || SettingDataType.STRING,
                description: 'Dynamically created setting',
                category: (category as SettingCategory) || SettingCategory.SYSTEM,
                createdAt: now,
                updatedAt: now
            });
        }
    }

    /**
     * Get number value with default
     */
    getNumber(key: string, defaultValue: number): number {
        const value = this.getValue<number>(key);
        return value !== undefined ? value : defaultValue;
    }

    /**
     * Get string value with default
     */
    getString(key: string, defaultValue: string): string {
        const value = this.getValue<string>(key);
        return value !== undefined ? value : defaultValue;
    }

    /**
     * Get boolean value with default
     */
    getBoolean(key: string, defaultValue: boolean): boolean {
        const value = this.getValue<boolean>(key);
        return value !== undefined ? value : defaultValue;
    }

    /**
     * Get JSON value parsed as type T
     * 
     * @param key - Setting key
     * @param defaultValue - Optional default if not found or parse fails
     * @returns Parsed JSON object or default/null
     */
    getJson<T>(key: string, defaultValue?: T): T | null {
        const setting = this.settings.get(key);
        if (!setting) return defaultValue ?? null;

        if (setting.dataType !== 'json') {
            console.warn(`[SystemSettings] Key ${key} is not JSON type (is ${setting.dataType})`);
            return defaultValue ?? null;
        }

        try {
            return JSON.parse(setting.value) as T;
        } catch (error) {
            console.warn(`[SystemSettings] Failed to parse JSON for ${key}`);
            return defaultValue ?? null;
        }
    }

    /**
     * Get configured log level with validation
     */
    getLogLevel(): LogLevel {
        const value = this.getString('log_level', LogLevel.INFO);
        const validLevels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
        return validLevels.includes(value as LogLevel) ? (value as LogLevel) : LogLevel.INFO;
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // INSTANCE-LEVEL GLOBAL PNL PERSISTENCE
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Generate key for instance-level globalPnL
     * @param instanceKey - The instance identifier (e.g., "123|TESTNET")
     * @param symbol - Trading symbol (e.g., "BTCUSDT")
     */
    private getGlobalPnlKey(instanceKey: string, symbol: string): string {
        return `globalPnl:${instanceKey}:${symbol}`;
    }

    /**
     * Set cumulative global PnL for an instance/symbol
     * This persists the realized PnL across strategy restarts
     * 
     * @param instanceKey - The instance identifier
     * @param symbol - Trading symbol
     * @param globalPnl - Cumulative realized PnL value
     */
    setInstanceGlobalPnl(instanceKey: string, symbol: string, globalPnl: number): void {
        const key = this.getGlobalPnlKey(instanceKey, symbol);
        this.set(key, globalPnl.toString());
        console.log(`[SystemSettings] Persisted globalPnl for ${instanceKey}:${symbol} = ${globalPnl.toFixed(4)}`);
    }

    /**
     * Get cumulative global PnL for an instance/symbol
     * Returns 0 if not previously persisted
     * 
     * @param instanceKey - The instance identifier
     * @param symbol - Trading symbol
     * @returns The persisted globalPnL or 0 if not found
     */
    getInstanceGlobalPnl(instanceKey: string, symbol: string): number {
        const key = this.getGlobalPnlKey(instanceKey, symbol);
        const value = this.getValue<number>(key);
        return value !== undefined ? value : 0;
    }

    /**
     * Reset global PnL for an instance/symbol (e.g., when user explicitly resets)
     * 
     * @param instanceKey - The instance identifier
     * @param symbol - Trading symbol
     */
    resetInstanceGlobalPnl(instanceKey: string, symbol: string): void {
        const key = this.getGlobalPnlKey(instanceKey, symbol);
        this.set(key, '0');
        console.log(`[SystemSettings] Reset globalPnl for ${instanceKey}:${symbol}`);
    }
}
