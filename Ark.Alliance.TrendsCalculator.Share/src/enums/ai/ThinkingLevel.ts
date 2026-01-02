/**
 * @fileoverview Thinking Level Enum
 * @module enums/ai/ThinkingLevel
 * 
 * AI model reasoning depth levels.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-28
 */

import { z } from 'zod';

/**
 * AI thinking/reasoning depth levels
 * 
 * @remarks
 * Controls how much reasoning the AI model uses before responding.
 * Higher levels = more thorough analysis but slower responses.
 */
export enum ThinkingLevel {
    /** Minimal reasoning, fastest responses */
    MINIMAL = 'MINIMAL',
    /** Light reasoning */
    LOW = 'LOW',
    /** Balanced reasoning depth */
    MEDIUM = 'MEDIUM',
    /** Deep reasoning, most thorough */
    HIGH = 'HIGH',
}

/**
 * Zod schema for ThinkingLevel validation
 */
export const ThinkingLevelSchema = z.nativeEnum(ThinkingLevel);

/**
 * Type for validated ThinkingLevel
 */
export type ThinkingLevelType = z.infer<typeof ThinkingLevelSchema>;
