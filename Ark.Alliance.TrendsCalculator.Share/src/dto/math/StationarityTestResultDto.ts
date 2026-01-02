/**
 * @fileoverview Stationarity Test Result DTO
 * @module dto/math/StationarityTestResultDto
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/Stationarity_ADF_Testing.md}
 */

import { z } from 'zod';
import { StationarityMethodSchema } from '../../enums/config/StationarityMethod';

export const StationarityTestResultDtoSchema = z.object({
    isStationary: z.boolean(),
    method: StationarityMethodSchema,

    // Quick check results
    varianceRatio: z.number().optional(),
    meanDifference: z.number().optional(),

    // ADF approximation results
    adfStatistic: z.number().optional(),
    criticalValue: z.number().optional(),

    // Transformation applied
    transformApplied: z.enum(['NONE', 'LOG_RETURNS', 'DIFFERENCE']).optional(),
    transformedData: z.array(z.number()).optional(),
});

export type StationarityTestResultDto = z.infer<typeof StationarityTestResultDtoSchema>;
