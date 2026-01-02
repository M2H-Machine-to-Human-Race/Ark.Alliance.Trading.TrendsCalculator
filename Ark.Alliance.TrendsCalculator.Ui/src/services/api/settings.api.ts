/**
 * @fileoverview Settings API Service
 * @module services/api/settings
 * @description
 * REST API client for system settings management.
 * Communicates with SettingsController endpoints.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-28
 * 
 * @remarks
 * Endpoints:
 * - GET /api/settings - Retrieve all settings grouped by category
 * - PUT /api/settings - Update multiple settings at once
 * - GET /api/settings/:category - Retrieve settings for specific category
 */

import { apiClient } from './client';

// ═══════════════════════════════════════════════════════════════════════════
// DTOs - Data Transfer Objects
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AI Provider Settings DTO
 * @swagger
 * components:
 *   schemas:
 *     AISettingsDto:
 *       type: object
 *       properties:
 *         ai_provider: { type: string }
 *         ai_model: { type: string }
 *         ai_temperature: { type: number }
 *         ai_max_tokens: { type: number }
 */
export interface AISettingsDto {
    ai_provider?: string;
    ai_model?: string;
    ai_temperature?: number;
    ai_max_tokens?: number;
}

/**
 * Strategy/Calculation Settings DTO
 * @swagger
 * components:
 *   schemas:
 *     StrategySettingsDto:
 *       type: object
 *       properties:
 *         trend_analysis_points: { type: number }
 *         trend_min_data_points: { type: number }
 */
export interface StrategySettingsDto {
    trend_analysis_points?: number;
    trend_min_data_points?: number;
}

/**
 * Binance Connection Settings DTO
 * @swagger
 * components:
 *   schemas:
 *     BinanceSettingsDto:
 *       type: object
 *       properties:
 *         market_data_ws_reconnect_interval_ms: { type: number }
 */
export interface BinanceSettingsDto {
    market_data_ws_reconnect_interval_ms?: number;
}

/**
 * Combined Settings Update Request DTO
 * @swagger
 * components:
 *   schemas:
 *     SettingsUpdateRequestDto:
 *       type: object
 *       properties:
 *         ai: { $ref: '#/components/schemas/AISettingsDto' }
 *         strategy: { $ref: '#/components/schemas/StrategySettingsDto' }
 *         binance: { $ref: '#/components/schemas/BinanceSettingsDto' }
 */
export interface SettingsUpdateRequestDto {
    ai?: AISettingsDto;
    strategy?: StrategySettingsDto;
    binance?: BinanceSettingsDto;
    [category: string]: Record<string, any> | undefined;
}

/**
 * Settings Update Result Item DTO
 */
export interface SettingsUpdateResultItem {
    key: string;
    success: boolean;
}

/**
 * Settings Update Response DTO
 * @swagger
 * components:
 *   schemas:
 *     SettingsUpdateResponseDto:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         message: { type: string }
 *         results: { type: array, items: { $ref: '#/components/schemas/SettingsUpdateResultItem' } }
 */
export interface SettingsUpdateResponseDto {
    success: boolean;
    message?: string;
    results?: SettingsUpdateResultItem[];
}

/**
 * All Settings Response DTO
 * @swagger
 * components:
 *   schemas:
 *     AllSettingsResponseDto:
 *       type: object
 *       properties:
 *         success: { type: boolean }
 *         data: { type: object, additionalProperties: true }
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
// API FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get all system settings grouped by category
 * @returns {Promise<AllSettingsResponseDto>} All settings organized by category
 * @endpoint GET /api/settings
 */
export async function getSettings(): Promise<AllSettingsResponseDto> {
    const response = await apiClient.get<AllSettingsResponseDto>('/settings');
    return response.data;
}

/**
 * Update multiple system settings at once
 * @param {SettingsUpdateRequestDto} settings - Settings to update, organized by category
 * @returns {Promise<SettingsUpdateResponseDto>} Update results with success status per key
 * @endpoint PUT /api/settings
 * 
 * @example
 * ```typescript
 * await updateSettings({
 *     ai: { ai_model: 'gemini-2.0-flash' },
 *     strategy: { trend_analysis_points: 150 }
 * });
 * ```
 */
export async function updateSettings(settings: SettingsUpdateRequestDto): Promise<SettingsUpdateResponseDto> {
    const response = await apiClient.put<SettingsUpdateResponseDto>('/settings', settings);
    return response.data;
}

/**
 * Get settings for a specific category
 * @param {string} category - Category name (e.g., 'ai', 'strategy', 'binance')
 * @returns {Promise<CategorySettingsResponseDto>} Category-specific settings
 * @endpoint GET /api/settings/:category
 */
export async function getSettingsByCategory(category: string): Promise<CategorySettingsResponseDto> {
    const response = await apiClient.get<CategorySettingsResponseDto>(`/settings/${category}`);
    return response.data;
}

/**
 * Settings API namespace export
 */
export const settingsApi = {
    getSettings,
    updateSettings,
    getSettingsByCategory,
};
