/**
 * @fileoverview GARCH Forecast Result DTO
 * @module dto/math/GARCHForecastResultDto
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/GARCH_Volatility.md}
 */

import { z } from 'zod';
import { GARCHMethodSchema } from '../../enums/config/GARCHMethod';
import { VolatilityClassificationSchema } from '../../enums/config/VolatilityClassification';

export const GARCHForecastResultDtoSchema = z.object({
    method: GARCHMethodSchema,
    params: z.object({
        omega: z.number(),
        alpha: z.number(),
        beta: z.number(),
    }),
    currentVolatility: z.number(),
    forecastedVolatility: z.array(z.number()),
    volatilityRegime: VolatilityClassificationSchema,
    persistence: z.number(),
});

export type GARCHForecastResultDto = z.infer<typeof GARCHForecastResultDtoSchema>;
