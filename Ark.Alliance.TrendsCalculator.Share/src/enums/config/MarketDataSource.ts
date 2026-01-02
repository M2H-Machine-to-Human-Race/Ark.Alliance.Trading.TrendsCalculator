/**
 * @fileoverview Market Data Source Enum
 * @module enums/config/MarketDataSource
 */

import { z } from 'zod';

export enum MarketDataSource {
    WEBSOCKET = 'WEBSOCKET',
    REST = 'REST',
}

export const MarketDataSourceSchema = z.nativeEnum(MarketDataSource);
export type MarketDataSourceType = z.infer<typeof MarketDataSourceSchema>;
