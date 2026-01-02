/**
 * @fileoverview Trend Precision Enum
 * @module enums/trend/TrendPrecision
 * 
 * Time precision for trend calculations.
 * 
 * @see {@link file:///c:/Repos/Ark.Alliance.Trading.Bot-React/Docs/TrendsMicroService_Analysis_Dashboard.md} Section 3.5
 */

import { z } from 'zod';

/**
 * Trend precision values
 */
export enum TrendPrecision {
    /** 1 second precision */
    ONE_SECOND = '1s',
    /** 1 minute precision */
    ONE_MINUTE = '1m',
    /** 15 minute precision */
    FIFTEEN_MINUTES = '15m',
}

/**
 * Zod schema for TrendPrecision validation
 */
export const TrendPrecisionSchema = z.nativeEnum(TrendPrecision);

/**
 * Type for validated TrendPrecision
 */
export type TrendPrecisionType = z.infer<typeof TrendPrecisionSchema>;
