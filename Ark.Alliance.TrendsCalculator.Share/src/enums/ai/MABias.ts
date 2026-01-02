/**
 * @fileoverview Moving Average Bias Enum
 * @module enums/ai/MABias
 * 
 * Moving average crossover bias indicator.
 */

import { z } from 'zod';

/**
 * MA bias values
 */
export enum MABias {
    /** Fast MA above slow MA */
    LONG = 'LONG',
    /** Fast MA below slow MA */
    SHORT = 'SHORT',
    /** MAs crossing or equal */
    NEUTRAL = 'NEUTRAL',
}

/**
 * Zod schema for MABias validation
 */
export const MABiasSchema = z.nativeEnum(MABias);

/**
 * Type for validated MABias
 */
export type MABiasType = z.infer<typeof MABiasSchema>;
