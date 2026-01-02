/**
 * @fileoverview Volatility Classification Enum
 * @module enums/config/VolatilityClassification
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/GARCH_Volatility.md}
 */

import { z } from 'zod';

export enum VolatilityClassification {
    LOW = 'LOW',
    NORMAL = 'NORMAL',
    HIGH = 'HIGH',
    EXTREME = 'EXTREME',
}

export const VolatilityClassificationSchema = z.nativeEnum(VolatilityClassification);
export type VolatilityClassificationType = z.infer<typeof VolatilityClassificationSchema>;
