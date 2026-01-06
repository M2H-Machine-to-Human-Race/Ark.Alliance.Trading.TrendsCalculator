/**
 * @fileoverview AI Exchange Status Enum
 * @module enums/ai/AIExchangeStatus
 * 
 * Defines the status of an AI exchange for telemetry.
 */

import { z } from 'zod';

/**
 * AI Exchange status values
 * Tracks the outcome of AI communication attempts
 */
export enum AIExchangeStatus {
    /** Exchange completed successfully */
    SUCCESS = 'SUCCESS',
    /** Exchange timed out */
    TIMEOUT = 'TIMEOUT',
    /** Exchange failed with error */
    ERROR = 'ERROR',
    /** Exchange is pending/in-progress */
    PENDING = 'PENDING',
}

/**
 * Zod schema for AIExchangeStatus validation
 */
export const AIExchangeStatusSchema = z.nativeEnum(AIExchangeStatus);

/**
 * Type for validated AIExchangeStatus
 */
export type AIExchangeStatusType = z.infer<typeof AIExchangeStatusSchema>;
