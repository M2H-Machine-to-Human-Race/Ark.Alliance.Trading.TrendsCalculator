/**
 * @fileoverview AI Settings DTO
 * @module dto/response/AISettingsDto
 * 
 * DTO for AI provider configuration settings.
 * Never exposes actual API keys - only indicates if configured.
 */

import { z } from 'zod';
import { AIProviderType, AIProviderTypeSchema } from '../../enums/ai/AIProviderType';
import { ThinkingLevel, ThinkingLevelSchema } from '../../enums/ai/ThinkingLevel';

/**
 * AI Settings DTO Schema
 * Configuration for AI provider integration
 */
export const AISettingsDtoSchema = z.object({
    /** Whether AI features are globally enabled */
    enabled: z.boolean().default(false),
    /** Selected AI provider */
    provider: AIProviderTypeSchema.default(AIProviderType.GEMINI),
    /** Model name/identifier */
    model: z.string().default('gemini-2.0-flash-thinking-exp'),
    /** Whether API key is configured (never expose actual key) */
    apiKeyConfigured: z.boolean().default(false),
    /** AI thinking depth level */
    thinkingLevel: ThinkingLevelSchema.default(ThinkingLevel.MEDIUM),
    /** Maximum tokens for AI responses */
    maxTokens: z.number().default(4096),
    /** Temperature for AI responses (creativity) */
    temperature: z.number().min(0).max(2).default(0.7),
});

/**
 * Type for validated AISettingsDto
 */
export type AISettingsDto = z.infer<typeof AISettingsDtoSchema>;

/**
 * Default AI settings
 */
export const defaultAISettings: AISettingsDto = {
    enabled: false,
    provider: AIProviderType.GEMINI,
    model: 'gemini-2.0-flash-thinking-exp',
    apiKeyConfigured: false,
    thinkingLevel: ThinkingLevel.MEDIUM,
    maxTokens: 4096,
    temperature: 0.7,
};

/**
 * Factory function to create AISettingsDto
 */
export function createAISettingsDto(data?: Partial<AISettingsDto>): AISettingsDto {
    return AISettingsDtoSchema.parse({
        enabled: data?.enabled ?? defaultAISettings.enabled,
        provider: data?.provider ?? defaultAISettings.provider,
        model: data?.model ?? defaultAISettings.model,
        apiKeyConfigured: data?.apiKeyConfigured ?? defaultAISettings.apiKeyConfigured,
        thinkingLevel: data?.thinkingLevel ?? defaultAISettings.thinkingLevel,
        maxTokens: data?.maxTokens ?? defaultAISettings.maxTokens,
        temperature: data?.temperature ?? defaultAISettings.temperature,
    });
}

/**
 * AI Connection Test Response DTO
 */
export const AIConnectionTestResponseSchema = z.object({
    success: z.boolean(),
    provider: AIProviderTypeSchema,
    model: z.string(),
    latencyMs: z.number(),
    message: z.string(),
    timestamp: z.string().datetime(),
});

export type AIConnectionTestResponse = z.infer<typeof AIConnectionTestResponseSchema>;
