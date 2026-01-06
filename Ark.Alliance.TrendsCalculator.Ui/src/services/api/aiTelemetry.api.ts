/**
 * @fileoverview AI Telemetry API Service
 * @module services/api/aiTelemetry.api
 * 
 * API calls for AI telemetry, settings, and connection testing.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2026-01-06
 */

import { apiClient } from './client';
import type {
    AISettingsDto,
    AITelemetryGridDto,
    AITelemetryDetailDto,
    AIConnectionTestResponse,
} from '@share/trends';

/**
 * Pagination result for telemetry grid
 */
export interface TelemetryGridResult {
    items: AITelemetryGridDto[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * Telemetry statistics
 */
export interface TelemetryStats {
    totalExchanges: number;
    successRate: number;
    avgLatencyMs: number;
    errorCount: number;
}

/**
 * Forecast settings for horizon display
 */
export interface ForecastSettingsDto {
    showHorizon: boolean;
    horizonMs: number;
    horizonPresets: number[];
}

/**
 * Get current AI settings
 */
export async function getAISettings(): Promise<AISettingsDto> {
    const response = await apiClient.get<{ success: boolean; data: AISettingsDto }>('/ai/settings');
    return response.data.data;
}

/**
 * Update AI settings
 */
export async function updateAISettings(settings: Partial<AISettingsDto>): Promise<AISettingsDto> {
    const response = await apiClient.put<{ success: boolean; data: AISettingsDto; message: string }>('/ai/settings', settings);
    return response.data.data;
}

/**
 * Test AI provider connection
 */
export async function testAIConnection(): Promise<AIConnectionTestResponse> {
    const response = await apiClient.post<{ success: boolean; data: AIConnectionTestResponse }>('/ai/test-connection');
    return response.data.data;
}

/**
 * Get paginated AI telemetry logs for grid
 */
export async function getTelemetryLogs(
    page: number = 1,
    pageSize: number = 20,
    instanceKey?: string
): Promise<TelemetryGridResult> {
    const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
    });
    if (instanceKey) params.append('instanceKey', instanceKey);

    const response = await apiClient.get<{ success: boolean; data: TelemetryGridResult }>(`/ai/telemetry?${params}`);
    return response.data.data;
}

/**
 * Get detailed telemetry log by ID
 */
export async function getTelemetryDetail(id: number): Promise<AITelemetryDetailDto> {
    const response = await apiClient.get<{ success: boolean; data: AITelemetryDetailDto }>(`/ai/telemetry/${id}`);
    return response.data.data;
}

/**
 * Get forecast settings
 */
export async function getForecastSettings(): Promise<ForecastSettingsDto> {
    const response = await apiClient.get<{ success: boolean; data: ForecastSettingsDto }>('/ai/forecast-settings');
    return response.data.data;
}

/**
 * Update forecast settings
 */
export async function updateForecastSettings(settings: Partial<ForecastSettingsDto>): Promise<ForecastSettingsDto> {
    const response = await apiClient.put<{ success: boolean; data: ForecastSettingsDto; message: string }>('/ai/forecast-settings', settings);
    return response.data.data;
}

/**
 * Get AI telemetry statistics
 */
export async function getTelemetryStats(instanceKey?: string): Promise<TelemetryStats> {
    const params = instanceKey ? `?instanceKey=${instanceKey}` : '';
    const response = await apiClient.get<{ success: boolean; data: TelemetryStats }>(`/ai/stats${params}`);
    return response.data.data;
}
