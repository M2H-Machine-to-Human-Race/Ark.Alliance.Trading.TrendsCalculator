/**
 * @fileoverview AI Telemetry Detail DTO
 * @module dto/response/AITelemetryDetailDto
 * 
 * Full detail DTO for displaying AI exchange in a modal.
 * Extends grid DTO with complete request/response payloads.
 */

import { z } from 'zod';
import { AITelemetryGridDtoSchema } from './AITelemetryGridDto';

/**
 * AI Telemetry Detail DTO Schema
 * Used for modal/detail view with full request/response
 */
export const AITelemetryDetailDtoSchema = AITelemetryGridDtoSchema.extend({
    /** Session identifier for grouping related exchanges */
    sessionId: z.string(),
    /** System prompt sent to AI */
    systemPrompt: z.string().optional(),
    /** User prompt/request sent to AI */
    userPrompt: z.string(),
    /** Full AI response text */
    fullResponse: z.string().optional(),
    /** Number of tokens in the prompt */
    promptTokens: z.number(),
    /** Number of tokens in the completion */
    completionTokens: z.number(),
    /** Error message if status is ERROR */
    errorMessage: z.string().optional(),
    /** Parsed action from AI response */
    parsedAction: z.string().optional(),
    /** Instance key for multi-instance scenarios */
    instanceKey: z.string().optional(),
});

/**
 * Type for validated AITelemetryDetailDto
 */
export type AITelemetryDetailDto = z.infer<typeof AITelemetryDetailDtoSchema>;

/**
 * Factory function to create AITelemetryDetailDto
 */
export function createAITelemetryDetailDto(data: Partial<AITelemetryDetailDto>): AITelemetryDetailDto {
    return AITelemetryDetailDtoSchema.parse({
        id: data.id ?? 0,
        timestampSend: data.timestampSend ?? new Date().toISOString(),
        timestampReceive: data.timestampReceive,
        durationMs: data.durationMs ?? 0,
        provider: data.provider ?? 'GEMINI',
        model: data.model ?? 'unknown',
        status: data.status ?? 'PENDING',
        summary: data.summary ?? '',
        tokenCount: data.tokenCount ?? 0,
        sessionId: data.sessionId ?? '',
        systemPrompt: data.systemPrompt,
        userPrompt: data.userPrompt ?? '',
        fullResponse: data.fullResponse,
        promptTokens: data.promptTokens ?? 0,
        completionTokens: data.completionTokens ?? 0,
        errorMessage: data.errorMessage,
        parsedAction: data.parsedAction,
        instanceKey: data.instanceKey,
    });
}
