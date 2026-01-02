/**
 * @fileoverview Training Result Response DTO
 * @module dto/response/TrainingResultResponseDto
 */

import { z } from 'zod';
import { TrendDirectionSchema } from '../../enums/trend/TrendDirection';
import { ForecastEvaluationResultSchema } from '../../enums/training/ForecastEvaluationResult';

export const PredictionResultSchema = z.object({
    timestamp: z.string().datetime(),
    symbol: z.string(),
    predictedDirection: TrendDirectionSchema,
    actualDirection: TrendDirectionSchema.optional(),
    predictedPrice: z.number(),
    actualPrice: z.number().optional(),
    result: ForecastEvaluationResultSchema,
    error: z.number().optional(),
});

export const AccuracyMetricsSchema = z.object({
    directionAccuracy: z.number().min(0).max(1),
    mape: z.number(),
    rmse: z.number(),
    mae: z.number(),
    totalPredictions: z.number().int(),
    correctPredictions: z.number().int(),
});

export const TrainingResultResponseDtoSchema = z.object({
    sessionId: z.string(),
    accuracy: AccuracyMetricsSchema,
    predictions: z.array(PredictionResultSchema),
    startTime: z.string().datetime(),
    endTime: z.string().datetime().optional(),
    durationMinutes: z.number(),
});

export type TrainingResultResponseDto = z.infer<typeof TrainingResultResponseDtoSchema>;
export type PredictionResult = z.infer<typeof PredictionResultSchema>;
export type AccuracyMetrics = z.infer<typeof AccuracyMetricsSchema>;
