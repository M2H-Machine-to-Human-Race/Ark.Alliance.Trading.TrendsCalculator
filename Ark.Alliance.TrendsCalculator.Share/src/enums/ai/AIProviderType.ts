/**
 * @fileoverview AI Provider Type Enum
 * @module enums/ai/AIProviderType
 * 
 * Supported AI providers for trend analysis and symbol optimization.
 * 
 * @author Ark.Alliance Team
 * @version 2.0.0
 * @since 2026-01-06
 */

import { z } from 'zod';

/**
 * AI provider type values
 */
export enum AIProviderType {
    /** Google Gemini (default) */
    GEMINI = 'gemini',
    /** OpenAI GPT */
    OPENAI = 'openai',
    /** Anthropic Claude */
    ANTHROPIC = 'anthropic',
    /** DeepSeek */
    DEEPSEEK = 'deepseek',
    /** Perplexity */
    PERPLEXITY = 'perplexity',
    /** xAI Grok */
    GROK = 'grok',
    /** No AI provider (math-only mode) */
    NONE = 'none',
}

/**
 * Zod schema for AIProviderType validation
 */
export const AIProviderTypeSchema = z.nativeEnum(AIProviderType);

/**
 * Type for validated AIProviderType
 */
export type AIProviderTypeValue = z.infer<typeof AIProviderTypeSchema>;
