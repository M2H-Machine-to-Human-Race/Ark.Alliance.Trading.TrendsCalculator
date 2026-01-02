/**
 * @fileoverview Analyze Trend Request DTO
 * @module dto/request/AnalyzeTrendRequestDto
 */

import { z } from 'zod';
import { CalculationMethodSchema } from '../../enums/trend/CalculationMethod';
import { RiskToleranceSchema } from '../../enums/ai/RiskTolerance';

export const AnalyzeTrendRequestDtoSchema = z.object({
    symbol: z.string().min(1).max(20),
    method: CalculationMethodSchema.optional(),
    strategyContext: z.object({
        investment: z.number().positive().optional(),
        riskTolerance: RiskToleranceSchema.optional(),
    }).optional(),
    forceRecalculation: z.boolean().optional().default(false),
});

export type AnalyzeTrendRequestDto = z.infer<typeof AnalyzeTrendRequestDtoSchema>;

export function createAnalyzeTrendRequest(data: unknown): AnalyzeTrendRequestDto {
    return AnalyzeTrendRequestDtoSchema.parse(data);
}
