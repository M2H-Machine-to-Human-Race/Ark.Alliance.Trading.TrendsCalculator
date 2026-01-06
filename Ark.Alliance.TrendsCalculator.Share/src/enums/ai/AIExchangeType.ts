/**
 * @fileoverview AI Exchange Type Enum
 * @module enums/ai/AIExchangeType
 * 
 * Defines the type of AI exchange for telemetry logging.
 */

import { z } from 'zod';

/**
 * AI Exchange type values
 * Used to categorize AI communication entries in telemetry logs
 */
export enum AIExchangeType {
    /** User or system request to AI */
    REQUEST = 'REQUEST',
    /** AI response to a request */
    RESPONSE = 'RESPONSE',
    /** System-level message (config, status) */
    SYSTEM_MESSAGE = 'SYSTEM_MESSAGE',
}

/**
 * Zod schema for AIExchangeType validation
 */
export const AIExchangeTypeSchema = z.nativeEnum(AIExchangeType);

/**
 * Type for validated AIExchangeType
 */
export type AIExchangeTypeType = z.infer<typeof AIExchangeTypeSchema>;
