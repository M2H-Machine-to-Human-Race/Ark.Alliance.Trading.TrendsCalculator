/**
 * @fileoverview AI Provider Type Enum
 * @module enums/ai/AIProviderType
 * 
 * Supported AI providers for trend analysis.
 */

import { z } from 'zod';

/**
 * AI provider type values
 */
export enum AIProviderType {
    /** Google Gemini */
    GEMINI = 'GEMINI',
    /** OpenAI GPT */
    OPENAI = 'OPENAI',
    /** Local model (self-hosted) */
    LOCAL = 'LOCAL',
}

/**
 * Zod schema for AIProviderType validation
 */
export const AIProviderTypeSchema = z.nativeEnum(AIProviderType);

/**
 * Type for validated AIProviderType
 */
export type AIProviderTypeType = z.infer<typeof AIProviderTypeSchema>;
