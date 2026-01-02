/**
 * @fileoverview IA Configuration Entity
 * @module Data/Entities/IAConfiguration
 * 
 * Per-instance AI provider configuration
 */

/**
 * AI Provider types
 */
export type IAProvider = 'openai' | 'anthropic' | 'local' | 'azure';

/**
 * IA Configuration entity
 */
export interface IAConfiguration {
    id?: number;

    // Instance link
    instanceKey: string;

    // Provider settings
    provider: IAProvider;
    model: string;
    endpoint: string;
    apiKey?: string;

    // Model parameters
    temperature: number;
    maxTokens: number;

    // Optimization settings
    optimizationIntervalMs: number;
    minDataPoints: number;

    // Feature flags
    enabled: boolean;
    autoApply: boolean;

    // Limits
    maxAdjustmentPercent: number;
    cooldownAfterInversionMs: number;

    // Timestamps
    createdAt: number;
    updatedAt: number;
}

/**
 * Create default configuration for instance
 */
export function createDefaultIAConfiguration(instanceKey: string): IAConfiguration {
    return {
        instanceKey,
        provider: 'openai',
        model: 'gpt-4o-mini',
        endpoint: 'https://api.openai.com/v1/chat/completions',
        temperature: 0.3,
        maxTokens: 500,
        optimizationIntervalMs: 300000,
        minDataPoints: 10,
        enabled: false,
        autoApply: false,
        maxAdjustmentPercent: 0.2,
        cooldownAfterInversionMs: 60000,
        createdAt: Date.now(),
        updatedAt: Date.now()
    };
}

/**
 * Map database row to entity
 */
export function iaConfigurationFromRow(row: any): IAConfiguration {
    return {
        id: row.id,
        instanceKey: row.instance_key,
        provider: row.provider as IAProvider,
        model: row.model,
        endpoint: row.endpoint,
        apiKey: row.api_key,
        temperature: row.temperature,
        maxTokens: row.max_tokens,
        optimizationIntervalMs: row.optimization_interval_ms,
        minDataPoints: row.min_data_points,
        enabled: row.enabled === 1,
        autoApply: row.auto_apply === 1,
        maxAdjustmentPercent: row.max_adjustment_percent,
        cooldownAfterInversionMs: row.cooldown_after_inversion_ms,
        createdAt: row.created_at,
        updatedAt: row.updated_at
    };
}
