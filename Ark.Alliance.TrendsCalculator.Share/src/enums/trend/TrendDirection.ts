/**
 * @fileoverview Trend Direction Enum
 * @module enums/trend/TrendDirection
 * 
 * Represents the predicted market direction.
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/TrendsMicroService_Analysis.md} Section 9
 */

import { z } from 'zod';

/**
 * Trend direction values
 */
export enum TrendDirection {
    /** Bullish trend - price expected to rise */
    LONG = 'LONG',
    /** Bearish trend - price expected to fall */
    SHORT = 'SHORT',
    /** No clear trend - avoid trading */
    WAIT = 'WAIT',
}

/**
 * Zod schema for TrendDirection validation
 */
export const TrendDirectionSchema = z.nativeEnum(TrendDirection);

/**
 * Type for validated TrendDirection
 */
export type TrendDirectionType = z.infer<typeof TrendDirectionSchema>;
