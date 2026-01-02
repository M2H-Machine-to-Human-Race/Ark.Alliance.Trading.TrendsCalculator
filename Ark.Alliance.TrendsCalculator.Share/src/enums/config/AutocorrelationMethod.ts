/**
 * @fileoverview Autocorrelation Method Enum
 * @module enums/config/AutocorrelationMethod
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/Autocorrelation_Testing.md}
 */

import { z } from 'zod';

export enum AutocorrelationMethod {
    DURBIN_WATSON = 'DURBIN_WATSON',
    LJUNG_BOX = 'LJUNG_BOX',
    BOTH = 'BOTH',
}

export const AutocorrelationMethodSchema = z.nativeEnum(AutocorrelationMethod);
export type AutocorrelationMethodType = z.infer<typeof AutocorrelationMethodSchema>;
