/**
 * @fileoverview Symbol Information Response DTO
 * @module dto/response/SymbolInfoDto
 * 
 * Detailed symbol metadata including contract specifications and current market data.
 * Used for Symbol Detail page to display comprehensive symbol information.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2026-01-02
 */

import { z } from 'zod';

/**
 * Zod schema for detailed symbol information validation
 * 
 * @remarks
 * Combines contract specifications from Binance exchange info
 * with current market data from ticker endpoint.
 */
export const SymbolInfoDtoSchema = z.object({
    /** Trading symbol (e.g., 'BTCUSDT') */
    symbol: z.string(),

    /** Base asset (e.g., 'BTC') */
    baseAsset: z.string(),

    /** Quote asset (e.g., 'USDT') */
    quoteAsset: z.string(),

    /** Trading status */
    status: z.enum(['TRADING', 'HALT', 'BREAK']),

    // Current market data
    /** Current last price */
    currentPrice: z.number(),

    /** 24h price change (absolute value) */
    priceChange24h: z.number(),

    /** 24h price change (percentage) */
    priceChangePercent24h: z.number(),

    /** 24h trading volume */
    volume24h: z.number(),

    // Contract specifications
    /** Minimum price increment (tick size) */
    tickSize: z.number(),

    /** Contract size (multiplier for position calculation) */
    contractSize: z.number(),

    /** Minimum order quantity */
    minQuantity: z.number(),

    /** Maximum order quantity */
    maxQuantity: z.number(),

    // Margin requirements
    /** Maintenance margin percentage */
    maintMarginPercent: z.number(),

    /** Required initial margin percentage */
    requiredMarginPercent: z.number(),
});

/**
 * TypeScript type inferred from SymbolInfoDtoSchema
 * 
 * @example
 * ```typescript
 * const symbolInfo: SymbolInfoDto = {
 *   symbol: 'BTCUSDT',
 *   baseAsset: 'BTC',
 *   quoteAsset: 'USDT',
 *   status: 'TRADING',
 *   currentPrice: 42500.50,
 *   priceChange24h: 1250.30,
 *   priceChangePercent24h: 3.02,
 *   volume24h: 15234567.89,
 *   tickSize: 0.01,
 *   contractSize: 1,
 *   minQuantity: 0.001,
 *   maxQuantity: 1000,
 *   maintMarginPercent: 2.5,
 *   requiredMarginPercent: 5.0
 * };
 * ```
 */
export type SymbolInfoDto = z.infer<typeof SymbolInfoDtoSchema>;
