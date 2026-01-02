/**
 * @fileoverview Forecast Evaluation Result Enum
 * @module enums/training/ForecastEvaluationResult
 * 
 * Result of evaluating a forecast prediction.
 */

import { z } from 'zod';

/**
 * Forecast evaluation result values
 */
export enum ForecastEvaluationResult {
    /** Prediction was correct */
    CORRECT = 'CORRECT',
    /** Prediction was incorrect */
    INCORRECT = 'INCORRECT',
    /** Awaiting evaluation */
    PENDING = 'PENDING',
}

/**
 * Zod schema for ForecastEvaluationResult validation
 */
export const ForecastEvaluationResultSchema = z.nativeEnum(ForecastEvaluationResult);

/**
 * Type for validated ForecastEvaluationResult
 */
export type ForecastEvaluationResultType = z.infer<typeof ForecastEvaluationResultSchema>;
