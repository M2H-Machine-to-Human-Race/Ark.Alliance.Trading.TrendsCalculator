/**
 * @fileoverview Forecast Validation DTO
 * @module dto/response/ForecastValidationDto
 */

import { z } from 'zod';
import { TrendDirectionSchema } from '../../enums/trend/TrendDirection';
import { ValidationStatusSchema } from '../../enums/trend/ValidationStatus';

export const ForecastValidationDtoSchema = z.object({
    id: z.string(),
    symbol: z.string(),
    forecastTimestamp: z.string().datetime(),
    validationTimestamp: z.string().datetime().optional(),
    predictedDirection: TrendDirectionSchema,
    actualDirection: TrendDirectionSchema.optional(),
    predictedPrice: z.number(),
    actualPrice: z.number().optional(),
    status: ValidationStatusSchema,
    isCorrect: z.boolean().optional(),
    forecastHorizonMs: z.number().int(),
});

export type ForecastValidationDto = z.infer<typeof ForecastValidationDtoSchema>;
