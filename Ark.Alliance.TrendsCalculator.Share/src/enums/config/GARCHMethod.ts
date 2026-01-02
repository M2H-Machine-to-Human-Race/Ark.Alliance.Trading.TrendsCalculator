/**
 * @fileoverview GARCH Method Enum
 * @module enums/config/GARCHMethod
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/Math/GARCH_Volatility.md}
 */

import { z } from 'zod';

export enum GARCHMethod {
    GARCH_11 = 'GARCH_11',
    EGARCH = 'EGARCH',
    SIMPLIFIED = 'SIMPLIFIED',
}

export const GARCHMethodSchema = z.nativeEnum(GARCHMethod);
export type GARCHMethodType = z.infer<typeof GARCHMethodSchema>;
