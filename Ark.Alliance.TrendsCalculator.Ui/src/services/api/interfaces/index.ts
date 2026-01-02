/**
 * @fileoverview API Interfaces Barrel Export
 * @module services/api/interfaces
 * @description
 * Exports all API interfaces and DTOs for mock testing.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-28
 */

// Health
export * from './health.interface';

// Symbol
export * from './symbol.interface';

// Trend
export * from './trend.interface';

// Binance
export * from './binance.interface';

// Settings
export * from './settings.interface';

// AI
export * from './ai.interface';

// ═══════════════════════════════════════════════════════════════════════════
// COMBINED API SERVICE INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

import type { IHealthApi } from './health.interface';
import type { ISymbolApi } from './symbol.interface';
import type { ITrendApi } from './trend.interface';
import type { IBinanceApi } from './binance.interface';
import type { ISettingsApi } from './settings.interface';
import type { IAIApi } from './ai.interface';

/**
 * Complete API Service Interface
 * Combines all controller interfaces for unified access
 */
export interface IApiService extends
    IHealthApi,
    ISymbolApi,
    ITrendApi,
    IBinanceApi,
    ISettingsApi,
    IAIApi { }
