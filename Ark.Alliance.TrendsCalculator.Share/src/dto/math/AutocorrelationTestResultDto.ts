/**
 * @fileoverview Autocorrelation Test Result DTO
 * @module dto/math/AutocorrelationTestResultDto
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/Autocorrelation_Testing.md}
 */

import { z } from 'zod';
import { AutocorrelationMethodSchema } from '../../enums/config/AutocorrelationMethod';
import { AutocorrelationSeveritySchema } from '../../enums/config/AutocorrelationSeverity';

export const AutocorrelationTestResultDtoSchema = z.object({
    hasAutocorrelation: z.boolean(),
    severity: AutocorrelationSeveritySchema,
    method: AutocorrelationMethodSchema,

    // Durbin-Watson results
    durbinWatson: z.number().optional(),
    dwInterpretation: z.enum(['POSITIVE', 'NEGATIVE', 'NONE', 'INCONCLUSIVE']).optional(),

    // Ljung-Box results
    ljungBoxQ: z.number().optional(),
    ljungBoxPValue: z.number().optional(),
    lagsChecked: z.number().int().optional(),

    // Adjustment factor
    rSquaredAdjustmentFactor: z.number().optional(),
});

export type AutocorrelationTestResultDto = z.infer<typeof AutocorrelationTestResultDtoSchema>;
