/**
 * @fileoverview Setting Category Enum
 * @module enums/config/SettingCategory
 * 
 * Categories for organizing system settings.
 * 
 * @author Ark.Alliance Team
 * @version 1.0.0
 * @since 2026-01-06
 */

import { z } from 'zod';

/**
 * Setting category values
 */
export enum SettingCategory {
    /** General application settings */
    GENERAL = 'general',
    /** Account/authentication settings */
    ACCOUNT = 'account',
    /** Cache configuration */
    CACHE = 'cache',
    /** Rate limiting configuration */
    RATELIMIT = 'ratelimit',
    /** Logging configuration */
    LOGGING = 'logging',
    /** Trading strategy parameters */
    STRATEGY = 'strategy',
    /** Binance API configuration */
    BINANCE = 'binance',
    /** Binance endpoint URLs */
    BINANCE_ENDPOINTS = 'binance_endpoints',
    /** AI provider configuration */
    AI = 'ai',
    /** AI prompt templates */
    AI_PROMPTS = 'ai_prompts',
    /** AI configuration parameters */
    AI_CONFIGURATION = 'ai_configuration',
    /** System-level settings */
    SYSTEM = 'system',
    /** Position inversion settings */
    INVERSION = 'inversion',
}

/**
 * Zod schema for SettingCategory validation
 */
export const SettingCategorySchema = z.nativeEnum(SettingCategory);

/**
 * Type for validated SettingCategory
 */
export type SettingCategoryValue = z.infer<typeof SettingCategorySchema>;
