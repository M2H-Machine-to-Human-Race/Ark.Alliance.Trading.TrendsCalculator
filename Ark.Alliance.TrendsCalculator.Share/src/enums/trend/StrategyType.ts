/**
 * @fileoverview Strategy Type Enum
 * @module enums/trend/StrategyType
 * 
 * Trading strategy types based on market behavior.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2025-12-28
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/Hurst_Exponent.md}
 */

import { z } from 'zod';

/**
 * Strategy type based on Hurst exponent analysis
 * 
 * @remarks
 * - H < 0.5 = Mean-reverting → RANGE_TRADING
 * - H ≈ 0.5 = Random walk → NEUTRAL
 * - H > 0.5 = Persistent → TREND_FOLLOWING
 */
export enum StrategyType {
    /** Mean-reverting market, trade ranges */
    RANGE_TRADING = 'RANGE_TRADING',
    /** Random walk, no clear strategy advantage */
    NEUTRAL = 'NEUTRAL',
    /** Trending market, follow momentum */
    TREND_FOLLOWING = 'TREND_FOLLOWING',
}

/**
 * Zod schema for StrategyType validation
 */
export const StrategyTypeSchema = z.nativeEnum(StrategyType);

/**
 * Type for validated StrategyType
 */
export type StrategyTypeType = z.infer<typeof StrategyTypeSchema>;
