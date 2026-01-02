/**
 * @fileoverview Available Symbol DTO
 * @module dto/response/AvailableSymbolDto
 * 
 * Minimal symbol information for symbol discovery and search functionality.
 * Used in combo box / select components for symbol selection.
 * 
 * @author Ark.Alliance
 * @version 1.0.0
 * @since 2026-01-02
 */

import { z } from 'zod';

/**
 * Zod schema for available symbol validation
 * 
 * @remarks
 * Lightweight DTO for listing all available Binance Futures symbols.
 * Used for symbol discovery UI (search/filter functionality).
 */
export const AvailableSymbolDtoSchema = z.object({
    /** Trading symbol (e.g., 'BTCUSDT') */
    symbol: z.string(),

    /** Base asset (e.g., 'BTC') */
    baseAsset: z.string(),

    /** Quote asset (e.g., 'USDT') */
    quoteAsset: z.string(),

    /** Whether symbol is actively trading */
    isActive: z.boolean(),

    /** Optional current price (for preview in dropdown) */
    currentPrice: z.number().optional(),

    /** Optional 24h volume (for sorting/filtering) */
    volume24h: z.number().optional(),
});

/**
 * TypeScript type inferred from AvailableSymbolDtoSchema
 * 
 * @example
 * ```typescript
 * const availableSymbol: AvailableSymbolDto = {
 *   symbol: 'BTCUSDT',
 *   baseAsset: 'BTC',
 *   quoteAsset: 'USDT',
 *   isActive: true,
 *   currentPrice: 42500.50,
 *   volume24h: 1523456.78
 * };
 * ```
 */
export type AvailableSymbolDto = z.infer<typeof AvailableSymbolDtoSchema>;
