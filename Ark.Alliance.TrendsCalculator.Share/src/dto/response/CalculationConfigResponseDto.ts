/**
 * @fileoverview Calculation Config Response DTO
 * @module dto/response/CalculationConfigResponseDto
 */

import { z } from 'zod';

export const CalculationConfigResponseDtoSchema = z.object({
    bufferSize: z.number().int(),
    emaPeriodShort: z.number().int(),
    emaPeriodLong: z.number().int(),
    regressionMinPoints: z.number().int(),
    compositeWeights: z.object({
        ema: z.number(),
        regression: z.number(),
        vwap: z.number(),
        imbalance: z.number(),
    }),
});

export type CalculationConfigResponseDto = z.infer<typeof CalculationConfigResponseDtoSchema>;
