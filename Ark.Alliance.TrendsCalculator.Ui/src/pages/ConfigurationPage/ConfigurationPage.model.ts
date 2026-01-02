/**
 * @fileoverview Configuration Page Data Model
 * @module pages/ConfigurationPage/ConfigurationPage.model
 * @description
 * Defines TypeScript interfaces for system configuration settings.
 * All models are immutable and follow strict typing.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-27
 */

/**
 * AI Provider configuration settings
 * @interface AIProviderSettings
 * @property {'gemini' | 'openai' | 'none'} provider - AI provider selection
 * @property {string} model - Model name (e.g., 'gemini-2.0-flash')
 * @property {number} temperature - Temperature setting (0-2)
 * @property {number} maxTokens - Maximum tokens for response
 * @property {string} [apiKey] - API key for the provider (optional, min 10 chars)
 */
export interface AIProviderSettings {
    provider: 'gemini' | 'openai' | 'none';
    model: string;
    temperature: number;
    maxTokens: number;
    apiKey?: string;
}

/**
 * Calculation parameter settings
 * @interface CalculationSettings
 * @property {number} bufferSize - Buffer size (10-500)
 * @property {number} minDataPoints - Minimum data points (5-100)
 * @property {number} emaFastPeriod - EMA fast period (2-50)
 * @property {number} emaSlowPeriod - EMA slow period (10-100)
 */
export interface CalculationSettings {
    bufferSize: number;
    minDataPoints: number;
    emaFastPeriod: number;
    emaSlowPeriod: number;
}

/**
 * WebSocket connection settings
 * @interface WebSocketSettings
 * @property {number} reconnectionDelay - Delay between reconnection attempts (ms)
 * @property {number} maxReconnectionAttempts - Maximum reconnection attempts
 * @property {number} heartbeatInterval - Heartbeat interval (ms)
 */
export interface WebSocketSettings {
    reconnectionDelay: number;
    maxReconnectionAttempts: number;
    heartbeatInterval: number;
}

/**
 * Complete system settings
 * @interface SystemSettings
 * @property {AIProviderSettings} ai - AI provider configuration
 * @property {CalculationSettings} calculation - Calculation parameters
 * @property {WebSocketSettings} websocket - WebSocket configuration
 */
export interface SystemSettings {
    ai: AIProviderSettings;
    calculation: CalculationSettings;
    websocket: WebSocketSettings;
}

/**
 * Complete Configuration Page state model
 * @interface ConfigurationPageModel
 * @property {boolean} isLoading - Loading state for async data
 * @property {boolean} isSaving - Saving state
 * @property {SystemSettings} settings - Current system settings
 */
export interface ConfigurationPageModel {
    isLoading: boolean;
    isSaving: boolean;
    settings: SystemSettings;
}
