/**
 * @fileoverview Regime Type Enum
 * @module enums/config/RegimeType
 * 
 * Market regime classifications.
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/Regime_Detection.md}
 */

import { z } from 'zod';

/**
 * Market regime type values
 */
export enum RegimeType {
    /** Strong upward trend */
    TRENDING_UP = 'TRENDING_UP',
    /** Strong downward trend */
    TRENDING_DOWN = 'TRENDING_DOWN',
    /** Sideways/ranging market */
    RANGING = 'RANGING',
    /** High volatility regime */
    HIGH_VOLATILITY = 'HIGH_VOLATILITY',
}

/**
 * Zod schema for RegimeType validation
 */
export const RegimeTypeSchema = z.nativeEnum(RegimeType);

/**
 * Type for validated RegimeType
 */
export type RegimeTypeType = z.infer<typeof RegimeTypeSchema>;
