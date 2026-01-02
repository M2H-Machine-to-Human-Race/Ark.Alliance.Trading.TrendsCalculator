/**
 * @fileoverview Stationarity Method Enum
 * @module enums/config/StationarityMethod
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/Stationarity_ADF_Testing.md}
 */

import { z } from 'zod';

export enum StationarityMethod {
    QUICK_CHECK = 'QUICK_CHECK',
    ADF_APPROXIMATION = 'ADF_APPROXIMATION',
    EXTERNAL_SERVICE = 'EXTERNAL_SERVICE',
}

export const StationarityMethodSchema = z.nativeEnum(StationarityMethod);
export type StationarityMethodType = z.infer<typeof StationarityMethodSchema>;
