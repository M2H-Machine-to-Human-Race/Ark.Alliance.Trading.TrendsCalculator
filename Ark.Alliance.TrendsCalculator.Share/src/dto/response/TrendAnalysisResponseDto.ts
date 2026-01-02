/**
 * @fileoverview Trend Analysis Response DTO
 * @module dto/response/TrendAnalysisResponseDto
 * 
 * Main response for trend analysis requests.
 */

import { z } from 'zod';
import { TrendDirectionSchema } from '../../enums/trend/TrendDirection';
import { CalculationMethodSchema } from '../../enums/trend/CalculationMethod';
import { HurstBehaviorSchema } from '../../enums/config/HurstBehavior';
import { RegimeTypeSchema } from '../../enums/config/RegimeType';

/**
 * Statistical analysis result
 */
export const StatisticalResultSchema = z.object({
    emaShort: z.number(),
    emaLong: z.number(),
    emaCrossover: z.enum(['BULLISH', 'BEARISH', 'NEUTRAL']),
    regression: z.object({
        slope: z.number(),
        rSquared: z.number(),
        rSquaredAdjusted: z.number().optional(),
        intercept: z.number(),
    }),
    vwap: z.number().optional(),
    atr: z.number().optional(),
    imbalanceScore: z.number().optional(),
    compositeScore: z.number(),
});

/**
 * AI analysis result
 */
export const AIResultSchema = z.object({
    direction: TrendDirectionSchema,
    confidence: z.number().min(0).max(1),
    reasoning: z.string().optional(),
    suggestedParams: z.record(z.unknown()).optional(),
});

/**
 * Main Trend Analysis Response
 */
export const TrendAnalysisResponseDtoSchema = z.object({
    symbol: z.string(),
    timestamp: z.string().datetime(),

    // Final conclusion
    direction: TrendDirectionSchema,
    confidence: z.number().min(0).max(1),
    compositeScore: z.number(),

    // Method used
    method: CalculationMethodSchema,

    // Detailed results
    statistical: StatisticalResultSchema.optional(),
    ai: AIResultSchema.optional(),

    // Advanced metrics (if enabled)
    hurstExponent: z.number().optional(),
    hurstBehavior: HurstBehaviorSchema.optional(),
    regime: RegimeTypeSchema.optional(),
    regimeProbability: z.number().min(0).max(1).optional(),

    // Metadata
    bufferPercent: z.number().min(0).max(100),
    calculationTimeMs: z.number(),
});

export type TrendAnalysisResponseDto = z.infer<typeof TrendAnalysisResponseDtoSchema>;
export type StatisticalResult = z.infer<typeof StatisticalResultSchema>;
export type AIResult = z.infer<typeof AIResultSchema>;
