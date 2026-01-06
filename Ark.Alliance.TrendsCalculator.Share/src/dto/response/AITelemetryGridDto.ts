/**
 * @fileoverview AI Telemetry Grid DTO
 * @module dto/response/AITelemetryGridDto
 * 
 * Lightweight DTO for displaying AI exchanges in a data grid.
 * Duration is calculated from timestampSend and timestampReceive.
 */

import { z } from 'zod';
import { AIExchangeStatusSchema } from '../../enums/ai/AIExchangeStatus';
import { AIProviderTypeSchema } from '../../enums/ai/AIProviderType';

/**
 * AI Telemetry Grid DTO Schema
 * Used for data grid display (lightweight, calculated duration)
 */
export const AITelemetryGridDtoSchema = z.object({
    /** Unique identifier */
    id: z.number(),
    /** Request timestamp (ISO DateTime) */
    timestampSend: z.string().datetime(),
    /** Response timestamp (ISO DateTime) */
    timestampReceive: z.string().datetime().optional(),
    /** Duration in milliseconds (calculated) */
    durationMs: z.number(),
    /** AI provider used */
    provider: AIProviderTypeSchema,
    /** Model name */
    model: z.string(),
    /** Exchange status */
    status: AIExchangeStatusSchema,
    /** Summary of response (first 100 chars) */
    summary: z.string(),
    /** Total token count */
    tokenCount: z.number(),
});

/**
 * Type for validated AITelemetryGridDto
 */
export type AITelemetryGridDto = z.infer<typeof AITelemetryGridDtoSchema>;

/**
 * Factory function to create AITelemetryGridDto
 */
export function createAITelemetryGridDto(data: Partial<AITelemetryGridDto>): AITelemetryGridDto {
    return AITelemetryGridDtoSchema.parse({
        id: data.id ?? 0,
        timestampSend: data.timestampSend ?? new Date().toISOString(),
        timestampReceive: data.timestampReceive,
        durationMs: data.durationMs ?? 0,
        provider: data.provider ?? 'GEMINI',
        model: data.model ?? 'unknown',
        status: data.status ?? 'PENDING',
        summary: data.summary ?? '',
        tokenCount: data.tokenCount ?? 0,
    });
}
