/**
 * @fileoverview Calculation Method Enum
 * @module enums/trend/CalculationMethod
 * 
 * Specifies the method used for trend calculation.
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/TrendsMicroService_Analysis.md} Section 9
 */

import { z } from 'zod';

/**
 * Calculation method values
 */
export enum CalculationMethod {
    /** Statistical analysis only (EMA, regression, etc.) */
    STATISTICAL = 'STATISTICAL',
    /** AI provider analysis only (Gemini, OpenAI, etc.) */
    AI = 'AI',
    /** Combined statistical and AI analysis */
    HYBRID = 'HYBRID',
}

/**
 * Zod schema for CalculationMethod validation
 */
export const CalculationMethodSchema = z.nativeEnum(CalculationMethod);

/**
 * Type for validated CalculationMethod
 */
export type CalculationMethodType = z.infer<typeof CalculationMethodSchema>;
