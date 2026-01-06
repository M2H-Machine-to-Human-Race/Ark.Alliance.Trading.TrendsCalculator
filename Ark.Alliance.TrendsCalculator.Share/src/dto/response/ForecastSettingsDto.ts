/**
 * @fileoverview Forecast Settings DTO
 * @module dto/response/ForecastSettingsDto
 * 
 * DTO for forecast horizon visualization settings.
 * Stored in database and manageable via Configuration UI.
 */

import { z } from 'zod';

/**
 * Forecast Settings DTO Schema
 * Controls how forecast horizons are displayed on charts
 */
export const ForecastSettingsDtoSchema = z.object({
    /** Whether to show forecast horizon overlay on charts */
    showHorizon: z.boolean().default(true),
    /** Forecast horizon duration in milliseconds */
    horizonMs: z.number().default(60000),
    /** Available preset durations in milliseconds */
    horizonPresets: z.array(z.number()).default([30000, 60000, 300000, 900000]),
});

/**
 * Type for validated ForecastSettingsDto
 */
export type ForecastSettingsDto = z.infer<typeof ForecastSettingsDtoSchema>;

/**
 * Default forecast settings
 */
export const defaultForecastSettings: ForecastSettingsDto = {
    showHorizon: true,
    horizonMs: 60000,       // 1 minute
    horizonPresets: [
        30000,   // 30 seconds
        60000,   // 1 minute
        300000,  // 5 minutes
        900000,  // 15 minutes
    ],
};

/**
 * Factory function to create ForecastSettingsDto
 */
export function createForecastSettingsDto(data?: Partial<ForecastSettingsDto>): ForecastSettingsDto {
    return ForecastSettingsDtoSchema.parse({
        showHorizon: data?.showHorizon ?? defaultForecastSettings.showHorizon,
        horizonMs: data?.horizonMs ?? defaultForecastSettings.horizonMs,
        horizonPresets: data?.horizonPresets ?? defaultForecastSettings.horizonPresets,
    });
}

/**
 * Helper to format horizon duration for display
 */
export function formatHorizonDuration(ms: number): string {
    if (ms < 60000) return `${ms / 1000}s`;
    if (ms < 3600000) return `${ms / 60000}m`;
    return `${ms / 3600000}h`;
}
