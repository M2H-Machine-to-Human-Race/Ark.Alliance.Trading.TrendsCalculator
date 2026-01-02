/**
 * @fileoverview Regime Detection Method Enum
 * @module enums/config/RegimeDetectionMethod
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/Regime_Detection.md}
 */

import { z } from 'zod';

export enum RegimeDetectionMethod {
    MULTI_FACTOR = 'MULTI_FACTOR',
    HURST_BASED = 'HURST_BASED',
    HMM_EXTERNAL = 'HMM_EXTERNAL',
}

export const RegimeDetectionMethodSchema = z.nativeEnum(RegimeDetectionMethod);
export type RegimeDetectionMethodType = z.infer<typeof RegimeDetectionMethodSchema>;
