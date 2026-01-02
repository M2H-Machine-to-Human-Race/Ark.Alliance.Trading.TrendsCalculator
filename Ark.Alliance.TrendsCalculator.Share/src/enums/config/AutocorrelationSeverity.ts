/**
 * @fileoverview Autocorrelation Severity Enum
 * @module enums/config/AutocorrelationSeverity
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/Autocorrelation_Testing.md}
 */

import { z } from 'zod';

export enum AutocorrelationSeverity {
    NONE = 'NONE',
    MILD = 'MILD',
    MODERATE = 'MODERATE',
    SEVERE = 'SEVERE',
}

export const AutocorrelationSeveritySchema = z.nativeEnum(AutocorrelationSeverity);
export type AutocorrelationSeverityType = z.infer<typeof AutocorrelationSeveritySchema>;
