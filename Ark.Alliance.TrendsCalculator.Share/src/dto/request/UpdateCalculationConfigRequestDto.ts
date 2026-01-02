/**
 * @fileoverview Update Calculation Config Request DTO
 * @module dto/request/UpdateCalculationConfigRequestDto
 */

import { z } from 'zod';

export const UpdateCalculationConfigRequestDtoSchema = z.object({
    bufferSize: z.number().int().min(50).max(2000).optional(),
    emaPeriodShort: z.number().int().min(3).max(50).optional(),
    emaPeriodLong: z.number().int().min(10).max(200).optional(),
    regressionMinPoints: z.number().int().min(20).max(500).optional(),
    compositeWeights: z.object({
        ema: z.number().min(0).max(1).optional(),
        regression: z.number().min(0).max(1).optional(),
        vwap: z.number().min(0).max(1).optional(),
        imbalance: z.number().min(0).max(1).optional(),
    }).optional(),
});

export type UpdateCalculationConfigRequestDto = z.infer<typeof UpdateCalculationConfigRequestDtoSchema>;

export function createUpdateCalculationConfigRequest(data: unknown): UpdateCalculationConfigRequestDto {
    return UpdateCalculationConfigRequestDtoSchema.parse(data);
}
