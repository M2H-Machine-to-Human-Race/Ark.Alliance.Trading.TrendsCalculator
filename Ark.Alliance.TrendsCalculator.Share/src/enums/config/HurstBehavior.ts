/**
 * @fileoverview Hurst Behavior Enum
 * @module enums/config/HurstBehavior
 * 
 * Hurst exponent interpretation categories.
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/Hurst_Exponent.md}
 */

import { z } from 'zod';

/**
 * Hurst behavior values
 * 
 * - H < 0.5 = Mean-reverting (anti-persistent)
 * - H ≈ 0.5 = Random walk
 * - H > 0.5 = Trending (persistent)
 */
export enum HurstBehavior {
    /** H < 0.5: Anti-persistent, oscillating */
    MEAN_REVERTING = 'MEAN_REVERTING',
    /** H ≈ 0.5: Unpredictable, random walk */
    RANDOM_WALK = 'RANDOM_WALK',
    /** H > 0.5: Persistent, trending */
    TRENDING = 'TRENDING',
}

/**
 * Zod schema for HurstBehavior validation
 */
export const HurstBehaviorSchema = z.nativeEnum(HurstBehavior);

/**
 * Type for validated HurstBehavior
 */
export type HurstBehaviorType = z.infer<typeof HurstBehaviorSchema>;
