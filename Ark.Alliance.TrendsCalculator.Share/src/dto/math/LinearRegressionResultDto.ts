/**
 * @fileoverview Linear Regression Result DTO
 * @module dto/math/LinearRegressionResultDto
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/Stationarity_ADF_Testing.md}
 */

import { z } from 'zod';

export const LinearRegressionResultDtoSchema = z.object({
    slope: z.number(),
    intercept: z.number(),
    rSquared: z.number().min(0).max(1),
    rSquaredAdjusted: z.number().optional(),
    standardError: z.number().optional(),
    tStatistic: z.number().optional(),
    pValue: z.number().optional(),
    slopeNormalized: z.number(),
    residuals: z.array(z.number()).optional(),
});

export type LinearRegressionResultDto = z.infer<typeof LinearRegressionResultDtoSchema>;
