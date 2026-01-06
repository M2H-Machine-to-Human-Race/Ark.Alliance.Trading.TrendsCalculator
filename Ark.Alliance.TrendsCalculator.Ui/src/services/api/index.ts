/**
 * @fileoverview API Service Index
 * @module services/api
 * @description
 * Aggregates all API services and provides unified export.
 * Each controller has a dedicated API file with typed DTOs.
 * 
 * @author Ark.Alliance
 * @version 2.0.0
 * @since 2025-12-28
 */

// Re-export all API modules
export * from './client';
export * from './health.api';
export * from './symbol.api';
export * from './trend.api';
export * from './binance.api';
export * from './settings.api';
export * from './ai.api';
export * from './aiTelemetry.api';

// Note: interfaces folder is intentionally NOT re-exported here to avoid
// duplicate export conflicts. Types are defined directly in their API files.

// Import individual APIs
import { healthApi } from './health.api';
import { symbolApi } from './symbol.api';
import { trendApi } from './trend.api';
import { binanceApi } from './binance.api';
import { settingsApi } from './settings.api';
import { aiApi } from './ai.api';

/**
 * Unified API service object
 * Provides all API methods in one namespace for backward compatibility
 */
export const apiService = {
    // Health
    ...healthApi,

    // Symbols
    ...symbolApi,

    // Trends
    ...trendApi,

    // Binance
    ...binanceApi,

    // Settings (real API - replaces mock)
    ...settingsApi,

    // AI Analysis
    ...aiApi,
};

export default apiService;

