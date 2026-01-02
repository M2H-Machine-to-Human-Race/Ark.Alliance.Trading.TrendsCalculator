/**
 * @fileoverview Binance Price Ticker Response DTO
 * @module dto/response/BinanceTickerDto
 * 
 * Data Transfer Object for real-time price updates from Binance WebSocket.
 * Contains symbol price, volume, and timestamp information.
 */

import { z } from 'zod';

/**
 * Zod schema for Binance ticker data validation
 */
export const BinanceTickerDtoSchema = z.object({
    /** Trading symbol (e.g., 'BTCUSDT') */
    symbol: z.string(),

    /** Current price */
    price: z.number(),

    /** 24-hour trading volume */
    volume: z.number(),

    /** Unix timestamp of the price update */
    timestamp: z.number(),
});

/**
 * TypeScript type inferred from schema
 */
export type BinanceTickerDto = z.infer<typeof BinanceTickerDtoSchema>;
