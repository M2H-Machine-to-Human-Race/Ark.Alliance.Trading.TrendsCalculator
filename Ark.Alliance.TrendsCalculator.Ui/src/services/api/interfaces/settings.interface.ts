/**
 * @fileoverview Settings API Interface
 * @module services/api/interfaces/settings
 * @description
 * TypeScript interface for Settings API service.
 * Enables mock implementations for unit testing.
 */

// ═══════════════════════════════════════════════════════════════════════════
// DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AI Provider Settings DTO
 */
export interface AISettingsDto {
    ai_provider?: string;
    ai_model?: string;
    ai_temperature?: number;
    ai_max_tokens?: number;
}

/**
 * Strategy/Calculation Settings DTO
 */
export interface StrategySettingsDto {
    trend_analysis_points?: number;
    trend_min_data_points?: number;
}

/**
 * Binance Connection Settings DTO
 */
export interface BinanceConnectionSettingsDto {
    market_data_ws_reconnect_interval_ms?: number;
}

/**
 * Combined Settings Update Request DTO
 */
export interface SettingsUpdateRequestDto {
    ai?: AISettingsDto;
    strategy?: StrategySettingsDto;
    binance?: BinanceConnectionSettingsDto;
    [category: string]: Record<string, any> | undefined;
}

/**
 * Settings Update Result Item DTO
 */
export interface SettingsUpdateResultItemDto {
    key: string;
    success: boolean;
}

/**
 * Settings Update Response DTO
 */
export interface SettingsUpdateResponseDto {
    success: boolean;
    message?: string;
    results?: SettingsUpdateResultItemDto[];
}

/**
 * All Settings Response DTO
 */
export interface AllSettingsResponseDto {
    success: boolean;
    data: Record<string, Record<string, any>>;
}

/**
 * Category Settings Response DTO
 */
export interface CategorySettingsResponseDto {
    success: boolean;
    category: string;
    data: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Settings API Interface
 * @endpoint /api/settings/*
 */
export interface ISettingsApi {
    /** Get all settings grouped by category */
    getSettings(): Promise<AllSettingsResponseDto>;

    /** Update multiple settings */
    updateSettings(settings: SettingsUpdateRequestDto): Promise<SettingsUpdateResponseDto>;

    /** Get settings for a specific category */
    getSettingsByCategory(category: string): Promise<CategorySettingsResponseDto>;
}
